---
id: V3-B4-DESIGN-AI-v1
title: ver3 設計書（AI用・機械可読正本 — スキーマ/契約中心）
date: 2026-07-10
status: reviewed
audience: ai
phase: B4
depends_on:
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-ai-first-data-design-v1.md
  - docs/planning/ver3/b2/research-gmo-aozora-api-v1.md
  - docs/planning/ver3/b2/ADR-V3-EMB-01-embedding-dimension-v1.md
  - docs/planning/ver3/b2/research-wiki-integration-v1.md
  - docs/planning/ver3/b2/research-workers-vs-vps-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
  - docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md
  - docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
  - docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md
---

# ver3 設計書 — AI用（機械可読正本）

> **読者**: 将来の実装 AI エージェント。**本書は B4 設計書3種の正本**であり、一般人用・開発者用は本書からの生成物（`b2/research-ai-first-data-design-v1.md` §4）。
> **これは設計であり実装ではない**。本書のスキーマは新 repo `it-hercules-laboratory_ver3` の `schemas/` へ転記された時点でランタイム正本になる。ここに「動く」と書かれたものは存在しない（誇張ゼロ・思想 D）。
> **凍結凡例**: `FROZEN(CL-NN)` = 互換必須レイヤー（`ver3-最終要件定義書-v1.md:1311-1327`）。対応 negative TC 緑化前の変更禁止。
> **裁定待ち凡例**: `⏳HG` = 数値・形の最終確定が人間裁定待ち。推奨値を置き、実装は推奨値で進めてよい（事後承認方式 — `ver3-ユーザー裁定-2026-07-10-第2回.md` 裁定2）。
> 撤回台帳 R-1〜R-9 に触れる設計は本書に存在しない（特に R-1 誇張演出・R-3 自動対話方式・R-9 Builder IDE 化）。

---

## 1. イベントエンベロープ正本スキーマ

出典: B2 AIファースト7点セット（`b2/research-ai-first-data-design-v1.md` §1(b)(d)・§5-3/5-4）、V3-FND-15、V3-OBS-06（value_origin）、ADR-V3-LAYER-01（`ver3-最終要件定義書-v1.md:1275-1305`）。

規約（散文最小）:
- 全 Truth イベントは CloudEvents v1.0 準拠 + 拡張。`type` は `ihl.<domain>.<event>.v<N>`（バージョン内包）。
- `id` は ULID（26 文字 Crockford Base32）。辞書順=時系列順。
- スキーマ進化: 追加は nullable/既定値付きのみ。破壊的変更は `type` の vN+1 新イベント。**旧イベントの書き換え・in-place 変換は禁止**。upcaster は投影層コードのみ。
- 既存 ver2 イベントは移行境界で「v0 イベント」として封印し upcaster で読む（`b3/ver3-開発計画-v1.md` §5.3 裁定）。

`schemas/events/envelope.schema.json`（正本として転記する）:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/events/envelope.schema.json",
  "title": "IHL Truth Event Envelope v1",
  "type": "object",
  "required": ["specversion", "id", "source", "type", "time", "dataschema", "provenance", "data"],
  "additionalProperties": false,
  "properties": {
    "specversion": { "const": "1.0" },
    "id": {
      "type": "string",
      "pattern": "^[0-7][0-9A-HJKMNP-TV-Z]{25}$",
      "description": "ULID. object key の先頭にも同一文字列で現れる"
    },
    "source": {
      "type": "string",
      "pattern": "^ihl:(api|worker|component|collector|agent|migration)/[a-z0-9-]+$",
      "examples": ["ihl:api/observations", "ihl:component/thumbnail", "ihl:agent/night-runner"]
    },
    "type": {
      "type": "string",
      "pattern": "^ihl\\.[a-z0-9_]+\\.[a-z0-9_]+\\.v[0-9]+$",
      "examples": ["ihl.obs.session_committed.v1", "ihl.ledger.platinum_minted.v1"]
    },
    "time": { "type": "string", "format": "date-time", "description": "UTC ISO8601" },
    "dataschema": {
      "type": "string",
      "pattern": "^ihl://schemas/events/[a-z0-9_/.-]+\\.schema\\.json$",
      "description": "repo 内 schemas/ への相対 URI（外部 URL 禁止）"
    },
    "subject": { "type": "string", "description": "任意。対象エンティティ ID（individual_id 等）" },
    "provenance": {
      "type": "object",
      "required": ["actor_kind", "actor_id", "schema_version"],
      "additionalProperties": false,
      "properties": {
        "actor_kind": { "enum": ["human", "agent", "device", "system"] },
        "actor_id": { "type": "string" },
        "model_version": { "type": ["string", "null"], "description": "actor_kind=agent のとき必須（モデル ID 文字列）" },
        "run_id": { "type": ["string", "null"], "description": "派生成果物・バッチ生成イベントで必須。ULID" },
        "schema_version": { "type": "string", "description": "data 部スキーマの semver" },
        "input_hash": { "type": ["string", "null"], "pattern": "^sha256:[0-9a-f]{64}$", "description": "派生イベントで必須。入力の canonical SHA-256" },
        "input_event_ids": { "type": "array", "items": { "type": "string" }, "description": "入力イベント ULID 列（lineage 追跡）" }
      }
    },
    "value_origin": {
      "enum": ["direct_observed", "image_derived", "environment_derived", "lineage_derived", "estimated", "imputed", "aggregate", "unknown", null],
      "description": "計測値を含むイベントで必須（V3-OBS-06）。含まないイベントは null 可"
    },
    "data": { "type": "object", "description": "dataschema が指す JSON Schema で検証される本体" }
  }
}
```

negative TC 種: `provenance.actor_kind=agent` かつ `model_version=null` の put → 422 で拒否。

---

## 2. R2 キー空間設計 `FROZEN(CL-01, CL-02)`

出典: V3-FND-01/02（`ver3-最終要件定義書-v1.md:1005-1006`）、用語集 R2 行（同 `:116`）、B2 ルール 6（Hive パーティション + ULID キー）、Workers 条件付き put（`b2/research-workers-vs-vps-v1.md` 根拠4）。

```yaml
# schemas/frozen/r2-keyspace.contract.yaml — 形式凍結（ADR-V3-LAYER-01 確定まで）
bucket_layers:
  truth:            # 不変層。INSERT ONLY。R2 トークンに削除権限なし
    events:    "events/type=<event_type>/date=YYYY-MM-DD/<ULID>--<slug>.json"
    snapshots: "snapshots/<domain>/<snapshot_id>--<slug>.json"   # snapshot-XXXX 上書き禁止(V3-FND-06)
    raw:       "raw/<domain>/<ULID>--<slug>.<ext>"               # 元画像・音声・センサー生データ(V3-OBS-52)
    tags:      "tags/<entity_id>/<ULID>--tag-event.json"         # append-only tag_event (CL-13)
    logs:      "logs/<source>/date=YYYY-MM-DD/<ULID>.jsonl"      # errors.jsonl 等。追記のみ
    runs:      "runs/<run_id>/run_info.json | output_manifest.json | errors.jsonl"  # V3-OBS-08
  projection:       # 再生成可能層。捨てても truth から f で復元
    normalized: "normalized/<domain>/..."
    derived:    "derived/<domain>/generation-<N>/..."            # embedding 等。世代 immutable
    manifests:  "manifests/<set_name>/snapshot=<snapshot_id>/part-*.parquet"
    pointers:   "manifests/<set_name>/latest.json"               # pointer のみ更新可（唯一の例外）
