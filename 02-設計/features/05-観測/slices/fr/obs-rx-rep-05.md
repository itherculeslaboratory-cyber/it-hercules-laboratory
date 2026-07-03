---
slice_id: 05-MICRO-fr-095
type: fr-1id
req_id: OBS-RX-REP-05
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-095 — OBS-RX-REP-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.5 OBS-RX-REP-05 · §4.16.7 · RTM `status=review`
- **acceptance**: OBS-RX-REP-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`clientContentDigest`** canonical SHA-256 — commit 内容の決定論的ダイジェストを保存し、再解析・監査で **同一入力=同一 digest** を保証すること。legacy civ-os 契約 · **IHL commit 未配線**（ver2 · tier-a review）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit body 全フィールド · canonical JSON キー順 · クライアント/サーバ digest 計算 |
| **Transform** | SHA-256(canonical JSON) → `clientContentDigest` 保存 · manifest へ伝播 |
| **OUT** | capture · manifest — digest フィールド · 再現性検証可能 |

## 受入基準

1. canonical JSON: キー順固定 · 浮動小数正規化 — civ-os `ProjectRules` 契約準拠（§3.3.1）。
2. manifest 必須キーに `clientContentDigest` 含む（REP-05 · RD-06 · api-003）。
3. UT-05-02（review）: OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 と **5 req 束ね**（`revrtm-001`）。
4. **IHL commit 未配線**: サーバ側計算/検証は **gap-impl** — tier-a review 維持。
5. bundle 追加時（OBS-REP-04）: canonical キー集合変更 — digest 再計算必須。

## In / Out 境界

| In | Out |
|----|-----|
| commit 全メタ | `clientContentDigest` |
| canonical 規則 | manifest/reanalysis 参照 |
| — | digest なし commit を本番完了と称しない |
| — | 非決定論的 JSON シリアライズ |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3.1 | digest canonical 規則 |
| §9.1 | 再現性最小 — digest 必須 |
| §4.16.5 | ver2 · legacy 契約 |
| civ-os | `buildSolidObservationReanalysisManifest` |

> ペア: [`obs-rx-rd-06.md`](obs-rx-rd-06.md) · [`obs-rep-05.md`](obs-rep-05.md) · [`obs-rep-08.md`](obs-rep-08.md) · [`obs-sol-02.md`](obs-sol-02.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-REP-05 |
| design_section | §9.1 digest |
| test_case_id | UT-05-02 |
| test_layer | unit |
| automation | pytest |
| status | **review** |

逆 RTM: UT-05-02 — OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05（5 req 束ね · `revrtm-001` · review）。

## 実装 surface

| 層 | 参照 |
|----|------|
| civ-os | digest 計算正本 |
| IHL Lib | **未配線** — gap-impl |
| API | manifest `clientContentDigest` |
| テスト | UT-05-02 部分 — IHL commit 側未 |

## gap 注記

- **review · tier-a**: civ-os 実装あり — IHL commit body への **配線待ち**。
- **ver2 宣言**: 要件 §4.16.5 は ver2 — RTM review で **意図的延期**と監査分離。
- **REP-08 連携**: ScreenDef キャンバス統合は別 FR — digest は **データ契約**のみ。
