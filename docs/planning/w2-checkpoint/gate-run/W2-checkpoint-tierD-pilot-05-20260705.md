# W2 Tier D Pilot — #05 観測登録

> **日付**: 2026-07-05  
> **ブランチ**: `feature/ui-parts-lab-w2-checkpoint`  
> **oracle**: [`ui-copy-spec/05-観測-v1.md`](./ui-copy-spec/05-観測-v1.md)  
> **参照**: [`W2-QUALITY-ROOT-CAUSE-AND-FIX-v1.md`](./W2-QUALITY-ROOT-CAUSE-AND-FIX-v1.md) §4 Tier D

---

## Phase 0 — Design Conflict Gate

### Role 1: REQ Reader

**出典**: `01-要件/05-観測.md` §4.10 OBS-CTX · §4.11 OBS-TGT · §4.9 OBS-TPL · OBS-SOL-04

観測登録 Must behaviors:

1. **対象ナビゲータ** — 5 ドメイン · 文字のみ · 亜種まで（未区別明示可）· 確定はユーザー
2. **WorkflowContext 伝播** — 05ctx → 05i/05a/05tl プリフィル（localStorage + query）
3. **計測入力** — 4 コントロール行 · 性別表示分岐 · 1 主ボタン **保存**
4. **IoT 導線** — 機器未登録バナー → 機器管理（#13）· ADR-H-30（サーバ secret 禁止）
5. **研究軸** — commit 時 hook（+5 saved · +3 photo）— 設計 forward · API 未配線可

**Gate**: PASS（要件は明確 · ver1 COMPLETE 宣言済）

---

### Role 2: DET Reader — 矛盾リスト

| # | DET / ADR | UI 草案 | 矛盾 | 解消 |
|---|-----------|---------|------|------|
| D1 | 詳細設計-v3 §1.2: OBS-TGT UI は frontend · Python は gap | ui/コンテキスト.md v2 確定扱いメモ | 層の権威が曖昧 | **Accepted** — W2 pilot は 3101 UI のみ · API なし |
| D2 | 入力UI設計-v1: 主 CTA = **〔保存〕** | catalog ObsInputRow: 視覚的主ボタン「行を追加」 | 主ボタン逆転 | **Fixed** — `ObsRegistrationW2.tsx` |
| D3 | コンテキスト.md: 主 CTA = **〔適用〕** | catalog: 「適用 → 検索（対象プリフィル）」 | ラベル冗長 · 検索が主に見える | **Fixed** — W2 override「適用」 |
| D4 | OBS-TGT-01: 昆虫専用ではない | catalog ObsDeviceLink: 「昆虫観察記録」 | 禁止語 | **Fixed (3101)** · catalog 3100 は未改変 |
| D5 | ui/入力UI設計-v1 ステータス: **草案 · 実装 Go 不可** | W2 Wave 2 で catalog 実装済 | 設計ゲート vs pilot | **Accepted deviation** — Tier D pilot 明示 Go · micro-spec v1 を oracle 化 |

**Gate**: PASS（矛盾は W2 override または Accepted deviation で記録）

---

### Role 3: UI Copy Spec

→ 正本: [`ui-copy-spec/05-観測-v1.md`](./ui-copy-spec/05-観測-v1.md)

---

### Role 4: SKEPTIC pre-IMPL

```text
grep catalog observation:
  BLOCKER packages/ihl-ui-catalog/.../ObsDeviceLink.tsx:19 「昆虫観察記録」
  WARN    ObsContextPicker.tsx:273 「適用 → 検索（対象プリフィル）」
  WARN    ObsInputRow.tsx — 保存 CTA なし · 行を追加が dominant

grep 3101 w2 (post-IMPL):
  PASS — 昆虫観察記録 0 件（ObsRegistrationW2 修正済）
  PASS — 適用 · 保存 · 何を観測しますか？ 一致
```

**Pre-IMPL Gate**: PASS（3101 スコープ）· catalog 3100 BLOCKER は **スコープ外（制約）**

---

## Phase 1 — IMPL サマリー

