"""決定論テキスト検索の梯子 — docs/knowledge を index.md 経由で横断検索。

段階1(主役・既定): 決定論キーワード検索。
  1. 質問から日本語 2-gram + 単一漢字 + 英数字トークンを抽出(ストップワード除去)。
  2. index.md の各行(name+説明)を **ファイルを開かずに** スコアリング。
  3. 最高スコアの 1 ファイルだけ開き、該当節(見出し単位)を抽出。
  4. その節がリンクへの誘導(本文が薄くリンクのみ)なら 1 回だけ辿る(2 ホップ目はしない)。
  出力は「証拠パス + 該当節の引用」。回答生成はしない(呼び出し側モデルの仕事)。

段階2(補助): `--semantic`。`EmbeddingBackend.embed_text` の dummy で見出しチャンクの
  ベクトルインデックスを `docs/knowledge/.vector-index/` に構築し検索。dummy は決定論のみ保証で
  意味的類似は反映しない(CI 安全)。実用バックエンドの選定は別途人間が判断。

  python tools/knowledge_search.py "飼育環境で保存する列は"        # 決定論梯子
  python tools/knowledge_search.py "..." --semantic               # 構築(無ければ)+意味検索
  python tools/knowledge_search.py --rebuild-index                # インデックス全消し→再構築
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from libs.ihl.observation.embedding import resolve_backend  # noqa: E402
from libs.ihl.observation.faiss_index import VectorIndex  # noqa: E402

# index.md は梯子の索引そのものであり「開いたファイル」に数えない。以下も検索対象外(索引/規約/ログ)。
_NON_CONTENT = {"index.md", "CLAUDE.md", "log.md"}
_STOPWORDS = {
    "the", "a", "an", "is", "are", "of", "to", "in", "and", "or", "for", "on", "with",
    "what", "how", "why", "which", "does", "do", "the", "this", "that",
}
_ROW_LINK = re.compile(r"\[[^\]]*\]\(([^)]+\.md)\)")
_KANJI = re.compile(r"[一-鿿]")
_CJK_RUN = re.compile(r"[぀-ヿ一-鿿ー]+")
_ASCII = re.compile(r"[a-z0-9]+")


def _knowledge_root() -> Path:
    env = os.environ.get("IHL_KNOWLEDGE_ROOT", "").strip()
    return Path(env).resolve() if env else _REPO_ROOT / "docs" / "knowledge"


def extract_keywords(text: str) -> list[str]:
    """英数字トークン + 日本語 2-gram + 単一漢字の和union(重複可、頻度は呼び出し側)。"""
    low = text.lower()
    kws: list[str] = [t for t in _ASCII.findall(low) if t not in _STOPWORDS]
    for run in _CJK_RUN.findall(text):
        if len(run) >= 2:
            kws += [run[i : i + 2] for i in range(len(run) - 1)]
        # 単一漢字は content 語なので拾う(ひらがな/カタカナ単字は助詞ノイズなので拾わない)。
        kws += [ch for ch in run if _KANJI.match(ch)]
    return kws


def _score(text: str, keywords: list[str]) -> int:
    low = text.lower()
    return sum(low.count(kw) for kw in keywords)


# 参考文献節は答えではないので節選択から除外(索引/出典)。
_META_HEADINGS = {"citations", "出典", "references", "参考文献"}


@dataclass
class Section:
    heading: str
    body: str

    @property
    def text(self) -> str:
        return f"{self.heading}\n{self.body}"


def _strip_frontmatter(md: str) -> str:
    if md.startswith("---"):
        end = md.find("\n---", 3)
        if end != -1:
            return md[md.find("\n", end + 1) + 1 :]
    return md


def split_sections(md: str) -> list[Section]:
    """見出し(# / ##...)単位に分割。見出し前の導入は先頭 Section にまとめる。"""
    body = _strip_frontmatter(md)
    sections: list[Section] = []
    heading = ""
    buf: list[str] = []
    for line in body.splitlines():
        if re.match(r"^#{1,6}\s", line):
            if heading or buf:
                sections.append(Section(heading, "\n".join(buf).strip()))
            heading = line.lstrip("#").strip()
            buf = []
        else:
            buf.append(line)
    if heading or buf:
        sections.append(Section(heading, "\n".join(buf).strip()))
    return sections


def best_section(md: str, keywords: list[str]) -> Section | None:
    """節を IDF 重み × 見出しブースト で選ぶ。頻出語(観測・検索等)は薄く、
    希少語(rerank・柱・色温度等)を濃く効かせ、質問の焦点節を surface する。"""
    all_secs = split_sections(md)
    sections = [s for s in all_secs if s.heading.strip().lower() not in _META_HEADINGS]
    if not sections:
        return None
    # h1(=ページ名)は index.md 梯子でここへ導いた語そのもの。節選択では再出現がノイズなので除外。
    title = next((s.heading.lower() for s in all_secs if s.heading.strip()), "")
    uniq = {kw for kw in set(keywords) if kw not in title} or set(keywords)
    n = len(sections)
    idf = {
        kw: math.log(1 + n / c)
        for kw in uniq
        if (c := sum(1 for s in sections if kw in s.text.lower())) > 0
    }

    def rank(s: Section) -> float:
        head, body = s.heading.lower(), s.body.lower()
        matched = {kw for kw in idf if kw in head + body}
        bigrams = [kw for kw in matched if len(kw) == 2]
        # 単一漢字が一致 2-gram に含まれるなら二重計上なので落とす(「検索」→検索/検/索 の膨張を防ぐ)。
        eff = [kw for kw in matched if not (len(kw) == 1 and any(kw in b for b in bigrams))]
        # 希少語(高 idf)ほど加点、見出し一致は x3。
        return sum(idf[kw] * (3 if kw in head else 1) for kw in eff)

    return max(sections, key=rank)


@dataclass
class SearchResult:
    query: str
    keywords: list[str]
    evidence_path: str  # knowledge_root からの相対
    heading: str
    quote: str
    opened_files: list[str] = field(default_factory=list)  # index.md は含めない


def _index_rows(root: Path) -> list[tuple[str, str]]:
    """(candidate_text, rel_link) を index.md から抽出。ファイルは開かない。"""
    rows: list[tuple[str, str]] = []
    for line in (root / "index.md").read_text(encoding="utf-8").splitlines():
        if not line.lstrip().startswith("|"):
            continue
        m = _ROW_LINK.search(line)
        if not m:
            continue
        link = m.group(1).lstrip("./")
        if Path(link).name in _NON_CONTENT:
            continue
        text = line.replace("|", " ")  # name + 説明(リンクセルも含むが害はない)
        rows.append((text, link))
    return rows


def _redirect_link(section: Section, root: Path) -> str | None:
    """節本文が薄く(実質リンクのみ)、バンドル相対 .md リンクを 1 本指すなら、その rel を返す。"""
    links = _ROW_LINK.findall(section.body)
    stripped = _ROW_LINK.sub("", section.body)
    if len(links) == 1 and len(re.sub(r"\s", "", stripped)) < 40:
        rel = links[0].lstrip("./")
        if (root / rel).is_file():
            return rel
    return None


def search(query: str, root: Path | None = None) -> SearchResult | None:
    root = root or _knowledge_root()
    keywords = extract_keywords(query)
    rows = _index_rows(root)
    if not rows:
        return None
    _text, link = max(rows, key=lambda r: _score(r[0], keywords))
    if _score(_text, keywords) == 0:
        return None
    opened: list[str] = []
    path = root / link
    opened.append(link)
    sec = best_section(path.read_text(encoding="utf-8"), keywords)
    if sec is None:
        return None
    # 1 ホップだけリンク誘導を辿る(2 ホップ目はしない)。
    redirect = _redirect_link(sec, root)
    if redirect is not None and redirect not in opened:
        opened.append(redirect)
        hop = best_section((root / redirect).read_text(encoding="utf-8"), keywords)
        if hop is not None:
            sec, link = hop, redirect
    return SearchResult(query, keywords, link, sec.heading, sec.text, opened)


# --- 段階2: 意味検索(dummy 埋め込み) ---

def _index_dir(root: Path) -> Path:
    return root / ".vector-index"


def _content_files(root: Path) -> list[Path]:
    return [
        p
        for p in sorted(root.rglob("*.md"))
        if p.name not in _NON_CONTENT and _index_dir(root) not in p.parents
    ]


def _chunks(root: Path) -> list[tuple[str, str]]:
    """(chunk_id, text)。chunk_id = 'relpath#見出し'。"""
    out: list[tuple[str, str]] = []
    for path in _content_files(root):
        rel = path.relative_to(root).as_posix()
        for sec in split_sections(path.read_text(encoding="utf-8")):
            if sec.text.strip():
                out.append((f"{rel}#{sec.heading}", sec.text))
    return out


def build_index(root: Path | None = None) -> int:
    """見出しチャンクを dummy 埋め込みでインデックス化。冪等(全消し→再構築)。返り値=チャンク数。"""
    root = root or _knowledge_root()
    backend = resolve_backend()
    chunks = _chunks(root)
    if not chunks:
        return 0
    ids = [cid for cid, _ in chunks]
    matrix = np.vstack([backend.embed_text(text) for _, text in chunks]).astype(np.float32)
    idir = _index_dir(root)
    if idir.exists():
        shutil.rmtree(idir)
    idir.mkdir(parents=True)
    np.save(idir / "matrix.npy", matrix, allow_pickle=False)
    (idir / "ids.json").write_text(
        json.dumps(
            {"ids": ids, "model_name": backend.model_name, "dim": int(matrix.shape[1])},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return len(ids)


def semantic_search(query: str, root: Path | None = None, *, top_k: int = 5) -> list[tuple[str, float]]:
    root = root or _knowledge_root()
    idir = _index_dir(root)
    if not (idir / "matrix.npy").is_file():
        build_index(root)
    matrix = np.load(idir / "matrix.npy")
    ids = json.loads((idir / "ids.json").read_text(encoding="utf-8"))["ids"]
    index = VectorIndex.from_vectors(ids, matrix)
    qvec = resolve_backend().embed_text(query)
    return index.search(qvec, top_k=top_k)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="決定論 knowledge テキスト検索(モデル生成なし)")
    parser.add_argument("query", nargs="?", help="日本語の質問")
    parser.add_argument("--semantic", action="store_true", help="dummy 埋め込みで意味検索")
    parser.add_argument("--rebuild-index", action="store_true", help="意味検索インデックスを再構築")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):  # Windows cp932 コンソールで日本語出力が落ちないように
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    root = _knowledge_root()

    if args.rebuild_index:
        n = build_index(root)
        print(f"インデックス再構築: {n} チャンク → {_index_dir(root)}")
        if not args.query:
            return 0

    if not args.query:
        parser.error("質問文が必要です(または --rebuild-index)")

    if args.semantic:
        for cid, score in semantic_search(args.query, root, top_k=args.top_k):
            print(f"{score:+.3f}  {cid}")
        return 0

    res = search(args.query, root)
    if res is None:
        print("該当なし")
        return 1
    print(f"証拠: {res.evidence_path}  ## {res.heading}")
    print(f"開いたファイル: {', '.join(res.opened_files)}")
    print("---")
    quote = res.quote if len(res.quote) <= 800 else res.quote[:800] + " …"
    print("\n".join("> " + ln for ln in quote.splitlines()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
