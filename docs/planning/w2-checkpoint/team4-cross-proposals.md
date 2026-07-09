# Team 4 — 横断 P2 提案（Wave 3）

> **ステータス**: **提案確定 · Wave 3 出力**（2026-07-05）  
> **実装**: **3101 EXEC 完了**（2026-07-05 · orchestration-compliant）  
> **正本**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) · [`team5-skeptic-findings.md`](./team5-skeptic-findings.md) · [`../quantum/W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md)

---

## 1. ステータス

| 項目 | 状態 |
|------|------|
| Charter Go | ✅ 2026-07-05（`Q1:C Q2:A Q3:C Q4:A Q5:B Q6:A Q7:A`） |
| 3101 プロトタイプ | ⚠️ **monolith-claimed · 未検証**（Team 5 RESTART 方針） |
| screen-def 正本 | ❌ BLK-W2-001〜004 **OPEN** — グラフ未同期 |
| 本稿の位置づけ | Wave 3 **設計提案** — Wave 4 実装の入力 |
| 3100 / `apps/web` | **改変禁止**（charter §2 · ownership-table §1） |

**Wave 4 着手条件**: Charter Go ✅ **+** 人間 `W2 P2 実装 Go` **+** Wave 2 scorecard 再検証 PASS

---

## 2. Charter 決定 ↔ 提案マップ

| Charter | 決定 | 横断提案 ID | 解消 BLOCKER | 3101 試作 |
|---------|------|-------------|--------------|-----------|
| **Q1:C** + **Q2:A** | 3 クリック厳守 · タブ統合・削除 OK | **P2-01** | BLK-W2-001 | `MarketBrowseW2.tsx` |
| **Q3:C** | 取引 06b 系 — 3101 のみ 1 画面 stepper | **P2-02** | （P2-03 と連動） | `MarketDetailBoardW2.tsx` |
| **Q4:A** | GMO 振込 — 取引フロー内インライン | **P2-03** | BLK-W2-003 | 同上 Stage 3 |
| **Q6:A** | 06soc orphan 削除 | **P2-04** | BLK-W2-004 | `excluded-screens.ts` |
| **Q7:A** | ホーム 01 リンク密度削減 | **P2-05** | BLK-W2-002 | `HomeCommandPanelW2.tsx` |
| **Q5:B** | 深葉 chrome — 観測・マーケット等のみ | **横断原則 §6** | — | `W2ScreenRenderer.tsx` · DeepNav |

> Charter §4.1 の「P2 横断 **5 項目**」= 上表 **P2-01〜05**。Q5:B は全提案に跨る **適用域制約**（§6）として別枠。

---

## 3. P2 提案（5 件）

### P2-01 — 3 クリック厳守：06a タブ統合 · 06lot-* retire

| 項目 | 内容 |
|------|------|
| **Charter** | Q1:C · Q2:A |
| **所有者** | Team 4（UI）· Team 8（screen-def alias / retire）· Team 13（Merge Bot） |
| **BLOCKER** | BLK-W2-001 · TRN-W2-001 |

**現状（正本グラフ）**

- 抽選当選→取引: `01→06a→06lot-tab→06lot-apply→06lot-result→06b` = **5 hop**
- 遷移監査 §0.3 #1–3 · [`screen-defs/06a.json`](../../screen-defs/06a.json) `hotspot.2 → 06lot-tab`

**提案**

1. **3101**: `06a?tab=lottery` + 内部 `lotteryStep`（list / apply / result）— walkId 遷移 **0**
2. 当選 CTA → `onNavigate("06b")` — 目標経路 `01→06a→06b` = **2 hop**（タブ内操作は hop 不計）
3. **3100**: `06lot-tab` · `06lot-apply` · `06lot-result` · `06lot-lose` **維持**（比較用）
4. **Wave 4 正本化**: `06lot-*` を screen-def から **retire** または **alias → 06a?tab=lottery**（Team 8）

**3101 試作根拠**

- [`apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx) — `LotteryInline` · `MarketTabs` · `screenParams.tab`
- registry: [`registry.ts`](../../apps/ui-parts-lab-w2/src/w2/registry.ts) L18–22

**受入条件**

- [ ] 抽選当選→取引: 正本グラフ **≤3 hop**（目標 2 hop）
- [ ] `06lot-tab` / `06lot-apply` / `06lot-result` への **外部遷移 0**（3101）
- [ ] `06a` scorecard PASS · hotspot overlay と tab 状態の parity 監査 PASS
- [ ] 3100 ベースライン未改変

---

### P2-02 — 06b 1 画面 stepper（3101 のみ · stage query param）

| 項目 | 内容 |
|------|------|
| **Charter** | Q3:C |
| **所有者** | Team 4 · Team 8（screen-def 統合設計） |
| **BLOCKER** | （P2-03 と同ファイル · stepper 前提） |

