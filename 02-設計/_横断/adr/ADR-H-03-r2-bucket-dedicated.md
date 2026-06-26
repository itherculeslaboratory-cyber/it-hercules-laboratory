# ADR-H-03: IHL 専用 R2 バケット（H-03 = A）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-03 · D-04  
> **バケット名**: `it-hercules-laboratory-dev`

---

## 決定

- **IHL 専用バケット** `it-hercules-laboratory-dev` を新設する（legacy `civilization-world` は **移行しない・そのまま**）。
- dev 環境のオブジェクトプレフィックスは IHL ツリー設計に従う（Phase 0 spike 後に `05-運用/queues/r2-layout.md` へ詳細化）。

### 推奨プレフィックス（たたき台）

```text
raw/
normalized/
derived/
manifests/latest/
events/preference_event.jsonl
events/tag_event.jsonl
```

## バケット作成の試行結果（2026-06-07）

| 手段 | 結果 |
|------|------|
| S3 API `CreateBucketCommand`（`R2_ACCESS_KEY_ID` 等） | **失敗** — `AccessDenied`（403）。既存 R2 トークンにバケット作成権限なし |
| S3 API `ListBuckets` | **失敗** — `AccessDenied`（403） |
| **Cloudflare API** `POST /accounts/{account_id}/r2/buckets` + `CF_API_TOKEN` | **成功** — バケット `it-hercules-laboratory-dev` を作成 |
| AWS CLI `aws s3 mb` | **未実施** — ローカルに AWS CLI 未インストール |

アカウント ID は `R2_ENDPOINT` のホスト `{account_id}.r2.cloudflarestorage.com` から解決（`CLOUDFLARE_ACCOUNT_ID` 未設定でも可）。

## 環境変数（秘密をコミットしない）

IHL / Phase 0 spike で最低限:

| 変数 | 用途 |
|------|------|
| `R2_ENDPOINT` | S3 互換エンドポイント |
| `R2_ACCESS_KEY_ID` | オブジェクト read/write 用 |
| `R2_SECRET_ACCESS_KEY` | 同上 |
| `R2_BUCKET` | `it-hercules-laboratory-dev`（IHL dev） |
| `CF_API_TOKEN` | バケット作成・R2 管理（Admin 相当スコープ） |
| `CLOUDFLARE_ACCOUNT_ID` | 任意（未設定時は endpoint から推定） |

プレースホルダ例: [`../../.env.example`](../../.env.example)

## H-15 接続検証（2026-06-07）

| 項目 | 結果 |
|------|------|
| バケット | `it-hercules-laboratory-dev` |
| プローブキー | `ihl/_phase0_probe/2026-06-07-probe.txt` |
| 操作 | PUT → HEAD → LIST（prefix `ihl/_phase0_probe/`）→ GET（本文 `H-15 probe` 一致） |
| 同一キー再 PUT | **成功**（バケット/オブジェクトレベルで上書き可） |
| 手段 | Node `@aws-sdk/client-s3`（`backend/scripts/h15-r2-probe.mjs`） |
| ステータス | **verified** |

## legacy

- civ-os `civilization-world`（および既存 `R2_BUCKET` 設定）は **変更・移行しない**。
- 観測セッション・固体イベントと IHL 個体パイプラインは **バケット分離**で接続（キー mapping ADR は別途）。

## 参照

- [`05-観測.md`](./05-観測.md) §⑨
- [`00-Phase0前-人間ToDoとAuto下準備.md`](../05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md) H-03
