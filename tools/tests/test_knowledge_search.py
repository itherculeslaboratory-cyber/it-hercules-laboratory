"""決定論テキスト検索の梯子テスト。

段階1は **実バンドル** (docs/knowledge) の実ページに対して 5 問を固定 —
Second Brain 原則5「開いたファイル数 ≦ 2」と正しい証拠節を回帰で守る。
段階2(意味検索)は tmp バンドルで完結し、実 repo に .vector-index/ を書かない。
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from tools.knowledge_search import (
    build_index,
    extract_keywords,
    search,
    semantic_search,
    split_sections,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]
_REAL_ROOT = _REPO_ROOT / "docs" / "knowledge"

# (質問, 期待する証拠ファイル, 証拠節に含まれるべき語)
_QUESTIONS = [
    ("飼育環境で保存する温度・湿度以外の列は何ですか", "topics/breeding-environment.md", "light_level"),
    ("観測の類似検索でrerankの重みはどうなっていますか", "topics/observation-pipeline.md", "0.50"),
    ("知の広場の3つの柱は何ですか", "topics/knowledge-plaza.md", "掲示板"),
    ("論文ノートの6節スキーマにはどんな節がありますか", "topics/research-notes-model.md", "仮説"),
    ("標準撮影チャンバーの照明の色温度は何Kですか", "topics/shooting-chamber.md", "6500K"),
]


@pytest.mark.parametrize("query,expected_file,evidence", _QUESTIONS)
def test_ladder_returns_evidence(query: str, expected_file: str, evidence: str) -> None:
    res = search(query, _REAL_ROOT)
    assert res is not None, query
    assert res.evidence_path == expected_file, (query, res.evidence_path)
    assert evidence in res.quote, (query, res.heading)
    assert len(res.opened_files) <= 2, (query, res.opened_files)  # 原則5


def test_keywords_mix_japanese_and_ascii() -> None:
    kws = extract_keywords("rerankの重みは6500K")
    assert "rerank" in kws  # 英数字トークン
    assert "重み" in kws  # 日本語 2-gram
    assert "6500k" in kws


def test_split_sections_skips_frontmatter() -> None:
    md = "---\ntype: Topic\n---\n\n# 見出し1\n本文a\n\n## 見出し2\n本文b\n"
    secs = split_sections(md)
    headings = [s.heading for s in secs]
    assert "見出し1" in headings and "見出し2" in headings
    assert not any("type: Topic" in s.text for s in secs)


def _make_tmp_bundle(root: Path) -> None:
    (root / "topics").mkdir(parents=True)
    (root / "index.md").write_text(
        "| name | link | 説明 |\n|---|---|---|\n"
        "| 環境 | [topics/env.md](./topics/env.md) | 温度と湿度 |\n",
        encoding="utf-8",
    )
    (root / "topics" / "env.md").write_text(
        "# 環境\n\n## 保存列\n温度と湿度を保存する。\n", encoding="utf-8"
    )


def test_semantic_build_and_search(tmp_path: Path) -> None:
    root = tmp_path / "knowledge"
    _make_tmp_bundle(root)
    n = build_index(root)
    assert n >= 1
    assert (root / ".vector-index" / "matrix.npy").is_file()
    # 冪等: 再構築してもエラーなく同数。
    assert build_index(root) == n
    hits = semantic_search("温度は何度", root, top_k=3)
    assert hits and isinstance(hits[0][0], str)
    assert np.isfinite(hits[0][1])