write_rules:
  - "truth 層への put は R2 条件付き put（onlyIf 不存在）でストレージ層強制。二重 put は先勝ち・後発 null/409"   # CL-01
  - "UPDATE / DELETE API を実装しない。修正 = 新イベント/新 snapshot の追記"
  - "latest.json は pointer log 方式: 新 pointer を別キーに put 後、latest.json を swap（swap 失敗時も旧 pointer は残存）"
  - "キー内 ULID とエンベロープ id は同一文字列（grep-ability。B2 ルール 10）"
  - "provenance 必須メタ（§1）を欠く put は API 層で 422 拒否"   # CL-02
```

negative TC 種: 同一 `events/...` キーへの 2 重 put で後発が null/409 になること（CL-01）。必須 provenance 欠落 put が 422 になること（CL-02）。

---

## 3. 投影層契約 — `projection = f(truth_events)`

出典: ADR-V3-LAYER-01 invariant（`ver3-最終要件定義書-v1.md:1294`）、V3-FND-04（純粋 Reducer）、V3-OBS-56（latest pointer）、B2 ルール 7（Parquet kv_metadata）。

```yaml
# schemas/projection.contract.yaml
determinism:
  law: "projection = f(truth_events)。f は決定論（同一入力→同一出力）・副作用ゼロ・IO なし"
  placement: "f（reducer/upcaster）は packages/（TS）または libs/（Python）。schemas/frozen・schemas/events のみに依存(DAG D7)"
  upcasting: "v0/vN 旧イベント → 最新形への変換は f 内の upcaster のみ。ストア内イベント無変更"
  rebuild: "全投影は削除→ f 再実行で完全復元可能であること（CI に rebuild 一致テスト）"
  no_facts: "投影層にしか存在しない事実を作らない（投影は事実を生まない）"
latest_pointer:
  file: "manifests/<set_name>/latest.json"
  schema:
    required: [snapshot_id, manifest_keys, source_event_range, generated_at, generator]
    source_event_range: { first_ulid: string, last_ulid: string }
parquet_kv_metadata:      # 全投影 Parquet の書き込み時に必須
  schema_id: "ihl://schemas/projections/<name>.schema.json"
  source_event_range: "<first_ULID>..<last_ULID>"
  generated_at: "UTC ISO8601"
  generator: "<script_name>@<semver>"
  compression: zstd
verification: "CI: duckdb parquet_kv_metadata() で 4 キー存在 + schema_id が repo に実在することを検査"
```

negative TC 種: kv_metadata 4 キーのいずれかを欠く Parquet が CI validate で fail すること。rebuild 再実行の出力ハッシュが前回と不一致なら fail（決定論違反検知）。

---

## 4. C-USB 部品 manifest スキーマ

出典: V3-FND-14（C-USB 定義）、V3-FND-15（lineage）、V3-AIP-46（薄ラップ）、V3-OBS-08（run_info/errors/output_manifest 必須）、フォルダ設計 §2.1 `components/`。

1 部品 = 1 ディレクトリ: `components/<name>/{manifest.json, run.(py|ts), tests/, README.md}`。

`schemas/cusb-manifest.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/cusb-manifest.schema.json",
  "title": "C-USB Component Manifest v1",
  "type": "object",
  "required": ["component_id", "version", "lineage", "contract", "runtime"],
  "additionalProperties": false,
  "properties": {
    "component_id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "version": { "type": "string", "description": "semver" },
    "lineage": {
      "type": "object",
      "required": ["uuid", "parent_uuid", "generation"],
      "properties": {
        "uuid": { "type": "string" },
        "parent_uuid": { "type": ["string", "null"], "description": "fork 元。オリジンは null" },
        "generation": { "type": "integer", "minimum": 0 },
        "lineage_hash": { "type": ["string", "null"] }
      }
    },
    "contract": {
      "type": "object",
      "required": ["input_manifest_schema", "output_manifest_schema"],
      "properties": {
        "input_manifest_schema": { "type": "string", "description": "ihl://schemas/... URI" },
        "output_manifest_schema": { "type": "string" },
        "guarantees": {
          "type": "array",
          "items": { "enum": ["append_only", "idempotent_by_run_id", "fail_if_output_exists", "errors_jsonl", "run_info"] },
          "description": "V3-OBS-08: append_only + fail_if_output_exists + errors_jsonl + run_info は全部品必須"
        }
      }
    },
    "runtime": { "enum": ["python", "typescript", "external_http"], "description": "external_http 例: VOICEVOX 互換 REST（TTS 境界）" },
    "wrapped_oss": { "type": ["string", "null"], "description": "薄ラップする OSS 名（V3-AIP-46）。自作ロジックは接続ドライバに限定" }
  }
}
```

negative TC 種: 同一 `run_id` の出力先が既存のとき run が fail すること（`fail_if_output_exists`）。`parent_uuid` 欠落 manifest が validate で fail すること。

---

## 5. API 契約骨格 `FROZEN(CL-03, CL-04)`

出典: Workers+Hono+zod-openapi 確定（`b2/research-workers-vs-vps-v1.md` §1、フォルダ設計 §2.4）、CL-03/04（`ver3-最終要件定義書-v1.md:1315-1316`）、V3-AUT-01（マジックリンクのみ）、V3-SEC-46（ロジックは API に固定・UI は皮）。

規約:
- 契約正本は `schemas/api/`（OpenAPI 3.1）。Hono 実装は `@hono/zod-openapi` で契約と CI 突合。
- 認証境界: **deny-by-default**。Scope A（観測 READ 公開範囲）のみ明示 public。WRITE は全て認証必須。
- actor_id 解決は opaque token → Hono middleware で再実装。既存ユーザー導出テストベクタ全件一致が回帰条件（CL-03。JWT vs opaque は V3-AUT-03 裁定と連動・C2 前確定）。
- 遷移系 API は許可辺のみ、不正遷移 409（思想 G / V3-MKT-02）。

主要リソース×メソッド表（第1波スコープ。57 route 完全表は `INFRA-ROUTE-MATRIX-v1.csv` に「公開/保護」列を追加して正本化する）:

| リソース | METHOD PATH | scope | 発行イベント type | CL |
|---|---|---|---|---|
| 認証 | `POST /auth/magic-link` | public | ihl.auth.link_requested.v1 | — |
| 認証 | `POST /auth/verify` | public | ihl.auth.session_opened.v1 | CL-03 |
| 観測セッション | `POST /observations` | auth | ihl.obs.session_committed.v1 | CL-01 |
| 観測セッション | `GET /observations/{id}` | **public(Scope A)** | — | CL-04 |
| 観測一覧 | `GET /observations` | **public(Scope A)** | — | CL-04 |
| 写真登録 | `POST /observations/{id}/captures` | auth | ihl.obs.capture_registered.v1 | CL-01/07 |
| 個体 | `POST /individuals` / `GET /individuals/{id}` | auth / public | ihl.ind.created.v1 | CL-06 |
| QR | `POST /individuals/{id}/qr` / `GET /qr/{token}` | auth / public | ihl.ind.qr_issued.v1 | CL-10 |
| テンプレ | `POST /templates` / `GET /templates` | auth / public | ihl.obs.template_forked.v1 | — |
| タグ | `POST /tags/{entity_id}` | auth | ihl.tag.event_appended.v1 | CL-13 |
| 類似検索 | `POST /search/similar` | auth | —（読取のみ） | CL-08 |
| 出品 | `POST /market/listings` + 遷移 API | auth | ihl.mkt.listing_transitioned.v1 | — |
| 取引 | `POST /market/trades/{id}/…` | auth | ihl.mkt.trade_stage_advanced.v1 | — |
| 台帳 | `GET /ledger/{account}` | auth(本人) | —（投影読取） | CL-12 |
| カルマ | `GET /karma/{user}` | public(公開仕様 V3-KRM-21) | — | CL-12 |
| GMO 照合 | `POST /gmo/webhook` | 署名検証(HMAC) | ihl.gmo.deposit_observed.v1 | CL-11 |
| GMO 照合 | (internal) unsentlist/明細ポーリング | system cron | ihl.gmo.deposit_observed.v1 | CL-11 |
| collector | `POST /env/measurements` | Ed25519 署名 | ihl.env.measurement_posted.v1 | CL-09 |
| ScreenDef | `GET /screen-defs/{screen_id}` | public | — | — |
| レビュースタック | `GET/POST /review-stack/…` | auth(owner) | ihl.night.review_decided.v1 | — |

negative TC 種: 未ログインで保護 route GET → 401/403 を**全保護 route 分**生成（CL-04）。既存 actor_id 導出ベクタ 1 件でも不一致で fail（CL-03）。不正遷移 POST → 409。

---

## 6. 状態機械定義（YAML 正本）

### 6.1 取引・期待入金（部分入金残債つき）

出典: V3-MKT-02/03/04、FR-GMO-08/09（`01-要件/23-GMO銀行振込判定.md:307-308`）、裁定1（GMO 設計ギャップ③）。

```yaml
# schemas/state-machines/listing.yaml (V3-MKT-02。現在状態 = イベント列末尾を reduceMarket 純関数で導出)
listing:
  states: [unlisted, listed_fixed, listed_auction, listed_lottery, offer_open, sold, delisted]
  transitions:   # 許可辺のみ。他は 409
    - unlisted -> listed_fixed | listed_auction | listed_lottery | offer_open
    - listed_* -> sold | delisted
    - offer_open -> sold | delisted
