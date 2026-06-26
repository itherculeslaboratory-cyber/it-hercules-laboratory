# ADR-H-30 — SwitchBot 資格情報の IHL 非保持 v1（DRAFT）

> **ステータス**: DRAFT（2026-06-21）— ユーザー方針 **STRONG** · **v1 運用凍結済み（2026-06-21）** · **観測 ver1 実装同期（2026-06-26）** — snapshot=`/latest` · 行 IoT=`/sync`（dev のみ）· ADR 全文確定は **HUMAN-ADR-H-30 待ち**  
> **決定日**: 2026-06-21  
> **運用凍結日**: 2026-06-21（§10）  
> **上位**: ユーザー攻撃耐性方針 · [`ADR-H-20-データクラスと書込方針-v1.md`](./ADR-H-20-データクラスと書込方針-v1.md)  
> **関連**: [`ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md)（**保存戦略は維持 · 取得経路のみ本 ADR で制約**） · [`ADR-H-29-collector-ポーリング-v1-DRAFT.md`](./ADR-H-29-collector-ポーリング-v1-DRAFT.md)（**サーバ側ポーリング決定は本 ADR により却下**） · [`ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md)（**過去データ import API 契約**） · [`ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md`](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md)（**運用上の個体↔温度計↔期間**） · [`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md)（Placement / Occupancy / DeviceBinding 4 概念）  
> **Cursor ルール**: [`.cursor/rules/ihl-no-switchbot-secret.mdc`](../../../../.cursor/rules/ihl-no-switchbot-secret.mdc)

---

## 1. 文脈

### 1.1 ユーザー方針（STRONG）

`SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET`（および同義の Open API 資格情報）は、**IHL のデプロイ可能スタック**に **一切保存・注入・参照させない**。

対象（非網羅）:

| 層 | 例 |
|----|-----|
| バックエンド | IHL API コンテナ · Cloudflare Worker · 本番 VPS |
| 永続化 | R2 · event_store · CI アーティファクト |
| 設定 | `.env.platform` · GitHub Actions / 本番 Secrets · git 履歴 |
| 運用 | IHL 所有 VPS 上の cron / docker compose **api サービス** |

**理由**: SwitchBot Open API は **token + secret の HMAC 対称鍵**のみ。公開鍵のみの認証は **存在しない**。サーバに secret を置くと漏洩時に **全デバイス操作・一覧取得**が可能になるため、攻撃耐性を最優先する。

### 1.2 SwitchBot が公式に提供するもの（2026-06 調査）

| 機能 | 内容 | IHL への示唆 |
|------|------|-------------|
| **Open API v1.1** | `GET /v1.1/devices` · `GET …/status` 等。**毎リクエスト HMAC 署名**（token + t + nonce, secret） | 自動取得には **必ず secret が必要** |
| **履歴 API** | **過去時系列の一括取得エンドポイントなし**（status は **現在値スナップショット**のみ） | [`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) の「自前 Tier B 構築」前提は変わらない |
| **Webhook** | `setup` / `query` / `update` / `delete`（[SwitchBotAPI](https://github.com/OpenWonderLabs/SwitchBotAPI)）— **状態変化イベントの push** | **登録・更新に token+secret が必要**。受信側 URL は公開 HTTPS。**連続温湿度履歴の正本にはならない** |
| **アプリ内 Export** | Meter 系: グラフ画面の **「Export Data」**（[Help Center](https://support.switch-bot.com/hc/en-us/articles/360060298693)）— 端末キャッシュ / Hub クラウド同期データ | **secret 不要** · v1 採用候補 |
| **Hub クラウド保存** | Hub 連携時 **最大約 2 年**（機種差あり）— 同期はアプリ操作 | API 経由一括 export **なし** |
| **サードパーティ連携** | Home Assistant · Alexa · Google · IFTTT · SmartThings 等（Hub / Matter 前提） | IHL へ構造化テレメトリを **直接渡さない** |
| **Open API CLI**（非公式だが OpenWonderLabs 製） | ローカル `~/.switchbot/device-history/*.jsonl` · `history range` 等 | **ユーザー PC 上**のオプション bridge 素材 |

**正直な結論**: SwitchBot で **完全自動・サーバ secret なし**の取得経路は **公式には存在しない**。Webhook も **設定時に secret が必要**であり、「IHL VPS が secret なしで SwitchBot をポーリングする」ことは **不可能**。

---

## 2. 決定

### 2.1 採用（v1）

| # | 経路 | 説明 |
|---|------|------|
| **A** | **手動 Export → Import** | ユーザーが SwitchBot アプリ（または CLI が出力した CSV/JSON）から **定期的にエクスポート**し、IHL の **import API / UI** へアップロード。`source=switchbot_import`（要 schema 追加） |
| **B** | **観測時手入力** | 撮影・固体 commit 時に温湿度を **manual_entry**（Tier A 観測）— 既存フロー |
| **C（任意）** | **ユーザー所有ローカル bridge** | secret は **ユーザーの PC / 自宅 LAN 機器のみ**。SwitchBot API を poll し、**Ed25519 署名付き** `POST /api/env/ingest` で **測定値だけ** IHL へ送信。**IHL 製品サーバの構成要素ではない** |

**v1 正本**: **A + B**。C は power user 向けオプション（リポジトリ同梱 `collector/` は **参考実装 · ユーザー自己責任**）。

### 2.2 却下（v1 · 本番 IHL スタック）

| 経路 | 却下理由 |
|------|----------|
| IHL API / VPS / Worker が `SWITCHBOT_*` を保持して **ポーリング** | secret がデプロイスタックに載る — ユーザー STRONG 方針違反 |
| Web「今すぐ取得」が **サーバ env の secret** で SwitchBot を叩く | 同上（[`ADR-H-29`](./ADR-H-29-collector-ポーリング-v1-DRAFT.md) §決定 2 を **却下**） |
| `.env.platform` / 本番 CI Secrets への `SWITCHBOT_*` | インフラ漏洩面に載る |
| Webhook 受信を IHL VPS で行い **サーバ側で webhook 登録**（secret 要） | 登録時点で secret がサーバに必要 |
| ブラウザのみで SwitchBot API 直叩き | CORS · secret がクライアントに露出 — 不可 |

### 2.3 ギャップ方針（Tier B）

| 状況 | 方針 |
|------|------|
| import 間隔の空白 | UI で **gap 表示**（[`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) §6 同型）— **補間は imputed · Tier A 別 event** |
| 観測時に最新値が欲しい | **手入力** or ローカル bridge 稼働中なら ingest 済み Tier B を参照 |
| 5 分連続 series が無い期間 | **受け入れる** · 自動 server poll で埋めない |

---

## 3. 代替案一覧（secret を IHL サーバに載せない）

| # | 代替 | Pros | Cons | ギャップ埋め | コスト | セキュリティ |
|---|------|------|------|-------------|--------|-------------|
| 1 | **手動 Export → Import** | secret ゼロ · 監査単純 · ユーザー方針完全一致 | 非リアルタイム · 手間 · export 形式は機種差 | 観測時手入力 · gap 表示 | 無料 | **最高**（IHL 側） |
| 2 | **ユーザー PC ローカル collector** | 5min 自動 · ADR-H-19 UPSERT と整合 · ingest は Ed25519 のみ | PC 常時稼働 · secret は **ユーザーマシン**に残る · IHL repo 同梱は「参考」 | offline queue · 手入力 | 電気代のみ | **サーバ secret なし** · PC 侵害はユーザー域 |
| 3 | **Home Assistant / n8n（LAN）** | 既存 IoT スタック · IHL へは webhook/ingest のみ | HA 側に secret · 構築・保守コスト | 同上 | HA ハード + 運用 | LAN 限定なら中〜高 |
| 4 | **SwitchBot Webhook → ユーザー LAN 中継 → ingest** | 受信 URL を自宅に置けば IHL VPS に secret 不要 | **webhook 登録に secret 一度必要** · イベント粒度 · 連続 series にならない | poll/import 併用 | トンネル/ngrok 等 | 中（登録端の secret 管理が鍵） |
| 5 | **ブラウザ on-demand API** | — | **不可能**（secret 露出 · CORS） | — | — | **不可** |
| 6 | **SwitchBot ネイティブ連携のみ**（Alexa 等） | secret を IHL に渡さない | IHL が構造化データを受け取れない | 手入力のみ | 無料 | IHL 無関係 |
| 7 | **ユーザー所有 Raspberry Pi poll** | #2 と同型 · VPS と分離 | デバイス管理 | queue | 低 | #2 同型 |
| 8 | **IHL VPS poll** | 実装済みに近い | **ユーザー方針で禁止** | — | VPS 常時 | **却下** |

### 3.1 「ローカル collector は IHL システムか？」

| 観点 | 判定 |
|------|------|
| IHL **製品サーバ**（VPS / 本番 API / R2 パイプライン） | **含めない** — secret を置いてよい |
| git 同梱の `collector/` スクリプト | **参考実装** · ユーザーが **自 PC で**実行 · 本番 compose の **api に secret を載せない** |
| Ed25519 ingest 鍵 | **IHL 契約**（collector 認証）— SwitchBot secret とは **別物** · API は **公開鍵のみ**保持 |

---

## 4. 推奨（ユーザー向け）

1. **v1 正本**: SwitchBot アプリ **Export Data** → IHL **import**（週次〜日次などユーザー運用）+ **観測時手入力**。  
2. **自動化が必要なら**: IHL サーバではなく **自分の PC / LAN** で [`collector/switchbot-local-collector.mjs`](../../../collector/switchbot-local-collector.mjs) 等を動かし、**測定値だけ** ingest。secret は **git / VPS / `.env.platform` に入れない**（`.env.local` は **その PC のみ** · コミット禁止）。  
3. **IHL 本番 VPS 上の server-side poll / sync は採用しない** — 理由を本 ADR に記録済み。

---

## 5. ADR-H-19 / ADR-H-29 との関係

| ADR | 関係 |
|-----|------|
| **ADR-H-19** | **Tier B バケット UPSERT · epsilon · provenance** は **import / local ingest 共通**で有効。**取得元**が server poll 限定ではなくなる |
| **ADR-H-29** | **サーバ env による poll / Web 即時取得** — **本 ADR により却下**。ステータス **SUPERSEDED（サーバ secret 部分）** |

---

## 6. 実装影響（現行コード · 再分類）

| コンポーネント | v1 本番 IHL | 備考 |
|----------------|------------|------|
| `libs/ihl/env/switchbot_client.py` | **ユニットテスト · ローカル bridge 参考用** | 本番 API からの live 呼び出し **禁止** |
| `GET /api/v1/devices` の SwitchBot cloud merge | **無効化 / secret 未設定時のみ**（現状どおり）→ 将来 **フラグで完全オフ** | 登録済み local alias のみ表示 |
| `POST /api/v1/devices/{id}/sync` | **ver2 OUT / 本番禁止** | 手動 import or ローカル bridge へ |
| `POST /api/env/ingest` + Ed25519 | **v1 IN** | secret 不要 |
| `collector/switchbot-local-collector.mjs` | **optional user-local · NOT deploy artifact** | docker compose **api** に `SWITCHBOT_*` を載せない運用 |
| SwitchBot import API / UI | **v1 要実装** | [`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) `POST /api/env/import/switchbot` · `source=switchbot_import` |
| 観測 UI `iot_switchbot` | **ingest 済み Tier B 参照 + 手入力** | サーバ live fetch に依存しない |

---

## 7. Import API（過去ギャップ埋め · API 化）

**問い**: 「Export → import」を API で改善できるか？

| 層 | 回答 |
|----|------|
| **SwitchBot → データ取得** | **API 化不可**（公式 history export エンドポイントなし）。**アプリ Export Data** または HA 等の **ローカル生成**が必須 |
| **Export ファイル → IHL Tier B** | **API 化可** — [`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) の `POST /api/env/import/switchbot`（session 認証 · CSV/JSON） |
| **自動化** | 任意 CLI `ihl-env-import`（CSV のみ · secret 不要）· フォルダ watch · 既存 Ed25519 ingest batch |

**v1 推奨**: アプリで週次 export → **IHL import API へ upload**（または CLI 1 コマンド）。forward 5 分 series が要る場合のみ **ユーザー PC** で `collector/`（経路 C）。

---

## 8. 未決 · 人間ゲート

| ID | 状態 | 内容 |
|----|------|------|
| **HUMAN-ADR-H-30** | **運用凍結済み · 確定待ち** | §10 の **二経路運用**（ユーザー PC Docker poll + たまに Export→Import）は **2026-06-21 ユーザー決定で凍結**。残りは ADR ステータス昇格（DRAFT→確定）・import 周期の推奨文面のみ |
| HUMAN-IMPORT-SCHEMA | 未決 | Export CSV 列 ↔ Tier B マッピング — **解消: [ADR-H-35 §2](./ADR-H-35-汎用デバイスCSV取り込み-v1-DRAFT.md)** |
| IMPL-STRIP-SERVER-SB | 未決 | 本番 API から server-side SwitchBot 呼び出し除去（別タスク） |

---

## 9. 参考リンク（外部調査 2026-06-21）

| URL | 要点 | IHL への示唆 |
|-----|------|-------------|
| [Country Life 24 — Python CSV 1時間 poll](https://countrylife24.com/automatically-export-switchbot-temperature-humidity-data-to-csv-using-python/) | v1.0 token のみ · **1時間** status スナップショット → CSV | 履歴 API なしの裏付け。**5分粒度には不適** |
| [Zenn tanny — Python × InfluxDB × Grafana](https://zenn.dev/tanny/articles/a5c0fa5c2230a7) | v1.1 HMAC · **`schedule.every(5).minutes`** · status スナップショット | **経路 C**（ユーザー PC poll）の典型。IHL `collector/` と同型 |

**調査結論**: 両記事とも **Open API に過去5分履歴の一括取得はない**。forward 5分 series は **ユーザー PC 常時 poll**、過去穴埋めは **アプリ Export → import** の併用が現実解（§2.1 経路 A + C）。

---

## 10. v1 運用凍結（2026-06-21）

> **ユーザー決定（凍結）**: IHL / env IoT の **v1 本番運用モデル**を次の **2 経路**に固定する。サーバ secret 非保持（§2.2 却下）は不変。

### 10.1 凍結された運用（正本）

| 優先 | 経路 | ADR | 用途 |
|------|------|-----|------|
| **1（主）** | **ユーザー PC 上 Docker 定期 poll** | §2.1 **C** · [`ADR-H-29`](./ADR-H-29-collector-ポーリング-v1-DRAFT.md)（ローカル部分のみ salvage） | forward 5 分 Tier B · Ed25519 `POST /api/env/ingest` · secret は **ユーザーマシンのみ** |
| **2（補）** | **たまに Export → Import** | §2.1 **A** · [`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) | 過去穴・poll 停止期間の backfill · `source=switchbot_import` |
| **常時** | **観測時手入力** | §2.1 **B** | 撮影/commit 時の Tier A スナップショット |

**却下のまま**: IHL VPS / API コンテナでの server-side poll · Web「今すぐ取得」（secret 要）。

### 10.2 運用上の必須記録（個体 ↔ 温度計 ↔ 期間）

Docker poll + import だけでは **「どの観測個体が、どの期間、どの温度計の下にいたか」** は自動では分からない。v1 運用では **Placement モデル**で記録する（詳細: [`ADR-H-32`](./ADR-H-32-生体-デバイス-期間-紐づけ-v1-DRAFT.md) · legacy [`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md)）。

| 概念 | 記録内容 | 時間軸 |
|------|----------|--------|
| **DeviceBinding** | `deviceId` ↔ `placementId` | `startedAt` … `endedAt?` |
| **Occupancy** | 観測個体（`subjectRef`）↔ `placementId` | `startAt` … `endAt?` |
| **TelemetryIngest** | `deviceId` + 測定値（± `placementId` / `annotationId`） | バケット時刻 |

**解釈**: 同一 `placementId` 上で **Occupancy 区間 ∩ DeviceBinding 区間** を取れば、「個体 X が device Y の計測圏にいた期間」を **事後復元**できる。ingest 行の `annotationId` は **点の文脈**であり、区間の正本は Occupancy + Binding。

### 10.3 ver1 出荷に対する実装ギャップ（要約）

| 項目 | IHL 現状 | ver1 要否 |
|------|----------|-----------|
| Placement + Occupancy API（`subject_ref`） | **実装済**（`PlacementStore` · `POST .../occupancy/start\|end`） | 必須 · API 利用可 |
| DeviceBinding start/end | **未実装**（shelf `openBinding: null`） | **ver1 必須 gap** — poll/import だけでは device↔棚が未確定 |
| 個体 ID → `subjectRef` 規約 | 未定義（任意文字列） | **ver1 設計メモ**（ADR-H-32） |
| import API | 契約のみ（ADR-H-31） | 補助経路 · IMPL 別タスク |
| 区間 JOIN クエリ API | なし | ver2 可 · v1 は history + 手動復元 |

### 10.4 ドキュメント相互参照

| ファイル | 追記内容 |
|----------|----------|
| [`01-要件/13-データ取得元管理.md`](../../01-要件/13-データ取得元管理.md) | §運用凍結 · FR-ENV-03 補足 |
| [`01-要件/05-観測.md`](../../01-要件/05-観測.md) | OBS-ENV 節 · 運用凍結 |
| [`02-設計/Phase6-打鍵フィードバック-v1.md`](../Phase6-打鍵フィードバック-v1.md) | env IoT ver1 運用凍結（2026-06-21 追記） |
| [`02-設計/features/13-データ取得元/詳細設計-v2.md`](../features/13-データ取得元/詳細設計-v2.md) | P3 DeviceBinding gap · §10 整合 |

---

*DRAFT v1 · 2026-06-21 · **v1 運用凍結 2026-06-21** · ADR 確定昇格は HUMAN-ADR-H-30 · IMPL は別タスク*
