# ADR-H-34 — 観測 UX × 研究データ品質 v1（Executive Summary · DRAFT）

> **ステータス**: DRAFT（2026-06-21）— **設計ゲート ユーザー明示承認済**（DELEGATED-DESIGN-GO + DELEGATED-TEST-DESIGN-GO · §4.16 OBS-RX-* 確定 · 2026-06-21）· **HUMAN-ADR-H-34**（DRAFT→Accepted 昇格）は **任意** · **DELEGATED-IMPL-GO 未付与**（実装後打鍵フィードバック待ち）  
> **設計正本**: 同上 ADR-H-33 設計正本リンク  
> **Changelog**: 2026-06-21 — §5 次回観測スケジュール（60 日 nudge 廃止 → 入力時 `next_observation_at` + ホーム要約）  
> **正本要件**: [`05-観測.md`](../../01-要件/05-観測.md) **§4.16 OBS-RX-*** · **§4.17 次回観測スケジュール**  
> **上位 ADR**: [H-30](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) · [H-31](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) · [H-32](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md) · [H-33](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md)  
> **UI 正本**: [`ui-reference/preferences.md`](../../../../ui-reference/preferences.md) §A/C · [`definition-of-done-high-finish.md`](../../../../docs/2026.4.4/definition-of-done-high-finish.md) U-*

---

## 1. 決定要約（1 ページ）

**問い**: 観測 UX を軽く保ちつつ、後から研究・再解析に耐えるデータを残せるか？

**答え**: **はい** — 条件は「メタデータを commit 1 操作に内蔵し、ユーザー二重入力を禁止する」こと。

| 柱 | v1 採用 |
|----|---------|
| **UX** | 3 クリック · 3〜5 チャンク · confirm 主ボタン 1 つ · 「環境・設置」独立チャンク · **次回観測日ピッカー** · QR/続ける追記 · append-only 履歴 · **ホーム要約で upcoming/overdue** |
| **研究** | 全行 `source` · `observed_at`≠`committed_at` · binding 区間派生 · 構造化行 · gap 透明 · 再現性フック最小セット |
| **両立の芯** | **観測 commit = binding moment**（ADR-H-33）— 計測 + 設備宣言 + 区間境界を **同一 TX** |

---

## 2. アーキテクチャ（概念）

```text
[ユーザー] ──3クリック──▶ 入力（≤5チャンク）
                              │
                              ├─ 個体 / individual_id
                              ├─ 【環境・設置】placement + devices[] + □snapshot
                              ├─ 【次回観測】next_observation_at（テンプレ stage プリフィル）
                              ├─ 計測行（構造化 · source 自動）
                              ├─ 撮影条件行（構造化）
                              └─ confirm（主ボタン1 · binding変更 · 次回日サマリー）
                                    │
                                    ▼ POST commit（単一 TX）
                              ┌─────────────────┐
                              │ capture INSERT   │
                              │ measurements[]   │
                              │ observation_     │
                              │  schedule?       │
                              │ derived:         │
                              │  DeviceBinding   │
                              │  Occupancy       │
                              └─────────────────┘
                                    │
                    ホーム today_lines ← upcoming/overdue クエリ
                    Tier B telemetry × 区間 JOIN（ver2 API / ver1 手動）
```

---

## 3. OBS-RX-* 索引（要件 ID 早見）

| 束 | ID 範囲 | 内容 |
|----|---------|------|
| UX 柱 | OBS-RX-UX-01〜11 | チャンク · 3-click · 主ボタン · 環境チャンク · **次回観測ピッカー** · **ホーム要約** · 追記 · 履歴 · confirm サマリー |
| 研究柱 | OBS-RX-RD-01〜11 | provenance · 時系列 · binding · 構造化 · gap · 再現性 · subject_ref · 409 キー · **observation_schedule** |
| 再現性 | OBS-RX-REP-01〜08 | BPCMS ver1 最小 vs ver2 strict |
| 追記・設備 | OBS-FUP-01〜11 | ADR-H-33 要件化済（§4.15 · §4.17） |
| テンプレ interval | OBS-TPL-22/23 | stage 別次回観測プリフィル |

詳細・受入基準・バランス表 → [`05-観測.md`](../../01-要件/05-観測.md) §4.16。

---

## 4. バランス表（要約）

| UX 目標 | 研究メタデータ | ユーザー負担 |
|---------|---------------|-------------|
| 3 クリック開始 | `entry_mode` · IDs | 低 — 自動採番 |
| 5 チャンク以内 | スキーマ境界 | 低 — プリフィル |
| commit 1 ボタン | 全 provenance + binding | **最低** — 派生自動 |
| 環境・設置 1 塊 | placement · devices · snapshot | 中 — 前回引用 |
| 正直な gap | missing / imputed 分離 | 低 — 表示のみ |
| 次回観測 | `observation_schedule` · テンプレ interval | 低 — 1 date picker · テンプレプリフィル |
| 再解析 | digest · manifest | **ゼロ追加** |

