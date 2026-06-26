# 機能別実装 DoD マトリクス v1（FR × route / API / persistence / test）

> **ステータス**: 草案 v1 · **status 列は実装着手前はすべて empty**  
> **作成日**: 2026-06-10  
> **使い方**: Batch 8 の深さ優先ルール — **4 列すべて PASS で機能 1 件完了**

**status 凡例**: `—` 未着手 · `△` 部分 · `✓` PASS · `N/A` 画面なし · `stays` legacy 参照のみ

---

## 1. P0 機能（Batch 8 前半）

| # | FR クラスタ（代表） | route（Next） | API（FastAPI） | persistence（event_store/R2） | test | status |
|---|---------------------|---------------|----------------|------------------------------|------|--------|
| **13** | FR-ENV-01〜10 · Placement · ingest · telemetry | `/env/shelf` · `/admin/env-iot` · `/settings/device` | `POST/GET /api/env/placements` · `POST /api/env/ingest` · `GET /api/env/telemetry` · `GET/POST/PATCH /api/v1/devices` | `truth/placement/` · `truth/devices/` · `truth/env/telemetry/v1/.../series.parquet` | `test_placement_store` · `test_env_telemetry_diff` · `test_switchbot_client` · `test_collector_ingest` · `test_env_ingest_component` · `test_device_registry` | ✓ **2026-06-10**（B8-Q-04 DELEGATED-IMPL-GO） |
| **12** | FR-SET-01〜15 · 機器リンク | `/settings` · `/settings/device` | `GET/PATCH /api/v1/me/preferences` · device registry CRUD | `preferences/v1/` · device registry events | `tests/unit/test_preferences_api.py` | ✓ **2026-06-10** |
| **01** | FR-AUTH-01〜 · magic link | `/login` · `/auth/callback` | `POST /api/v1/auth/magic-link` · `POST /api/v1/auth/verify` | session（非 R2）· `events/pii_access_event` | `tests/unit/test_auth.py` | ✓ **2026-06-10** |
| **03** | FR-ONB-01〜 · handle | `/register` · `/onboarding` | `POST /api/v1/auth/register` · `POST /api/v1/onboarding/complete` | `onboarding/v1/` events | `tests/unit/test_onboarding.py` | ✓ **2026-06-10** |
| **09** | FR-PAPER-01〜 · 条件マッチ | `/research` · `/paper` | `GET /api/v1/research/papers` · `POST /api/v1/research/match` | `research/v1/` match events | `tests/unit/test_research_match.py` | ✓ **2026-06-10** |
| **18** | FR-PHOTO-01〜 · embedding | `/component/photo-analysis` | `POST /api/v1/pipeline/embedding` | `derived/embeddings/` · component run_info | `tests/unit/test_embedding_builder.py`（拡張） | ✓ **2026-06-10** |
| **05** | OBS-TPL · OBS-ENV · solid commit | `/observation` · 入力 UI | `POST /api/captures` · `POST /api/measurements` | `capture/capture` · `capture/measurement` | `tests/integration/test_observation_e2e.py` | △ **E2E smoke ✓** · **POST-B8-01** solid commit 待ち |

---

## 2. P1 機能（Batch 8 後半）

