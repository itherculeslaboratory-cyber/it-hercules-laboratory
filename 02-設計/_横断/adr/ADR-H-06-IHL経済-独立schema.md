# ADR-H-06: IHL 経済 — 独立 schema（H-ECON = B）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-ECON  
> **正本**: 本 ADR · [`08-カルマシステム.md`](./08-カルマシステム.md) · [`14-貢献度.md`](./14-貢献度.md) · [`22-プラチナコインマーケット.md`](./22-プラチナコインマーケット.md) · [`06-マーケット.md`](./06-マーケット.md)

---

## 文脈

IHL 経済（karma · platinum · PT · contribution · market 連動）を R2 に載せる際、civ-os legacy の `economy/*` キー構造を **そのままコピーするか**、IHL 単独の schema を正とするかが未決だった。

---

## 決定

**選択肢 B を採用** — **IHL 独立 schema**（civ-os ファイル構造のコピー **禁止**）。

| 項目 | 内容 |
|------|------|
| **schema / R2 パス** | **IHL canonical** — 本 ADR のプレフィックス設計に従う |
| **ルール哲学** | [`08-カルマシステム.md`](./08-カルマシステム.md) · [`22-プラチナコインマーケット.md`](./22-プラチナコインマーケット.md) · [`06-マーケット.md`](./06-マーケット.md) §11（Fib · fee_unpaid · 争い別軸）を **維持** |
| **legacy civ-os** | `backend/` の `economy/*` · `contributionEconomy.ts` は **参照 + salvage のみ** |
| **理由（ユーザー）** | 単一正本 · 構造がすっきり · IHL バケット `it-hercules-laboratory-dev`（ADR-H-03）と整合 |

2026.06.08 アイディア §5–6（Contribution / Coin / PT / Research Score 分離）の **イベントソーシング思想**も IHL 経済 schema に取り込む（列名は IHL YAML 正本）。

---

## IHL R2 プレフィックス（たたき台 · v0）

バケット: `it-hercules-laboratory-dev`（本番は別 ADR）

```text
ihl/economy/
├── events/                          # append-only JSONL（Truth）
│   ├── contribution_event.jsonl       # 活動量（累積・減少なし）
│   ├── coin_event.jsonl               # Platinum 功績章（付与のみ）
│   ├── pt_event.jsonl                 # 影響力ポイント（増減）
│   ├── karma_event.jsonl              # カルマ値/count 変動（08 二層）
│   ├── supporter_event.jsonl          # 金銭支援（Research Score と分離）
│   └── market_economy_event.jsonl     # fee_unpaid · 取引経済（06 連動）
├── snapshots/                       # 再計算可能（Truth ではない）
│   ├── contribution_summary/
│   ├── coin_summary/
│   ├── pt_summary/                    # current_pt_balance はここ
│   ├── research_score_summary/        # 称号中心運用推奨
│   ├── karma_summary/                 # value + count 表示用
│   └── title_summary/                 # Research Fellow 等
└── rules/                             # ポインタ + 版管理（INSERT で更新）
    └── economy_master.pointer.json    # 最新 rules 実体への pointer（H-04 D-01 並行）
```

**原則**: INSERT ONLY · 修正 = 新 event / 新 snapshot / 新 pointer（[`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) · R2 Only）

---

## Truth イベント列（IHL · 2026.06.08 §5–6 整合）

| イベント | 役割 | civ-os 哲学対応 |
|----------|------|-----------------|
| **ContributionEvent** | 活動量（累積・減少なし） | 14 貢献度 · PlatinumCoinRules §5 |
| **CoinEvent** | 功績章（付与のみ · delta なし） | 20 投票 · 14 還元 |
| **PTEvent** | 影響力（消費型） | 20 · 22 ショップ |
| **KarmaEvent** | カルマ value / count（08 二層） | 08 · 11 争い Δcount |
| **SupporterEvent** | 金銭支援 tier（評価と分離） | Pay To Win 禁止 |

**Research Score** — 専用 Truth イベント **なし**（Content / Citation / Discussion / ContributionEvent から **Snapshot 再計算** · ADR-H-04 §5）

---

## legacy civ-os → IHL 参照マッピング（移行用 · 正本ではない）

| legacy R2 / コード（civ-os） | IHL 相当（概念） | 備考 |
|------------------------------|------------------|------|
| `economy/csync/events/*.json` | `ihl/economy/events/*.jsonl` | C-Sync **不採用**。イベント種別を IHL enum に再編 |
| `economy/karma_log/` | `ihl/economy/events/karma_event.jsonl` | 08 二層モデルへ写像 |
| `economy/graph/{nodeId}.json` | `ihl/economy/snapshots/contribution_summary/` + graph 派生 | 14 ノードグラフは Snapshot |
| `economy/rules/economy_master.json` | `ihl/economy/rules/economy_master.pointer.json` | pointer 方式は H-04 D-01 と整合 |
| `contributionEconomy.ts` 内部キー | IHL component `economy_ledger`（未実装） | salvage ロジック参照のみ |

**one-time export**（H-06 D-07 個体 ID 移行と同型）は **別 ADR**。本 ADR は schema 境界のみ確定。

---

## 影響

- **14 貢献度** · **08 カルマ** · **22 PT ショップ** · **06 マーケット §11.7** の詳細設計は **IHL プレフィックス**を前提
- civ-os `economy/*` への **新規キー追加禁止**（IHL repo のみ）
- Phase 0 spike は経済非依存（ADR-H-03 と同様）

---

## 参照

- [`ADR-H-03-r2-bucket-dedicated.md`](./ADR-H-03-r2-bucket-dedicated.md)
- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) — PT/Research Score = Snapshot
- [`00-Phase0前-人間ToDoとAuto下準備.md`](../05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md) — H-ECON
