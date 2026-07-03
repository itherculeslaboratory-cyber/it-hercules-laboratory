# #04 ホーム — MICRO スライス作業場

> **合図**: `IHL-DOC-REMED MAD` · **作業票**: [`docs/planning/audits/WorkOrder-04-MICRO.json`](../../../docs/planning/audits/WorkOrder-04-MICRO.json)  
> **索引**: [`docs/planning/audits/slice-index-04.json`](../../../docs/planning/audits/slice-index-04.json) · DET §8  
> **GOLDEN**: [`docs/planning/golden/GOLDEN-04-MANIFEST.md`](../../../docs/planning/golden/GOLDEN-04-MANIFEST.md)

---

## カテゴリ

| ディレクトリ | 件数 | 内容 |
|--------------|------|------|
| [`api/`](./api/) | 1 | `GET /api/v1/home/summary` |
| [`schema/`](./schema/) | 3 | 応答 DTO（HomeSummaryResponse · HomeCard · HomePrimaryCta） |
| [`reverse-rtm/`](./reverse-rtm/) | 4 | test→req 逆引き（層別） |
| [`fr/`](./fr/) | 37 | `H-*` · `NF-H-*` · OBS 横断 1 文正規化 |

**screen なし** — UI 状態は [`ui/UI設計-v1.md`](../ui/UI設計-v1.md) · [`遷移設計-v1.md`](../遷移設計-v1.md) を正とする。

---

## ルール

1. **本文マージ禁止** — 各 md を正本とし、DET v3 §8 は索引のみ。
2. **gap/deferred 粉飭禁止** — RTM status をそのまま記述。
3. **IHL 実装正本** — `apps/api/main.py` `home_summary`（legacy dashboard は salvage 参照のみ）。
