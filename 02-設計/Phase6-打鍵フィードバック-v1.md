# Phase 6 打鍵フィードバック v1

> **ステータス**: ユーザー確定記録  
> **確定日**: 2026-06-07  
> **文脈**: Phase 6 **Wave A**（W0–W3 ver1 観測コア）段階打鍵 · [`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](./ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) §段階打鍵  
> **正本（スコープ）**: [`01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](../01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.6 · §0 確定 D
> **後続設計（プチWF）**: [`ADR-プチWF-観測ver1残件と命名-v1-DRAFT.md`](./ADR-プチWF-観測ver1残件と命名-v1-DRAFT.md)

---

## 1. ユーザー決定（2026-06-07）

打鍵・Wave A 計画レビューに基づき、次を **ver2**（post-ver1）へ延期:

| 項目 | 延期先 | FR 正本 |
|------|--------|---------|
| アキネーター | **ver2** | OBS-TGT-03 |
| SwitchBot | **ver2** | OBS-ENV-02 ~ OBS-ENV-06 |
| タグ洗練 | **ver2** | OBS-TAG-01 |

**区分**: **確定 2026-06-07**（実装 AI は ver1 W3 スコープに含めない）

### H2 / H3 追記（同日確定）

- **H2**: 観測登録は commit 契約で進める（confirm 送信で `sessionId` / `r2Key` を API 返却）。
- **H3**: R2 はハイブリッド（通常はローカル fallback、必要時のみ dev バケット）。

---

## 2. Wave A との関係

| Wave | ver1 範囲 | 本決定の影響 |
|------|-----------|--------------|
| W0 AppShell | シェル・nav | 変更なし |
| W1 Auth | ログイン · terms · language | 変更なし |
| W2 Home | ホーム CTA · stub summary | 変更なし |
| W3 Observation core | context → input → confirm → done · templates · QR/scan | **コア導線のみ** — アキネーター / SwitchBot / タグ洗練 UI は **ver2 backlog** |

ver1 shippable 判定は [`00-プロダクト方針`](../01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.5（W0+W1+W2+W3 + Tier B/D）のまま。ver2 項目は Phase 6 Wave A の Tier D チェックリストから **除外**（または「意図的延期」行として記録）。

---

## 3. 実装・設計 AI 向け

1. ver1 画面にユーザー向け「未実装」は出さない（`no-user-facing-unimplemented`）。ver2 機能は **導線を置かない**か、既存フローで代替。
2. ver2 着手時は `FR-EXT-02` mini Phase + RTM 更新 + `05-観測.md` 該当 OBS のテスト設計から。
3. 進捗実装の参照: [`Phase6-W1-W3-進捗-v1.md`](./Phase6-W1-W3-進捗-v1.md)

---

## 4. 追加打鍵フィードバック（2026-06-21）

> `/observation/input`・`/observation/input/confirm` でのユーザー再打鍵結果。  
> 反映先正本: `01-要件/05-観測.md`（§4.9 追補）。

| # | ユーザー発言（要約） | 反映 FR | ver 判定 |
|---|---|---|---|
| 1 | 「テンプレが Dynastes hercules hercules に紐づくのか不明」 | OBS-TPL-19 | **ver1 IN** |
| 2 | 「フェーズ選択がない（初令/2令/3令初期/3令後期/前蛹/蛹/生体）」 | OBS-INPUT-01 | **ver1 IN** |
| 3 | 「性別選択がない（任意で入れたい）」 | OBS-INPUT-02 | **ver1 IN** |
| 4-1 | 「計測行 DD の末尾に追加がほしい」 | OBS-INPUT-03 | **ver1 IN** |
| 4-2 | 「項目を追加できない」 | OBS-INPUT-04（OBS-TPL-03 補強） | **ver1 IN** |
| 4-3 | 「単位を追加できない」 | OBS-INPUT-05（OBS-TPL-07 補強） | **ver1 IN** |
| 4-4 | 「SwitchBot は選べるのに実機を選べない/管理画面へ行けない」 | OBS-INPUT-06 | **ver2 OUT**（2026-06-07 方針） |
| 5 | 「定期取得オンでもデバイス選択できない」 | OBS-INPUT-07 | **ver2 OUT**（2026-06-07 方針） |
| 6 | 「撮影条件が自由入力で使い物にならない。行構造にしてほしい」 | OBS-PHOTO-01 | **ver1 IN** |
| 7 | 「登録時にそのままテンプレ保存したい」 | OBS-TPL-18 | **ver1 IN** |
| 8 | 「テンプレをフォークして共有したい」 | OBS-TPL-20 | **ver2 OUT** |
| 9 | 「タグ/テンプレが投票で自然淘汰される設計が核」 | OBS-TPL-21（+ OBS-TAG-01 連携） | **ver2 OUT（C-2）** |

### 4.1 ver1 実装対象（本フィードバック起点）

- OBS-TPL-18, OBS-TPL-19
- OBS-INPUT-01, 02, 03, 04, 05
- OBS-PHOTO-01

### 4.3 実装ステータス（2026-06-21 反映）

| FR | 実装状況 | 備考 |
|---|---|---|
| OBS-INPUT-01 | 実装済み | `/observation/input` にフェーズ DD（初令/2令/3令初期/3令後期/前蛹/蛹/生体）を追加。`stage_name` + `larva_subtype` + `phase_label` を commit payload に送信。 |
| OBS-INPUT-02 | 実装済み | 性別 DD（unknown/male/female/not_applicable）を追加。任意入力のまま保存可能。 |
| OBS-INPUT-03 | 実装済み | 計測行 DD 末尾に「＋ 項目を追加」「＋ 行を追加」を追加。 |
| OBS-INPUT-04 | 実装済み | 項目を入力画面から追加でき、辞書拡張イベント API（`/api/v1/observation/dictionary-extensions`）へ保存。 |
| OBS-INPUT-05 | 実装済み | 単位 DD に「＋ 単位を追加」を追加。辞書拡張イベント API へ保存。 |
| OBS-PHOTO-01 | 実装済み | 撮影条件を構造化行（項目/値/単位/追加）へ変更。 |
| OBS-TPL-18 | 実装済み | `/observation/input/confirm` に「この設定をテンプレートとして保存」ボタン追加。 |
| OBS-TPL-19 | 実装済み | テンプレを `target_species` で束縛し、入力画面で種族一致/不一致を表示。 |

### 4.2 ver2 backlog 送り（本フィードバック起点）

- OBS-INPUT-06, OBS-INPUT-07（SwitchBot 実デバイス選択/定期取得デバイス選択）
- OBS-TPL-20（community fork）
- OBS-TPL-21（投票/自然淘汰）

### 4.4 追補（2026-06-21 / SwitchBot 実機選択）

- API `GET /api/v1/devices` は、`SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` 設定時に SwitchBot Cloud 連携機器を返す（`source=switchbot`）。
- `/settings/devices` で `device_id` ごとに管理用名称（`display_name`）を上書き可能。観測入力のデバイス選択は `display_name` を表示し、生 ID のみ表示を回避。
- 秘密値は API 応答へ含めない（token/secret 非露出）。

### 4.5 追補（2026-06-21 / 写真入力 UX 改善）

- OBS-PHOTO-01 を再補強し、撮影条件は計測行と同じ「行構造 DD（項目/値/単位 + 追加）」へ統一。
- 「撮影時の環境取得（任意）」UI は撤去し、IoT 行に機器がある場合のみ撮影後に背景で環境スナップショットを付与。
- 「撮影する」は `MediaDevices.getUserMedia` のプレビュー導線（デバイス選択→撮影）へ更新し、`写真を選択` は別ボタンで維持。

### 4.6 追補（2026-06-21 / 検索詳細の可変項目表示）

- `/observation` 検索結果および `/observation/:id` 詳細での「可変フィールド全面表示」は **ver2 polish** に延期。
- ver1 は観測導線（context → input → confirm → done）と命名・親設定の最小運用を優先し、検索詳細の拡張は Phase6 ver2 backlog とする。

### 4.7 追補（2026-06-21 / env IoT v1 運用凍結）

> **ユーザー決定 · 凍結** — 詳細 [`ADR-H-30`](../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) §10

| 項目 | 内容 |
|------|------|
| **取得** | (1) **ユーザー PC** Docker / collector 定期 poll（主） · (2) **たまに** SwitchBot Export → IHL import（補） · IHL サーバ secret poll **却下** |
| **記録** | **個体↔温度計↔期間** — [`ADR-H-33`](../02-設計/_横断/adr/ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md): **観測 commit から Occupancy/DeviceBinding 自動派生**（主経路） |
| **HUMAN-ADR-H-30** | **運用凍結済み · 確定待ち**（ADR ステータス昇格のみ残） |
| **ver1 gap** | **`derive_bindings_from_observation()` 未実装** — commit 時 device 宣言 → 区間イベント派生が blocking（単独 DeviceBinding API は P1 任意） |

### 4.8 追補（2026-06-25 / 構造化行統一 · B モデル）

| 項目 | 内容 |
|------|------|
| **決定** | 温湿度を撮影条件へ自動注入しない · StructuredRow 統一 · 環境スナップショットは環境・設置チャンク |
| **要件** | `05-観測.md` §4.18 OBS-RX-ROW-* |
| **ADR** | [ADR-H-36](../02-設計/_横断/adr/ADR-H-36-構造化行統一-v1-DRAFT.md) |
| **実装** | `StructuredRow.tsx` · `GET /api/env/devices/{id}/latest` · commit `environment_snapshot` · **ver1 COMPLETE 2026-06-26** |

§4.5「撮影後背景 env snapshot」は **撮影条件マージ廃止** — スナップショットは §4.18 に従い環境チャンクのみ。

*打鍵フィードバック記録 · コミット前ドラフト可*
