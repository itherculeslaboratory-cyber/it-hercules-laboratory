# UX レビュー手順書 — AI 追記 v1（2026-06-09）

> **元ファイル（変更なし）**: [`レビュー手順書　レビュー結果`](./レビュー手順書　レビュー結果)  
> **正本手順書**: [`../it-hercules-laboratory/02-設計/_ui-global/00-UXレビュー手順書-v1.md`](../it-hercules-laboratory/02-設計/_ui-global/00-UXレビュー手順書-v1.md)

---

## 1. 集計（2026-06-09 残件バッチ完了後）

| 項目 | 数 |
|------|-----|
| レビュー Step 合計 | **94** |
| ユーザー完了（初回レビュー ☑） | **87** |
| AI 残件バッチで mock+doc+配線完了 | **+6**（Step 8, 10, 18, 24, 46, 53） |
| **人間のみ残（再レビュー or Go）** | **1**（Step 48 通知 UX 正本） |
| **再目視推奨（AI mock 差し替え後）** | **6**（上記 NG 系 Step） |
| **実質 AI 完走可能スコープ** | **93 / 94** |

---

## 2. ユーザー NG と AI 対応（更新）

| Step | ユーザー指摘要約 | AI 対応（本バッチ） | 再レビュー |
|:----:|------------------|---------------------|:----------:|
| 8 | `☑ [ ]` 未チェック | O1→O2 hotspot 確認 · [x] AI | 任意 |
| 10 | 利用規約に本音解説・動画リンクがない | mock `ihl-00-terms.png` · FR-16 草案完了 · 遷移 Step 2' | **要** |
| 18 | 観測と検索が同一導線 | mock `ihl-01-nav-home.png` CTA 分離 | **要** |
| 24 | 画面文脈の板・テンプレ・Builder | mock 文脈バー · ADR-H-14 · 01→03/09/16 配線 | **要** |
| 46 | Stage 2〜3 ステッパ・確認・8% | mock stage2/3 · `06-マーケット.md` §2.4–2.5 | **要** |
| 48 | マーケットソーシャルは通知 | `PRnotif` 移設設計済 · **人間 Go 待ち** | **人間** |
| 53 | 板ハブのタブ重複 | mock `ihl-07-board-hub.png` タブ削除 · 4 大ボタン | **要** |
| — | 出品画面なし | mock `ihl-06-market-listing-create.png` · `06list` 配線済 | **要** |

### ユーザー自由記述（観測・好み）

| トピック | AI 対応（本バッチ） |
|----------|---------------------|
| 計測: 種族・フェーズ・採卵日・N 日目 | mock `ihl-05-obs-input-row.png` |
| テンプレ: 画像・scope_route 絞り込み | mock `ihl-05-obs-template-list.png` |
| 好み: 表示にも反映 | mock `ihl-10-preference-pairwise.png` プレビュー帯 |

---

## 3. §G 未配線 12 件 — AI 配線結果（最終）

| # | 内容 | AI 後 |
|---|------|-------|
| 1 | デフォルト `01` | 変更なし（仕様） |
| 2 | ホーム→血統 | **配線済** `01`→`03` |
| 3 | ホーム→論文 | **配線済** `01`→`09` |
| 4 | ホーム→Builder | **配線済** `01`→`16` |
| 5 | 板ハブ→論文 | **配線済** `07a`→`09` |
| 6 | 板ハブ→その他 | **配線済** `07a`→`07o` |
| 7 | `06soc` stub | **移設** → `PRnotif`（stub 注記残し） |
| 8 | `06auc`→`06b` stub | 変更なし（stub 維持） |
| 9 | `23` stubOnly | 変更なし · `06b-s3` から到達 |
| 10 | 抽選落選 mock | **配線済** `06lot-lose` |
| 11 | 優先順落選 mock | **配線済** `06pri-lose` |
| 12 | lineage-metrics mock | **配線済** 画面 ID `03met` |

**配線解消: 9/12** · **意図的維持: 3**（#1, #8, #9）

---

## 4. AI 完了チェック（§C 追記 · 本バッチ後）

| Step | ユーザー | AI 追記（最終） |
|:----:|:--------:|:---------------:|
| 8 | `☑ [ ]` | [x] AI |
| 10 | NG | [☑] mock+doc 済 · **人間再レビュー推奨** |
| 18 | NG | [☑] mock 済 · 再レビュー推奨 |
| 24 | NG | [☑] mock+ADR 済 · 全 mock 文脈バー統一は次バッチ |
| 46 | NG | [☑] stage mock 済 · 再レビュー推奨 |
| 48 | NG | [△] **人間 Go**（`PRnotif` 正本画面） |
| 53 | NG | [☑] hub mock 済 · 再レビュー推奨 |

---

## 5. Mock アーカイブ実績

