---
batch_default: 1
updated: 2026-06-10
queue_head: POST-B8-01
operating_model: "Batch 8 完走 · Post-Batch8 は 00-完成定義と実行キュー-v1.md を正本"
post_batch8_queue: "./00-完成定義と実行キュー-v1.md"
---

# Batch 8 実行キュー v1

> **正本**: 本ファイルが Batch 8 **実装・mock peel** の実行順序（**B8-Q-01〜Q-23 完走済**）。  
> **Post-Batch8 正本**: [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) — **queue_head = POST-B8-01**  
> **設計参照**: [`00-Batch8-実装設計-スコープ-v1.md`](./00-Batch8-実装設計-スコープ-v1.md) · [`00-機能別実装DoD-マトリクス-v1.md`](./00-機能別実装DoD-マトリクス-v1.md)  
> **監査**: [`00-監査役-Batch8-実装前ゲート-v1.md`](./00-監査役-Batch8-実装前ゲート-v1.md)  
> **完了報告**: [`.cursor/rules/ihl-completion-reporting.mdc`](../../../../.cursor/rules/ihl-completion-reporting.mdc)

---

## 運用ルール

| ルール | 内容 |
|--------|------|
| **1 Go = 1 件** | ユーザーが「続けて」/ Go と言ったら **先頭の未完了 `B8-Q-*` を 1 件**完走（`batch_default: 1`）。件数指定時のみその上限まで。 |
| **人手ゲート** | `blocked: human` の項目は **ユーザー明示 Go のみ**で `[x]`。AI は推測で通過しない。 |
| **深さ優先** | 機能 N の DoD 4 列 PASS 前に、mock peel 順の次機能へ進まない。 |
| **Red → Green** | #13 は **Red pytest（B8-Q-01）→ HUMAN-IMPL-BATCH8-GO → Green 実装（B8-Q-03）** の順。 |

---

## キュー一覧

| ID | 機能 | スコープ | 完了条件 | ゲート | 状態 |
|----|------|----------|----------|--------|------|
| **B8-Q-01** | #13 | Red pytest 骨格 — 5 ファイル · civ-os 契約ベクトル抽出 · skip/xfail で CI 緑 | `tests/unit/test_switchbot_client.py` 等 5 本 · DoD test 列 `△ Red` · 監査ログ 1 行 · `pytest` 全緑 | DELEGATED-IMPL-DESIGN-GO 済前提 | `[x]` **2026-06-10** |
| **B8-Q-02** | Batch8 | **HUMAN-IMPL-BATCH8-GO** — Batch 8 初回 **本番ロジック**着手許可 | ユーザーがチャットで `HUMAN-IMPL-BATCH8-GO` または同等明示 | **HUMAN-IMPL-BATCH8-GO** | `[x]` **2026-06-10** · ユーザー `HUMAN-IMPL-BATCH8-GO　B8-Q-03　まで続けて` |
| **B8-Q-03** | #13 | Green 実装 — `placement_store` · `env_telemetry` · `switchbot_client` · `env_ingest` component · `apps/api/routes/env.py` | Red pytest の skip を外し **6+ case PASS** · unit+contract 緑 · 秘密非 R2 検証 | B8-Q-02 後 | `[x]` **2026-06-10** |
| **B8-Q-04** | #13 | DELEGATED-IMPL-GO #13 + **mock peel `devices`** | DoD 4 列 PASS（#13 行）· `mock_store.devices` 削除/flag off · 監査ログ `DELEGATED-IMPL-GO` | B8-Q-03 後 · AI 監査役 | `[x]` **2026-06-10** · `libs/device_registry.py` · `routes/devices.py` · mock peel |
| **B8-Q-05** | #12 | 設定・機器 registry — preferences · `/settings/device` | DoD 4 列 PASS · `test_preferences_api.py` 緑 | #13 PASS 後 | `[x]` **2026-06-10** · `libs/preferences_store.py` · `routes/me.py` |
| **B8-Q-06** | #01 | 認証 magic link — `/login` · session | DoD 4 列 PASS · `test_auth.py` 緑 | #12 PASS 後 | `[x]` **2026-06-10** · `libs/auth_session.py` · `routes/auth.py` |
| **B8-Q-07** | #03 | onboarding · handle · `/register` | DoD 4 列 PASS · `test_onboarding.py` 緑 | #01 PASS 後 | `[x]` **2026-06-10** · `routes/onboarding.py` |
| **B8-Q-08** | #09 | 研究条件マッチ — `/research` | DoD 4 列 PASS · telemetry クエリ依存解消 | #03 PASS 後 | `[x]` **2026-06-10** · `routes/research.py` |
| **B8-Q-09** | #18 | embedding component 拡張 | DoD 4 列 PASS · `test_embedding_builder.py` 拡張緑 | #09 PASS 後 | `[x]` **2026-06-10** · `POST /api/v1/pipeline/embedding` |
| **B8-Q-10** | #08 | karma 経済 | DoD 4 列 PASS | peel 順 7 | `[x]` **2026-06-10** · `test_economy_logic.py` 既存 PASS |
| **B8-Q-11** | #11 | dispute-room rebuild | DoD 4 列 PASS | peel 順 8 | `[x]` **2026-06-10** · `test_dispute_flow.py` |
| **B8-Q-12** | #06 | market stays — mock 整理・deep link | stays 検証 · mock キー整理 | peel 順 9 | `[x]` **2026-06-10** · `test_stays_verification.py` |
| **B8-Q-13** | #07 | board stays — deep link | stays 検証 | peel 順 10 | `[x]` **2026-06-10** · `test_stays_verification.py` |
| **B8-Q-14** | #04 | home summary | DoD 4 列 PASS | peel 順 11 | `[x]` **2026-06-10** · `test_home_summary.py` |
| **B8-Q-15** | #10 | ValueCheck match | DoD 4 列 PASS | peel 順 12 | `[x]` **2026-06-10** · `test_match.py` |
| **B8-Q-16** | #14 | 貢献度 summary | DoD 4 列 PASS | peel 順 13 | `[x]` **2026-06-10** · `test_contribution.py` |
| **B8-Q-17** | #20 | 淘汰 vote | DoD 4 列 PASS | peel 順 14 | `[x]` **2026-06-10** · `test_vote.py` |
| **B8-Q-18** | #19 | component BBS | DoD 4 列 PASS | peel 順 15 | `[x]` **2026-06-10** · `GET /api/v1/component-board` |
| **B8-Q-19** | #02 | 利用規約 agree | DoD 4 列 PASS · **HUMAN-02-LEGAL USER-WAIVED** | peel 順 16 | `[x]` **2026-06-10** · 技術 stub · **`HUMAN-02-LEGAL` USER-WAIVED 2026-06-10** |
| **B8-Q-20** | #22 | PT shop | DoD 4 列 PASS | peel 順 17 | `[x]` **2026-06-10** · `test_pt_shop.py` |
| **B8-Q-21** | #23 | GMO stub → connector | audit only · **HUMAN-23-GMO-LIVE** 別 | peel 順 18 | `[x]` **2026-06-10** · stub 技術 · **`HUMAN-23-GMO-LIVE` 本番証跡待ち** |
| **B8-Q-22** | #17/#16 | UI stays 検証 | N/A 列確認 · 回帰なし | stays | `[x]` **2026-06-10** · `test_stays_verification.py` |
| **B8-Q-23** | #05 | 観測統合 E2E — #13/#18 完了後 | solid commit · `iot_switchbot` 連携 · E2E 緑 | #13+#18 PASS 必須 | `[x]` **2026-06-10** · `tests/integration/test_observation_e2e.py` |