---

## 5. ver1 / ver2 境界（確定）

| 機能 | ver1 IN | ver2 OUT |
|------|---------|----------|
| commit + devices[] + binding 派生 | ✓ | |
| 環境・設置チャンク | ✓ | |
| **次回観測日**（入力 + テンプレ + ホーム要約） | ✓ | プッシュ通知 |
| QR / 観測を続ける | ✓ | ネイティブ QR |
| 計測行 IoT デバイス必須 | | ✓（OBS-INPUT-06/07） |
| IHL サーバ secret poll | | ✓（ADR-H-30 却下） |
| ~~2 ヶ月 nudge~~ **廃止** | ユーザー指定日 + ホーム要約 | — |
| BPCMS strict · 査読級 B+ | 最小メタのみ | 機材義務全文 |
| サーバ JOIN telemetry API | 手動/history | `GET .../subjects/.../telemetry` |
| community fork · タグ投票 | | ✓ |

---

## 6. ADR-H-33 §15 矛盾 — 解消記録

| 論点 | v1.0 確定 |
|------|-----------|
| 計測行 IoT vs 環境チャンク | 計測行=ver2 · 環境チャンク=ver1 |
| MVP env IoT | フル統合=OUT · commit 宣言=IN |
| `subject_ref` | `@individual/{id}` |
| FR-ENV-02 409 | `(placement_id, device_id, role)` |
| DeviceBinding API | commit 派生=P0 · 単独 API=P1 |

---

## 7. BPCMS / 再現性 — ver1 最小メタデータ

ver1 で **必ず** commit に含める（査読 strict は ver2）:

- `capture_id` · `prior_capture_id` · `individual_id`
- `observed_at` · `committed_at` · `entry_mode`
- `placement_id` · `devices[]`（id · role · source）
- 任意 **`next_observation_at`** · 派生 **`observation_schedule.scheduled`**
- `measurement[]` — name · value · unit · **method** · **source** · **value_origin**
- `photo_conditions[]` — 構造化行
- taxonomy — user-confirmed only
- `schema_version` · `clientContentDigest`
- 任意 `environment_snapshot`（点 · 区間と分離）

参照: OBS-RX-REP-* · OBS-REP-02/04/05/08 · `reanalysis-manifest`。

---

## 8. データ取得元との接続

| 経路 | 役割 | ADR |
|------|------|-----|
| 観測 commit | **主** — binding/occupancy 派生 · **observation_schedule** | H-33 · [`13-データ取得元管理.md`](../../01-要件/13-データ取得元管理.md) §② |
| ホーム summary | upcoming/overdue 個体 | #04 · `GET /api/v1/home/summary` |
| ユーザー PC poll | Tier B forward | H-30 §10 C |
| Export → Import | backfill | H-31 |
| 手入力 snapshot | 観測時点の点 | H-30 §10 B |
| 棚 API 単独 | 観測なし設備変更 | H-33 P1 |

---

## 9. 人間ゲート

| 項目 | 状態 |
|------|------|
| OBS-RX-* §4.16 | **v1.0 要件確定候補** — **人間レビュー OK**（2026-06-21） |
| 本 ADR H-34 | DRAFT — **設計ゲート 4 点完了** · H-33/H-30 とセットで ADR 昇格可（HUMAN-ADR-H-34） |
| 設計ゲート 5 点 | **#2–#5 完了**（v2.0 人間レビュー済 · 2026-06-21）· 要件 #1 レビュー OK · IMPL = DELEGATED-IMPL-GO 待ち |
| BPCMS strict | ver2 · 人間判断 |
| プッシュ通知（次回観測） | ver2 · オプトイン · 別 ADR |
| HUMAN-IMPORT-SCHEMA | 未決 |
| 実機 SwitchBot · 本番 R2 | 人間確認（OBS-NF-09） |

---

## 10. 参照

- [`05-観測.md`](../../01-要件/05-観測.md) §4.15 OBS-FUP · §4.16 OBS-RX-* · **§4.17 次回観測スケジュール**
- [`04-ホーム画面.md`](../../01-要件/04-ホーム画面.md) H-044 · G-H-03 — 観測通知統合
- [`13-データ取得元管理.md`](../../01-要件/13-データ取得元管理.md) §② commit 主経路
- [`Phase6-打鍵フィードバック-v1.md`](../Phase6-打鍵フィードバック-v1.md) §4.7
- [`ui-reference/preferences.md`](../../../../ui-reference/preferences.md)
- `civilization/ProjectRules.md` — INSERT ONLY

---

*v1.0 要件確定候補 · 2026-06-21 · 設計のみ — IMPL は DELEGATED-IMPL-GO 後*
