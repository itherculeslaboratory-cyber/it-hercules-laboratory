---
id: V3-B4-DESIGN-DEVELOPER
title: ver3 設計書（開発者用）v1 — API・データ設計
date: 2026-07-10
status: reviewed
audience: developer
phase: B4
depends_on:
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-workers-vs-vps-v1.md
  - docs/planning/ver3/b2/research-gmo-aozora-api-v1.md
  - docs/planning/ver3/b2/research-ai-first-data-design-v1.md
  - docs/planning/ver3/b2/research-smtp-secrets-migration-v1.md
  - docs/planning/ver3/b2/research-tts-video-stack-v1.md
  - docs/planning/ver3/b2/ADR-V3-EMB-01-embedding-dimension-v1.md
  - docs/planning/ver3/b2/research-wiki-integration-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
  - docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md
  - docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md
  - docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md
---

# ver3 設計書（開発者用）v1 — API・データ設計

> **読者**: OSS コントリビュータと実装エージェント（Phase C の実装者）。
> **位置づけ**: B4 設計書 3 種のうち開発者用。**AI 用設計書（機械可読）が正本**であり、本書は開発者が読む実装ガイドの正本（`b3/ver3-開発計画-v1.md` §9.1 の構図に準拠）。
> **規約**: 本書は**設計書**である。ここに書かれたものはまだ動いていない（誇張ゼロ・動くものだけ — 思想 D）。「動く」と書けるのは ver3-live で稼働確認済みの事実のみで、その場合は出典を付す。
> **凡例**: 【事実】= repo / B2 レポートで確認済み（出典付き）。【設計】= 本書の設計判断（事後承認方式 — `ver3-ユーザー裁定-2026-07-10-第2回.md` 裁定2）。**⚖裁定待ち** = 推奨値を置くが人間裁定で確定する数値。

---

## 1. アーキテクチャ全体図

### 1.1 全体図（ASCII）【設計 — 構成要素は B2 で確定済み。⚖印のみ裁定待ち】

```text
                        ユーザー端末（ブラウザ / PC）
   ┌───────────────────────────────────────────────────────────────┐
   │  Next.js Web（apps/web・単一 React Renderer ← screen-defs/*.json）│
   │  端末 ONNX 推論（テキスト ruri-v3-70m 384 のみ。画像埋め込みの現行正 │
   │  はサーバ側 dinov2_vits14 — 端末実行は将来オプション ADR-V3-EMB-01）│
   │  UGC 翻訳・画像前処理（射影変換等）も端末側 — 変動費ゼロ原則        │
   └───────────────┬───────────────────────────────┬───────────────┘
                   │ HTTPS                          │ 静的配信
                   ▼                                ▼
   ┌───────────────────────────┐    ┌───────────────────────────────┐
   │  Cloudflare Workers + Hono │    │  Cloudflare Pages（Web ホスト）│
   │  (TS, @hono/zod-openapi)   │    └───────────────────────────────┘
   │  主 API（契約正本= schemas/api）│
   │  認証: マジックリンクのみ    │──── HTTPS ──▶ Resend（メール送信・第一候補）
   │  R2 バインディング条件付き put│               実鍵投入は人間ゲート
   │                            │               ⚖Workers 直送信は V3-AUT-04
   │                            │               条文改訂の裁定待ち（§3.2）
   └──────┬──────────┬─────────┘
          │          │ HTTPS（x-access-token）
          ▼          ▼
   ┌────────────┐  ┌──────────────────────────────┐
   │ Cloudflare │  │ GMO あおぞらネット銀行 API      │
   │ R2 = Truth │  │ stub → sunabar(stg) → live 3-tier│
   │ append-only│  │ 振込入金明細照会ポーリング照合    │
   │ INSERT ONLY│  └──────────────────────────────┘
   └──────┬─────┘
          │ S3 互換 API（読み書き。UPDATE/DELETE 権限なしトークン）
          ▼
   ┌───────────────────────────────────────────────────────────────┐
   │  C-USB Python 部品（components/<name>/run.py — Workers に載せない）│
   │  ・ingest / thumbnail(暫定) / embedding 生成（DINOv2）            │
   │  ・動画量産ライン: VOICEVOX Engine(互換 REST=C-USB 境界) + ffmpeg │
   │    + ComfyUI(API JSON) + YouTube Data API（videos.insert のみ自動）│
   │  ・夜間運転ランナー（D:\claude\ops\ 側で実行・repo 外ログ）        │
   └───────────────────────────────────────────────────────────────┘
```

構成要素の確定根拠【事実】:

| 要素 | 決定 | 出典 |
|------|------|------|
| 主 API = Workers + Hono (TS) | FastAPI→移植の二度書き棄却。最初から TS で書く | `b2/research-workers-vs-vps-v1.md` §1・§5 |
| Web = Cloudflare Pages + Next.js + 単一 Renderer | ScreenDef（UI-as-data）を単一 Renderer が描画 | `ver3-最終要件定義書-v1.md:715`（V3-UIX-17）/ フォルダ設計 §2.1 |
| Truth = R2 のみ・append-only | INSERT ONLY / no-overwrite / 常駐 DB を SSOT にしない | 同 §5.3 ADR-V3-LAYER-01（V3-FND-01/02） |
| 埋め込み 384 一本化 | 画像 = `dinov2_vits14`（**サーバ torch hub が現行正**。端末実行は将来の同系 small ONNX オプション — ADR-V3-EMB-01 Decision 1）、テキスト = ruri-v3-70m 384（端末 ONNX 可） | `b2/ADR-V3-EMB-01` / `b2/research-wiki-integration-v1.md` §1-1 |
| C-USB Python 部品 | 重い ML・画像処理・動画合成は Workers に載せず `components/<name>/run.py` | フォルダ設計 §2.4「Python が残る領域」 |
| メール = Resend 第一候補 | SMTP 互換でコード変更ゼロ移行可。実鍵は人間ゲート。**Workers→Resend HTTPS 直送信は ⚖V3-AUT-04 条文改訂の裁定待ち**（§3.2） | `b2/research-smtp-secrets-migration-v1.md` §1・§4 段階(c) |
| GMO = sunabar で設計〜結合検証完結 | 本番は明細照会ポーリング照合が最小構成 | `b2/research-gmo-aozora-api-v1.md` §1 |

### 1.2 依存方向（repo 内）【事実 — フォルダ設計 §7.2 を転記参照】

`apps → packages | libs | components`、`schemas/` は葉（何にも依存しない）、`screen-defs/` はデータであり import しない、codegen は `schemas → generated` の一方向。詳細はフォルダ設計 §7（D1〜D7）を正とし、本書では複製しない（スキーマ・規約の複製はアンチパターン — フォルダ設計 §7.3）。

### 1.3 実験枠エージェント（ツイン）の位置【設計 — 裁定3 反映】

- ツイン（本人写像 Twin / 案内 AI さくら）は**実験枠 opt-in・既定 off**。各 Twin は**別エージェント**として編成し、人格はプロンプトで作らず**ログ RAG 接地**で構成する（V3-AIP-42、`ver3-ユーザー裁定-2026-07-10-第2回.md` 裁定3）。
- 実装上の制約: 人格 = 関数。**意思決定権限・経済権限・PII 権限を一切与えない**（V3-OTH-19）。エージェント定義は読み取り専用スコープの API トークンのみ受け取り、書込系 route・台帳系 route への到達を Scope A 境界設計（§3.3 deny-by-default）で構造的に遮断する。
- 「Twin」というペルソナ語を **IHL 本体 UI に出さない**（V3-UIX-65。RTM dropped 判定 — `ver3-最終要件定義書-v1.md:1363`）。
- 撤回済み R-3（単一 AI による自動対話方式）は復活させない。復活形の最終確定は人間裁定（V3-VID-10 保留）。本書はエージェント編成の器だけを定義し、対話生成方式は設計しない。

