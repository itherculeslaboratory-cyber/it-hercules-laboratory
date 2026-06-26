# ADR-H-32 — 観測個体 ↔ 温度計 ↔ 期間（v1 運用設計メモ）

> **ステータス**: DRAFT（2026-06-21）— **最小設計メモ**（IMPL 別タスク）  
> **後続統合**: [`ADR-H-33`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md) — **観測 commit = binding moment** · G1 優先度の再定義 · `devices[]` / `prior_capture_id`  
> **トリガー**: [`ADR-H-30`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) §10 — Docker poll + Export→Import 運用凍結に伴う **「どの個体がどの期間どの温度計下にいたか」** の記録要件  
> **4 概念正本**: [`ADR-env-placement-device-binding.md`](../../../../design/adr/ADR-env-placement-device-binding.md)  
> **IHL 実装正本**: [`13-データ取得元/詳細設計-v2.md`](../features/13-データ取得元/詳細設計-v2.md) · `libs/placement_store.py` · `apps/api/routes/env.py`

---

## 1. 問い

SwitchBot テレメトリ（Tier B）は **deviceId 中心**。観測個体（固体 annotation / 個体命名 ID）は **別軸**。  
v1 運用（ユーザー PC poll + たまに import）で **事後に**「個体 A の 6/1〜6/7 は棚 X の Meter B の下だった」と説明するには、**時間区間付きの結び**が必要。

---

## 2. モデル（採用 · legacy ADR と同一）

**Placement をハブ**に、2 本の Tier A 区間イベントを重ねる。

```text
DeviceBinding:  deviceId  ──bind──▶  placementId   [startedAt … endedAt?]
Occupancy:      subjectRef ──occupy─▶ placementId   [startAt … endAt?]

解釈: 個体 subjectRef が placement P にいる区間 I_occ
      と device D が P にバインドされている区間 I_bind の交差
      ⇒ 「個体が device D の計測圏にいた期間」
```

| フィールド | 役割 | INSERT ONLY |
|------------|------|-------------|
| `subjectRef` | 観測個体参照（`annotationId` · 個体命名 ID · sessionId 等） | Occupancy start イベント |
| `deviceId` | SwitchBot / registry 上の計測器 | DeviceBinding start イベント |
| `placementId` | 物理スロット（棚・槽） | 両イベント共通キー |

**TelemetryIngest**（ingest body の `placementId` / `annotationId`）は **点の文脈**。区間の正本は **Occupancy + DeviceBinding**（FR-ENV-03/04 · ADR-env §用語）。

---

## 3. 現行コード評価（2026-06-21）

| 能力 | civ-os `backend/` | IHL `指示/it-hercules-laboratory/` |
|------|-------------------|-------------------------------------|
| Placement CRUD | 実装済 | 実装済 |
| Occupancy start/end + `subjectRef` | 実装済 | 実装済 |
| DeviceBinding start/end | 実装済 | **未実装**（shelf `openBinding: null` · P3 gap） |
| ingest `annotationId` | あり | body 受理 · Tier B 行への永続は partial |
| 区間 JOIN クエリ API | なし（history + shelf で手動） | なし |
| 固体 commit `placementId` | 実装済 | 実装済（`observation_solid`） |

**結論**: **概念と Occupancy API は ver1 出荷可能域**。**DeviceBinding 区間**が無いと poll/import データを **棚・個体に結べない** — ver1 の **最小 blocking gap**。

> **2026-06-21 更新（ADR-H-33）**: blocking gap の **主解**は **観測 commit からの DeviceBinding/Occupancy 自動派生**（[`ADR-H-33`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md) §3.3）。単独 `POST .../device-binding/*` は **P1 任意**（観測なしの棚操作）。

---

## 4. v1 出荷に必要な最小追加（設計のみ · IMPL 別）

| # | 項目 | 内容 | 優先 |
|---|------|------|------|
| **G1** | **観測 commit → binding 派生** | `devices[]` + `placementId` + `observed_at` から DeviceBinding/Occupancy INSERT · shelf `openBinding` 反映 | **P0**（[`ADR-H-33`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md)） |
| **G1b** | IHL DeviceBinding API（任意） | `POST .../device-binding/start\|end` · 409 重複 — **観測なし**の温度計交換用 | **P1** |
| **G2** | `subjectRef` 規約 | 推奨: `@annotation/{id}` または個体命名正本 ID — UI で Occupancy 開始時に自動填入 | P1 |
| **G3** | 運用チェックリスト | Placement 作成 → Binding 開始 → Occupancy 開始（個体移動時 end/start）— ドキュメント化で可 | P1 |
| **G4** | import API | ADR-H-31 · 補助 backfill | P2 |
| **G5** | `GET .../subjects/{ref}/environment?from=&to=` | 区間 JOIN 専用 API | ver2 |

**ver1 で不要**: 自動推定（テレメトリだけから個体を推論）· R2 行 UPDATE。

---

## 5. 観測入力との接続

| 経路 | 記録 |
|------|------|
| 固体 commit | 任意 `placementId` · `occupancyId`（点）— [`05-観測.md`](../../01-要件/05-観測.md) OBS-ENV-05 |
| 棚フロー | Occupancy / Binding のみ（環境二重 POST 禁止 · FR-ENV-06） |
| collector ingest | `placementId` / `annotationId` optional — Binding 未確定時は **未解決**を許容（FR-ENV-04） |

### 5.1 UI 配置（ver1 · UX 相談 2026-06-21 確定）

**推奨**: 計測行 Card 内の「定期取得」ブロックを拡張せず、**「環境・設置」独立チャンク**を **個体命名の直後・計測行の直前**に置く。

| UI 要素 | 役割 |
|---------|------|
| Placement（棚） | Occupancy の hub |
| Device（温度計） | DeviceBinding · poll/import の参照元 |
| 期間開始 / 終了 | 区間の正本 |
| 「温湿度スナップショット同梱」checkbox | **点**（今回 commit のみ）— 区間バインドとは分離 |

定期取得 ON 時は **Device 必須**（上記チャンクで選択 · 計測行はデフォルト引用）。

---

## 6. 参照

- [`ADR-H-33`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md) — **統合モデル** · commit 派生 · follow-up · クエリ  
- [`ADR-H-30`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) §10 運用凍結  
- [`ADR-H-31`](./ADR-H-31-SwitchBot-Import-API-v1-DRAFT.md) — 補助 import  
- [`13-データ取得元管理.md`](../../01-要件/13-データ取得元管理.md) §運用凍結  
- [`05-観測.md`](../../01-要件/05-観測.md) §4.15 OBS-FUP-*

---

*DRAFT v1 · 2026-06-21 · §4 G1 は ADR-H-33 により P0=commit 派生 · 設計メモのみ — 実装は POST-OSS / IMPL キュー*