trade:           # 取引成立 = 配送完了確認 かつ 評価確定 (V3-MKT-04)
  states: [matched, stage1_private_board, stage2_shipping_payment, delivered, settled, cancelled]
  notes: "オークション落札は stage1 を省略し stage2 へ直行。配送完了から1ヶ月無評価で自動『良い』評価 → settled"

# schemas/state-machines/expected-payment.yaml — GMO 照合の残債モデル(設計ギャップ③の解消)
expected_payment:
  record: { id, obligor_user_id, transfer_code, amount_yen, kind: [fee_8pct, pt_deposit, p2p], trade_ref, created_at }
  # 用語: pt_deposit = V3-MKT-12『PT入金』区分（PT = 影響力行使の消費型ポイント — V3-KRM-10。プラチナ勲章とは別概念の円建て入金）。勲章プラチナ本体の金銭購入ではない（§7.1 で構造禁止・GMO台帳→platinum_minted 参照は negative TC で fail）。用途詳細は V3-MKT-38 裁定に従属
  states: [pending, partially_paid, matched, cancelled]
  events:                                    # すべて append-only。残債は投影が Σ で導出
    - ihl.ledger.obligation_created.v1       # 期待入金 INSERT。amount_yen 全額が初期残債
    - ihl.ledger.payment_applied.v1          # data: {expected_payment_id, deposit_event_id, applied_yen}
    - ihl.ledger.credit_granted.v1           # 過入金 FR-GMO-09: 超過分を貢献費クレジット計上(将来 8% に相殺)
    - ihl.ledger.credit_applied.v1           # クレジット自動相殺: 次回義務発生時に保有クレジットを残債へ充当。data: {expected_payment_id, applied_yen}
    - ihl.ledger.obligation_cancelled.v1
  residual_rule: "residual = obligation.amount_yen - Σ payment_applied.applied_yen - Σ credit_applied.applied_yen（投影値。Truth に残債列を持たない）"
  partial_payment: "FR-GMO-08: 入金額 < 残債 → payment_applied(入金全額) を追記し state=partially_paid。残債>0 の間 fee_unpaid 起算は継続"
  overpayment: "FR-GMO-09: 入金額 > 残債 → payment_applied(残債分) + credit_granted(超過分) を同一バッチで追記し state=matched"
  aggregation: "合算振込（1入金→複数 trade_ref 按分）は詳細設計 TBD を維持（要件 §2.5.5）。v1 は 1 期待入金内残債のみ"
```

### 6.2 カルマ（減算・時間回復）

出典: V3-KRM-01/02/03/04/05（`ver3-最終要件定義書-v1.md:347-362`。V3-KRM-02 は `:362`）。

```yaml
# schemas/state-machines/karma.yaml — 二層独立モデル。全ミューテーション R2 INSERT ONLY (CL-12)
karma:
  layers:
    value: { range: [-100, 100], initial: 0 }
    count: { range: [0, inf], initial: 0 }
  events:
    - ihl.karma.count_increased.v1     # data: {steps, reason_event_id}。1 step ごとに value -= Fib(n) を逐次適用(n=count到達値)
    - ihl.karma.monthly_relief.v1      # 毎月25日基準: count>=1 → count-1。count=0 完遂月のみ value+10 (上限100)
    - ihl.karma.count_reduced_by_indulgence.v1  # 免罪符 1 購入 = count-1 (0未満不可)。value 直接購入なし
  invariants:
    - "value の増加経路は monthly_relief のみ。減少は count_increased の Fib ペナルティのみ"
    - "value <= -100 → 永久BAN(ログイン拒否)。R2 データは保持・プロフィールに公開表示 (V3-KRM-04)。免罪符での復帰不可"
    - "Fib 計算は決定論: イベント列 replay で value/count が常に再現一致すること"
