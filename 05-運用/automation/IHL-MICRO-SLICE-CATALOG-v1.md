# IHL マイクロスライス辞典 v1（狂気モード基盤）

> **合図**: `IHL-DOC-REMED MAD`  
> **生成器**: [`scripts/ihl-doc-micro-workorder.mjs`](../../scripts/ihl-doc-micro-workorder.mjs)  
> **採点**: [`IHL-SLICE-SCORECARD-v1.md`](./IHL-SLICE-SCORECARD-v1.md) · **工場**: [`IHL-DOC-REMED-FACTORY-v1.md`](./IHL-DOC-REMED-FACTORY-v1.md)  
> **黄金基準**: #05 観測（`docs/planning/audits/WorkOrder-05-MICRO.json`）

---

## 目的

Wave 1 の粗粒度スライス（`NN-DET-s3-api` 等 5〜6 種）を **爆発分解**し、1 スライス = **1 route / 1 モデル / 1 エラーコード / 1 req_id** まで細分化する。狙いは **Best-of-N 並列**（Auto 多数）で **完全性を機械採点**できる粒度にすること。

- 1 MICRO WorkOrder の目標: **60〜150 スライス / 機能**（`--feature NN` で生成）
- スライスは **owner: `auto` | `tier-a`** を持つ（判断が要るものだけ Tier A）
- 粗粒度 `WorkOrder-NN.json` は **残す**（MICRO は `WorkOrder-NN-MICRO.json` へ別出力）

---

## スライス種辞典

| type | 単位 | 抽出元 | owner 既定 | 成果物 | acceptance の核 |
|------|------|--------|-----------|--------|-----------------|
| **api-1route** | 1 API route | `apps/api/routes/*.py`（decorator AST/regex） | auto | `slices/api/<method>-<path>.md` | method/path/**auth**/request/response/errors 各1行以上 |
| **schema-field** | 1 Pydantic request モデル | `class X(BaseModel)` | auto | `slices/schema/<model>.md` | 全フィールドの name/type/default/必須 · enum |
| **error-code** | 1 HTTP エラーコード | route 群の `HTTPException(status_code=)` | auto | `slices/errors/<code>.md` | 発生条件 · detail · UI 導線 · カタログ行 |
| **screen-state** | 1 画面 × 4状態 | Web ルート（`apps/web`） | **tier-a** | `slices/screens/<route>.md` | loading/empty/error/ok · 主ボタン1 · 3クリック |
| **reverse-rtm** | 1 テスト層 | `RTM-v1.csv`（test→req） | auto | `04-トレーサ/features/NN-*/逆RTM-v1.csv` | 孤立TC 0 · 層内 TC→req 逆引き |
| **fr-1id** | 1 req_id（FR/NFR） | `01-要件/NN-*.md` + RTM | auto（gap/human/review は tier-a） | `slices/fr/<req_id>.md` | 1文正規化(IN→T→OUT) · 受入基準 · RTM 整合 |

### 追加候補（Wave 展開時）

| type | 単位 | 備考 |
|------|------|------|
| **route-index-web** | 1 Web ルート | `ROUTE-INDEX-v1.csv` 行 → 遷移辞書 |
| **auth-1row** | 1 auth 行 | `AUTH-MATRIX-v1.csv`（契約オラクルと突き合わせ） |
| **glossary-1term** | 1 用語 | `用語彙-v1.md` |

---

## slice_id 命名

```
NN-MICRO-<typeabbr>-<seq3>
例: 05-MICRO-api-001 · 05-MICRO-schema-005 · 05-MICRO-fr-042
```

typeabbr: `api` · `schema` · `error` · `screen` · `revrtm` · `fr`

---

## slice 形式（JSON）

```json
{
  "slice_id": "05-MICRO-api-013",
  "owner": "auto",
  "type": "api-1route",
  "inputs": ["apps/api/routes/observation.py", "POST /api/v1/observation/search", "DET §3.9 認証境界"],
  "outputs": ["02-設計/features/05-観測/slices/api/post-api-v1-observation-search.md"],
  "acceptance": "method/path/auth/request/response/errors 各1行以上 · auth=public · errors=[400]"
}
```

---

## 実行

```bash
# 単一機能（黄金 #05）
node scripts/ihl-doc-micro-workorder.mjs --feature 05
# 全機能
node scripts/ihl-doc-micro-workorder.mjs --all
```

出力: `docs/planning/audits/WorkOrder-NN-MICRO.json`（`slice_counts.by_type` / `by_owner` / `fr_slices_truncated` を含む）。

> **truncation**: スライスが `MAX_SLICES=150` を超える場合、fr-1id を打ち切り `fr_slices_truncated` に記録する。打ち切り分は次段 Wave または `--feature` 再実行時に MAX 引き上げで拾う。
