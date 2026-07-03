---
slice_id: 05-MICRO-fr-044
type: fr-1id
req_id: OBS-TPL-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-044 — OBS-TPL-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-03 · RTM `status=planned`
- **acceptance**: OBS-TPL-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測入力で **項目名（`measurement_name`）** を辞書候補から選択するか **「＋ 自由入力」** で新規追加できること（ADR-H-13 §5）。雌雄テンプレ切替（OBS-TPL-01/02）と併用し、テンプレ未登録項目でも記録を阻害しない（OBS-INPUT-04 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `measurement_name.yaml` 候補 · ユーザー DD 選択 · 自由入力文字列 |
| **Transform** | 候補選択 → 正規名確定 · 自由入力 → `MEASUREMENT_NAME_MAP` 正規化 · 辞書拡張 API（任意） |
| **OUT** | 正規化済み `measurement_name` · 計測行 draft · 辞書拡張イベント（201） |

## 受入基準

1. 入力 UI に **「＋ 自由入力」** 導線（ADR-H-13 §5 · `入力UI設計-v1.md`）。
2. 日本語ラベル（体長/角長）→ 正規名変換（`MEASUREMENT_NAME_MAP` · DET §3.3）。
3. UT-05-06（planned）: `test_ut_05_06_measurement_name_normalized`。
4. `POST /dictionary-extensions` で候補辞書を **INSERT** 拡張可（Wave C · 補助）。
5. 性別切替は **表示分岐のみ** — 既存行の measurement_name は非破壊（ADR-H-13 §D6）。

## In / Out 境界

| In | Out |
|----|-----|
| 辞書候補 DD | 正規 `measurement_name` |
| 自由入力テキスト | 計測行 · 辞書拡張行 |
| — | テンプレ必須による自由入力拒否 |
| — | 正規化なしの raw ラベル永続 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | 正規名写像 |
| §3.3 | `POST /measurements` v1 経路 |
| §3.9 | dictionary-extensions |
| ADR-H-13 §5 | 自由入力導線 |

> Schema: [`measurementrow.md`](../schema/measurementrow.md) · [`dictionaryextensionrequest.md`](../schema/dictionaryextensionrequest.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-03 |
| design_section | §3.3 正規名 |
| test_case_id | UT-05-06 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-06 — OBS-TPL-03 のみ（`revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-v1-observation-measurements.md`](../api/post-api-v1-observation-measurements.md) · dictionary-extensions |
| Schema | [`measurementsaverequest.md`](../schema/measurementsaverequest.md) |
| Dict | `measurement_name.yaml` |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | `test_ut_05_06_*`（retrofit 待ち） |

## gap 注記

- **planned**: v1 正規化ロジックは設計確定 — **専用 UT 未緑** で planned 維持。
- **INPUT-03/04**: Phase6 打鍵 FB は本 FR を補強 — 重複ではなく導線拡張。
- **層分離**: API 契約は slices/api 正本 — 本 FR は要件意図の固定。