```

### 6.3 査読6段（決定論5 + LLM1）

出典: V3-PPR-05（`ver3-最終要件定義書-v1.md:789`）、V3-AIP-04。実装波は第2波 — 本書は契約のみ定義。

```yaml
# schemas/state-machines/peer-review.yaml
peer_review_pipeline:
  stages:
    - { n: 1, name: structure,      kind: deterministic, check: "スキーマ適合・必須節存在" }
    - { n: 2, name: missing_data,   kind: deterministic, check: "欠損・null 規約違反検出" }
    - { n: 3, name: reproducibility, kind: deterministic, check: "run_id/input_hash/engine version から再実行一致" }
    - { n: 4, name: consistency,    kind: deterministic, check: "引用実在・RTM/数値整合" }
    - { n: 5, name: statistics,     kind: deterministic, check: "統計検定の前提・計算再現" }
    - { n: 6, name: llm_review,     kind: llm, constraint: "提案者と別モデル系列。要約・改善提案のみ。合否判定は 1-5 の決定論結果が正" }
  ordering: "1→5 を全通過するまで stage 6 を起動しない（決定論先行・LLM 呼び出し最小 = 条項①⑤）"
  output_event: ihl.ppr.review_completed.v1   # data: {paper_id, stage_results[6], run_id, model_version(stage6)}
```

### 6.4 GMO 照合（日時決定 P1〜P6・FIFO）`FROZEN(CL-11)`

出典: `01-要件/23-GMO銀行振込判定.md:136-209`（P1〜P6・§2.5.3）、`b2/research-gmo-aozora-api-v1.md`、裁定1（設計ギャップ①②④）。

```yaml
# schemas/state-machines/gmo-reconciliation.yaml
derive_transfer_code:        # FROZEN(CL-11): SHA-256 -> uint24 digest[0..2] -> Base36 大文字 -> "U-" + 4..6文字
  frozen: "既存ユーザー全員分のテストベクタ回帰必須。1件でも不一致で fail"
  registration_collision:    # 設計ギャップ④の解消（登録時 alternate slice）
    rule: |
      新規ユーザー登録時に derived code が既存ユーザーの code と衝突した場合のみ、
      digest スライスをずらして再導出する: attempt1 = digest[0..2](既定), attempt2 = digest[3..5],
      attempt3 = digest[6..8]。最大3回。3回とも衝突なら登録を保留し手動キューへ（自動採番へ逃げない）。
      採用スライス index はユーザーレコードに永続化し、以後の導出は保存済み code を正とする（再導出しない）。
    event: ihl.gmo.transfer_code_assigned.v1   # data: {user_id, code, slice_index, attempt}
  extraction_regex: "U[\\-\\－][A-Z0-9]{4,6}"   # ゆらぎ耐性 MAX（全角ハイフン許容）

deposit_ingestion:           # 設計ギャップ①の解消（3入力経路 → 単一イベントへ正規化）
  inputs:
    webhook:   "POST /gmo/webhook (va-deposit-transaction, HMAC 検証)"
    unsentlist: "GET /unsentlist/va-deposit-transaction を配信停止検知時+日次に system cron が回収"
    polling:    "GET /accounts/deposit-transactions を 1〜5 分周期ポーリング（Phase1 最小構成の正経路）"
  bridge: |
    3 経路すべて同一の正規化関数 normalizeDeposit() を通し、単一イベント
    ihl.gmo.deposit_observed.v1 {itemKey, applicantName, amount_yen, remittance_datetime, raw_source}
    として Truth に append する。照合エンジンの入力はこのイベントのみ（webhook payload 直結を廃止）。
  idempotency: "itemKey（口座ID毎一意・μs timestamp）をキーに冪等。重複配信・経路重複は同一 itemKey の 2 回目 put が no-op"

remittance_datetime:         # 設計ギャップ②の前提。優先順は要件 §2.5.2 の P1〜P6 を凍結転記
  priority:
    P1: "エンベロープ timestamp (ISO8601 時刻付き)"
    P2: "account.baseDate + account.baseTime"
    P3: "va_transaction.transactionDate (日付のみ → JST 00:00:00)"
    P4: "va_transaction.valueDate (P3 欠落時)"
    P5: "va_transaction.itemKey 先頭14桁 YYYYMMDDHHMMSS（パース可能なら P3 より優先）"
    P6: "OS 受信 received_at（最終フォールバック）"

matching:                    # 要件 §2.5.3 を凍結転記（設計ギャップ②の created_at 下限フィルタを含む）
  algorithm: |
    S0: C = { expected | status in [pending, partially_paid]
              AND amount_yen 照合(部分入金は残債照合)
              AND transfer_code が normalize(applicantName + " " + remarks) に部分一致 }
    S1: |C| = 0 -> 照合失敗イベント(理由: コード/金額不一致)
    S2: |C| = 1 -> matched（§6.1 の payment_applied / credit_granted を発行）
    S3: |C| >= 2 ->
      3a: remittance_datetime を P1..P6 で決定
      3b: C' = { row in C | row.created_at <= remittance_datetime }   # 義務発生日以降の入金のみ。先払い誤紐づけ防止
      3c: |C'| = 0 -> 手動確認キュー（自動照合しない）
      3d: |C'| = 1 -> matched
      3e: |C'| >= 2 -> FIFO by obligation: argmin(created_at, id)     # 最古の未払い義務へ消込
  events:
    - ihl.gmo.deposit_matched.v1      # data: {deposit_event_id, expected_payment_id, applied_yen}
    - ihl.gmo.match_failed.v1         # 手動キュー行。UI 文言「該当する未払いがありません」
  human_gate: "本番鍵投入・実入金確認のみ人間ゲート（V3-MKT-15）。sunabar 上の結合 E2E までは AI 完結"