---

## 2. データ設計 — Truth 層 / 投影層

### 2.1 層分離（ADR-V3-LAYER-01）【事実】

正本は `ver3-最終要件定義書-v1.md:1275-1305`（ADR-V3-LAYER-01）。実装者が守る不変条件は 1 行に尽きる:

> **`projection = f(truth_events)`。`f` は決定論的・副作用ゼロ。投影は全消去しても Truth から完全復元できる。投影層にしか存在しない事実を作らない。**

| 層 | 置くもの | 実装上の住所 |
|----|----------|--------------|
| Truth（不変） | event/snapshot・同意記録・カルマ/プラチナ台帳・タグイベント・collector 署名付き環境 POST | R2（キー規約 §2.2）。書込は Workers の R2 バインディング経由のみ |
| 投影（再生成可） | Parquet manifest・materialized view・latest.json pointer・集計・（採用する場合）KV/D1 セッションキャッシュ | R2 派生プレフィクス + Workers 内キャッシュ。reducer/f は `packages/`（TS）または `libs/`（Python）に置き、`schemas/frozen/`・`schemas/events/` にのみ依存（フォルダ設計 D7） |

### 2.2 イベントエンベロープとキー規約【事実 — B2 調査 7 点セット】

全イベントは CloudEvents v1.0 準拠 JSON（`b2/research-ai-first-data-design-v1.md` §5 ルール 3/6）:

- 必須: `specversion: "1.0"` / `id`（ULID） / `source` / `type`（`ihl.<domain>.<event>.v<N>` — バージョン内包） / `time` / `dataschema`（`schemas/events/` への相対 URI）。
- 拡張: `provenance`（生成主体 human / agent 名+モデル ID / device ID、入力イベント ID 列）。lineage 要件（V3-FND-15）はこの拡張に統合する（`b3/ver3-開発計画-v1.md` §2.2）。
- オブジェクトキー: `<ULID>--<kebab-case-slug>.<ext>`、ディレクトリは Hive 形式 `events/type=<type>/date=YYYY-MM-DD/`。
- 投影 Parquet には `parquet_kv_metadata` で `schema_id` / `source_event_range` / `generated_at` / `generator` を埋め込み、CI で `parquet_kv_metadata()` 検証クエリを回す。

### 2.3 no-overwrite のストレージ層強制【設計 — C1 実機検証が条件】

書込経路は 1 本に固定する: **R2 バインディング条件付き put（`onlyIf`）で put-if-absent を強制**し、precondition 失敗（= 既存キーあり）は put が null を返す（`b2/research-workers-vs-vps-v1.md` 根拠4）。API 層はこれを **409 Conflict** に変換して返す（V3-FND-01「同一キー再 put は 409」）。正確な書き方（`etagMatches:'*'` vs `If-None-Match: *`）は過去バグ報告があるため **C1 で 2 重 put 実機テスト必須**（同レポート R1）。実機で使えない場合はアプリ層チェック（ver3-live 現行同等）に後退してよい — 移行自体は止まらない（`b3/ver3-開発計画-v1.md` R-05）。

### 2.4 スキーマ進化規約【事実 — B2 調査ルール 4/5】

1. 追加は nullable か既定値付きのみ（非破壊）。
2. 破壊的変更は `type` のバージョンを上げ**新イベント型として発行**。旧イベントの UPDATE/DELETE・in-place 変換は禁止（条項③）。
3. **upcaster は投影層コードにのみ置く**。スキーマ変更 PR には旧→新の upcaster テストを必ず伴う（批評家ゲート必須項目 — `b2/research-ai-first-data-design-v1.md` §4 ⑤）。
4. スキーマ正本は `schemas/*.schema.json`（JSON Schema draft 2020-12）唯一。TS 型・Python モデル・人間向け解説はすべて codegen（フォルダ設計 R3）。

### 2.5 v0 封印イベント（ver2 既存データの継承）【設計 — B3 裁定提案の実装規約】

既存 ver2 イベントへの ULID/エンベロープ**遡及付与は行わない**。移行境界で「**v0 イベント**」として封印し、upcaster で読む（`b3/ver3-開発計画-v1.md` §5.3 の裁定提案。旧イベント書き換えは条項③違反のため他案なし）。実装規約:

- `schemas/frozen/` に v0 形式（ver2 の現行 event/manifest 形式）を**バイト互換のまま JSON Schema 化**して収める（フォルダ設計 §6 copy 行）。
- 投影 reducer は入力イベントを `specversion` フィールドの有無で判別: 無し = v0 → `upcastV0()` を通してから共通パスへ。`upcastV0()` は id を「R2 キー + 決定的ハッシュ」から合成する（新規 ULID を発番しない — 再実行で同一 id になる決定論を守る）。
- v0 upcaster のテストベクタは**既存 R2 の実レコードサンプル**から作る（CL-02 の「既存レコード replay が新コードで通る TC」— §8）。
- v0 形式での**新規書込は移行境界日以降禁止**（CI: `schemas/frozen/` の v0 スキーマを `dataschema` に指す新イベントを検知したら fail）。

---

## 3. API 設計方針

### 3.1 契約先行【事実 + 設計】

- **契約の正本は `schemas/api/`**（OpenAPI / JSON Schema）。Hono 実装は `@hono/zod-openapi` の Zod スキーマで書き、CI で schemas/api と突合する（フォルダ設計 §2.4。Zod ↔ JSON Schema の生成方向は Phase C 初回 codegen で確定 — 同書の残課題）。
- 既存 ver3-live FastAPI の OpenAPI は**仕様正本（読むだけ）**。FastAPI の新規記述は行わない（`b2/research-workers-vs-vps-v1.md` §5-3）。
- route の全量管理は `INFRA-ROUTE-MATRIX-v1.csv`（57 route）を切替順序表として流用し、新 repo 側に「公開/保護」列を追加した写しを契約シャードとして持つ（§8.3）。

### 3.2 認証【事実 + ⚖裁定待ち】

