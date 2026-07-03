# #17 UI選択 — MICRO スライス作業場

> **合図**: `IHL-DOC-REMED MAD` · **作業票**: [`docs/planning/audits/WorkOrder-17-MICRO.json`](../../../docs/planning/audits/WorkOrder-17-MICRO.json)  
> **索引**: [`docs/planning/audits/slice-index-17.json`](../../../docs/planning/audits/slice-index-17.json) · DET §8  
> **GOLDEN**: [`docs/planning/golden/GOLDEN-17-MANIFEST.md`](../../../docs/planning/golden/GOLDEN-17-MANIFEST.md)

---

## カテゴリ

| ディレクトリ | 件数 | 内容 |
|--------------|------|------|
| [`api/`](./api/) | 2 | route 契約 1 本ずつ |
| [`schema/`](./schema/) | 1 | Pydantic DTO |
| [`errors/`](./errors/) | 0 | HTTP エラーコード |
| [`reverse-rtm/`](./reverse-rtm/) | 0 | test→req 逆引き（層別） |
| [`fr/`](./fr/) | 12 | req_id 1 文正規化 |

---

## ルール

1. **本文マージ禁止** — 各 md を正本とし、DET v3 §8 は索引のみ。
2. **gap/deferred 粉飭禁止** — RTM status をそのまま記述。
3. **IHL 実装正本** — 契約レジスタ-v1.yaml · route ファイル。