```

negative TC 種: created_at > remittance_datetime の pending が C' に残ったら fail（早すぎる振込の誤マッチ検知）。slice 衝突 3 回で自動採番したら fail。webhook payload を正規化イベントを経ずに照合エンジンへ渡す経路が存在したら fail（アーキテクチャテスト）。

### 6.5 出品モデレーション状態機械（指摘システム — 第2波・契約のみ本書で定義）

出典: V3-GOV-31（司法モジュール設計原則 = 告発時の身元開示対称性・第1波）、V3-GOV-34/35（機能要件・第2波・新規採番）、V3-GOV-07（PT 投票 — 補強原典「対価・権利・権能」）、V3-GOV-08（指摘カルマΔcount — §6.2 と接続）。裁定正本: `ver3-ユーザー裁定-2026-07-10-第4回.md`。不適切出品への事前ワードフィルタは採用しない（抜け道が無数 — 同裁定原文）。防衛線はユーザーの指摘システム（「貴族のシステム」概念）。

```yaml
# schemas/state-machines/listing-moderation.yaml — §6.1 listing 状態機械と直交する可視性 overlay（listed_* の商品にのみ適用）
listing_visibility:
  states: [visible, hidden]        # 初期値 visible
  transitions:                     # 許可辺のみ。遷移は投影がカウンタ閾値到達を検知してイベントを発行
    - visible -> hidden            # active_complaint_count >= 5 → ihl.gov.listing_hidden.v1
    - hidden -> visible            # 解決で active_complaint_count < 5 → ihl.gov.listing_unhidden.v1
  counter: "active_complaint_count = Σ complaint_filed − Σ complaint_resolved（同一 listing_id。投影値 — Truth にカウンタ列を持たない §3）"
  boundary: "⏳HG 裁定原文は「5件以下にならない限り表示されません」。発動閾値(>=5)と整合させ『5件未満で再表示』と解釈（第4回裁定 注記・レジストリ ambiguity 記録済み）。境界値の最終確定は詳細設計で本人確認"
seller_listing_right:              # V3-GOV-35 二段目
  states: [active, suspended]      # 初期値 active
  transitions:
    - active -> suspended          # hidden_listing_count >= 5 → ihl.gov.seller_suspended.v1。suspended 中の新規出品 POST は 409（§5 遷移規約と同型）
    - suspended -> active          # hidden_listing_count < 5 で復帰。専用解除イベント型は第4回裁定に存在しないため定義しない — 状態は投影導出（要否は詳細設計 TBD）
  counter: "hidden_listing_count = 出品者の現在 hidden 状態の listing 数（投影値。listing_hidden / listing_unhidden から導出）"
complaint_room:                    # 指摘ルーム = V3-GOV-31（身元開示対称性）の担保機構（V3-GOV-34）
  actors: "当事者2名固定 [complainant_id, seller_id]。第三者の発言権なし"
  visibility: { initial: private, publish: "当事者のどちらでも・いつでも外部公開可（対称性: どちらか一方だけが隠れることはできない）" }
  publish_representation: "公開フラグの実体は ihl.gov.room_published.v1 の append（フラグ列の UPDATE ではない）。非公開へ戻すイベントは第4回裁定に存在しないため定義しない"
  external_vote: "公開後の第三者投票は PT 保有者のみ・1票 = 1PT 消費（V3-GOV-07。§7.2 platinum_consumed purpose: vote）。コスト0の投票経路は作らない"
events:                            # すべて §1 エンベロープ・append-only（CL-01/02 準拠）
  - ihl.gov.complaint_filed.v1     # data: {complaint_id, listing_id, complainant_id, reason}。成立時に room_created を同一バッチで発行。カルマ接続: V3-GOV-08 — §6.2 karma.count_increased の reason_event_id に本イベント id
  - ihl.gov.complaint_resolved.v1  # data: {complaint_id, resolution}
  - ihl.gov.listing_hidden.v1      # data: {listing_id, complaint_count_at_transition}
  - ihl.gov.listing_unhidden.v1    # data: {listing_id, complaint_count_at_transition}
  - ihl.gov.seller_suspended.v1    # data: {seller_id, hidden_listing_count_at_transition}
  - ihl.gov.room_created.v1        # data: {room_id, complaint_id, actors: [complainant_id, seller_id]}
  - ihl.gov.room_published.v1      # data: {room_id, published_by}   # published_by は actors のいずれか。それ以外は validate fail
```

negative TC 種: 閾値未満（指摘4件）で listing_hidden 発行 → fail。complaint_filed/resolved 列の replay で可視性・停止状態の再現不一致 → fail。actors 外の actor による room_published put → validate fail。PT 残高 0 の外部投票受理 → fail（V3-GOV-07）。

---

## 7. 勲章（プラチナ）発行モデル — 会計イベント設計

出典: 裁定4（`ver3-ユーザー裁定-2026-07-10-第2回.md`）、V3-MKT-38/40・V3-KRM-33（`ver3-最終要件定義書-v1.md:915-934`）、V3-KRM-11（upstream 10%・端数繰越）、CL-12。**V3-KRM-33 と V3-MKT-40 を本節の単一発行モデルに統合する（二重定義禁止ゲートの解消）。**

### 7.1 原則（思想承認済み・変更不可）

- プラチナ = 文明の勲章。金銭購入不可・送金売買禁止・インフレ絶対禁止・カルマ完全分離・穴を埋めた時だけ発行。
- 希少性を煽る販促（FOMO 型）禁止。在庫・発行量は透明開示（V3-MKT-32）。
- 台帳は複式簿記（Σdebit=Σcredit・残高非負・immutable・idempotency_key UNIQUE・増減は system ロールのみ）= V3-MKT-40。CL-12 append-only。

### 7.2 会計イベント型（append-only 正本）

```yaml
# schemas/events/platinum-ledger.yaml — 全イベントは §1 エンベロープに載る。台帳勘定は仮想 account
accounts:
  user:<user_id>:            "ユーザー保有勲章"
  sink:expired:              "消滅済み勲章の吸収勘定（残高単調増加 = 累計消滅量。再流通不可）"
  pool:unissued:             "未発行枠（総量/年間上限モデル採用時のみ実勘定化。月上限モデルでは概念勘定）"
event_types:
  - type: ihl.ledger.platinum_minted.v1
    data: { to: "user:<id>", units: int>0, source_axis: [research, capital, development], trigger_event_id, idempotency_key }
    rule: "発行はサーバ(system)のみ。ver2 Fibonacci 自己抑制を通過した鋳造のみ（V3-KRM-12: 軸別 Fib(n)*100 閾値・端数繰越）"
    entry: "debit pool:unissued / credit user:<id>"
  - type: ihl.ledger.platinum_consumed.v1
    data: { from: "user:<id>", units: int>0, purpose: [vote, shop, indulgence], target_ref, idempotency_key }
    rule: "消費のみ。ユーザー間 transfer イベント型は定義しない（送金売買禁止を型レベルで強制）"
    entry: "debit user:<id> / credit clearing:settlement"   # 同一バッチ内で 7.3 の 2 イベントに即時分解
  - type: ihl.ledger.platinum_upstream_transferred.v1       # transfer_upstream_10pct
    data: { from: "clearing:settlement", to: "user:<ancestor_id>", units: int>=0, distribution_weight, consumed_event_id }
    rule: "消費対象の lineage 祖先へ upstream_rate を重み配分（V3-KRM-11 と同型）。祖先なしは全額 expire へ"
  - type: ihl.ledger.platinum_residual_expired.v1           # expire_residual
    data: { from: "clearing:settlement", to: "sink:expired", units: int>0, consumed_event_id }
    rule: "上流還元後の残余を消滅。sink:expired は出金辺を持たない勘定（再流通したら複式検算で即検知）"
