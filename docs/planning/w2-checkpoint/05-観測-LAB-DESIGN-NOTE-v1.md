# 05 観測 — LAB Design Note v1

> **日付**: 2026-07-05  
> **walkId**: `05ctx` · `05i` · **`05confirm`** · port **3101**  
> **実装**: `apps/ui-parts-lab-w2/src/w2/ObsRegistrationW2.tsx` · `observation-draft-lab.ts`  
> **oracle 正本**: `02-設計/features/05-観測/遷移設計-v2.md` · `ui/観測入力-v2.md` · `ui/コンテキスト.md` · `slices/screens/observation-confirm.md`  
> **受入**: [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md)  
> **設計 doc 処理**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)

---

## 0. HOME フィードバック教訓（本実装への適用）

| 教訓 | 05 観測での適用 |
|------|----------------|
| 設計 § verbatim 引用 → 対照表 | §1–§3 表（本 note） |
| agent invent UI 禁止 | PT · マイページ duplicate · orphan 保存 CTA なし |
| user gate > draft | lab は TRN v2 正本（保存 terminal 不可） |
| 3 画面フロー必須 | ctx → input → **confirm** |
| sessionStorage handoff | `observation-draft-lab.ts` |
| 正直 self-score | MUST 未達は cap 70（score session v1） |

---

## 1. 設計 § 引用（verbatim · oracle）

### 1.1 コンテキスト（`ui/コンテキスト.md`）

> **主タスク**: 「観測対象を選び、必要なら段階を添えて、観測画面（検索 05a / 入力 05i / テンプレ一覧 05tl）に引き継ぐ」  
> **ステッパ**: ①対象 ②絞り込み ③確認  
> **適用**: 1 主ボタン〔適用〕+ トグル「プロフィールにも保存」  
> **亜種未到達**: 〔適用〕無効（OBS-TGT-04）  
> **伝播**: 〔適用〕で `ihl.observation.context.v1` 更新 → 05i プリフィル

### 1.2 入力（`ui/観測入力-v2.md` · `遷移設計-v2.md`）

> **主 CTA**: 入力=〔確認へ〕 · confirm=〔登録する〕/「観測を確定」  
> **チャンク**: 対象/命名 · 環境・設置 · 次回観測 · 計測 · 写真（3–5 認知塊）  
> **令・性別**: 05i 側（ADR-H-16 §6）  
> **フロー**: input draft 編集 → 〔確認へ〕 → confirm 読取サマリー → commit

### 1.3 確認（`slices/screens/observation-confirm.md`）

> **見出し**: 「登録前の確認」  
> **主ボタン**: 「登録する」  
> **empty**: draft なし →「確認データが見つかりません」+ 入力へ戻る  
> **副次**: テンプレ保存 · 各チャンク編集 → input

---

## 2. UI 要素 → 設計 § 対照表

### 2.1 walkId `05ctx`

| UI 要素 | 設計 § | MUST/SHOULD |
|---------|--------|-------------|
| 見出し「何を観測しますか？」 | コンテキスト §2 ステップ① | MUST |
| 5 ドメインチップ | OBS-TGT-01 · §2 ステップ① | MUST |
| ステッパ ①②③ | §2 · §3 mock | MUST |
| 3 タブ（学名検索/質問/分類ツリー） | ADR-H-16 §4 · §2 ステップ② | MUST |
| 分類ツリー文字のみ | OBS-TGT-02 · §3 禁止 | MUST |
| 亜種ステータストグル | OBS-TGT-04 · §2 ステップ③ | MUST |
| 亜種未到達時 適用 disabled | §4 · OBS-TGT-04 | MUST |
| タグプレビュー | OBS-TGT-06 · §2 | SHOULD |
| 段階セグメント（生物） | §2 ステップ③ · ADR-H-16 §6 | SHOULD |
| 主 CTA「適用」1 つのみ | OBS-CTX-03 · §2 | MUST |
| 適用 → context 書込 + navigate 05i | OBS-CTX-01 · §5 | MUST |
| 文字のみ（画像なし） | OBS-TGT-02 | MUST |
| empty/loading/error | §4 · OBS-NF-04 | MUST |

### 2.2 walkId `05i`

