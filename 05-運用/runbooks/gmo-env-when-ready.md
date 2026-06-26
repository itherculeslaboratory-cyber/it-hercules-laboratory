# Runbook: GMO 鍵投入（口座開設済み → .env 準備）

> **ステータス**: 草案 v1 · 2026-06-09  
> **人間ゲート**: 本番 live 照合は **`P0-NEXT-GMO-LIVE-EXEC`**（Tier D）のみ。本書は **鍵の置き場と段階切替** の下準備。  
> **設計正本**: [`../../01-要件/23-GMO銀行振込判定.md`](../../01-要件/23-GMO銀行振込判定.md)  
> **legacy salvage**: `civilization-os/docs/gmo-aozora-integration.md` · `backend/src/logic/gmoAozora*.ts`  
> **env テンプレ**: [`../../.env.example`](../../.env.example) §GMO

---

## 0. 前提（2026-06-09 ユーザー確認）

| 項目 | 状態 |
|------|------|
| GMO 法人口座開設 | **完了**（ユーザー申告） |
| API クライアント ID / シークレット | **未投入** — 準備でき次第 `.env` へ（コミット禁止） |
| 設計ゲート 4 点（IHL） | **DELEGATED-DESIGN-GO 済** — **実装コードは未 Go** |
| civ-os legacy 実装 | **REQ-007 implemented** — IHL rebuild 時の参照のみ |

---

## 1. Stub tier 設計（接続モード）

| Tier | `GMO_CONNECTOR_MODE` | 必要 env | 動作 |
|------|---------------------|----------|------|
| **0 stub** | 未設定 or `stub` | なし（`GMO_*` すべて空で可） | 振込コード表示 UI のみ。Webhook 署名スキップ。照合はローカル JSON / テストフィクスチャ。**本番入金なし**。 |
| **1 stg** | `stg` | `GMO_AOZORA_CLIENT_ID` · `GMO_AOZORA_CLIENT_SECRET` · `GMO_AOZORA_WEBHOOK_BASE_URL`（STG URL） | 銀行 STG API で subscribe / unsent。テスト入金で照合 1 件。`supporter_event.amount_jpy` 等の **本番値書込はまだ不可**（schema-pack §6 #4）。 |
| **2 live** | `live` | Tier 1 + 本番 URL + 署名 secret/header · **`P0-NEXT-GMO-LIVE-EXEC` 人間完了** | 実入金 Webhook · 8% 期待入金照合 · R2 INSERT。証跡は `docs/gmo-production-verification-template.md` に記録。 |

**原則**

- 口座開設 ≠ live 接続。鍵投入前は常に **Tier 0**。
- Tier 上げは **下位から順**（stub → stg → live）。live は人間サインオフ必須。
- 秘密は **サーバ `.env` / GitHub Actions Secrets のみ**。R2・フロント・ログに載せない（`secrets-rotation-playbook.md` §0）。

---

## 2. 鍵が届いたときの手順（5 分チェックリスト）

### Phase A — ファイル準備（人間 · 秘密をコミットしない）

1. `指示/it-hercules-laboratory/.env.example` の GMO 節を参照し、**ローカル `.env`**（gitignore）にコピー。
2. GMO ポータルから取得した値を填入:
   - `GMO_AOZORA_CLIENT_ID`
   - `GMO_AOZORA_CLIENT_SECRET`
3. 検証環境なら `GMO_AOZORA_WEBHOOK_BASE_URL=https://stg-api.gmo-aozora.com/ganb/api/webhooks/v1`
4. Webhook 署名が契約に含まれる場合のみ、**両方**セット:
   - `GMO_AOZORA_WEBHOOK_SECRET`
   - `GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER`（銀行ドキュメントのヘッダ名）
5. `GMO_CONNECTOR_MODE=stg`（まず STG）

### Phase B — 接続確認（実装 Go 後 · civ-os または IHL Connector）

> **設計ゲート注意**: IHL 新 repo への Connector 実装は **実装 Go** まで禁止。Phase B は **legacy civ-os** または **実装 Go 後の IHL** で実施。

1. サーバ起動 · `GET /api/market/gmo/reconciliation/meta` で `stub: false` を確認（civ-os）。
2. 経済マスター権限で `POST /api/market/gmo/va-deposit/subscribe`（`enable: true`）。
3. テスト用 `POST /api/market/gmo/expected-payment`（`remittance_reference` = ユーザーの `U-XXXX`）。
4. 銀行 STG からテスト入金 → `POST /api/market/gmo/webhook` が **202** · `matched_expected_ids` を確認。
5. 署名不一致時 **401** · 秘密がログに出ないことを確認。

### Phase C — live 昇格（人間ゲートのみ）

1. `docs/CONTINUE_QUEUE.md` の **`P0-NEXT-GMO-LIVE-EXEC`** チェックリストを実施。
2. `GMO_AOZORA_WEBHOOK_BASE_URL` を本番 URL に変更 · `GMO_CONNECTOR_MODE=live`。
3. `docs/gmo-production-verification-template.md` に証跡 1 ファイル作成。
4. ローテーション手順: [`secrets-rotation-playbook.md`](./secrets-rotation-playbook.md) §3。

---

## 3. env 変数一覧（IHL 正本）

| 変数 | 必須（Tier） | 説明 |
|------|-------------|------|
| `GMO_AOZORA_CLIENT_ID` | 1+ | 銀行発行クライアント ID |
| `GMO_AOZORA_CLIENT_SECRET` | 1+ | 銀行発行シークレット |
| `GMO_AOZORA_WEBHOOK_BASE_URL` | 1+ | API ベース（STG / 本番） |
| `GMO_AOZORA_WEBHOOK_SECRET` | 1+（署名あり時） | HMAC 秘密 |
| `GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER` | 1+（署名あり時） | 受信ヘッダ名 |
| `GMO_WEBHOOK_SIGNATURE_FORMAT` | 任意 | `hex`（既定）or `base64` |
| `GMO_WEBHOOK_SIGNATURE_PREFIX` | 任意 | 例: `sha256=` |
| `GMO_RECONCILIATION_STORE_PATH` | 任意 | 照合 JSON パス |
| `GMO_LEDGER_SETTLEMENT` | 任意 | `0` で issueCoin 無効（8% 推奨） |
| `GMO_YEN_PER_PLATINUM` | 任意 | PT 換算（既定 100） |
| `GMO_CONNECTOR_MODE` | 任意 | `stub` / `stg` / `live`（IHL 実装時） |

---

## 4. 未決（設計のみ · 実装前）

| ID | 項目 | 備考 |
|----|------|------|
| U-GMO-03 | 8% matched 時の issueCoin | 会計未確定 · 既定は **off** 推奨 |
| U-GMO-04 | 本番署名形式の契約合わせ | ポータルドキュメントで最終確認 |
| U-GMO-05 | IHL Webhook 公開 URL | インフラ未着手 |
| — | IHL Connector コード | **実装 Go** 待ち |

---

## 5. 関連

| パス | 用途 |
|------|------|
| [`../../.env.example`](../../.env.example) | プレースホルダ env |
| [`secrets-rotation-playbook.md`](./secrets-rotation-playbook.md) | ローテーション SOP |
| `civilization-os/docs/gmo-aozora-integration.md` | legacy 実装メモ |
| `civilization-os/docs/gmo-production-verification-template.md` | live 証跡テンプレ |
| `civilization-os/docs/CONTINUE_QUEUE.md` | `P0-NEXT-GMO-LIVE-EXEC` |

---

*草案 · 秘密値は記載しない · コミット対象はプレースホルダのみ*