- **マジックリンクのみ**（パスワード・OAuth・SMS・SNS を意図的に非サポート — V3-AUT-01、`ver3-最終要件定義書-v1.md:390`）。フロー: メール入力 → リンク送信（Resend）→ トークン検証（TTL 15 分・ワンタイム — V3-AUT-02）→ セッション確立。
- **メール送信経路は V3-AUT-04 の条文改訂裁定待ち（⚖）**: 現行条文は「実メール送信は VPS で行い（Workers 単独で SMTP 完結禁止）」（V3-AUT-04、`ver3-最終要件定義書-v1.md:391`・§2.08 設計方針 同 `:386`）。§1.1 の Workers→Resend HTTPS 直送信は B2 SMTP レポート**段階(c)の提案止まり**であり、同レポート自身が「本要件の条文改訂を要するため人間ゲート付議」と明記する（`b2/research-smtp-secrets-migration-v1.md` V3-AUT-04 行・残課題1）。V3-AUT-03 同様に人間裁定で確定するまでは段階(a)(b)（VPS 送信）が現行正。§7.2 の「VPS 薄常駐存廃の再裁定」はこの条文改訂裁定とセットで付議する。
- SMTP 未設定/送信失敗/CI 時は **dev_token フォールバック**を維持（V3-AUT-05 — ローカル開発と E2E の生命線。Resend 障害時のログイン継続経路でもある）。
- **セッション方式は V3-AUT-03 の裁定待ち**: opaque session_token（サーバ側検証）が正案、旧 JWT(localStorage) は置換対象（`ver3-最終要件定義書-v1.md:399`）。**C2 冒頭までに確定必須**（CL-03 と連動 — `b3/ver3-開発計画-v1.md` §5.1）。実装は Hono middleware 1 枚に閉じ、トークン形式を差し替え可能にしておく。opaque 採用時のストア: R2 直読みを既定、KV/D1 は投影キャッシュとしてのみ許容（ADR-V3-LAYER-01 整合 — `b2/research-workers-vs-vps-v1.md` §7-4）。
- エラーコードは既存契約を凍結: 無 Bearer=401 UNAUTHORIZED / 無効=401 INVALID_TOKEN / ユーザー不在=401 USER_NOT_FOUND / カルマ停止=403 KARMA_SUSPENDED（V3-AUT-19、`ver3-最終要件定義書-v1.md:404`）。

### 3.3 Scope A 境界（deny-by-default）【事実】

- 既定は**全 route 保護**。公開は認証入口（/login /register）・規約・言語・**観測 READ（Scope A）のみ**。列挙されない route は 307 → /login（V3-AUT-13）。
- WRITE のみログイン必須（IHL_AUTH_REQUIRED=1）、観測 search/list/detail/image は未ログイン閲覧可、画像は認証必須環境では blob 認証付き fetch（V3-AUT-15）。
- 実装: Hono の route 単位 middleware + **57 route マトリクスの「公開/保護」列と照合する TC**（CL-04。境界の広狭変更は互換破壊 — `b3/ver3-開発計画-v1.md` §5.1）。観測配下は READ 既定・WRITE 列挙の deny-list（V3-AUT-14: `OBSERVATION_WRITE_PREFIXES` 相当を新実装でも単一定数に集約）。

### 3.4 レート・エラー規約【設計】

| 規約 | 内容 | 出典 |
|------|------|------|
| 409 no-overwrite | 同一キー再 put・状態機械の不正遷移は一律 409（V3-FND-01 / V3-MKT-02） | `ver3-最終要件定義書-v1.md:53, 319` |
| エラー形式 | 機械可読 `{error: <CODE>, message}` を返し、文言変換はクライアント側（V3-AUT-20） | 同 `:408` |
| ユーザー向け文言 | 「未実装」「WIP」を出さない（思想 D / V3-UIX-01） | CLAUDE.md 禁止事項 |
| 外部 API レート | GMO は 429 + `WG_ERR_154` が仕様化。ポーリングは暫定 1〜5 分周期 + 指数バックオフ、契約後に接続通知書の実数で上書き | `b2/research-gmo-aozora-api-v1.md` §5-2 |
| 自 API レート | 第1波では専用レートリミッタを**作らない**（Workers 無料枠 10万 req/日が事実上の上限。個人規模で自前実装は YAGNI）。悪用兆候が出たら Cloudflare WAF ルールで対処 | `b2/research-workers-vs-vps-v1.md` 根拠1【設計】 |

---

## 4. GMO 連携実装ガイド（sunabar で検証可能な粒度）

> 対象要件: V3-MKT-12/14/15、CL-11、`01-要件/23-GMO銀行振込判定.md`（FR-GMO-01〜10）。
> **人間ゲートは 2 点のみ**: 本番キー投入・実入金確認（`ver3-ユーザー裁定-2026-07-10-第2回.md` 裁定5）。**キーのコミットは絶対禁止**。それ以外（設計・実装・sunabar 結合テスト）はすべて AI が完走する。

### 4.1 3-tier 環境【設計】

| tier | 実体 | 用途 | 認証 |
|------|------|------|------|
| **stub** | ローカル fixture（保存済み sunabar レスポンス JSON を返すモック） | 単体テスト・CI（キー不要で全 TC が回る） | なし |
| **stg** | sunabar 実環境（`api.sunabar.gmo-aozora.com` — ポータルのモックとホストが違う点に注意） | 結合テスト・C4 E2E | ポータル画面コピーのトークン（最終ログイン 30 日で失効） |
| **live** | 本番（`api.gmo-aozora.com/ganb/api/corporation/v1`） | 実入金照合 | 接続契約 + OAuth 系（人間ゲート） |

認証層はトークン取得方法が tier 間で異なるため**差し替え可能に分離**する（`b2/research-gmo-aozora-api-v1.md` §5-4）。tier 切替は環境変数 1 つ（例 `GMO_TIER=stub|stg|live`）。stub fixture は sunabar の実レスポンスを C0 で採取して固定する（C0 完了条件 — `b3/ver3-開発計画-v1.md` §3.1）。

### 4.2 照合の完全フロー（ポーリング正・Webhook はトリガー）【設計】

照合の正はあくまで**明細照会 API**。Webhook は順序非保証・重複配信・停止 14 日でメッセージ削除のため単独では使わない（`b2/research-gmo-aozora-api-v1.md` §3 却下表）。

```text
[定期 poll（1〜5 分 ⚖接続通知書で確定）]
  GET /accounts/deposit-transactions（振込入金明細照会・入金のみ）
        │  itemKey ページング（nextItemKey）・前回카ーソル以降のみ
        ▼
  ① extract: 明細行 → 正規化トランザクション
     { itemKey, amount, applicantName(半角カナ48), remittance_datetime }
        ▼
  ② match: 照合エンジン（§4.3 アルゴリズム — 入力形式を問わない純関数）
        ▼
  ③ 台帳 append: payment_applied / credit_granted / match_failed 等（型名は §4.4 = AI用 §6.1 正本）を R2 INSERT ONLY
     （itemKey を冪等キーに。既 itemKey は no-op — FR-GMO-04 / NFR-GMO-02）

[Webhook 経路（VA 拡張時・トリガー専用）]
  va-deposit-transaction 受信（HMAC 検証・不一致 401）→ ①へ合流
[自己修復ループ]
  GET /subscribe-status で配信停止検知
  → GET /unsentlist/va-deposit-transaction で未送信分を一括回収 → ①へ合流
  + 日次: 明細照会 API と照合台帳の突合バッチ（取りこぼし検出）
```

**設計ギャップの解消 ①（ブリッジ配線）**【事実→設計】: 現行実装は `receive_webhook_and_match()` が webhook payload だけを入力とし（`libs/ihl/payments/gmo_reconciliation_store.py:250-271`）、unsentlist / ポーリング結果は照合エンジンに**配線されていない**（unsentlist は meta 文言のみ — 同 `:280`）。ver3 では照合エンジンの入力を**正規化トランザクション（① の形）に統一**し、「webhook 受信」「unsentlist 回収」「明細照会ポーリング」の 3 経路すべてが同じ ①→②→③ に合流する。経路は provenance（`source: webhook|unsentlist|polling`）でイベントに記録し、二重取得は itemKey 冪等で吸収する。

### 4.3 照合アルゴリズム（日時下限フィルタ込み）【事実 — 23-GMO §2.5.3 を実装凍結】

