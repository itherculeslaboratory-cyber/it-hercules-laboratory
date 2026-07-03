---
slice_id: 05-MICRO-fr-012
type: fr-1id
req_id: OBS-ENV-04
owner: auto
rtm_status: xref
---

# 05-MICRO-fr-012 — OBS-ENV-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-04 · RTM `status=xref`
- **acceptance**: OBS-ENV-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ユーザー PC 上の **ローカル collector**（Ed25519 署名付き）が環境計測を **`POST /api/env/collector/ingest`** 経由で R2 `world/env/...` に **INSERT ONLY** 蓄積すること。SwitchBot token 等の **秘密は `collector/.env` のみ** — IHL サーバ repo・応答・ログに出さない（REQ-027 · OBS-NF-02）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | collector 署名済 payload · device_id · readings（temp/humidity 等）· `captured_at` |
| **Transform** | ingest handler が署名検証 → telemetry イベント INSERT · env-samples index 追記 |
| **OUT** | 201 ingest 応答 · 観測 commit は **telemetry_bucket 参照** で measurement 2 行写像（OBS-ENV-02） |

## 受入基準

1. 秘密鍵・SwitchBot token は **collector/.env のみ** — API 応答・commit body に含まない。
2. 署名不正 · payload 検証失敗 → **401/400**（#13 エラーカタログ正本）。
3. `UAT-05-03`: env chain retrofit（`test_solid_commit_iot_switchbot_env_chain`）が telemetry 参照経路を緑 — collector 経路は **#13 UAT 横断 · xref**。
4. ADR-H-30: IHL サーバ secret live poll **禁止** — collector / Docker poll / Import のみ。
5. INSERT ONLY — 同一 sample 上書き禁止（OBS-R2-01 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| ローカル collector プロセス | signed ingest イベント |
| `collector/.env` 秘密 | env-samples JSON + index |
| — | 観測 Web ingest UI（#05 スコープ外 · #13） |
| — | サーバ側 SwitchBot API 直接呼出 |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 Out | collector ingest → #13 |
| §6 | 秘密非表示 · OBS-NF-02 |
| §2.2 | telemetry → measurement 写像（観測側） |

> ingest route 契約は **#13 契約レジスタ** 正本 — 観測 slices/api には **未掲載**（層分離）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-04 |
| design_section | §1.2 #13 collector |
| test_case_id | UAT-05-03 |
| test_layer | acceptance |
| automation | review |
| status | **xref** |

逆 RTM: UAT-05-03 は OBS-ENV-04（xref）· OBS-FUP-10（deferred）を束ねる（`revrtm-004-acceptance-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 横断 | #13 collector ingest · REQ-027 |
| ADR | ADR-H-30 · ADR-H-31（Import 代替経路） |
| 観測連携 | [`post-api-captures.md`](../api/post-api-captures.md) · env chain 分岐 |
| 運用 | `solid-switchbot-operating-checklist.md` · precheck 5 分類 |
| テスト | `test_solid_commit_iot_switchbot_env_chain`（telemetry 参照 · retrofit） |

## gap 注記

- **xref + deferred 混在**: UAT-05-03 束ねに OBS-FUP-10（follow-up 横断）— collector 単体 UAT は #13 側で完結させる。
- **IHL rebuild**: collector 実装は civilization-os salvage 参照 — ingest API 配線は #13 マイルストーン。
- **代替導線**: Export→Import（ADR-H-31）+ Docker poll — collector 未配置でも env chain は **手動/Import** で検証可。
