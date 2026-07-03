# #16 UIbuilder — MICRO スライス作業場

> **合図**: `IHL-DOC-REMED MAD` · **作業票**: [`docs/planning/audits/WorkOrder-16-MICRO.json`](../../../docs/planning/audits/WorkOrder-16-MICRO.json)  
> **索引**: [`docs/planning/audits/slice-index-16.json`](../../../docs/planning/audits/slice-index-16.json) · DET §8  
> **GOLDEN**: [`docs/planning/golden/GOLDEN-16-MANIFEST.md`](../../../docs/planning/golden/GOLDEN-16-MANIFEST.md)

---

## カテゴリ

| ディレクトリ | 件数 | 内容 |
|--------------|------|------|
| [`api/`](./api/) | 4 | route 契約 1 本ずつ |
| [`schema/`](./schema/) | 2 | Pydantic DTO |
| [`errors/`](./errors/) | 1 | HTTP エラーコード |
| [`reverse-rtm/`](./reverse-rtm/) | 0 | test→req 逆引き（層別） |
| [`fr/`](./fr/) | 18 | req_id 1 文正規化 |

---

## ルール

1. **本文マージ禁止** — 各 md を正本とし、DET v3 §8 は索引のみ。
2. **gap/deferred 粉飭禁止** — RTM status をそのまま記述。
3. **IHL 実装正本** — 契約レジスタ-v1.yaml · route ファイル。
