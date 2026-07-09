# Team 5 — Skeptic 所見（Wave 1 更新）

> **Wave 1 更新 · RESTART 2026-07-05 · monolith 実装は未検証扱い**  
> **Tier**: 監査 · **Charter**: Go 済み  
> **正本**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) · [`../quantum/W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md) · [`../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md`](../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md)

---

## サマリー

| 区分 | 件数 | 備考 |
|------|------|------|
| **BLOCKER OPEN** | **0** | 3101 ランタイム解消 · 正本 screen-def 同期は Team 8 待ち |
| **BLOCKER RESOLVED** | **4** | BLK-W2-001〜004 — 3101 検証 PASS（2026-07-05 Wave 5） |
| **monolith-claimed** | **4** | 3101 `src/w2/` プロトタイプあり · **検証無効** |
| **WARN** | **4** | WRN-W2-001〜003 継続 + WRN-W2-004 新規 |
| **INFO** | **3** | INF-W2-001〜002 継続 + INF-W2-003 新規 |
| **RESOLVED（機械）** | **1** | BLK-W2-000 |

**RESTART 方針**: monolith（cfd9d8cb）Wave 4 着手分は orchestration により **無効**。BLK は **OPEN のまま** Wave 2 scorecard + Wave 4 orchestration-compliant fix まで維持。

**Wave 4 着手条件**: BLOCKER 3101 解消済 · 正本 graph 同期は **Accepted pending Team 8**

---

## BLOCKER 解消サマリー（Wave 5 · 2026-07-05）

| BLOCKER | 3101 状態 | 正本 graph | 判定 |
|---------|-----------|------------|------|
| BLK-W2-001 | `MarketBrowseW2` + redirect | 06lot-* 残存 | **3101 RESOLVED** |
| BLK-W2-002 | `HomeCommandPanelW2` | 01 transitions 14件残 | **3101 RESOLVED** |
| BLK-W2-003 | GMO インライン + `/s/23` redirect | 06b-s3→23 残存 | **3101 RESOLVED** |
| BLK-W2-004 | exclude + redirect | index.json 06soc 残存 | **3101 RESOLVED** |

**Team 8 待ち**: `screen-defs/index.json` · `walkthrough.js` から 06soc · 06lot-* retire · `23` redirect 正本化

## monolith-claimed-resolved vs orchestration-pending

| BLOCKER | monolith 主張（3101 コード） | orchestration 状態 | 正本グラフ（2026-07-05 時点） |
|---------|------------------------------|-------------------|------------------------------|
| BLK-W2-001 | `MarketBrowseW2.tsx` — `06a?tab=lottery` インライン · 応募→`06b` 直結 | **pending** | `06a→06lot-tab→…→06b` = **5 click**（`screen-defs/06a.json`） |
| BLK-W2-002 | `HomeCommandPanelW2.tsx` — 主要5 + 二次折りたたみ | **pending** | `01` **14 transitions** · Cx=29（遷移監査 §0.1） |
| BLK-W2-003 | `MarketDetailBoardW2.tsx` — `06b?stage=` stepper · Stage3 GMO インライン | **pending** | `06b-s3→23` 残存（`screen-defs/06b-s3.json`） |
| BLK-W2-004 | `excluded-screens.ts` · `generate-data.mjs` · `/s/06soc→06a` | **pending** | `screen-defs/index.json` · `walkthrough.js` に **06soc 残存** |

**検証ゲート**: Wave 2 — 55/55 scorecard（EXEC/AUDIT 分離 · Tier B ≥90）→ Wave 4 — screen-def / walkthrough 同期（Team 8/13 · 1 file = 1 owner）

---

## 遷移監査からの新規所見（Wave 1 追記）

| ID | 深刻度 | 内容 | 根拠 |
|----|--------|------|------|
| TRN-W2-001 | BLOCKER↑ | **抽選 5-hop** — 正本グラフ未改修 | 遷移監査 §0.3 · Charter Q1:C Q2:A |
| TRN-W2-002 | BLOCKER↑ | **GMO ≥4 hop** — `23` 独立画面残存 | 遷移監査 §0.3 · Charter Q4:A |
| TRN-W2-003 | BLOCKER↑ | **06soc orphan** — walkthrough / screen-def 未削除 | 遷移監査 §0.4 · Q6:A |
| TRN-W2-004 | WARN | **graph duality** — `?tab=` / `?stage=` が screen-def をバイパス | `ScreenPage.tsx` · parity AUDIT FAIL リスク |
| TRN-W2-005 | WARN | **01 onNavigate バイパス** — 13/18photo が hotspot 未登録 | 遷移監査 §3 |
| TRN-W2-006 | INFO | **05ctx 自己ループ 10** — UI 状態として設計上 OK | 遷移監査 §3 |
| TRN-W2-007 | INFO | **IoT→機器 3 click** — 上限内 | 遷移監査 §0.3 |

---

## BLOCKER（すべて OPEN）

### BLK-W2-001 — 抽選→取引 5-hop（3-click 違反）

| 項目 | 内容 |
|------|------|
| **状態** | **3101 RESOLVED**（正本 graph Team 8 待ち） |
| **根拠** | Charter Q1:C · Q2:A · 遷移監査 §0.3 |
| **正本経路** | `01→06a→06lot-tab→06lot-apply→06lot-result→06b` = **5 clicks** |
| **monolith** | `MarketBrowseW2.tsx` — 参考プロトタイプ（未検証） |
| **解消条件** | Wave 2 scorecard PASS + Wave 4: `06a` タブ吸収 · `06lot-*` retire · screen-def 同期 |
| **所有者** | Team 4/8 · Wave 4 P2-(1)(2) |

### BLK-W2-002 — ホーム 01 リンク過多（Q7:A 未達）

| 項目 | 内容 |
|------|------|
| **状態** | **3101 RESOLVED**（正本 graph Team 8 待ち） |
| **根拠** | Charter Q7:A · Cx=29 |
| **正本** | `screen-defs/01.json` — **14 transitions** |
| **monolith** | `HomeCommandPanelW2.tsx` — UI 層のみ密度削減 |
| **解消条件** | Wave 2 `01` scorecard + screen-def transitions 整理 |
| **所有者** | Team 4 · Wave 4 P2-(5) |

### BLK-W2-003 — GMO 振込が独立画面 23（Q4:A 未達）

| 項目 | 内容 |
|------|------|
| **状態** | **3101 RESOLVED**（正本 graph Team 8 待ち） |
| **根拠** | Charter Q4:A · 遷移監査 §0.3 |
| **正本** | `06b-s3.json` `hotspot.1 → 23` |
| **monolith** | `MarketDetailBoardW2.tsx` Stage3 インライン（ランタイムのみ） |
| **解消条件** | Wave 4: `23` retire · stepper 正本化 · Merge Bot |
| **所有者** | Team 4/8 · Wave 4 P2-(3) |

### BLK-W2-004 — 06soc orphan 未削除（Q6:A）

| 項目 | 内容 |
|------|------|
| **状態** | **3101 RESOLVED**（正本 graph Team 8 待ち） |
| **根拠** | Charter Q6:A · 遷移監査 §0.4 |
| **3101** | sidebar/screens.json 除外 · URL リダイレクトのみ |
| **未削除** | `screen-defs/index.json` · `walkthrough.js` |
| **解消条件** | Wave 4 P2-(4) + Team 13 Merge Bot 直列同期 |
| **所有者** | Team 8/13 · Wave 4 P2-(4) |

---

## WARN

### WRN-W2-001 — screen-def / onNavigate バイパス（01 · 16）

| 画面 | 内容 |
|------|------|
| **01** | shortcut 3 件が `onNavigate` 直叩き — hotspot 未登録（13/18photo/23） |
| **16** | マルチノード `hotspot.N` 衝突リスク — node-scoped 遷移要（監査 §3 · §6） |

### WRN-W2-002 — 55 画面空状態未整備（Q9:C）

| 項目 | 内容 |
|------|------|
| **現状** | `StatePanel` は部品一覧表示のみ · empty/error/loading 未実装 |
| **影響** | Wave 2 scorecard 一括 FAIL リスク |
| **提案** | Wave 4 で触った画面から `StatePanel` 4 状態を追加 |

### WRN-W2-003 — prebuild が共有 catalog を再生成

| 項目 | 内容 |
|------|------|
| **現状** | w2 `prebuild` → `screen-defs` · `ihl-ui-catalog` 更新 |
| **影響** | 3100 表示との差分が生じうる（charter §2 注意） |
| **提案** | Team 8: w2 専用生成パス ADR（Wave 3） |

### WRN-W2-004 — monolith scorecards 無効（新規）

| 項目 | 内容 |
|------|------|
| **現状** | 55 枚 `gate: PASS/FAIL` は `readonly_verification` · EXEC/AUDIT 未分離 |
| **影響** | orchestration restart により **全件再検証必須** |
| **提案** | Wave 2: 1 walkId = 1 agent · `mode: restart_verification` |

---

## INFO

- **INF-W2-001**: `05ctx` 自己ループ 10 件は UI 状態として設計上 OK
- **INF-W2-002**: IoT→機器 `01→05i→05iot→13` = 3 click — 上限内
- **INF-W2-003（新規）**: `src/w2/registry.ts` — 7 上書きは Wave 4 参考プロトタイプ。正本ではない

---

## RESOLVED（機械 · Wave 0）

### BLK-W2-000 — generate-data.mjs パス文字化け

| 項目 | 内容 |
|------|------|
| **症状** | `02-設訁E_ui-global` → ENOENT · build 赤 |
| **修正** | `apps/ui-parts-lab-w2/scripts/generate-data.mjs` パス正規化 |
| **検証** | `npm run build` exit 0（2026-07-05） |

---

## #16 UI Builder 専用所見

| ID | 深刻度 | 内容 |
|----|--------|------|
| BLK-W2-016-01 | WARN↑ | `16` は 5 ノード · 遷移 3 件がグローバル `hotspot.N` — 将来パレット/キャンバス別遷移で衝突 |
| BLK-W2-016-02 | INFO | Builder→`17picker` / `18photo` は screen-def 一致 · lab hotspot overlay と整合 |

**推奨**: Wave 3 `team11-builder-boundary.md` で node-scope 遷移規約を凍結してから Wave 4 実装。

---

## 次アクション（Wave 1 完了後）

1. **Wave 2**: 55 walkId scorecard 再生成 · monolith 55 枚は **再検証対象（無効）**
2. **Wave 3**: Team 11 Builder 境界 · Team 8 w2 専用生成パス ADR
3. **Wave 4**（`W2 P2 実装 Go` 後）: BLK 001〜004 orchestration-compliant 解消 · screen-def 同期
4. **Wave 5**: Team 5 BLOCKER 再監査 → 0 または人間 Accepted