**現状（正本グラフ）**

- 取引 Stage3: `01→06a→06b→06b-s2→06b-s3` = **4 hop**
- 3 walkId: [`06b.json`](../../screen-defs/06b.json) · [`06b-s2.json`](../../screen-defs/06b-s2.json) · [`06b-s3.json`](../../screen-defs/06b-s3.json)

**提案**

1. **3101 のみ**: 単一 walkId `06b` + `?stage=1|2|3` — stage 変更は **同一画面内 0 hop**
2. `TradeStepper` + Stage 2 **modal 確認**（振込/配達 2 主 CTA — 取引文脈維持）
3. **3100**: 3 画面遷移のまま — A/B 比較可能
4. **Wave 4 正本化（任意フェーズ）**: `06b-s2` / `06b-s3` retire — charter は「3101 試作→比較→凍結」のため **人間 Go 後**に screen-def 統合

**3101 試作根拠**

- [`MarketDetailBoardW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/MarketDetailBoardW2.tsx) — `parseStage(screenParams)` · `goStage()` · `data-w2-variant="stepper-stage*"`

**受入条件**

- [ ] 3101: stage 1↔2↔3 遷移が **walkId 変更なし**（URL param のみ）
- [ ] 3100: `06b` / `06b-s2` / `06b-s3` **未改変**
- [ ] Stage 2 modal: 確定後 stage 3 へ — hotspot 衝突なし（遷移監査 §6 · node-scoped 遷移）
- [ ] `06b` scorecard PASS（3101 renderer 経由）

---

### P2-03 — GMO インライン（Stage 3）· 独立 23 deprecate

| 項目 | 内容 |
|------|------|
| **Charter** | Q4:A |
| **所有者** | Team 4 · Team 8 · Team 13 |
| **BLOCKER** | BLK-W2-003 · TRN-W2-002 |

**現状（正本グラフ）**

- GMO（出品経由）: `…→06b-s3→23` = **≥4 hop**
- [`06b-s3.json`](../../screen-defs/06b-s3.json) `hotspot.1 → 23`

**提案**

1. **3101**: Stage 3 内に `GmoTransferStatusChip` · `GmoTransferFeeBreakdown` · `GmoTransferCodeDisplay` を **インラインパネル**配置
2. 「振込を済ませた」→ 同一画面内完了 — **`23` への遷移 0**
3. **3101**: `/s/23` ルート **非公開**または stub リダイレクト（P2-04 と同型）
4. **Wave 4**: `23` walkId **retire** · `06b-s3→23` エッジ削除 · walkthrough 同期

**3101 試作根拠**

- [`MarketDetailBoardW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/MarketDetailBoardW2.tsx) L80–94 — `data-inline-gmo="true"`

**受入条件**

- [ ] 3101: Stage 3 から **`23` への hotspot / nav 0**
- [ ] GMO 完了フローが Stage 3 内で完結（empty/error 最低 1 状態 — Q9:C）
- [ ] 正本グラフ: `06b-s3→23` エッジ **0**（Wave 4 Merge Bot 後）
- [ ] 抽選経由 GMO 8-hop（遷移監査 §0.3 #8）が P2-01 + 本提案で **≤3 hop**

---

### P2-04 — 06soc orphan 削除 · 3101 nav/routes 整理

| 項目 | 内容 |
|------|------|
| **Charter** | Q6:A |
| **所有者** | Team 8 · Team 13 · Team 4（3101 ルーティング） |
| **BLOCKER** | BLK-W2-004 · TRN-W2-003 |

**現状**

- `06soc`: orphan stub · `01` 未到達（遷移監査 §0.4）
- 正本残存: [`screen-defs/index.json`](../../screen-defs/index.json) · `walkthrough.js`
- 3101 部分対応: [`excluded-screens.ts`](../../apps/ui-parts-lab-w2/src/w2/excluded-screens.ts) — sidebar 除外のみ

**提案**

1. **3101**: nav · routes · sidebar から **完全除外** — `/s/06soc` → `06a` リダイレクト（既存方針を文書化）
2. **Wave 4**: `screen-defs/06soc.json` retire · `index.json` エントリ削除 · walkthrough ノード削除
3. generate-data: `06soc` を 55 カウントから除外するか **stubOnly** フラグで監査対象外化（Team 8 ADR）

**受入条件**

- [ ] 3101: サイドバー · 直接 URL から **06soc 到達不可**
- [ ] 正本: `screen-defs` · walkthrough から **06soc 0 件**
- [ ] Reachable from `01` の orphan 数 **1 減**（`03met` は別途）
- [ ] Team 5 BLK-W2-004 **RESOLVED**