| アーカイブ | 件数 |
|------------|------|
| 作成されたアーカイブ | **0** |

**理由**: ワークスペースに既存 PNG が無かったため上書き前アーカイブは未実施。次回差し替え時は [`archive-mock.mjs`](../it-hercules-laboratory/02-設計/_ui-global/mockups/mockups/mockups/scripts/archive-mock.mjs) を先に実行すること。

### 本バッチ新規/再生成 PNG（12 件）

| ファイル | 用途 |
|----------|------|
| `ihl-00-terms.png` | O3 本音解説 |
| `ihl-01-nav-home.png` | ホーム CTA 分離・文脈バー |
| `ihl-05-obs-input-row.png` | 計測入力 |
| `ihl-05-obs-template-list.png` | テンプレ一覧 |
| `ihl-06-market-listing-create.png` | 出品作成 |
| `ihl-06-market-detail-board-stage2.png` | Stage 2 |
| `ihl-06-market-detail-board-stage3.png` | Stage 3 |
| `ihl-07-board-hub.png` | 板ハブ |
| `ihl-10-preference-pairwise.png` | 好み+プレビュー |
| `ihl-06-market-lottery-result-lose.png` | 抽選落選 |
| `ihl-06-market-priority-queue-lose.png` | 優先順落選 |
| `ihl-03-lineage-metrics-detail.png` | 率 drilldown `03met` |

配置先: `指示/it-hercules-laboratory/02-設計/_ui-global/mockups/mockups/mockups/`

---

## 6. 変更ファイル一覧（AI · 本バッチ追記）

| 種別 | パス |
|------|------|
| Mock PNG | `02-設計/_ui-global/mockups/mockups/mockups/ihl-*.png` ×12 |
| Mock 仕様 | `02-設計/_ui-global/mockups/mockups/mockups/SPECS-pending-mocks.md` |
| ウォークスルー | `02-設計/_ui-global/ux-walkthrough/walkthrough.js`（`06lot-lose` `06pri-lose` `03met`） |
| 手順書 | `02-設計/_ui-global/00-UXレビュー手順書-v1.md` §G |
| ADR | `ADR-H-14-グローバル文脈バー.md` |
| 要件/UI | `02-利用規約` · `02-利用規約-遷移設計-v1` · `06-マーケット.md`（UI設計） |
| 17–19 草案 | `17-*-詳細設計-v1` · `17-*-遷移設計-v1` · `18-*` · `19-*` |
| README | `ux-walkthrough/README.md` |

---

## 7. 人間 Go が必要な残件

1. **Step 48**: `PRnotif` をマーケットソーシャルの正本とするか確定（通知 mock 専用化は未）
2. **法務**: FR-16 本音解説・動画の文言正本（`docs/legal/` とは別の平易層）
3. **再目視**: Step 10, 18, 24, 46, 53 + 出品 mock — ウォークスルーでホットスポット微調整
4. **設計ゲート 4 点** — 全機能 人間確定 0 件のまま（実装禁止継続）
5. **walkthrough 参照の他 mock**（browse 等 ~30 枚）— ワークスペース未配置 · 別バッチ or LFS 要確認

---

## 8. ユーザー Go 記録（2026-06-09 · 観測 05ctx / OBS-TGT）

> **注意**: 以下は **設計ゲート上の人間レビュー済み扱いメモ**。**実装 Go ではない**（`design-before-implementation-gate.mdc` 継続）。

| 項目 | ユーザー判断 | AI 記録 |
|------|-------------|---------|
| **05ctx モック** `ihl-05-obs-context-picker.png` | **原版でモック OK** | 生物中心の現行 PNG を Phase 1 UX レビュー正本とする。差し替え不要 |
| **OBS-TGT UI 草案**（[`05-観測-コンテキスト.md`](../it-hercules-laboratory/02-設計/features/05-観測/ui/コンテキスト.md) v2） | **目視 OK** | 設計ゲート UI 列を **部分 Go** とする（全 4 点確定ではない） |
| **`artifact` / `digital` 専用 mock** | **不要** | ADR-H-16 + 辞書 YAML で Phase 1 十分。別 PNG 生成はスコープ外 |

**反映先**: [ADR-H-16 §9.1](../it-hercules-laboratory/02-設計/_横断/adr/ADR-H-16-観測対象ナビゲータ.md) · [`05-観測-コンテキスト.md`](../it-hercules-laboratory/02-設計/features/05-観測/ui/コンテキスト.md) · [`00-設計ゲート4点-ギャップマトリクス-v1.md`](../it-hercules-laboratory/05-運用/queues/00-設計ゲート4点-ギャップマトリクス-v1.md)

---

*AI 追記 v1.2 · 2026-06-09 05ctx/OBS-TGT ユーザー Go 記録 · ユーザー原本は未改変*
