# DOC-SPOT — Wave 1 スポット監査（機械 + 文書）

> **日付**: 2026-07-03 · **対象**: #01 ログイン · #05 観測（抽選 2 機能）

## #05 観測 — PASS（条件付き）

| 項目 | 結果 |
|------|------|
| DET v3 | 533 行（v2 501 → +32 · IMPL-GAP §3.9–3.10 追加） |
| REQ OBS-GAP | §補遺 3 件追記済 |
| parity | PASS |
| RTM 機械 | 114 issues（planned/gap 行の TC 未実在 — 正直に残存） |

**所見**: Scope A · AuthenticatedImage · READ/WRITE 分離は文書化完了。gap 行の粉飾なし。

## #01 ログイン — PASS

| 項目 | 結果 |
|------|------|
| DET v3 | 272 行 |
| IMPL-GAP | 3 API routes → DET §7.1 追跡 |
| parity | 要 `node scripts/ihl-design-impl-parity-check.mjs --feature 01` |

## Wave 1 残

- #02 法務条文 HUMAN-02-LEGAL 未触
- #03 #04 #12 DET v3 草案化済 · TD 追跡表 appended

## 次アクション

- `IHL-DOC-REMED` で Wave 1 残 GATE 項目
- RTM `planned` は **捏造 existing 禁止** — テスト実装は別キュー
