# #12 設定 — MICRO スライス作業場

> **合図**: `IHL-DOC-REMED MAD` · **作業票**: [`docs/planning/audits/WorkOrder-12-MICRO.json`](../../../docs/planning/audits/WorkOrder-12-MICRO.json)  
> **索引**: [`docs/planning/audits/slice-index-12.json`](../../../docs/planning/audits/slice-index-12.json) · DET §8  
> **GOLDEN**: [`docs/planning/golden/GOLDEN-12-MANIFEST.md`](../../../docs/planning/golden/GOLDEN-12-MANIFEST.md)

---

## カテゴリ

| ディレクトリ | 件数 | 内容 |
|--------------|------|------|
| [`api/`](./api/) | 5 | preferences · settings · pii-session |
| [`schema/`](./schema/) | 2 | PreferencesPatchBody · PreferencesProjection |
| [`reverse-rtm/`](./reverse-rtm/) | 4 | test→req 逆引き（層別） |
| [`fr/`](./fr/) | 24 | `FR-SET-*` · `NFR-SET-*` 1 文正規化 |

**screen/error なし** — UI 状態は [`ui/UI設計-v1.md`](../ui/UI設計-v1.md) · [`遷移設計-v1.md`](../遷移設計-v1.md) を正とする。HTTP 4xx は route 契約上なし。

---

## ルール

1. **本文マージ禁止** — 各 md を正本とし、DET v3 §8 は索引のみ。
2. **gap/deferred 粉飭禁止** — RTM status をそのまま記述。
3. **IHL 実装正本** — `apps/api/routes/me.py` · `apps/api/main.py` · `libs/ihl/identity/preferences_store.py`（legacy MeSettingsPage は salvage 参照のみ）。