invariants:
  - "Σdebit = Σcredit（イベントバッチ単位）"
  - "全 user 勘定残高 >= 0"
  - "任意時点: 累計 mint = Σ全user残高 + 累計 upstream 再配分純増 + sink:expired 残高（保存則）"
  - "idempotency_key UNIQUE。二重実行は 2 回目が no-op"
```

### 7.3 消滅のタイミングと会計表現（本書の確定裁定）

**確定**: 消滅は**消費コミット時に即時・同一アトミックバッチで**発生させる。

```
consumed(N units)
  → 同一バッチ内で:
      upstream_units = floor(N × upstream_rate)          # 端数は消滅側へ（勲章は整数。ユーザー別繰越を持たず決定論を優先）
      platinum_upstream_transferred(upstream_units)       # lineage 祖先へ重み配分（配分内の端数も floor・余りは expire へ）
      platinum_residual_expired(N - upstream_units)
  → clearing:settlement はバッチ末尾で常に残高 0（不変条件）
```

- **月次バッチ消滅案は却下**: cron 依存・「消滅待ち残高」という中間状態が台帳に生まれ、複式検算と replay 決定論を汚す。即時消滅なら状態機械が増えない。
- 会計表現は「バーン」でなく**吸収勘定への振替**とする。消滅を DELETE や残高減算の特殊処理にせず通常の複式仕訳で表現することで、CL-12（既存台帳からの残高再計算一致）と保存則検算が単一のリデューサで閉じる。
- 消滅は保有勲章の没収ではない（既存保有分は減らさない — V3-KRM-33）。消滅するのは**本人が消費した勲章の残余のみ**。

### 7.4 数値パラメータ表（推奨値 + ⏳HG 人間裁定待ち — V3-MKT-38）

| policy_key | 推奨値 | 代替案（ソース間不整合の原文） | 状態 |
|---|---|---|---|
| `platinum.upstream_rate` | **0.10** | ver1 思想 10% / V3-KRM-11 upstreamPercent 既定 10% で整合 | 推奨で実装可 |
| `platinum.expire_rate` | **0.90**（= 1 − upstream_rate。独立キーにせず導出値とする） | ver1「90%消滅」 | ⏳HG |
| `platinum.monthly_mint_cap_per_user` | **10 枚/月/人** | 月10枚上限説 vs 上限なし(V3-KRM-12「キャップ設けず」) | ⏳HG（不整合の本体） |
| `platinum.total_supply_cap` | **設けない**（発行は Fib 自己抑制 + 消滅で収縮） | 固定総量説 | ⏳HG |
| `platinum.annual_mint_cap` | **設けない** | 年間上限説 | ⏳HG |
| `platinum.mint_threshold_base` | 100（contributionPerPlatinum・V3-KRM-11） | — | 確定済み |
| `platinum.dynamic_multiplier`（AI 自動制御の動的倍率） | **第1波では実装しない**（policy_key の器だけ用意） | 誇張ゼロ — 制御ロジック未検証のまま「AI 制御」を謳わない（開発者用 §5.3 と同一行） | ⏳HG |

- 全キーは `market_governance` 政策テーブル（policy_key + timestamp 最新行を正 — V3-MKT-39）に置き、コードへのハードコード禁止。裁定確定時は新行 append のみで反映。

negative TC 種: user→user の直接 transfer イベント投入が schema validate で fail。`sink:expired` を debit する仕訳が invariant 検査で fail。バッチ後 `clearing:settlement` 残高 ≠ 0 で fail。保存則検算不一致で fail。

---

## 8. ScreenDef スキーマ骨格 + ThemePack トークン契約

出典: V3-UIX-17/18（`ver3-最終要件定義書-v1.md:438,446`）、V3-UIX-16（同 `:432`）、既存形式継承（`screen-defs/01.json` — 中身は再設計・形式は継承、`b3/ver3-開発計画-v1.md` §6.2 案B）。

`schemas/screendef.schema.json`（骨格。既存 63 JSON と後方互換の必須3キー + ver3 拡張）:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/screendef.schema.json",
  "title": "ScreenDef v1 (UI-as-data SSOT)",
  "type": "object",
  "required": ["screen_id", "route", "title", "nodes", "transitions"],
  "properties": {
    "screen_id": { "type": "string" },
    "route": { "type": "string" },
    "title": { "type": "string" },
    "layout": { "type": "string", "default": "standard" },
    "primary_cta": { "type": ["string", "null"], "description": "主CTA node id。1画面1つ(V3-UIX-06)。renderer が 2 個目を検出したら描画拒否" },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "component_id", "region"],
        "properties": {
          "id": { "type": "string" },
          "component_id": { "type": "string", "description": "catalog 登録済み Component のみ（Builder 内 invent 禁止 = V3-UIX-08 REFRAME 維持）" },
          "region": { "type": "string" },
          "props": { "type": "object", "description": "state + className を規約統一(V3-UIX-18)。ロジック持ち込み禁止(D6)" }
        }
      }
    },
    "transitions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["from", "to_screen_id"],
        "properties": { "from": {"type": "string"}, "to_screen_id": {"type": "string"}, "label": {"type": "string"} }
      }
    },
    "lineage": { "$ref": "ihl://schemas/cusb-manifest.schema.json#/properties/lineage", "description": "ScreenDef 自体も fork 対象" }
  }
}
```

ThemePack トークン契約（`schemas/themepack.contract.yaml`）:

```yaml
themepack:
  token_prefix: "--civ-"                  # CSS 変数正本。V3-UIX-16
  source_of_truth: "design_token.yaml + UI primitive カタログ"
  required_packs: [light, dark]           # 2 パック必須。片方欠落は validate fail
  token_groups: [color, radius, shadow, motion, spacing, typography]   # スタイル C-USB 化(V3-UIX-14)
  semantics: "色は意味のみ(緑=成功/生存・赤=失敗・青=情報・黄=注意)。装飾多色トークンの追加禁止(V3-UIX-04)"
  propagation: "テンプレ1箇所変更 → 全画面へ CSS 変数一括伝播。世界共通デフォルト + ユーザー個別上書き + フォーク系譜"
  lineage: "ThemePack も lineage{uuid,parent_uuid,generation} を持つ fork 対象"
```

negative TC 種: `component_id` が catalog 未登録の ScreenDef が validate/描画で fail。primary_cta 2 個で fail。dark パック欠落 ThemePack で fail。

---

## 9. ツイン実験枠 — エージェント契約

出典: 裁定3（`ver3-ユーザー裁定-2026-07-10-第2回.md`）、V3-AIP-42（RAG 接地・`ver3-最終要件定義書-v1.md:1175`）、V3-OTH-19（人格=関数・同 `:875`）、V3-UIX-65（Twin 語 UI 禁止・同 `:1258`）、V3-VID-10（復活形は保留・同 `:866`）、R-3（自動対話方式は撤回のまま）。

