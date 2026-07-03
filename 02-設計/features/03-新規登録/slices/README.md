# #03 新規登録 — マイクロスライス作業場

> **合図**: `IHL-DOC-REMED MAD` · **作業票**: [`../../../../docs/planning/audits/WorkOrder-03-MICRO.json`](../../../../docs/planning/audits/WorkOrder-03-MICRO.json)  
> **辞典**: [`../../../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md)

---

## これは何か

`WorkOrder-03-MICRO.json` の各スライス（1 route / 1 モデル / 1 エラー / 1 req_id）が **1 ファイルずつ**書かれる場所。Best-of-N の Auto ワーカーは **1 スライスだけ**を担当し、ここに成果物を置く。

## ディレクトリ

| dir | 種 | 命名 | 例 |
|-----|----|------|----|
| `api/` | api-1route | `<method>-<path>.md` | `post-api-v1-onboarding-complete.md` |
| `schema/` | schema-field | `<model>.md` | `onboardingcompletebody.md` |
| `errors/` | error-code | `<code>.md` | `409.md` |
| `reverse-rtm/` | reverse-rtm | `revrtm-NNN-<layer>.md` | `revrtm-001-unit-layer.md` |
| `fr/` | fr-1id | `<req_id>.md` | `fr-reg-12.md` |

> 逆RTM CSV 正本: `04-トレーサ/features/03-新規登録/逆RTM-v1.csv`（`ihl-reverse-rtm.mjs --write`）。

## 完了条件

- acceptance の **全項目**を満たす
- 契約オラクル（api-1route）· layering · rtm-coverage が PASS
- Best-of-N 採点 ≥ 85（C コード一致 ≥ 25）

## 禁止

- 実装コード変更（文書化のみ）
- 実装に無い route/フィールドの断定
- ユーザー向け「未実装」語