`01-要件/23-GMO銀行振込判定.md:158-183`（§2.5.3）を TS で実装する。S1〜S3 は凍結転記のまま、**S0 のみ FR-GMO-08（部分入金 — §4.4）採用に伴い `partially_paid` と残債照合を含める**（AI 用設計書 §6.4 と同一。要件 §2.5.3 の `status=pending ∧ amount_yen=入金額` は全額入金時の特殊形として包含される）:

```text
S0 候補集合 C: status in [pending, partially_paid] ∧ 金額照合（部分入金は残債照合 — §4.4） ∧
   transfer_code が normalize(applicantName + remarks) に部分一致
S1 |C|=0 → 照合失敗（理由: コード/金額不一致）
S2 |C|=1 → matched
S3 |C|≥2 → 日時一意化:
   3a remittance_datetime を優先順 P1〜P6 で決定
   3b C' = { row ∈ C | row.created_at ≤ remittance_datetime }   ← 日時下限フィルタ
   3c |C'|=0 → 手動確認キュー（早すぎる振込は自動照合しない）
   3d |C'|=1 → matched
   3e |C'|≥2 → argmin(created_at, id)  — 義務が最も古い 1 件へ FIFO
```

- **P1〜P6 日時決定順**（同 `:142-147`）: P1 エンベロープ `timestamp` → P2 `baseDate+baseTime` → P5 `itemKey` 先頭 14 桁（`YYYYMMDDHHMMSS`。パース可能なら P3 より優先） → P3 `transactionDate`（時刻は JST 00:00:00） → P4 `valueDate` → P6 OS 受信時刻。ポーリング経路（§4.2 ①）では明細照会レスポンスの `itemKey`（P5 相当）が第一ソースになる。
- **設計ギャップの解消 ②**【事実→設計】: 現行 `match_pending_expected_from_va_transaction()`（`gmo_reconciliation_store.py:171-200`）は最古 `created_at` 選択のみで **3b の `created_at ≤ remittance_datetime` 下限フィルタが未実装**。ver3 実装では 3b を必須ステップとし、negative TC「入金日時より新しい義務にマッチしない（未来義務への先払い誤紐づけ拒否）」を C4 の最優先 TC に含める。

### 4.4 部分入金・過入金の残債モデル【事実 — 23-GMO §3.1 → 設計: 台帳イベント化】

**設計ギャップの解消 ③**: FR-GMO-08（部分入金）/ FR-GMO-09（過入金クレジット）は要件確定済みだが現行台帳に残債モデルが無い。ver3 の照合台帳（R2 append-only）に次のイベント型を定義する（**型名の正本は AI 用設計書 §6.1 `expected-payment.yaml`**。状態は `[pending, partially_paid, matched, cancelled]`）:

| イベント型 | 発生条件 | data 要点 |
|-----------|----------|-----------|
| `ihl.ledger.obligation_created.v1` | 義務発生（8% は取引成立時）。amount_yen 全額が初期残債 | obligor_user_id / amount_yen / transfer_code / kind / trade_ref / created_at |
| `ihl.ledger.payment_applied.v1` | 入金の消込（全額・部分共通）。入金額 < 残債なら入金全額を applied し state=partially_paid | expected_payment_id / deposit_event_id / applied_yen（**残債はイベントに書かない — 投影が Σ で導出**。AI 用 §6.1 residual_rule） |
| `ihl.ledger.credit_granted.v1` | 入金額 > 残債（FR-GMO-09）。payment_applied(残債分) と同一バッチで発行し state=matched | expected_payment_id / deposit_event_id / excess_yen → ユーザー別**貢献費クレジット残高**へ計上 |
| `ihl.ledger.credit_applied.v1` | 次回 8% 義務発生時にクレジットを自動相殺 | expected_payment_id / applied_yen / credit_source_event_id |
| `ihl.ledger.obligation_cancelled.v1` | 義務取消 | expected_payment_id / 理由コード |
| `ihl.gmo.match_failed.v1` | S1/3c 照合失敗 | itemKey / 理由コード（手動確認キューの入力） |

投影: `residual(obligation) = amount_yen − Σ payment_applied.applied_yen − Σ credit_applied.applied_yen`（**投影値。Truth に残債列を持たない** — AI 用 §6.1 residual_rule）。residual > 0 の間は fee_unpaid 月次 Fibonacci Δcount 継続、全額消込月で当該取引由来の Δcount 停止（V3-MKT-10、`ver3-最終要件定義書-v1.md:313`）。**返金フローは作らない**（FR-GMO-10 — クレジット相殺で会計を閉じる）。UI で部分入金を積極宣伝しない（23-GMO §3.1 製品スタンス）。

### 4.5 deriveTransferCode（CL-11 形式凍結 + 衝突 alternate slice）【事実→設計】

- **CL-11 は形式凍結**: `SHA-256(userId) → uint24(digest[0..2] BE) → Base36 大文字 → 4 桁 0 左 pad / 6 桁超は右 6 桁 → "U-" + body`。抽出 regex `U[\-\－][A-Z0-9]{4,6}`（全角ハイフン許容→半角正規化）。現行実装 `libs/ihl/payments/gmo_transfer_code.py:20-29` を仕様正本として WebCrypto + 純 TS で決定的に再実装し、**既存ユーザー全員分のテストベクタで回帰必須**（1 件でも不一致 = fail。`b3/ver3-開発計画-v1.md` CL-11 行）。
- **設計ギャップの解消 ④（登録時衝突 alternate slice）**【事実: 未実装 — 現行実装は digest[0..2] 固定】: `01-要件/23-GMO銀行振込判定.md:85` の規約を ver3 で実装する（**AI 用設計書 §6.4 と同一**）。新規ユーザー登録時に導出コードが既存ユーザーと衝突した場合、**読み取りオフセットを +3 バイトずつずらして再導出する**: attempt1 = `digest[0..2]`（既定）→ attempt2 = `digest[3..5]` → attempt3 = `digest[6..8]`（**試行は最大 3 回** — TBD だった定数を B4 で 3 に確定【設計・⚖事後承認】）。3 回とも衝突なら登録を保留し手動キューへ（**自動採番へ逃げない**。24bit 空間 1,677 万に対し想定ユーザー規模では実質発生しない防衛線）。
  - 採用した slice index（0〜2）は `users/{userId}.json` の `transfer_code_slice` に記録する（以後の導出は保存済みコードを正とし再導出しない — AI 用 §6.4）。
  - **既存ユーザーは全員 slice=0**。alternate slice は新規登録時のみ適用され、既存コードは不変（CL-11 凍結と矛盾しない）。
  - negative TC: 「衝突 fixture（同一コードに導出される userId ペア）で 2 人目が slice=1 のコードを得る」「**3 回連続衝突で自動採番へ逃げたら fail**（手動キュー行きになること）」。

### 4.6 C4 完了条件との接続【事実】

sunabar 上で「擬似入金 → 照合 → 台帳 append」の E2E green + deriveTransferCode 全ユーザーテストベクタ green + 台帳 negative TC green が C4 の機械検証条件（`b3/ver3-開発計画-v1.md` §3.1 C4）。本番契約申込・実鍵・初回実入金のみ人間ゲート。個人事業主口座での直接契約可否は公式資料間に不整合があり銀行へ直接確認（同計画 R-07 — 法人限定でも名前照合ポーリング最小構成で運用可能）。

---

## 5. 経済実装

### 5.1 三軸分離（思想 F）【事実】