```yaml
# schemas/agents/twin-experiment.contract.yaml — 実験枠。既定 off・opt-in・人間裁定つき
feature_flag: { key: "experiment.twin_broadcast", default: false, scope: per_user_opt_in }
agents:                                   # 2 体は別エージェント（単一 AI に会話を演じさせる R-3 方式を採らない）
  - agent_id: twin-self                   # 本人写像
    grounding: "本人ログ RAG のみ（観測ログ・裁定ログ・OK/NG 差分）。プロンプトによる性格付け禁止(V3-AIP-42。RAG 迂回禁止)"
  - agent_id: twin-sakura                 # 案内 AI さくら
    grounding: "システム側運用ログ + 公開 wiki RAG のみ"
shared_constraints:                       # 人格 = 関数 (V3-OTH-19)
  permissions:
    decision_making: false                # 意思決定権限なし
    economy: false                        # 台帳・勲章・カルマへの書込不可（system ロール外）
    pii: false                            # PII コーパスへのアクセス不可（マスク済みログのみ）
    security: false
  io: "入力 = RAG 検索結果 + 台本骨子。出力 = 発話ドラフト（ihl.twin.draft_generated.v1）→ 朝レビュースタック行き。直接公開経路なし"
  provenance: "全ドラフトに provenance{actor_kind: agent, model_version, run_id, input_event_ids(RAG ヒット元)} 必須"
naming: "『Twin』ペルソナ語を IHL 本体 UI に一切出さない(V3-UIX-65)。UI 露出時の呼称は人間裁定"
human_gate: "掛け合い発信の最終形（公開形態・頻度・声）は V3-VID-10 保留のまま。本契約は sandbox 生成までを上限とし、公開は人間裁定必須"
```

negative TC 種: twin エージェントの token で台帳 WRITE を試行 → 403 で fail しなければならない。UI 文言スナップショットに「Twin」出現で lint fail。

---

## 10. 夜間タスク定義スキーマ + 朝レビュースタック

出典: V3-AIP-96/78（`ver3-最終要件定義書-v1.md:814-825`）、ワークスペース設計 §4.2（max 3 値必須・欠落時実行拒否・STOP マーカー）、開発計画 R-01、可視化キュー8点（`D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md` §ver3への示唆 1〜8）。

`schemas/night-task.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/night-task.schema.json",
  "title": "Night Task Definition v1",
  "type": "object",
  "required": ["task_id", "goal", "success_criteria", "cost_cap_tokens", "cost_cap_usd", "time_cap_minutes", "max_rounds", "zero_result_stop"],
  "additionalProperties": false,
  "properties": {
    "task_id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "goal": { "type": "string" },
    "target_system": { "type": "string" },
    "success_criteria": { "type": "string", "description": "機械判定可能な形で書く" },
    "cost_cap_tokens": { "type": "integer", "exclusiveMinimum": 0 },
    "cost_cap_usd": { "type": "number", "exclusiveMinimum": 0 },
    "time_cap_minutes": { "type": "integer", "exclusiveMinimum": 0 },
    "zero_result_stop": { "const": true, "description": "成果ゼロラウンド検知で自動停止。false 不可" },
    "max_rounds": { "type": "integer", "minimum": 1, "description": "必須（ワークスペース設計 §4.2 / 開発計画 R-01: 上限3値必須・欠落時実行拒否）。推奨値 10" },
    "escalation": { "type": "string", "description": "上限到達時の停止手順。孫エージェント生成禁止(V3-CST-03)" }
  }
}
```

```yaml
# schemas/night-run.contract.yaml — ランナー規約
runner:
  validation: "上記スキーマ validate 不合格（必須キャップ欠落含む）のタスクは実行拒否"
  night_budget: "タスク別上限とは別に夜間全体の総枠 (ops/schedules/night.json)。総枠到達で全タスク停止"
  stop_marker: "上限到達時 runs/<run_id>/STOP を書く（空ファイル+理由1行）。STOP 存在下で新ラウンド起動禁止"
  round_log: "1 ラウンド = 1 JSON 追記 {round_n, started_at, tokens_used, usd_used, artifacts[], score}"   # 可視化キュー⑥
  no_full_auto: "ワンクリック全自動禁止。成果は必ずレビュースタック経由。迷う1割は人間(V3-AIP-78/31)"

# schemas/review-stack.schema.json（データ形の骨格）
review_item:
  required: [item_id, produced_by_run_id, artifact_ref, summary_3lines, state]
  state: { enum: [pending_review, ok, ng], initial: pending_review }
  decision_event: ihl.night.review_decided.v1   # data: {item_id, decision: ok|ng, decided_by}
  rule: "OK/NG の 2 択だけで捌ける形に整形して積む。OK は Promote 候補化・NG は理由任意で closed"

# schemas/claude-dashboard.contract.yaml — 可視化8キュー（参照3動画の設計キュー。番号は summary ノート準拠）
dashboard:
  1_kanban: { columns: [needs_input, working, completed], unit: "セッション/タスク" }   # 状態別3カラム
  2_peek: "一覧アイテムに覗き見プレビュー（経過時間・要約・簡易操作）。フル遷移不要"
  3_confirm_destructive: "削除・キャンセル等の破壊的操作は必ず確認ダイアログ"
  4_button_grid: "頻用操作のワンクリックボタングリッド（実行はヘッドレス起動。全自動化ではない）"
  5_usage_panel: "利用枠・残量指標は主要操作領域と分離した専用サイドパネル"
  6_round_json_log: "進捗・スコア・改善履歴をラウンド単位 JSON で保存し UI でタイムライン再生"
  7_customizable: "表示項目・レイアウトはユーザー/プロジェクトごとにカスタマイズ可能（固定テンプレ一本化禁止）"
  8_background_intake: "ダッシュボード外で起動したバックグラウンド処理を一覧へ取り込む導線（取りこぼしゼロ）"
```

negative TC 種: `cost_cap_usd` / `max_rounds` 欠落タスクが実行拒否されなければ fail。STOP 存在下のラウンド起動で fail。`zero_result_stop: false` が validate を通ったら fail。

---

## 11. 埋め込み契約 `FROZEN(CL-08)`

出典: ADR-V3-EMB-01 Decision 1〜4、V3-OBS-09（`ver3-最終要件定義書-v1.md:209`）、テキスト側 `b2/research-wiki-integration-v1.md` §1（ruri-v3-70m）。

