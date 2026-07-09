# 10 好み学習 — LAB Design Note v1

> **日付**: 2026-07-06  
> **walkId**: `10` · route `/match`  
> **Oracle**: [`05-検索-PREFERENCE-FIRST-v1.md`](./05-検索-PREFERENCE-FIRST-v1.md) · [`10-マチアプ/ui/UI設計-v1.md`](../../02-設計/features/10-マチアプ/ui/UI設計-v1.md) · ADR-H-02  
> **実装**: `apps/ui-parts-lab-w2/src/w2/PreferenceLearningW2.tsx`

---

## 0. 結論

| 項目 | 判定 |
|------|------|
| v1 スコープ | ① おすすめ一覧 → ② pairwise（10 回）→ 収束サマリ → 〔検索に反映〕 |
| W2 override | **必須** — catalog scaffold は UI 投票用 · 本番好み導線ではない |
| 05a 連携 | `localStorage.preference_profile_mock` — 05a は mount 時に読み込み |
| 重複 HOME | **W2GlobalChrome のみ** — ページ内・withW2Shell フッタの HOME 禁止 |

---

## 1. 画面状態（1 主 CTA / 状態）

| 状態 | 主 CTA | 副次 |
|------|--------|------|
| `recommend`（cold） | 〔まず②で好みを教えて〕 | プレビュー帯 |
| `recommend`（学習済） | 〔好みをもっと精緻化する〕 | おすすめカード 3 件 · 詳細 ▸ |
| `pairwise` | 〔左〕〔右〕（対称・大） | どちらも × · おすすめに戻る |
| `converged` | 〔検索に反映〕→ `05a` | 続ける · 収束度バー |

---

## 2. lab 契約（05a 向け）

```typescript
// localStorage key（正本）
preference_profile_mock = {
  prefer: string[];      // 表示用ラベル要約（大型・太い角 等）
  avoid: string[];
  vector: {              // FR-MCH-REC-05 contribution vectors（lab 主 rerank）
    body_length_mm?: { target: number; direction: "gte"|"lte"|"near" };
    horn_length_mm?: { target: number; direction: "gte"|"lte"|"near" };
    black_ratio?: { target: number; direction: "gte"|"lte"|"near" };  // 0–1
    price_tier?: { target: number; direction: "gte"|"lte"|"near" };   // 1=low … 3=high
    availability?: { target: number; direction: "gte"|"lte"|"near" };
  };
  confidence: number;
  voteCount: number;
  summaryLine: string;   // 1 行 · 数値要約（例: 体長78mm・角長52mm・黒率82%を好む）
  updatedAt: string;
}
```

> **v1.1（2026-07-06）**: 旧 lab は `prefer` ラベルのみで tag-overlap rerank — **設計（FR-MCH-REC-05 · 詳細設計 §4）の contribution vectors との乖離**。本版で `vector` を正とし、ラベルは表示補助に降格。

| sessionStorage | 用途 |
|----------------|------|
| `ihl.preference_session.v1` | ラウンド · votes · valueChecks · usedPairKeys |
| `ihl.preference_lab.phase.v1` | recommend / pairwise / converged |

### 2.1 ペア選択契約（lab · uncertainty）

| 項目 | 内容 |
|------|------|
| 母集団 | `MOCK_SPECIMENS` 18 件（`body_length_mm` · `horn_length_mm` · 色 · 視点メタ付き） |
| 戦略 | `uncertainty` — 各次元の不確実度が最大の軸で **1 次元だけ差分** のペアを優先 |
| 優先順 | 同率時 **size → horn → color**（要件: size → horn → color） |
| 重複回避 | `usedPairKeys`（session 内 · 正規化 id ペア） |
| フォールバック | 単一差分ペアが尽きたら任意 2 件 · 全使用時は先頭ペアを再利用 |
| 記録 | 各 vote に `leftId` / `rightId` · profile は `buildProfileFromSession` で再生成 |

### 2.2 ValueCheck 契約（lab · FR-MCH-01〜03）

| 項目 | 内容 |
|------|------|
| テンプレ | `valuecheck_default_v1` — size / horn / color / price / availability |
| セル | `x` / `minus` / `circle` / `null`（skip） |
| 総合 | `no` / `maybe` / `yes`（送信必須） |
| 保存先 | `session.valueChecks[]`（dimension_matrix · 本番は Truth 非永続） |
| profile 重み | ValueCheck 次元は pairwise の **1.5×** で `prefer`/`avoid` に反映 |
| UI | pairwise 副次「詳しく ▸」→ モーダル · 送信後も pairwise 本線継続 |

**05a 読み取り**: `localStorage.getItem("preference_profile_mock")` → `vector` で mock capture を数値近接 reorder（ラベル fallback あり）。

---

## 3. チェックリスト（W2 lab）

- [x] W2 専用 `PreferenceLearningW2`（catalog scaffold 不使用）
- [x] progress chip（発見 → 精緻化 → マッチ muted）
- [x] pairwise 10 ラウンド収束
- [x] 収束サマリ + 〔検索に反映〕
- [x] `preference_profile_mock` を localStorage へ書込
- [x] プレビュー帯（並びイメージ）
- [x] サンプルデータ表示（NFR-MCH-04）
- [x] テキスト優先カード（18 標本 · mm/角/色/視点）
- [x] uncertainty ペア選択（size→horn→color · 単一次元差分）
- [x] ValueCheck オーバーレイ（valuecheck_default_v1 · session 保存）
- [x] ValueCheck 重み付き profile 集計
- [x] 数値ベクトル `vector` 集計（pairwise + ValueCheck → centroid + direction）
- [x] 05a 数値フィルタ UI（好み条件（数値）· スライダー · 以上/以下/付近）
- [ ] 05a 好み近い順（別タスク · 本 note の消費側）→ **vector rerank 実装済**

---

## 4. テスト導線

```text
/s/10                           — cold start · おすすめ空
/s/10                           — pairwise 10 回 → 収束
/s/10 → 検索に反映              — /s/05a へ（profile 保持確認）
localStorage preference_profile_mock — DevTools で確認
```

> dev server: **http://localhost:3101**（`vite.config.ts` strictPort）  
> ユーザー報告 port 3001 は別プロセスの可能性あり — 正本は 3101。

---

## 5. 設計 doc 追随 TODO（本番前）

- [ ] `10-マチアプ-遷移設計-v1` — lab phase と本番 state 名の対応表
- [ ] `05-検索-LAB-DESIGN-NOTE` §3.6 — 05a 実装時に profile 帯追加
- [ ] boost 重み ADR（好み rerank · H-05 待ち）

---

*v1 · W2 lab oracle · 05a preference-first の前提画面*
