# Batch 8 — 実装設計・スコープ v1（salvage + 再アーキテクチャ）

> **ステータス**: 草案 v1 · **設計のみ**（コード実装は Batch 8 ゲート後）  
> **作成日**: 2026-06-10  
> **前提**: [`ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md`](./ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md) 承認 · [`ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md)

---

## 0. エグゼクティブサマリー

Batch 8 は **「civ-os をコピーする」バッチではありません。**  
**契約抽出 → C-USB 層で再実装 → mock を剥がす** バッチです。

レイヤーは **View(Next) → API(FastAPI) → libs → components(run.py) → event_store/R2** に固定します。  
**深さ優先**: 機能 N が DoD 4 列すべて PASS するまで、次機能の新規ルートを増やしません。

---

## 1. レイヤーマップ（クリーンアーキテクチャ）

```text
┌─────────────────────────────────────────────────────────────┐
│  View — apps/web (Next.js)                                   │
│  ・ルート / ページ / Server Actions は薄い                    │
│  ・fetch は lib/api.ts に集約（ページ直書き禁止）              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP JSON
┌───────────────────────────▼─────────────────────────────────┐
│  API — apps/api (FastAPI)                                    │
│  ・認証 · ルーティング · 入力検証 · エラーマップ               │
│  ・ドメインロジックを持たない（libs/components へ委譲）        │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│ libs/         │   │ components/   │   │ stores.py 配線     │
│ switchbot_    │   │ env_ingest/   │   │ event_store       │
│ client.py     │   │ run.py        │   │ placement_store   │
│ placement_    │   │ ingest_       │   │ (mock→実装置換)   │
│ store.py      │   │ normalize/…   │   │                   │
└───────┬───────┘   └───────┬───────┘   └─────────┬─────────┘
        │                   │                     │
        └───────────────────┴─────────────────────┘
                            ▼
              ┌─────────────────────────┐
              │ libs/event_store.py      │
              │ R2 append-only · schema  │
              │ truth/{schema}/{id}.json │
              └─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Connector（プロセス外） — collector/ Docker                  │
│  SwitchBot API → 署名 payload → POST /api/env/ingest         │
│  秘密: collector/.env のみ                                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 層ごとの責務

| 層 | 許可 | 禁止 |
|----|------|------|
| **View** | 状態表示 · フォーム · 導線 | SwitchBot API 直叩き · 秘密入力 UI |
| **API** | CRUD オーケストレーション · auth | poller ループ · OSS 直結 |
| **libs** | 永続化アダプタ · 外部 API 薄ラップ | UI 知識 |
| **components** | ITO Transform · manifest 入出力 | HTTP サーバ |
| **event_store** | schema 検証 · INSERT ONLY | UPDATE/DELETE |
| **collector** | 定期取得 · キュー · 署名 | R2 直書き · 秘密の backend 送信以外 |

---

## 2. salvage = 契約抽出リスト

### 2.1 civ-os から **読む**（契約・テスト観点）

| 領域 | civ-os パス | 抽出物 |
|------|-------------|--------|
| Collector ingest | `collector/switchbot-local-collector.mjs` | `env_collector_ingest_v1` · canonical JSON 署名 · 300s 既定 |
| Ingest 検証 | `backend/src/logic/envCollectorIngest.ts` | 公開鍵 map · サニタイズ列 |
| Placement | `backend/src/api/routes/envPlacement.ts` | CRUD · QR TTL · 409 競合 |
| Shelf | `backend/src/api/routes/envShelf.ts` | shelf 状態 · telemetry クエリ形状 |
| Poller 運用 | `backend/scripts/switchbot-env-poller.ts` | 間隔 · バックオフ · ログ type 名 |
| テレメトリ補助 | `backend/src/logic/envTelemetryCollector.ts` | sleep/backoff 計算（**差分ロジックは新規**） |
| SwitchBot クライアント | `backend/src/logic/switchbotClient.ts` | HMAC 署名 · status パース列 |
| 運用 | `docs/solid-switchbot-operating-checklist.md` | 秘密分離 · 最小保存 |
| 観測接続 | `measurement_method.yaml` `iot_switchbot` | `requires_device` · `environment_derived` |

### 2.2 civ-os から **書き直す**（IHL 新実装）

| 項目 | 理由 |
|------|------|
| Express ルート全体 | FastAPI + Pydantic + IHL schema |
| `mock_store.devices` | `placement_store` + Truth events |
| 毎ポール無条件 R2 INSERT | ADR-H-19 差分 insert |
| Node collector（最終形） | 当面 mjs 参考可 · 長期は Python/Docker 統一検討 |
| civ-os `userId` 投影 | IHL actor_id / handle 契約 |
| `solidUserSettings` TS | IHL device registry event + API |

### 2.3 触らない（stays）

| 機能 | 理由 |
|------|------|
| civ-os `/market/*` | ADR-H-18 stays · Phase 2 以降 |
| civ-os `/board/*` | 同上 |
| civ-os BuilderShell | stays |

---

## 3. mock 剥がし順序（深さ優先）

```text
13 → 12 → 01 → 03 → 09 → 18 → 08 → 11 → 06 → 07 → 04 → 10 → 14 → 20 → 19 → 02 → 22 → 23 → 17 → 16 → 05（最後に統合）
```

> **注**: #05 観測はパイプラインが横断するため、**#13（IoT）と #18（解析）の DoD 後**に mock 剥がしを完了する。

### 3.1 順序と根拠

| 順 | # | 理由 |
|:--:|---|------|
| 1 | **13** | **データ取得の土台**。`iot_switchbot` · Placement · ingest が無いと #05 入力 UI が空振り |
| 2 | **12** | 機器 registry · preferences · `/settings/device` 導線（#13 と #05 のハブ） |
| 3 | **01** | 認証なしでは env/placement API を保護できない |
| 4 | **03** | onboarding · handle · 初回 agree_terms |
| 5 | **09** | 研究は観測データ参照 — telemetry クエリに依存 |
| 6 | **18** | embedding component — 観測パイプラインの独立縦 |
| 7 | **08** | 経済イベント — dispute/market の前提 |
| 8 | **11** | IHL-native rebuild · dispute-room |
| 9 | **06** | stays だが mock 整理 · 将来 salvage の足場 |
| 10 | **07** | stays · mock→deep link |
| 11–20 | 残り | 依存の少ない順 · #05 は #13/#18 完了後に統合テスト |

### 3.2 mock 剥がしの定義（1 機能あたり）

1. `apps/api/mock_store.py` の当該キーを **削除**（または feature flag off）
2. `libs/*_store.py` + `event_store.append` に **置換**
3. `apps/web` の当該ページが **実 API** のみを叩く
4. DoD マトリクス 4 列が **PASS**
5. unit + contract test 緑

---

## 3.3 Red-first ワークフロー（#13 · B8-Q-01）

実装着手前に **pytest Red 骨格**（契約ベクトル + skip）を先に置き、`HUMAN-IMPL-BATCH8-GO` 後に Green 化する。実行順は [`00-Batch8-実行キュー-v1.md`](./00-Batch8-実行キュー-v1.md) を正とする。

---

## 4. 深さ優先ルール（Depth-First Rule）

```
機能 N を着手
  → 実装設計 stub（P0 は ≥1 ページ）を書く
  → route / API / persistence / test を **N だけ** 実装
  → DoD 4 列 PASS
  → 監査役 DELEGATED-IMPL-GO（機能 N）
  → 次の mock peel 対象へ
```

**禁止**:

- 機能 13 が persistence 未 PASS のまま機能 05 に `/observation/solid` 実ルート追加
- 横断 refactor を「ついでに」入れる
- civ-os ファイルの bulk copy

---

## 5. Batch 8 フェーズ分割（設計タスク内）

| Phase | 内容 | 本タスク |
|-------|------|----------|
| **8.0** | ADR-H-18 · DoD マトリクス · 監査ゲート doc | ✅ 本バッチ（設計のみ） |
| **8.1** | #13 実装設計確定 · ADR-H-19 承認 | 設計 doc |
| **8.2** | #13 コード（collector · env_ingest · API） | **HUMAN-IMPL-BATCH8-GO 後** |
| **8.3** | #12 → #01 → #03 mock peel | 同上 |
| **8.4** | #09 · #18 | 同上 |
| **8.5** | 経済・社区 (#08/#11/#06/#07) | 同上 |
| **8.6** | #05 観測統合 E2E | 同上 |

---

## 6. 既存 IHL 資産との接続点

| 現状 | Batch 8 での扱い |
|------|------------------|
| `apps/api/mock_store.devices` | #13 で `placement_store` + device events に置換 |
| `GET /api/devices` (mock) | `libs/placement_store.py` 実装へ |
| `apps/web` `/env/shelf` | 実 API 接続（今はルートのみ） |
| `components/ingest_normalize/` | 画像用 — **env とは別 component**（`env_ingest` 新設） |
| `libs/event_store.py` | env sample 用 schema 追加（`capture/measurement` 連携） |

---

## 7. 関連ドキュメント

| パス | 用途 |
|------|------|
| [`00-機能別実装DoD-マトリクス-v1.md`](./00-機能別実装DoD-マトリクス-v1.md) | 完了判定 |
| [`00-監査役-Batch8-実装前ゲート-v1.md`](./00-監査役-Batch8-実装前ゲート-v1.md) | 着手前チェック |
| [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) | #13 詳細 |
| [`../05-運用/queues/00-実装前バッチ実行計画-v1.md`](../05-運用/queues/00-実装前バッチ実行計画-v1.md) | Batch 0〜7 完了 · §Batch 8 |

---

*草案 v1 · 2026-06-10 · 設計のみ · civ-os は reference implementation*
