# 設計網羅監査 — 専門班 C：設定 / IoT / シークレット / 機器

> **作成日**: 2026-06-08  
> **監査スコープ**: 12-設定.md、SwitchBot/Placement/DeviceRegistry/P2-NEXT-ENV、.env シークレット安全管理（ローテーション・UI vs サーバ・Tier D）、機器一覧管理 UI  
> **判定凡例**: ✅ 済 / 🟡 部分 / ❌ 未 / 🔴 P0 ギャップ  
> **ステータス**: 草案（人間レビュー待ち）  
> **親**: [`00-設計網羅監査-チェックリスト.md`](./00-設計網羅監査-チェックリスト.md) · [`00-設計網羅監査-統合.md`](./00-設計網羅監査-統合.md)

---

## A. 設定機能（12-設定.md）

### A-1. 要件定義書の存在

| 項目 | 判定 | 根拠・所在 |
|---|---|---|
| 機能要件書ファイル存在 | ✅ 済 | `12-設定.md`（2026-06-07 作成） |
| FR-SET-01〜15（LLM・locale・Push 等）番号付き要件 | ✅ 済 | §④ FR-SET-01〜15 記載済み |
| FR-SET-16〜19（取引前設定: 局留め・配送先・振込口座）| 🟡 部分 | §④.5 たたき台追加済み。必須化可否・詳細設計は「詳細設計で確定」と留保 |
| FeatureNode / C-USB 位置づけ | 🟡 部分 | §⑥ に記載あり。「将来 `Kernel: user-preferences` 統合候補」と未確定 |
| IHL rebuild 対応明示 | ✅ 済 | §⑦ で legacy salvage 方針明示 |
| インベントリ §12 ステータス | 🟡 部分 | `01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §12 = `partial` |

### A-2. 設計ゲート 4 点の充足状況

| ゲート | 判定 | 状況 |
|---|---|---|
| **① 要件定義** | 🟡 部分 | たたき台レベル。FR-SET-16〜19 の必須化・API スキーマ未確定 |
| **② 詳細設計** | ❌ 未 | `/me/settings` の取引前設定 API スキーマ・DB キー・PII 参照範囲制御の詳細設計書なし |
| **③ 遷移設計** | ❌ 未 | 設定→マーケット取引前チェック・設定未完了時の誘導フロー遷移図なし |
| **④ UI 設計** | ❌ 未 | 取引前設定セクションのワイヤー・フォーム UX 設計なし |

> **判定**: 設計ゲート 4 点中 **0 点確定**。`design-before-implementation-gate.mdc` に照らし **実装禁止**状態。

### A-3. 既存実装との整合

| 項目 | 判定 | 根拠 |
|---|---|---|
| `MeSettingsPage.tsx` 実装存在 | ✅ 済 | legacy 実装あり |
| LLM設定・Push・dev/admin トグル | ✅ 済 | FR-SET-01〜10 は実装済み |
| locale 切替実装 | 🟡 部分 | `POST /api/auth/locale` は legacy あり。IHL では preferences PATCH 統合予定（FR-SET-15）— 未実装 |
| 取引前設定（局留め・配送先・振込口座）| ❌ 未 | 実装ゼロ。フロント UI・PATCH API・PII 参照制御ともなし |
| `PATCH /api/auth/ai-llm-preferences` | ✅ 済 | auth.ts 実装確認 |

---

## B. 環境 IoT（SwitchBot / Placement / P2-NEXT-ENV）

### B-1. ENV キュー完了ステータス

| タスク | 判定 | 内容 |
|---|---|---|
| **P2-NEXT-ENV-1-ADR-MODEL** | ✅ 済 | `ADR-env-placement-device-binding.md` 採用 |
| **P2-NEXT-ENV-2-COLLECTOR-DOCKER** | ✅ 済 | `envTelemetryCollector.ts`・`switchbot-env-poller.ts` 実装済み |
| **P2-NEXT-ENV-3-QR-LIFECYCLE** | ✅ 済 | `POST/GET /api/env/placements` 実装済み |
| **P2-NEXT-ENV-4-UX-SHELF** | ✅ 済 | `/observation/env-shelf`（`EnvShelfFlowPage.tsx`）実装済み |
| **P2-NEXT-ENV-5-UX-OBS-ROLE** | ✅ 済 | 固体タグ画面での roleTemplate・placementId commit 接続実装済み |
| **P2-NEXT-ENV-6-ADMIN-UI** | ✅ 済 | `/admin/env-iot`（`EnvHistoryAdminPage.tsx`）実装済み |
| **P2-NEXT-ENV-7-MAP-OPTIONAL** | ✅ 済 | §7 スコープのみ明文化（実装ゼロで完了）|
| **P2-NEXT-ENV-EPIC-CLOSE** | ✅ 済 | REQ-019 `implemented` 同期済み |

> **ENV エピック全完了**。CONTINUE_QUEUE 上 7 タスクすべて `[x]`。

### B-2. ADR 設計品質

| 項目 | 判定 | 根拠 |
|---|---|---|
| R2 INSERT ONLY 遵守設計 | ✅ 済 | ADR 憲法節に明記 |
| `placementId` 安定 ID 設計 | ✅ 済 | ULID/UUID 推奨明記 |
| SwitchBot 秘密値 R2 非保存 | ✅ 済 | ADR + `solid-switchbot-operating-checklist.md` §3 |
| collector Ed25519 署名 | ✅ 済 | FR-ENV-07 |
| 非 SwitchBot デバイス対応 | 🟡 部分 | `13-データ取得元管理.md` §⑨「Driver registry（REQ-030）で拡張予定」。REQ-030 設計なし |

### B-3. SwitchBot 秘密値の扱い

| 観点 | 判定 | 根拠 |
|---|---|---|
| TOKEN/SECRET を R2 に保存しない | ✅ 済 | FR-ENV-08・ADR |
| collector ローカル `.env` 隔離 | ✅ 済 | `collector/.env.example` |
| フロント UI から TOKEN/SECRET を入力させない設計 | ✅ 済 | 現行 ADR でレガシー扱い確認済み |
| ユーザー別 BYOK SwitchBot 非対応 | ✅ 済 | `solidUserSettings.ts` — API キー本体は非保存 |

---

## C. .env シークレット安全管理（ローテーション・UI vs サーバ・Tier D）

### C-1. 現状の .env 管理体制

| 項目 | 判定 | 根拠・所在 |
|---|---|---|
| `.env.example` の網羅性 | ✅ 済 | ルート・`backend/`・`collector/`・IHL に各 `.env.example` 整備済み |
| シークレットのリポジトリコミット禁止 | ✅ 済 | `.env.example` ヘッダ・`staging-secrets-for-optional-e2e.md` |
| CI/GitHub Actions Secrets 管理方針 | 🟡 部分 | チェックリスト形式で一覧。**正式 Secrets 管理 ADR・Runbook なし** |
| JWT_SECRET のローテーション手順 | ❌ 未 | ローテーション手順・影響範囲の Runbook なし |
| VAPID キー（Web Push）ローテーション | ❌ 未 | ローテーション時の端末再登録フロー未設計 |
| GMO API Client Secret ローテーション | ❌ 未 | 「定期ローテを検討」と 1 行のみ |
| R2 鍵の本番投入手順 Runbook | 🟡 部分 | プレースホルダ設計あり。**本番 SOP なし** |

### C-2. UI vs サーバの責務分離

| 項目 | 判定 | 根拠 |
|---|---|---|
| ユーザー BYOK（LLM API Key）はサーバ保存・フロントはフラグのみ | ✅ 済 | FR-SET-02・NFR-SET-01 |
| SwitchBot TOKEN/SECRET は UI から設定させない | ✅ 済 | 運用 checklist §1/§3 |
| 取引前設定 PII の参照範囲制御設計 | 🟡 部分 | FR-SET-16〜18 で方針記載。**API レベルのアクセス制御スキーマ未設計** |
| 秘密値の平文ログ禁止 | ✅ 済 | FR-SET-09 |

### C-3. Tier D・人間ゲートとの関係

| 項目 | 判定 | 根拠 |
|---|---|---|
| 本番シークレット投入は人間ゲート（Tier D）と整合 | 🟡 部分 | 原則明示あり。**本番投入手順書（SOP）なし** |
| Secrets ローテーション = 人間作業の明示 | ❌ 未 | CONTINUE_QUEUE にローテーション関連タスクなし |
| 環境変数変更時の CI/CD 反映確認手順 | ❌ 未 | 設計・Runbook なし |

---

## D. 機器一覧管理 UI（SwitchBot デバイス registry）

### D-1. 現行 UI の設計・実装状況

| 項目 | 判定 | 根拠 |
|---|---|---|
| V17 / A17 設計書存在 | 🟡 部分 | `design/V/V17_device_human.md` 等存在。**状態: planned（2026-03-24）** |
| A17_ui.json（UI 定義 JSON）| 🟡 部分 | SwitchBot Token/Secret 入力 + デバイス一覧表示の JSON 定義あり |
| A17 専用 React コンポーネントページ | ❌ 未 | `V17*.tsx` / `DevicePage.tsx` **存在せず** |
| `/settings/device` ルート登録 | 🟡 部分 | `registry.ts` に登録のみ。**描画コンポーネント未実装** |

### D-2. IHL rebuild での機器管理 UI 設計

| 項目 | 判定 | 根拠 |
|---|---|---|
| IHL rebuild でのデバイス管理 UI 要件定義 | ❌ 未 | `12-設定.md`・`13-データ取得元管理.md` ともに詳細設計なし |
| `SolidRegisteredDevice` 型の管理 UI | ❌ 未 | 型定義あり。CRUD UI なし |
| DeviceBinding 一覧 / 管理 UI | 🟡 部分 | `/admin/env-iot` に履歴閲覧はある。**デバイス追加・削除・編集 UI なし** |
| 非 SwitchBot デバイス（BLE・Wi-Fi）管理 UI | ❌ 未 | REQ-030 設計なし |

### D-3. 固体観測フロー内でのデバイス設定

| 項目 | 判定 | 根拠 |
|---|---|---|
| 固体観測フロー内の `defaultSwitchBotDeviceId` 設定 | ✅ 済 | `SolidFlowView.tsx` に設定入力 UI あり（フロー内限定） |
| デバイス登録の R2 永続化 | ✅ 済 | `saveSolidUserSettings` → R2 |

---

## E. P0 ギャップ一覧（優先対応）

| # | ギャップ | 理由 | 対応方針 |
|---|---|---|---|
| **P0-GAP-C-01** | **取引前設定（FR-SET-16〜19）の詳細設計・API スキーマ・PII アクセス制御が未設計** | マーケット P2P 取引時に住所・口座の露出リスク | `12-設定.md` §④.5 から詳細設計書を起こし、PII 参照 API の認可スキーマを確定 |
| **P0-GAP-C-02** | **機器一覧管理 UI（V17/A17）の専用 React ページが未実装** | ユーザーが SwitchBot デバイスを UI から管理できない | IHL rebuild スコープで `DeviceManagementPage.tsx` + API を設計ゲート後に実装 |
| **P0-GAP-C-03** | **シークレットローテーション Runbook が存在しない** | 本番インシデント時の対応手順が口頭依存 | `05-運用/runbooks/secrets-rotation-playbook.md` を作成。Tier D チェックリストに組み込む |
| **P0-GAP-C-04** | **非 SwitchBot デバイス（BLE scale・Wi-Fi sensor）の Driver registry（REQ-030）が設計なし** | 型定義はあるが ADR・API・UI が存在しない | `ADR-device-driver-registry.md`（仮）で REQ-030 スコープを先に確定 |

---

## F. 補足: 設計の健全な部分

| 項目 | 評価 |
|---|---|
| **P2-NEXT-ENV 全エピック完了**（ADR・API・UI・テスト） | 高品質。R2 INSERT ONLY・Ed25519 署名・秘密値分離と文明 OS 憲法に整合 |
| SwitchBot 秘密値の **ハード分離**設計 | 設計原則として一貫 |
| `EnvHistoryAdminPage`（`/admin/env-iot`）の実装品質 | DoD U-* に準拠 |
| ユーザー BYOK LLM キーの **フラグ方式** | FR-SET-02・NFR-SET-01 で設計と実装が一致 |

---

## G. 監査まとめ

| 領域 | 総合 | 主な残課題 |
|---|---|---|
| 12-設定（基本設定） | 🟡 部分 | 取引前設定の詳細設計・UI 設計ゲート未通過 |
| 12-設定（取引前 PII 管理） | 🔴 P0 | API スキーマ・PII アクセス制御・UI ゼロ |
| ENV IoT（P2-NEXT-ENV） | ✅ 済 | 全タスク完了。REQ-019/027 implemented |
| SwitchBot 秘密値設計 | ✅ 済 | R2 非保存・collector 分離・UI 禁止が一貫 |
| .env シークレット管理方針 | 🟡 部分 | 原則はある。ローテーション Runbook が全種 P0 欠落 |
| 機器一覧管理 UI（V17） | 🔴 P0 | React ページ未実装。IHL rebuild でも詳細設計なし |
| 非 SwitchBot デバイス対応 | ❌ 未 | REQ-030 設計なし |

---

## H. 推奨設計成果物（doc 名のみ）

- `12-設定-UI設計-v1.md`
- `12-設定` §秘密鍵管理拡張 or `ADR-H-14-秘密鍵管理.md`
- `13-データ取得元管理-UI設計-v1.md`
- `05-運用/runbooks/secrets-rotation-playbook.md`
- `ADR-device-driver-registry.md`（REQ-030）
- `05-観測-入力UI設計-v1.md` §機器管理リンク（班 D と共著）

---

*専門班 C 設計監査 · 2026-06-08 · サブエージェント 58e1826d · 非正本 · 実装禁止ゲート有効*