| UI 要素 | 設計 § | MUST/SHOULD |
|---------|--------|-------------|
| パンくず「観測 › 計測入力」 | ui-copy-spec · 入力 v2 | MUST |
| 対象チップ（ctx プリフィル） | OBS-CTX-01 · 入力 §3.1 | MUST |
| 発育フェーズ DD（令 L1–L3） | ADR-H-16 §6 · 入力 §3.1 | MUST |
| 性別 DD + 角長分岐 | 入力UI v1 §4 · ADR-H-13 | MUST |
| 環境・設置 Card | OBS-RX-UX-04 · 入力 §3.2 | MUST |
| 次回観測 Card | OBS-RX-UX-10 · 入力 §3.3 | MUST |
| 計測行 4 コントロール | OBS-INPUT-01 · 入力 §3.4 | MUST |
| 写真 Card（選択/未登録） | 入力 §3.4 | MUST |
| 主 CTA「確認へ」（保存 terminal 禁止） | TRN v2 §1–§2 · OBS-RX-UX-03 | MUST |
| 確認へ → draft 永続 + 05confirm | TRN v2 §2 · DET §10 | MUST |
| ctx 再入で計測値保持 | 入力遷移 §0 | MUST |
| 副次「行を追加」outline | OBS-TPL-03 | MUST |
| empty/loading/error | OBS-NF-04 · 入力 §6 | MUST |

### 2.3 walkId `05confirm`

| UI 要素 | 設計 § | MUST/SHOULD |
|---------|--------|-------------|
| walkId 存在 `/s/05confirm` | TRN v2 §0 · checklist G1 | MUST |
| 見出し「登録前の確認」+ 1 行説明 | observation-confirm.md | MUST |
| 主 CTA「登録する」1 つ | OBS-RX-UX-03 · TRN §4 | MUST |
| 観測個体データサマリー | observation-confirm.md 表示要素 | MUST |
| 写真サマリー | 同上 | MUST |
| 環境・設置サマリー | OBS-RX-UX-04 | MUST |
| 次回観測サマリー | OBS-RX-UX-10 | MUST |
| 副次テンプレ保存 | OBS-TPL-18 | MUST |
| 編集リンク → 05i | TRN §4 | MUST |
| empty（draft なし） | observation-confirm.md 状態 | MUST |
| loading（登録中...） | observation-confirm.md | MUST |
| error + 再試行 | TRN §6 · OBS-RX-UX-09 | MUST |
| binding 差分サマリー | OBS-RX-UX-08 ver2 defer | SHOULD |
| 成功後 done/toast+ホーム | TRN §4 | SHOULD |

---

## 3. Pre-implementation gate（10 項目）

| # | 項目 | v1 |
|---|------|-----|
| 1 | 機能 UI doc § を verbatim 引用したか | ✅ §1 |
| 2 | 3 画面対照表（MUST 行）を埋めたか | ✅ §2 |
| 3 | TRN v2 主 CTA（確認へ/登録する）を確認したか | ✅ |
| 4 | agent invent 禁止（PT/保存 terminal）を確認したか | ✅ §0 |
| 5 | sessionStorage handoff 設計したか | ✅ `observation-draft-lab.ts` |
| 6 | 05confirm walkId を screens.json + screen-def に追加するか | ✅ Phase 2 |
| 7 | HOME キャリブレーション（過大採点防止）を引用したか | ✅ §0 · CAL v3-v4 |
| 8 | acceptance checklist 参照を明記したか | ✅ ヘッダ |
| 9 | apps/web 改変しないか | ✅ lab only |
| 10 | 既存 ObsRegistrationW2 salvage 方針か | ✅ ctx/iot 維持 · input/confirm 拡張 |

---

## 4. Lab draft キー

| キー | 用途 | 出典 |
|------|------|------|
| `ihl.observation.context.v1` | WorkflowContext（target + stage） | ADR-H-15 · コンテキスト §5 |
| `ihl.observation.draft.lab.v1` | 計測入力 draft（confirm 読取） | TRN v2 §2 · DET §10 |

---

## 5. テスト経路

```text
01（ホーム）→ 左ナビ「観測」または CTA → 05ctx
  → 〔適用〕→ 05i（対象チッププリフィル）
  → 値確認 · 〔確認へ〕→ 05confirm
  → 〔登録する〕→ toast + 01
```

---

*v1 · HOME 教訓適用 · confirm walkId 新規 · TRN v2 正本*