---

### P2-05 — ホーム 01 リンク密度削減（主要 5 + 二次折りたたみ）

| 項目 | 内容 |
|------|------|
| **Charter** | Q7:A |
| **所有者** | Team 4 · Team 8（transitions 整理） |
| **BLOCKER** | BLK-W2-002 · TRN-W2-005（hotspot バイパス） |

**現状（正本グラフ）**

- Cx = **29**（out 13 + in 16）— 遷移監査 §0.1
- [`01.json`](../../screen-defs/01.json) — **14 transitions**
- WRN-W2-001: shortcut 3 件が `onNavigate` 直叩き — hotspot 未登録

**提案**

1. **PRIMARY_NAV 5**: 観測 · マーケット · 掲示板 · 設定 · 検索
2. **SECONDARY_NAV 9**: `showMore` 折りたたみ — 論文 · 好み · 貢献度 · 投票 · Builder · 愚痴 · 改善提案 · 機器 · 写真解析
3. L1: 3 KPI stat cards + 2 主 CTA（観測登録 · マーケット）
4. **Wave 4**: screen-def transitions を **可視 L1 導線に整合** — `onNavigate` バイパスを hotspot 登録へ移行（parity 監査）

**3101 試作根拠**

- [`HomeCommandPanelW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx) — `PRIMARY_NAV` · `SECONDARY_NAV` · `data-w2-variant="density-reduced"`
- empty / loading / error: `PanelStateMessage`（WRN-W2-002 対応）

**受入条件**

- [ ] 3101: 常時表示ナビ **5 項目** · 二次は折りたたみ
- [ ] 正本: `01` out-edge **≤6**（L1 相当 · Team 8 再集計）
- [ ] Cx **≤20**（目標 · 遷移監査再計測）
- [ ] hotspot parity: `onNavigate` バイパス **0**（Wave 4 screen-def 同期後）
- [ ] `01` scorecard PASS

---

## 4. 横断原則 — 深葉 Chrome（Q5:B）

Charter Q5:B: **BrandChrome / ObsDeepNav / MarketDeepNav** は **観測・マーケット深葉のみ** — 全 55 画面一律ではない。

| 適用域 | walkId 例 | コンポーネント | 非適用（現状維持） |
|--------|-----------|----------------|-------------------|
| **観測深葉** | `05a`–`05iot` · `05ctx` | `ObsDeepNav` | 設定 · 投票 · 論文 |
| **マーケット深葉** | `06a` · `06b` · `06auc` | `MarketDeepNav` | 掲示板 · プロフィール |
| **全画面共通** | 全 standard layout | `BrandChrome`（screen-def `ihl-brand-chrome` ノード） | auth layout（O1–O3） |

**実装方針**

- [`W2ScreenRenderer.tsx`](../../apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx): screen-def の `ihl-brand-chrome` ノードは **既存どおり全画面** — 追加 chrome は **部品内 DeepNav** のみ
- P2-01 · P2-02 試作は既に `MarketDeepNav` を ContentArea 内に配置 — **パターン正**（Team 1 §7.1 P2-(6) 整合）
- 観測 11 画面: catalog 既存 `ObsDeepNav` を維持 · **新規 55 画面展開はしない**
- 深葉→`01` **≤2 hop**（Team 1 成功指標）

**受入条件（横断）**

- [ ] DeepNav 追加対象が **観測 + マーケット深葉のみ**（grep 監査: 他ドメインに `*DeepNav` 新規 0）
- [ ] 設定 · 掲示板 · 経済 hub に **MarketDeepNav 未追加**

---

## 5. 実装 DAG（Wave 4 推奨順）

Charter §6 · Team 1 §7.3 と同一。依存関係を守る — 下流は上流の param 契約に依存。

```text
P2-01  06a tab 吸収 + 06lot-* retire
  ↓
P2-02  06b stepper（?stage=）
  ↓
P2-03  GMO inline + 23 retire
  ↓
P2-04  06soc 削除 + 導線整理
  ↓
P2-05  01 ホーム密度削減
  ∥（並行可 · 01 は独立度高）
横断   Q5:B DeepNav 適用域 — P2-01/02 実装時に同時確認
```

| 順序 | 提案 | ブロック解除 | 並列可否 |
|------|------|--------------|----------|
| 1 | P2-01 | BLK-W2-001 | — |
| 2 | P2-02 | — | P2-01 の `06b` 入口契約後 |
| 3 | P2-03 | BLK-W2-003 | P2-02 Stage 3 必須 |
| 4 | P2-04 | BLK-W2-004 | P2-01 後（nav 整理） |
| 5 | P2-05 | BLK-W2-002 | **P2-01 と並列可** |
| — | Q5:B 横断 | — | P2-01/02 と同時レビュー |

---

## 6. リスク · 依存 · 未決事項

### WRN-W2-003 — prebuild が共有 catalog を再生成

| 項目 | 内容 |
|------|------|
| **現状** | w2 `predev` / `prebuild` → `screen-defs` · `ihl-ui-catalog` 更新 |
| **影響** | 3100 表示との差分 · parity 監査混乱 · Merge Bot 競合 |
| **Wave 3 対応** | Team 8: **w2 専用生成パス ADR** 提案（ownership-table §3） |
| **Wave 4 暫定** | screen-def 大変更は **Merge Bot 直列** · P2 実装前に ADR 確定 or 生成スコープ限定 |

**P2 実装時の抑制策**

1. Wave 4 では **3101 `src/w2/` override 優先** — catalog 本体変更は最小
2. screen-def retire（06lot-* · 06soc · 23）は **1 walkId = 1 owner** · Team 13 直列
3. `npm run ui-parts-lab`（3100）と `ui-parts-lab-w2`（3101）を **同時起動比較** — charter §2

### その他 WARN

| ID | リスク | 緩和 |
|----|--------|------|
| **TRN-W2-004** | `?tab=` / `?stage=` が screen-def をバイパス — parity FAIL | Wave 2 scorecard + Wave 4 alias 登録 |
| **WRN-W2-001** | `01` · `16` hotspot バイパス | P2-05 で 01 整理 · Team 11 Builder 境界（Wave 3） |
| **WRN-W2-002** | 55 画面 empty/error 未整備 | P2 触った walkId から `StatePanel` 4 状態追加（Q9:C） |
| **WRN-W2-004** | monolith scorecard 無効 | Wave 2: `mode: restart_verification` · 1 walkId = 1 agent |

### 3101 プロトタイプの限界（Team 5）

- `src/w2/registry.ts` の **7 上書きは参考** — orchestration-compliant 解消は Wave 4 + screen-def 同期が必須
- BLK-W2-001〜004 は **OPEN のまま** — 本稿は設計正本、検証 PASS ではない

---

## 7. 参照リンク

### 設計 · 監査

| ドキュメント | 用途 |
|--------------|------|
| [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) | Q1–Q10 確定回答 |
| [`team5-skeptic-findings.md`](./team5-skeptic-findings.md) | BLOCKER / WARN 一覧 |
| [`team1-web-research.md`](./team1-web-research.md) | P2 walkId マップ · UX 根拠 |
| [`../quantum/W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md) | §0.3 3-click 違反 · §0.4 dead-end |
| [`ownership-table.md`](./ownership-table.md) | ファイル所有権 · Merge Bot 規則 |
| [`../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md`](../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md) | Wave 編成 |