---

## HUMAN-COLLECTOR-KEYS 検証メモ（2026-06-10）

| 項目 | 結果 |
|------|------|
| `collector/.env` | **なし**（docker compose local-collector は未読） |
| リポジトリ root `.env` | `SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` **設定済** |
| SwitchBot API | `SWITCHBOT_LIST=PASS`（device_count=13）· `SWITCHBOT_STATUS=PASS`（先頭デバイス） |
| Ed25519 | `ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64` **未設定** — ingest 実機スモーク未了 |
| IHL pytest（docker） | switchbot + collector_ingest **5 PASS** |
| 次の人手作業 | `collector/.env.example` から `collector/.env` を作成し鍵を移す · API 側に `ENV_COLLECTOR_PUBLIC_KEY` を配置 · `node collector/smoke-keys.cjs` で Ed25519 PASS 確認 |

---

## 残り人手ゲート（Batch 8 外枠）

| ID | 内容 | 状態 |
|----|------|------|
| **HUMAN-COLLECTOR-KEYS** | 実 SwitchBot keys · live collector（Tier D） | **部分確認 2026-06-10** — **civ-os root `.env` SwitchBot live PASS**（device_count=13）· Ed25519 は `collector/.env` 未配置 → **POST-B8-02** |
| **HUMAN-02-LEGAL** | #02 最終法務条文 | **`[x]` USER-WAIVED 2026-06-10** — 現行 terms stub OK · 法務確定時のみ差替 |
| **HUMAN-23-GMO-LIVE** | GMO 本番入金証跡 | **PHYSICALLY-BLOCKED** — `GMO_AOZORA_CLIENT_ID` / `GMO_AOZORA_CLIENT_SECRET` 未投入 · **POST-B8-GMO-*** |

---

## 項目詳細（先頭 5 件）

### B8-Q-01 — #13 Red pytest（完了）

- **スコープ**: [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) §7 の 5 テストファイル · civ-os `envCollectorIngest` / `switchbotClient` から **契約ベクトルのみ**抽出
- **完了条件**:
  - [x] `tests/unit/test_switchbot_client.py`
  - [x] `tests/unit/test_placement_store.py`
  - [x] `tests/unit/test_env_telemetry_diff.py`
  - [x] `tests/contract/test_collector_ingest.py`
  - [x] `tests/unit/test_env_ingest_component.py`
  - [x] `pytest` 全件緑（skip/xfail 可）
  - [x] DoD マトリクス #13 test 列 `△ Red`
  - [x] 監査ログ §4 追記
- **ブロック**: なし（設計 doc のみ · 本番ロジック未着手）

### B8-Q-04 — DELEGATED-IMPL-GO #13 + mock peel devices（完了）

- **スコープ**: `mock_store.devices` 置換 · `/api/v1/devices` 実 API · 監査 `DELEGATED-IMPL-GO`
- **完了条件**: DoD マトリクス #13 の route/API/persistence/test 4 列 `✓`
- **証跡**: `libs/device_registry.py` · `apps/api/routes/devices.py` · `test_device_registry.py` · pytest **136 PASS**

---

## ユーザーが次に言うこと

| 状況 | 発話例 |
|------|--------|
| Post-Batch8 続行 | **`続けて`** · **`続けて 全部`** — 正本 [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) |
| 鍵投入後 | GMO env を `.env` に配置 — エージェントは **質問せず** POST-B8-GMO-04 まで完走 |
| collector live | `collector/.env` 作成 · **`HUMAN-COLLECTOR-KEYS Go`**（Ed25519 smoke 後） |

---

* v1 · 2026-06-10 · Batch 8 完走 · Post-Batch8 queue_head = POST-B8-01*