| ファイル | 変更 |
|----------|------|
| `apps/ui-parts-lab-w2/src/w2/ObsRegistrationW2.tsx` | **新規** — 05ctx · 05i · 05iot 専用 override |
| `apps/ui-parts-lab-w2/src/w2/registry.ts` | DEDICATED_W2_OVERRIDES 登録 |
| `apps/ui-parts-lab-w2/src/w2/catalogW2Overrides.ts` | SKIP_PREFIXES 追加 |
| `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` | 観測登録 → `05ctx`（3-click パス A） |

**build**: `npm run build` PASS（2026-07-05）

---

## Phase 2 — Tier D AUDIT

### 2.1 HTTP / 直接ロード

| URL | HTTP | 備考 |
|-----|------|------|
| http://localhost:3101/s/01 | 200 | ホーム |
| http://localhost:3101/s/05ctx | 200 | 対象ナビゲータ |
| http://localhost:3101/s/05i | 200 | 計測入力 |
| http://localhost:3101/s/05iot | 200 | IoT バナー |

### 2.2 Copy grep vs ui-copy-spec（3101 W2 層）

| 期待文言 | walkId | grep 3101 w2 | 結果 |
|----------|--------|--------------|------|
| 何を観測しますか？ | 05ctx | ObsRegistrationW2.tsx | PASS |
| 適用 | 05ctx | ObsRegistrationW2.tsx | PASS |
| 保存 | 05i | ObsRegistrationW2.tsx | PASS |
| 観測 計測入力 | 05iot | ObsRegistrationW2.tsx | PASS |
| 昆虫観察記録 | * | w2/ grep | PASS（0 件） |

### 2.3 E2E 導線（手順 · browser 目視推奨）

1. http://localhost:3101/s/01 → **◎ 観測登録を始める** → `/s/05ctx`
2. **適用** → `/s/05i`
3. **保存** → 成功 toast（研究軸 hook 設計メモ表示）

**クリック数**: 3（Charter Q1/Q2 準拠）

### 2.4 Scorecard CONTENT PASS（パイロット walkId）

| walkId | gate_structural | gate_content | gate | 備考 |
|--------|-----------------|--------------|------|------|
| 05ctx | PASS | **PASS** | PASS | W2 dedicated override |
| 05i | PASS | **PASS** | PASS | 保存 CTA · 研究軸メモ |
| 05iot | PASS | **PASS** | PASS | 禁止語除去 |
| 05a | PASS | PARTIAL | PARTIAL | catalog ラップのみ · 次イテレ |
| 05i-m / 05i-f | PASS | PARTIAL | PARTIAL | catalog · 保存あり |
| 05tl / 05td / 05fork | PASS | PARTIAL | PARTIAL | 未 override |

**Pilot スコープ CONTENT PASS**: **3/3** コア登録画面（05ctx · 05i · 05iot）

---

## 残ギャップ · 人間 Go

| ID | 内容 | 人間 Go |
|----|------|---------|
| GAP-TD-05-001 | 3100 catalog `ObsDeviceLink` に「昆虫観察記録」残存 | 3100 改変可否 |
| GAP-TD-05-002 | ui-copy-spec v1 → `micro-spec-CONFIRMED` 昇格未 | 目視 10 分スポットチェック |
| GAP-TD-05-003 | 05a/05tl/05i-m/f は Tier B catalog のみ | 次バッチ override |
| GAP-TD-05-004 | 保存 → API commit 未配線（設計どおり） | ver1 API 連携は別 GO |
| GAP-TD-05-005 | screen-def `01.json` hotspot.1 ラベルは依然 05i 直跳び表記 | doc 同期 or screen-def 更新 GO |

---

## 総合判定

| 項目 | 結果 |
|------|------|
| **Can we do it?** | **Yes**（Tier D pilot · #05 観測登録コア） |
| **Tier D pilot** | **CONDITIONAL PASS** — 05ctx/05i/05iot CONTENT PASS · 副画面 PARTIAL |
| **人間 Go 推奨** | ui-copy-spec v1 目視確定 · 3100 禁止語修正方針 |

---

*Auto agent · no commit · 3100/apps/web 未改変*