### screen-defs（正本グラフ）

| walkId | ファイル | P2 |
|--------|----------|-----|
| `06a` | [`screen-defs/06a.json`](../../screen-defs/06a.json) | P2-01 |
| `06lot-tab` · `06lot-apply` · `06lot-result` · `06lot-lose` | [`screen-defs/06lot-*.json`](../../screen-defs/) | P2-01 retire |
| `06b` · `06b-s2` · `06b-s3` | [`screen-defs/06b.json`](../../screen-defs/06b.json) 他 | P2-02 · P2-03 |
| `23` | [`screen-defs/23.json`](../../screen-defs/23.json) | P2-03 retire |
| `06soc` | [`screen-defs/06soc.json`](../../screen-defs/06soc.json) | P2-04 retire |
| `01` | [`screen-defs/01.json`](../../screen-defs/01.json) | P2-05 |
| 索引 | [`screen-defs/index.json`](../../screen-defs/index.json) | 全 P2 |

### 3101 W2 プロトタイプ（`apps/ui-parts-lab-w2/src/w2/`）

| ファイル | 提案 | 上書き component_id |
|----------|------|---------------------|
| [`MarketBrowseW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx) | P2-01 | `ihl-06-market-browse__*` |
| [`MarketDetailBoardW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/MarketDetailBoardW2.tsx) | P2-02 · P2-03 | `ihl-06-market-detail-board__*` |
| [`HomeCommandPanelW2.tsx`](../../apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx) | P2-05 | `ihl-01-nav-home__HomeCommandPanel` |
| [`excluded-screens.ts`](../../apps/ui-parts-lab-w2/src/w2/excluded-screens.ts) | P2-04 | — |
| [`registry.ts`](../../apps/ui-parts-lab-w2/src/w2/registry.ts) | 全 P2 | override 台帳 |
| [`W2ScreenRenderer.tsx`](../../apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx) | Q5:B | BrandChrome 配線 |

---

*Team 4 · Wave 3 · 次: Wave 4 実装（`W2 P2 実装 Go` 待ち）*