**カルマ（信用）/ 貢献度（活動量）/ マーケット評価（他者評価）は統合しない**（ADR-H-08、`ver3-最終要件定義書-v1.md:129, 354`）。実装上は R2 プレフィクス・イベント型・投影 reducer をドメインごとに分け、相互参照は表示層のみで行う（reducer が他ドメインの残高を入力に取ることを禁止 — 唯一の例外は「資本貢献度 = 8% 支払い 1:1 変換」の一方向フックで、これはイベント参照であり残高参照ではない）。

| 軸 | モデル | 出典 |
|----|--------|------|
| カルマ | カルマ値 [-100,+100] + カルマカウントの二層独立。減少 = Fib(n) 逐次適用のみ、回復 = 月次時間経過のみ。全ミューテーション R2 INSERT ONLY で Fib 計算を決定的に | V3-KRM-01/02/03（`:347, :362, :355`） |
| 貢献度 | research/capital/development 3 軸独立・非負累積。各軸累計 100pt で 1PT 鋳造、2 枚目以降の鋳造閾値 Fib(n)×100、無ミント月は月次 1 段下げ（下限 100）。月境界 UTC 暦月 | V3-KRM-12（`:351`） |
| マーケット評価 | 良い/普通/悪い 件数モデル。取引成立後のみ・非公開不可 | V3-MKT-27（`:329`） |

### 5.2 台帳の共通実装（複式簿記 append-only）【事実→設計】

V3-MKT-40（`:330`）と CL-12 を単一の台帳基盤に実装する:

- 台帳エントリはイベント（§2.2 エンベロープ）として R2 INSERT ONLY。**Σdebit = Σcredit・残高非負**を書込前バリデーションで強制し、違反は 409。
- 取引実行は idempotency_key（ULID または itemKey）で二重実行を拒否。
- 残高 = イベント列の投影（reducer 純関数）。state と event の不一致検出クエリを CI と日次バッチに置く（「不正が即バレる構造」）。
- ルールは API 側に置く（DB トリガー不使用 — そもそも常駐 DB が無い）。

### 5.3 勲章（プラチナ）発行モデルの一本化【設計 — 裁定2 の主題。B4 で確定する】

**思想（確定済み）**: プラチナ = 文明の勲章。金銭購入不可・送金売買禁止・インフレ絶対禁止・カルマ完全分離・穴を埋めた時だけ発行（V3-MKT-38 思想承認）。希少性を煽る販促は禁止（V3-MKT-32）。

**V3-KRM-33 と V3-MKT-40 の統合【設計】**: 発行モデルは 1 つ。「発行 = §5.2 台帳への mint イベント」「抑制 = V3-KRM-12 の Fibonacci 鋳造閾値」「上限 = 政策パラメータ行」に分解し、二重定義を排除する。

勘定は 4 つ（すべて台帳投影上の論理勘定。実体は R2 イベント列。**勘定名・イベント型名の正本は AI 用設計書 §7.2 `platinum-ledger.yaml`**）:

```text
pool:unissued（未発行枠） ──mint──▶ user:<id>（ユーザー残高） ──消費──▶ clearing:settlement（決済クリアリング）
                                                                  │ 同一アトミックバッチ内で即時分解
                                                    ┌─────────────┴─────────────┐
                                                    ▼ upstream_rate（既定10%）    ▼ 残余
                                          user:<ancestor>（lineage 祖先へ再交付）  sink:expired（消滅シンク）
```

イベント型【設計 — AI 用 §7.2 と同一】:

| イベント型 | 意味 | 会計仕訳（debit / credit） |
|-----------|------|---------------------------|
| `ihl.ledger.platinum_minted.v1` | 鋳造（Fib 閾値到達 or 付与ルール。発行は system のみ） | pool:unissued / user |
| `ihl.ledger.platinum_consumed.v1` | 消費（投票・免罪符・ショップ）。ユーザー間 transfer 型は定義しない | user / clearing:settlement |
| `ihl.ledger.platinum_upstream_transferred.v1` | 消費分の upstream_rate を lineage 祖先へ重み配分（祖先なしは全額 expire へ） | clearing:settlement / user(上流) |
| `ihl.ledger.platinum_residual_expired.v1` | 上流還元後の**残余の消滅** | clearing:settlement / sink:expired |

**消滅のタイミングと会計表現（確定裁定 — AI 用設計書 §7.3 / 付録A-1 が正本）**:

1. **タイミング = 消費コミット時に即時・同一アトミックバッチ**。consumed(N) と同一バッチ内で `upstream_units = floor(N × upstream_rate)` を upstream_transferred、残余 `N − upstream_units` を residual_expired として発行し、`clearing:settlement` はバッチ末尾で常に残高 0（不変条件）。**月次バッチ消滅案は却下**（cron 依存・「消滅待ち残高」という中間状態が台帳に生まれ、複式検算と replay 決定論を汚す — AI 用 §7.3）。V3-KRM-11 の「月集計で還元」は貢献度側のフォーク収益還元の規定であり、勲章消費の即時分解と矛盾しない（B4 裁定・事後承認）。
2. **会計表現 = sink:expired 吸収勘定への振替イベント**。「消す」のではなく「sink:expired に積む」— append-only 台帳と完全整合し、`累計 mint = Σ全user残高 + 累計 upstream 再配分純増 + sink:expired 残高` の保存則が任意時点で機械検証できる。sink:expired は**受入専用**（sink:expired を debit する仕訳はスキーマで禁止 = 勲章の復活は構造的に不可能）。
3. **negative TC（C4/C5 で最優先）**: 「sink:expired を debit する仕訳が fail」「バッチ後 clearing:settlement 残高 ≠ 0 で fail」「保存則検算不一致で fail」「platinum_minted 以外で総発行量が増えたら fail（インフレ絶対禁止の機械検証）」「金銭経路（GMO 照合台帳）から platinum_minted への直接参照が存在したら fail（金銭購入不可）」「user→user の transfer イベント型を定義しない（送金売買禁止はスキーマ非存在で強制）」。

**数値パラメータ（policy_key 単位 — AI 用設計書 §7.4 と同一）**:

| policy_key | 推奨値 | 根拠 | 状態 |
|-----------|--------|------|------|
| `platinum.upstream_rate` | **0.10** | ver1 思想 10% / V3-KRM-11 upstreamPercent 既定 10% で整合 | 推奨で実装可（非裁定待ち） |
| `platinum.expire_rate` | **0.90**（= 1 − upstream_rate。独立キーにせず導出値とする） | ver1「90%消滅」 | ⚖裁定待ち |
| `platinum.monthly_mint_cap_per_user` | **10 枚/月/人** | 月10枚上限説 vs 上限なし（V3-KRM-12「キャップ設けず」）— 不整合の本体 | ⚖裁定待ち |
| `platinum.total_supply_cap` | **設けない**（発行は Fib 自己抑制 + 消滅で収縮） | 固定総量説と V3-KRM-33「既存保有分は減らさない」は両立しにくい | ⚖裁定待ち |
| `platinum.annual_mint_cap` | **設けない** | 年間上限説 | ⚖裁定待ち |
| `platinum.mint_threshold_base` | **100**（contributionPerPlatinum・V3-KRM-11） | — | 確定済み |
| `platinum.dynamic_multiplier`（AI 自動制御の動的倍率） | 第1波では**実装しない**（政策行 `policy_key` の器だけ用意） | 誇張ゼロ — 制御ロジック未検証のまま「AI 制御」を謳わない | ⚖裁定待ち |

パラメータはすべて `market_governance.csv` 同型の policy_key + timestamp 最新行方式（V3-MKT-39）で持ち、コードへのハードコード禁止。裁定確定までは推奨値を initial 行として投入し、裁定で上書き行を追加する（append-only）。