```yaml
# schemas/frozen/embedding.contract.yaml
common:
  dim: 384                        # 画像・テキスト共通。manifest embedding_dim: int 必須（スキーマ凍結）
  dtype: float32
  normalization: "L2 必須（||v||2 = 1 ± 1e-6）"
  nan: "禁止。NaN/Inf 含有ベクトルは保存前に reject"
  mismatch_guard: "検索側は manifest の embedding_dim を信頼し、次元不一致ベクトルを比較対象から遮断（旧 scoring.py:44 相当を TS/Py 双方に移植）"
image:
  model: "dinov2_vits14（サーバ）。将来端末 = 同系 small ONNX で同一 384（V3-FND-19）"
  color: "ColorHist / 部位別 Lab は embedding に連結しない。rerank 特徴として分離（V3-OBS-14。重み 0.50/0.20/0.20/0.10 は ADR-H-12 暫定値）"
text:
  model: "ruri-v3-70m（384・Apache-2.0・ONNX 端末実行可）"
  parity: "PyTorch/ONNX 出力の cosine 一致検証をバックエンド追加時の受け入れ条件とする"
backend_protocol:               # EmbeddingBackend Protocol（V3-OBS-09 継承）
  interface: { name: str, dim: "int (=384)", embed: "(input) -> float32[384] L2-normalized" }
  default: "dummy 決定論バックエンド（sha256→正規乱数→L2。torch 非依存・CI 用）"
  switch: "環境変数 IHL_EMBEDDING_BACKEND"
escape_hatch_768: "実装しない。発動条件・移行手順は ADR-V3-EMB-01 §Decision-4 のみを正本とする（旧 384 系列は削除せず別系列 append）"
```

negative TC 種: dim≠384 のベクトル投入が検索対象から遮断されなければ fail。非正規化（||v||≠1）ベクトルの保存が通ったら fail。NaN 含有で fail。

---

## 12. 機械検証手段 — スキーマ別 negative TC 種の総覧

規約: 1 スキーマ = 最低 1 本の「破ると fail する」negative TC（`ver3-最終要件定義書-v1.md:1385` の生成規約）。CL 対応行は Phase C 最優先で緑化（同 `:1389`、開発計画 C1 完了条件）。green は実測エビデンスがある時のみ（V3-AIP-03）。

| # | 対象スキーマ/契約 | negative TC 種（1行） | CL |
|---|---|---|---|
| 1 | envelope.schema.json | `type` がバージョン無し(`ihl.obs.foo`)の put → validate fail | CL-02 |
| 2 | envelope.provenance | agent イベントで model_version 欠落 → 422 | CL-02 |
| 3 | r2-keyspace | 同一キー 2 重 put → 後発 null/409（実機） | CL-01 |
| 4 | r2-keyspace | R2 トークンで DELETE 実行 → 権限エラー | CL-01 |
| 5 | projection.contract | kv_metadata 4 キー欠落 Parquet → CI fail | — |
| 6 | projection.contract | 投影 rebuild 出力ハッシュ不一致 → fail（決定論違反） | — |
| 7 | cusb-manifest | 同一 run_id 出力先既存で run 続行 → fail | — |
| 8 | api 契約 | 未ログイン GET 保護 route → 401/403 を全保護 route 分 | CL-04 |
| 9 | api 契約 | 既存 actor_id 導出ベクタ 1 件不一致 → fail | CL-03 |
| 10 | listing/trade 状態機械 | 許可辺以外の遷移 POST → 409 | — |
| 11 | expected_payment | 部分入金後の残債 ≠ amount−Σapplied → fail | — |
| 12 | expected_payment | 過入金で credit_granted 未発行 → fail | — |
| 13 | karma | イベント列 replay で value/count 再現不一致 → fail | CL-12 |
| 14 | karma | value ≤ −100 でログイン成功 → fail | — |
| 15 | peer-review | stage1〜5 未通過で stage6(LLM) 起動 → fail | — |
| 16 | gmo deriveTransferCode | 既存全ユーザーベクタ 1 件不一致 → fail | CL-11 |
| 17 | gmo alternate slice | 衝突 3 回後に自動採番へ逃げたら fail | CL-11 |
| 18 | gmo matching | created_at > remittance_datetime の行が C' に残存 → fail | — |
| 19 | gmo bridge | 照合エンジンへ deposit_observed 以外の入力経路が存在 → fail | — |
| 20 | platinum ledger | user→user transfer イベント → validate fail | CL-12 |
| 21 | platinum ledger | バッチ後 clearing 残高 ≠ 0 / 保存則不一致 → fail | CL-12 |
| 22 | platinum ledger | 同一 idempotency_key の 2 回目実行が残高を動かす → fail | CL-12 |
| 23 | screendef | catalog 未登録 component_id → validate fail | — |
| 24 | themepack | dark パック欠落 → validate fail | — |
| 25 | twin contract | twin token で台帳 WRITE → 403 でなければ fail | — |
| 26 | twin contract | UI 文言に「Twin」出現 → lint fail | — |
| 27 | night-task | cost_cap_usd / max_rounds 欠落タスクが実行された → fail | — |
| 28 | night-run | STOP マーカー存在下の新ラウンド起動 → fail | — |
| 29 | embedding | dim≠384 / 非正規化 / NaN ベクトルが検索・保存を通過 → fail | CL-08 |
| 30 | 同意記録 | 同意ファイル上書き試行が成功 → fail | CL-05 |
| 31 | 個体/QR | 既存 individual_id・発行済み QR トークンの参照断絶 → fail | CL-06/10 |
| 32 | collector | 改竄署名の環境 POST が受理 → fail | CL-09 |
| 33 | listing-moderation | 閾値未満（指摘4件）で listing_hidden 発行 / replay で可視性・停止状態の再現不一致 → fail | — |
| 34 | complaint room | 当事者以外の room_published put → validate fail / PT 非保有者の公開ルーム投票受理 → fail | — |

---

## 付録 A. 本書が確定させた設計判断（B4 裁定・事後承認対象）

1. **勲章消滅のタイミング = 消費コミット時・即時・同一アトミックバッチ**。会計表現は `sink:expired` 吸収勘定への複式振替（§7.3）。月次バッチ案は却下。数値パラメータは §7.4 の推奨値 + ⏳HG。
2. **GMO 3 入力経路（webhook/unsentlist/ポーリング）を `ihl.gmo.deposit_observed.v1` 単一イベントに正規化**し、照合エンジンの入力をこのイベントのみに限定（設計ギャップ①）。created_at 下限フィルタ・P1〜P6・FIFO を状態機械 YAML に凍結転記（②）、残債は投影導出（③）、登録時 alternate slice digest[3..5]/[6..8] 最大3回（④）。
3. **プラチナのユーザー間 transfer イベント型を定義しない**ことで送金売買禁止をスキーマレベルで強制（§7.2）。
4. ScreenDef は既存 63 JSON の必須 3 キー（screen_id/nodes/transitions）と後方互換の形式継承 + lineage/primary_cta 拡張（§8）。

*改訂は append 追記または新版ファイルで行う。既存本文の書き換えは誤記修正に限る。*

*v1.1: 2026-07-10 第4回裁定反映 — §6.5 出品モデレーション状態機械（V3-GOV-31/34/35/07・V3-GOV-08 接続）を追加、§12 に #33/34 を追記。出典: `ver3-ユーザー裁定-2026-07-10-第4回.md`。*
