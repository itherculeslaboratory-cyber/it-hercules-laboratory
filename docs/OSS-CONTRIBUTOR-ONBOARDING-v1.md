# OSS コントリビュータ オンボーディング v1（30 分パス）

> **対象**: GitHub から `it-hercules-laboratory` を clone した初参加者  
> **前提**: civilization-os は **不要**（参照リンクのみ）  
> **正本**: [`ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](./design/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) · [`00-完成定義と実行キュー-v1.md`](./design/00-完成定義と実行キュー-v1.md) §0

---

## ゴール（30 分後にできること）

1. ローカルで **pytest 緑**を確認できる
2. **1 機能 = 1 component** の境界を説明できる
3. 直す対象機能の **4 点設計**（要件 · 詳細 · 遷移 · UI）に辿り着ける
4. **POST-OSS-*** キューから次の貢献候補を選べる

---

## タイムボックス（合計 ≈ 30 分）

| 分 | ステップ | やること |
|----|----------|----------|
| 0–5 | **Clone & 起動** | `git clone` → `cd 指示/it-hercules-laboratory` → `pip install -e .` → `pytest` |
| 5–10 | **アーキ概要** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) を読む |
| 10–15 | **貢献ルール** | [`CONTRIBUTING.md`](../CONTRIBUTING.md) · Issue/PR の component 単位 |
| 15–20 | **機能を選ぶ** | [`00-OSS機能ギャップ表-v1.md`](./design/00-OSS機能ギャップ表-v1.md) で **OSS-READY ≠ ✓** の行を 1 つ選ぶ |
| 20–25 | **設計を読む** | `指示/it-hercules-laboratory/01-要件/NN-*.md` + 遷移 + UI 設計 |
| 25–30 | **実装境界** | 該当 `components/` or `libs/` の README · manifest 契約を確認 |

---

## 読む順序（詳細）

### Phase A — リポジトリ（5 分）

```bash
git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git
cd 指示/it-hercules-laboratory
pip install -e ".[dev]"
pytest
```

- 秘密鍵不要で CI と同じ stub モードが動く
- 失敗したら Issue に **pytest ログ先頭 20 行**のみ貼る（秘密を含めない）

### Phase B — 思想（10 分）

| 順 | ファイル | 内容 |
|----|----------|------|
| 1 | [`指示/it-hercules-laboratory/README.md`](../README.md) §OSS | フォルダマップ · 索引 |
| 1.5 | [`it-hercules-laboratory/docs/design/OSS-REPO-LAYOUT-v1.md`](design/OSS-REPO-LAYOUT-v1.md) | PR の出し先 · フォルダ原則 P1–P6 |
| 2 | [`ADR-H-21`](./design/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) §0–2 | civ-os = reference only |
| 3 | [`00-完成定義`](./design/00-完成定義と実行キュー-v1.md) §0 | USER-DONE 7 層 |

### Phase C — 1 機能に入る（15 分）

1. **ギャップ表**で機能 # を選ぶ → `POST-OSS-NN` ID をメモ
2. **設計 4 点**を `指示/it-hercules-laboratory/01-要件/` から読む
3. **component 分解** — [`02-設計/_横断/component/00-マスターcomponent分解表.md`](../02-設計/_横断/component/00-マスターcomponent分解表.md)
4. **コード** — `it-hercules-laboratory/components/<name>/` or `apps/api/routes/`
5. **テスト** — `tests/unit/test_<feature>.py` を先に読む（契約の executable spec）

---

## フォルダマップ（クイック参照）

```
it-hercules-laboratory/          ← 実装正本（あなたが PR する場所）
├── apps/
│   ├── api/                     ← FastAPI ルート
│   └── web/                     ← Next.js UI
├── components/                  ← C-USB manifest 付きパイプライン
├── libs/                        ← 共有ドメインロジック
├── tests/                       ← unit · contract · integration
├── docs/ARCHITECTURE.md
└── CONTRIBUTING.md

指示/it-hercules-laboratory/     ← 設計正本（昇格前 · civ-os 内）
├── 01-要件/           ← 01–23 要件 + 詳細 + 遷移
├── 02-設計/_ui-global/                      ← ワイヤー · mockups
├── 02-設計/_横断/component/      ← 7 分類 · OSS 候補表
└── 05-運用/queues/                 ← ADR · 完成定義 · ギャップ表
```

---

## PR の最小セット（機能 1 件）

| 必須 | 内容 |
|------|------|
| コード | component or route + persistence（mock_store 経由禁止） |
| テスト | unit ≥1 · 該当 contract/integration |
| ドキュメント | component README 更新 · 設計 4 点の差分があれば `指示/` 側も |
| チェック | `pytest` 緑 · route-matrix 該当行があれば更新 |

---

## やってはいけないこと

- civilization-os を **runtime dependency** にしない
- `mock_store` に新規ドメインを追加しない（event_store / libs へ）
- 秘密値を Issue/PR/ログに書かない
- 「未実装」「WIP」をユーザー向け UI に出さない

---

## 次の一歩

- キュー先頭: `grep '^- \[ \]' 指示/it-hercules-laboratory/05-運用/queues/00-完成定義と実行キュー-v1.md`
- ギャップ確認: [`00-OSS機能ギャップ表-v1.md`](./design/00-OSS機能ギャップ表-v1.md)
- 質問: GitHub Issue · ラベル `good-first-issue` · `component/<name>`

---

*v1 · 2026-06-10 · 30 分オンボーディング正本*