### 5.4 8% 手数料（システム維持費税）【事実】

- 発生: **取引成立時**（= 配送完了確認 + 評価確定。マッチング確定単独では発生しない — V3-MKT-04/10）。売り手に負債計上 → 30 日猶予 → 支払で資本貢献度 1:1 変換 / 猶予超過は fee_unpaid 月次 Fibonacci Δcount（`:313`）。
- 回収: §4 の GMO 照合（振込コード共用 — 8% と PT でコードを分けない、`:316`）。部分入金残債・過入金クレジットは §4.4 のイベント型に載る。ここでの「PT 入金」は PT マーケット関連の円建て入金区分（V3-MKT-12）であり、勲章プラチナ本体の金銭購入ではない（購入経路は §5.3 negative TC で構造禁止）。
- 手数料率 8% は倫理宣言（ヤフオク 8.8〜10% より常に低く — V3-MKT-11）。三層経済（商用 3% / 取引 8% / フォーク 10%）の他 2 層は V3-MKT-36 参照。

### 5.5 指摘・モデレーション実装ガイド（V3-GOV-31/34/35/07）【設計 — 第4回裁定反映・第2波】

> 対象要件: V3-GOV-31（司法モジュール設計原則・第1波）、V3-GOV-34/35（機能要件・第2波・新規採番）、V3-GOV-07（PT 投票）、V3-GOV-08（指摘カルマΔcount）。裁定正本: `ver3-ユーザー裁定-2026-07-10-第4回.md`。**状態機械・イベント型名の正本は AI 用設計書 §6.5 `listing-moderation.yaml`**。

- **設計原則（V3-GOV-31）**: 告発時の身元開示は対称。指摘者と出品者のどちらか一方だけが隠れられる構造を作らない。担保機構は「指摘成立時に当事者2人ルームを作成し、当事者がいつでも外部公開できる」（V3-GOV-34）。不適切出品への事前ワードフィルタは採用しない（抜け道が無数 — 第4回裁定原文）。
- **Truth はイベントのみ・カウントは投影**: complaint_filed / complaint_resolved / listing_hidden / listing_unhidden / seller_suspended / room_created / room_published（§2.2 エンベロープ・R2 INSERT ONLY）。「同一商品への現在有効な指摘件数」「出品者の現在非表示件数」は投影 reducer が Σ で導出し、**Truth にカウンタ列を持たない**（§2.1 の不変条件と同型）。
- **二段閾値（V3-GOV-35）は named constant**: `moderation.listing_hide_threshold`（推奨 5）/ `moderation.seller_suspend_threshold`（推奨 5）を §5.3 と同じ policy_key + timestamp 最新行方式（V3-MKT-39 同型）で持ち、コードへのハードコード禁止。境界値（裁定原文「5件以下にならない限り表示されません」vs 発動閾値 >=5）は「**5件未満で再表示**」と解釈済みだが、**最終確定は詳細設計で本人確認**（第4回裁定 注記）。
- **カルマ接続（V3-GOV-08）**: 指摘成立は既存の指摘カルマΔcount と同じ経路 — complaint_filed を reason_event_id として `ihl.karma.count_increased.v1`（§5.1 カルマ行）を発行する。イベント参照であり残高参照ではない（三軸分離 §5.1 の例外規約と同型）。モデレーション reducer がカルマ残高を入力に取ることは禁止。
- **PT 投票の重み（V3-GOV-07）**: ルーム公開後の外部投票は PT 保有者のみ・**1票 = 1PT 消費**（`ihl.ledger.platinum_consumed.v1` purpose: vote — §5.3）。コスト 0 の投票経路は作らない（「100件のコスト0の投票より、1件のプラチナコインの投票のほうが重い」。PT は貢献に対する対価・権利・権能 — 第4回裁定 ruling_note）。
- **negative TC（第2波実装時）**: 閾値未満で listing_hidden 発行 → fail / 当事者以外の room_published → validate fail / PT 非保有者の投票受理 → fail / replay で可視性・停止状態の再現不一致 → fail（AI 用 §12 #33/34）。

---

## 6. フォルダ・開発フロー

### 6.1 フォルダ【事実 — 複製しない】

新 repo のフォルダ構成・命名（英語 kebab-case）・深度制限・依存 DAG・アンチパターン表・初期化チェックリスト（11 手順）は **`b3/ver3-新repoフォルダ設計-v1.md` を正本**とする。本書は再掲しない（スキーマ・規約複製の禁止 — 同書 §7.3）。実装者は C0 で同書 §8 をそのまま実行する。

### 6.2 V-model 5 点ゲート + 批評家ゲート【事実 + 設計】

- 実装前に要件・詳細・遷移・UI・テスト設計の 5 点全通過。テスト設計ゲートは人間 Go でも免除不可（`ver3-最終要件定義書-v1.md:127`）。
- 批評家ゲート = **EXEC/AUDIT 分離**【設計】: 実装したエージェント（EXEC）と検証するエージェント（AUDIT）を必ず別セッション/別エージェントにする。AUDIT は (a) 仕様適合 (b) 出典実在 (c) 回帰（CL TC 全緑維持） (d) 設計整合（DAG・層分離違反）の 4 点を敵対的に検査し、実測エビデンス（テスト実行ログ・実機検証）が無い green 主張を却下する（V3-AIP-03。「批評家を通らないものは納品されない」）。
- 機械 GATE（`scripts/`）: filename lint / frontmatter 検査 / 生成物手編集検知 / スキーマ validate / CLAUDE.md↔AGENTS.md 同期 / `schemas/frozen/` 変更検知 → CL negative TC 必須化（フォルダ設計 §8 手順 7）。**機械 GATE PASS は人間の完成宣言より優先**（憲法 C6）。

### 6.3 TC 生成規約【事実 — §6.4 転記参照】

正本は `ver3-最終要件定義書-v1.md:1381-1390`。実装者向け要点:

1. 1 要件 ID につき最低 1 TC。制約要件は**「破ったら fail する negative TC」を最低 1 本**。
2. **CL-01〜13 対応の negative TC が Phase C 全体の最優先**。C1 で赤→緑化し、以降の全 PR の回帰条件（1 本でも赤に転じた PR は自動 fail — `b3/ver3-開発計画-v1.md` R-03）。
3. TC 列: `{TC-ID, 対応 V3 ID, 種別(positive/negative/nonfunc), 前提, 手順, 期待, 自動化可否, 状態}`。自動化不可（本番鍵・実入金等の人間ゲート）は分母から除外して停止報告。
4. green は実測エビデンスがある時のみ。rubber-stamp 禁止。

### 6.4 CI【設計】

`.github/workflows/` 骨格（フォルダ設計 §8 手順 7 の 6 本）+ 実装系: (a) `pnpm test`（packages/apps — Vitest 想定） (b) `pytest`（libs/components） (c) CL negative TC スイート（`tests/` 常駐・必須 pass） (d) codegen 差分検査（schemas 変更に生成物が追従しているか） (e) wrangler dry-run。E2E（Playwright）は nightly。テストランナーの最終選定は Phase C 初回コミットで確定（フレームワーク銘柄は本書で凍結しない）。

---

## 7. セキュリティ

### 7.1 collector Ed25519（CL-09 凍結）【事実】