| # | FR クラスタ | route | API | persistence | test | status |
|---|-------------|-------|-----|-------------|------|--------|
| **08** | FR-KRM · fib · 月次 | `/admin/karma` · `/help/karma` | `GET /api/karma/policy` · `POST /api/karma/events` | `economy/karma_event` | `tests/unit/test_economy_logic.py` | ✓ **2026-06-10** |
| **11** | U-MKT-DSP · dispute-room | `/dispute` · `/dispute/[id]` | `POST /api/disputes` · `POST /api/disputes/{id}/vote` | `governance/dispute_event` · `governance/vote_event` | `tests/unit/test_dispute_flow.py` | ✓ **2026-06-10** |
| **06** | FR-MKT · listing | `/market/*` | **stays** — civ-os 参照 | **stays** | `test_stays_verification.py` | stays ✓ **2026-06-10** |
| **07** | FR-BRD · 投稿 | `/board/*` | **stays** | **stays** | `test_stays_verification.py` | stays ✓ **2026-06-10** |
| **04** | FR-HOME · CTA | `/` · `/home` | `GET /api/home/summary` | snapshot reads | `tests/unit/test_home_summary.py` | ✓ **2026-06-10** |
| **10** | FR-MATCH · ValueCheck | `/match` · `/vote` | `POST /api/match/value-check` | `events/tag_event` | `tests/unit/test_match.py` | ✓ **2026-06-10** |
| **14** | FR-CONT · 貢献度 | `/contribution` | `GET /api/v1/contribution` | `economy/contribution_event` | `tests/unit/test_contribution.py` | ✓ **2026-06-10 POST-OSS-14** |
| **20** | FR-VOTE · 淘汰 | `/vote` | `POST /api/votes` | `governance/vote_event` | `tests/unit/test_vote.py` | ✓ **2026-06-10** |
| **19** | FR-COMP-BBS | `/improve` | `GET /api/component-board` | GitHub 連携（非 R2 SSOT） | `tests/unit/test_board_store.py` · stays | ✓ **2026-06-10** |
| **02** | FR-TOS · 同意 | `/terms` | `POST /api/legal/agree` | agree events | `tests/unit/test_terms.py` | ✓ **stub ✓** · **HUMAN-02-LEGAL USER-WAIVED 2026-06-10** |
| **21** | FR-I18N · locale | `/settings` | `GET /api/v1/i18n/messages` · `GET/PATCH /api/v1/me/preferences` | `preferences/v1/` | `tests/unit/test_i18n.py` · `test_preferences_api.py` | ✓ **2026-06-10 POST-OSS-21** |
| **22** | FR-PT-SHOP | `/shop/pt` | `GET/POST /api/v1/economy/shop` | `economy/pt_event` | `tests/unit/test_pt_shop.py` | ✓ **2026-06-10 POST-OSS-22** |
| **23** | FR-GMO | `/admin/gmo` | connector `gmo_match` · `/api/v1/gmo/*` | audit events only | `tests/unit/test_gmo_stub.py` · `test_gmo_connector.py` | ✓ **2026-06-10 POST-OSS-23** · **keys-pending live** — POST-B8-GMO-04/05 |
| **17** | FR-UI-SEL | — | **stays** | — | `test_stays_verification.py` | stays ✓ **2026-06-10** |
| **16** | FR-UI-BLD | — | **stays** | — | `test_stays_verification.py` | stays ✓ **2026-06-10** |
| **15** | schema 横断 | N/A | N/A | `02-設計/_横断/schema/*.yaml` | `scripts/ihl-schema-inventory.mjs` · `test_schema_validator.py` | ✓ **2026-06-10 POST-OSS-15** |

---

## 3. 機能 #13 詳細行（DoD 分解）

| サブドメイン | route | API | persistence | test |
|--------------|-------|-----|-------------|------|
| Placement CRUD | `/env/shelf` | `POST/GET /api/env/placements` | `placement_event` INSERT | `test_placement_crud` |
| QR 解決 | `/env/shelf?qr=` | `GET /api/env/qr/{token}` | `qr_token_event` | `test_qr_resolve` |
| Device binding | `/settings/device` | `POST .../device-binding/start|end` | `device_binding_event` | `test_binding_409` |
| Collector ingest | —（Docker） | `POST /api/env/ingest` | `series.parquet` Tier B マージ | `test_collector_ed25519` |
| Telemetry クエリ | `/admin/env-iot` | `GET .../telemetry?from&to` | index by placement+device | `test_telemetry_range` |
| 観測連携 | `/observation`（#05） | measurement `iot_switchbot` | `capture/measurement` | `test_obs_env_link` |

---

## 4. 完了判定（機能 1 件）

```
[ ] route: 遷移設計の全主要 state が実ルートで到達可能
[ ] API: OpenAPI / 詳細設計の全エンドポイント実装 + 4xx/5xx 契約
[ ] persistence: INSERT ONLY 検証 · schema_validator PASS · 秘密非保存
[ ] test: unit ≥1 · 該当 contract test · CI 緑
```

**監査ログ**: [`00-監査役-Batch8-実装前ゲート-v1.md`](./00-監査役-Batch8-実装前ゲート-v1.md) に `DELEGATED-IMPL-GO` 行追加。

---

## 5. 更新履歴

| 日付 | 変更 |
|------|------|
| 2026-06-10 | 初版 · 全 status empty |
| 2026-06-10 | #13 — ADR-H-18/19/20 HUMAN-CONFIRMED · series.parquet · Occupancy 参照モデル · impl 待ち |
| 2026-06-10 | #13 test 列 △ Red — B8-Q-01 pytest 骨格 5 ファイル · civ-os 契約ベクトル · CI skip 緑 |
| 2026-06-10 | #13 Green — B8-Q-03 libs + env_ingest + routes/env.py · pytest 8 PASS · DoD test ✓ · route/API/persist △ |
| 2026-06-10 | Batch 8 技術完走 — B8-Q-04〜Q-23 · pytest 136 PASS |
| 2026-06-10 | #02 USER-WAIVED · #23 keys-pending · Post-B8 正本 [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) |

---

*草案 v1 · 2026-06-10 · 実装進捗は本表のみを正とする*