- 鍵形式・署名プロトコルは**一切変えない**。検証実装のみ Workers WebCrypto（Ed25519 verify）へ再実装（`b2/research-workers-vs-vps-v1.md` 根拠8）。
- 秘密鍵はサーバに置かない設計を継承（IoT TOKEN/SECRET はユーザー端末側のみ、署名付き測定値だけをサーバへ — V3-OBS-29）。
- TC: 既存 collector の実署名サンプル verify green + 改竄署名の拒否 negative TC（§8 表 CL-09 行）。

### 7.2 シークレット管理【事実 — B2 #7 の 3 段】

| 段階 | 方式 | 出典 |
|------|------|------|
| いま（ver3-live） | VPS `.env.platform`（chmod 600）+ rotation playbook に SMTP 節追記 | `b2/research-smtp-secrets-migration-v1.md` §4 段階(a) |
| ver3 新 repo（VPS 常駐が残る部品） | systemd `LoadCredential` へ昇格（env 平文より露出面が狭い） | 同 段階(b) |
| Workers 側 | `wrangler secret put`（Resend キー等。HTTPS API 直送信） | 同 段階(c)（VPS 薄常駐存廃の再裁定は人間ゲート付議） |

規約: **テンプレ方式** — repo には `.env.example`（キー名 + ダミー値 + 取得手順コメント）のみ。実値のコミットは絶対禁止（GMO 開発キー含む — ローカル `.env` のみ）。ローテは playbook 3 段手順（新鍵追加 → grace → 旧鍵失効）: `05-運用/runbooks/secrets-rotation-playbook.md:17` を新 repo runbooks へ継承。CI にシークレットパターン検知 lint（誤コミット防衛線）を置く【設計】。

### 7.3 PII【事実】

- Truth は消せないため、PII は**不使用フラグで論理無効化**（条項③の tension 解 — `ver3-最終要件定義書-v1.md:75`）。イベントスキーマに `pii_revoked` 系フラグを持たせ、投影 reducer がフラグ済みデータを全ビューから除外する。物理削除は行わない。
- PII マスク先行（V3-SEC-07 — MVP-規約として初日から適用）。住所は保持しない（匿名配送・局留め推奨、保持は UUID/UserID/ユーザー名のみ — V3-MKT-20）。
- `pii-output`（ver2 ローカル）は移行対象外・削除保護（ワークスペース設計 §5.2-4）。新 repo・HQ 階層に一切登場させない。

---

## 8. 移行 — 互換必須 13 レイヤー

### 8.1 二分表【事実 — B3 §5.1 準拠。本書は実装時の検証手順を追記】

分類の正本は `b3/ver3-開発計画-v1.md` §5.1。**凍結 9 件**（CL-01/02/05/06/08/10/11/12/13）/ **変換ブリッジ要 4 件**（CL-03/04/07/09）。

| CL | 分類 | 実装時の検証手順（negative TC 最優先） |
|----|------|----------------------------------------|
| CL-01 | 凍結 | wrangler で同一キー 2 重 put → 先勝ち・後発 null → API 409 を確認（実機。C1） |
| CL-02 | 凍結 | 既存 R2 実レコードの replay が新 reducer で通る + 必須メタ欠落 put の拒否 |
| CL-03 | ブリッジ | 既存ユーザー actor_id 導出テストベクタ**全件**一致。V3-AUT-03 裁定を C2 冒頭で確定してから配線 |
| CL-04 | ブリッジ | 57 route マトリクス「公開/保護」列と突合。全保護 route に未ログイン GET → 401/403 の TC を機械生成 |
| CL-05 | 凍結 | 同意ファイル上書き試行の拒否 TC（複数同意 = 別ファイル方式を無変更移植） |
| CL-06 | 凍結 | 既存個体 ID 実サンプルでの sire/dam 参照 TC |
| CL-07 | ブリッジ（最難） | 暫定住所 `components/thumbnail/`（Python）。新経路出力と既存契約（長辺 512px JPEG・EXIF transpose）の比較 TC。バイト級互換不能なら**画像 ingest のみ VPS 残置**（部分ハイブリッド — 正式 fallback） |
| CL-08 | 凍結 | 次元不一致ベクタが検索対象から遮断される TC（`scoring.py:44` 相当の TS 移植）。manifest `embedding_dim=384` スキーマ凍結 |
| CL-09 | ブリッジ（軽） | 実署名サンプル verify + 改竄拒否（§7.1） |
| CL-10 | 凍結 | 発行済み QR 実トークンのスキャン → 観測再開 TC（現物ラベル流通中） |
| CL-11 | 凍結 | 全ユーザーテストベクタ回帰 + alternate slice TC（§4.5） |
| CL-12 | 凍結 | 台帳 UPDATE/DELETE 拒否 + 既存台帳からの残高再計算一致 |
| CL-13 | 凍結 | 既存タグイベント列からの集計値一致 |

### 8.2 移行順序【事実 — B3 §5.2】

`C1: CL-01→02/05/12/13（書込経路） → C2: CL-03→04（境界） → C3: CL-06/10→08→09→07（識別子→外部） → C4: CL-11`。原理: 上流（R2 書込規約）の TC が緑でないと下流の TC が信頼できない。

### 8.3 並行運用・cutover【事実 — B3 §5.3】

route 単位 strangler（57 route 表を切替順序に流用）。書込系 route は切替時点で**片系のみ有効**（イベント二重発行防止 — R-10）。切替前に新旧レスポンス突合 TC（差分は upcasting 許容差のみホワイトリスト）。cutover 実施・VPS 解約は人間ゲート。ロールバックは route 単位で旧系へ戻すだけ（R2 は append-only なのでデータ巻き戻し不要）。

---

## 9. 動画・夜間運転の実装スタック

### 9.1 動画量産ライン（第2波 — 設計のみ先行、実装投入は第2波ゲート後）【事実】

出典: `b2/research-tts-video-stack-v1.md` §1。C-USB 部品として `components/` に置く（各段の出力はファイル、段間に人間 OK/NG ゲート）。

| 段 | 選定 | C-USB 境界（差し替え契約） |
|----|------|---------------------------|
| TTS | **VOICEVOX Engine**（ローカル HTTP） | **VOICEVOX 互換 REST API** を境界に固定 — AivisSpeech / COEIROINK が無改修で差替可 |
| 合成 | **ffmpeg + 薄 Python**（ASS 字幕を libass 焼き込み・overlay・concat demuxer） | 入力: カット素材 + ASS + 音声 wav / 出力: mp4。Remotion / MoviePy / YMM4 は不採用 |
| 画像 | **ComfyUI**（SD 系・8GB VRAM）+ open_clip cosine ≥ 0.75 で既存アセット再利用判定 | **ComfyUI API JSON**（`POST /prompt` — 公式サポートの操作面） |
| サムネ | Pillow テンプレ合成 | — |
| 投稿 | **YouTube Data API（videos.insert）のみ自動** | quota: videos.insert 100 回/日 + 他 10,000 units/日。**未検証プロジェクトからのアップロードは private 固定**（解除に audit — 公開化は人間ゲートと整合）。TikTok/X は半自動（人間が投稿） |

### 9.2 夜間運転（V3-AIP-96・Tier S）【事実 + 設計 — 裁定4 反映】

運転機構は第1波の背骨だが、**MVP 実装には含めず**（`b3/ver3-開発計画-v1.md` §2.2 MVP-除外）、詳細設計は B7 成果物。本書は実装者が守る**構造上の必須制約**だけを確定する（ワークスペース設計 §4.2 準拠）:

1. **コスト・時間・回数の上限は必須キー**: タスク定義（`00-hq\night-tasks\<task-id>.md` frontmatter）に `cost_cap_tokens` / `cost_cap_usd` / `time_cap_minutes` / `max_rounds`（キー名は AI 用設計書 §10 `night-task.schema.json` の required と同一。frontmatter で別名は使わない）。**欠落時はランナーが実行を拒否**する（設定で無効化できないガード）。
2. **夜間総枠**: `ops\schedules\night.json` にタスク別上限とは別の一夜総コスト上限。推奨値 ⚖裁定待ち（過去実績『一日で 20 ドル』の再発防止が動機 — `b3/ver3-開発計画-v1.md` R-01。総枠推奨 = その半額 $10/夜）。
3. **自動停止**: 上限到達でランナーが `ops\runs\<night-id>\STOP`（空ファイル + 理由 1 行）を書き、以降のラウンドは起動しない。**成果ゼロ自動停止**【設計】: 連続 2 ラウンドで成果物パスが空（diff ゼロ・出力ゼロ）なら STOP（理由: `no-progress`）。
4. **ログ**: `ops\runs\<YYYY-MM-DD>-<task-id>\round-NN.json` — ラウンド単位 JSON append-only（開始/終了時刻・消費トークン・累積コスト・成果物パス・停止理由）。可視化キュー ⑥ の正本データ。
5. **朝レビュー**: 成果はかんばん「対応待ち」カラムにカードとして積み、人間は **OK/NG だけで捌ける**形式（成果物パス + 3 行要約 + OK/NG ボタン相当）に整形してから積む。**ワンクリック全自動は禁止 — 迷う 1 割は必ず人間**（V3-AIP-31）。

### 9.3 Claude 可視化ダッシュボード（設計キュー 8 点の実装割当）【事実 — 参照 3 動画分析ノート準拠】

正本: `D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md:93-100`。定義ファイル置場はワークスペース設計 §4.1。実装（B7 → Phase C 以降）に向けた割当:

| # | キュー | 実装割当 |
|---|--------|----------|
| ① | 状態別 3 カラムかんばん（対応待ち/実行中/完了） | `dashboard\layout.json` `columns`。夜間 run 成果カードは「対応待ち」へ |
| ② | 覗き見プレビュー（フル遷移なしで経過時間・要約・簡易操作） | 同 `peek`。round-NN.json の末尾から要約を引く |
| ③ | 破壊的操作に確認ダイアログ必須 | `confirm_destructive: true` — **変更不可のガード値**（スキーマで false を許さない） |
| ④ | ワンクリックボタングリッド | `dashboard\buttons.json`（1 ボタン = skill 名 + 引数。headless 実行） |
| ⑤ | 利用枠パネル（主要領域と分離した専用サイドエリア） | `layout.json` `side_panel.metrics`（レート窓・実行回数・夜間コスト累計） |
| ⑥ | ラウンド単位 JSON 構造化ログの再生 | 正本 = `ops\runs\`（§9.2-4）。dashboard は読むだけ（投影） |
| ⑦ | カスタマイズ可能 | `layout.json` 自体がユーザー編集可の正本。固定テンプレ禁止 |
| ⑧ | バックグラウンド取り込み（「見えないものは忘れる」対策） | `layout.json` `ingest` — 他所で起動したセッション/run の登録導線（登録 API は B7 で設計） |

---

## 10. コントリビュータ向け規約

1. **単一 clone**: 全ソースは 1 repo（`it-hercules-laboratory_ver3`）を clone すれば揃う（条項②）。サブモジュール・私有依存・別 repo 前提のビルドを作らない。
2. **Contributor Spine**: 読む順は 5 ファイル固定 — `README.md` → `docs/onboarding.md`（30 分パス） → `docs/architecture.md` → `02-design/constitution.md` → `docs/planning/status.md`。AI エージェントの入口は `AGENTS.md`（正本・120 行以内）+ `llms.txt`。**第二の索引・第二の読む順を新設しない**（フォルダ設計 R4/§7.3）。
3. **fork 文化と lineage**: 改善の基本動作は「採用」でなく「fork」。Component・テンプレート・拡張はすべて `manifest.json` に lineage（fork 元 component_id・世代・version）を持ち、fork 収益 10% は上流貢献者へ月次還元される（V3-KRM-11・V3-MKT-36）。lineage の無い部品は台帳・マーケットに載らない。
4. **「批評家を通らないものは納品されない」**（V3-AIP-03・条項⑤）: PR は (a) CL negative TC 全緑 (b) 機械 GATE PASS (c) EXEC と別主体の AUDIT レビュー (d) 実測エビデンス付き green、の 4 点を通過して初めてマージ対象になる。「動くはず」は納品ではない。
5. **禁止事項（コントリビュータも同じ）**: 実鍵・PII のコミット / `schemas/frozen/` の TC 緑化前変更 / 生成物（`docs/generated/` 等）の手編集 / R-1・R-3・R-9（撤回台帳）に触れる機能の再提案 / ユーザー向け UI への「未実装」表記。
6. **貢献の報い**: 著作権主張ではなく貢献ポイント（貢献度 3 軸 → プラチナ鋳造 — §5）。GitHub 貢献（PR マージ・レビュー等）は webhook で貢献度 Δ に換算される（V3-KRM-13、換算表は config 管理でハードコード禁止）。

---

## 11. 出典一覧（本書固有の主要参照）

| 出典 | 使用箇所 |
|------|----------|
| `docs/planning/ver3/ver3-最終要件定義書-v1.md` §1（思想・用語）・§5.3（ADR-V3-LAYER-01 `:1275-1305`）・§5.4（CL-01〜13 `:1311-1327`）・§6.4（TC 規約 `:1381-1390`）・2.05/2.06/2.08 各要件・§4.3（勲章 `:915-934`） | 全章 |
| `docs/planning/ver3/b2/`（全 8 レポート。個別引用は本文中） | §1・§3・§4・§7・§9 |
| `docs/planning/ver3/b3/ver3-開発計画-v1.md`（MVP §2・マイルストーン §3・移行 §5・リスク §8） | §2.5・§4.6・§8 |
| `docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md`（ツリー §2・DAG §7・初期化 §8） | §1.2・§6 |
| `docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md` §4（dashboard/night-tasks） | §9.2・§9.3 |
| `docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md`（裁定 2/3/4/5） | §1.3・§4・§5.3 |
| `docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第4回.md`（V3-GOV-31 確定・V3-GOV-34/35 新規・V3-GOV-07 補強） | §5.5 |
| `01-要件/23-GMO銀行振込判定.md`（§2.2 `:57-96`・§2.5.2 `:136-156`・§2.5.3 `:158-183`・§3.1 `:247-265`・FR-GMO `:296-309`） | §4 |
| `libs/ihl/payments/gmo_transfer_code.py:20-29` / `libs/ihl/payments/gmo_reconciliation_store.py:171-200, 250-271, 280` | §4.3〜4.5（現行実装の設計ギャップ根拠） |
| `D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md:93-100` | §9.3 |
| `05-運用/runbooks/secrets-rotation-playbook.md:17` | §7.2 |

---

*本書は Phase B4 成果物（開発者用）。改訂は append 追記または新版で行い、既存本文の書き換えは誤記修正に限る。実装着手時は各 B2 レポートの `revalidate_before_impl` 条項を必ず先に消化すること。*

*v1.1: 2026-07-10 第4回裁定反映 — §5.5 指摘・モデレーション実装ガイド（V3-GOV-31/34/35/07）を追加、§11 に裁定第4回を追記。*
