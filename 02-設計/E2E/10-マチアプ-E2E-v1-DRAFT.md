# 10 マチアプ — E2E 設計 v1

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **REQ 正本**: `01-要件/10-マチアプ.md` · `ADR-H-02-matchapp-pairwise-preference.md`  
> **遷移正本**: `02-設計/features/10-マチアプ/遷移設計-v1.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に準拠  
> **スコープ注記**: ① おすすめ個体一覧（FR-MCH-REC-*）は post-ver1・Wave 2 以降実装予定。E2E は先行設計済み。  
> **更新日**: 2026-06-18 — FR-MCH-UX-01〜07 採用反映（progress chip · 理由 1 行 · 詳細リンク · おすすめに戻る · 空 CTA · pairwise ショートカット · N ラウンド収束）
> **シナリオ数**: 計 **17 シナリオ**（Happy Path 11 + UX 6 + Negative 4 ※一部 UX は Happy に統合）

---

## §1 — スコープと前提

### スコープ

| 対象 | 含む |
|------|------|
| エントリー遷移 | ナビ → `/match` → ① おすすめ個体一覧（有 / 空状態） |
| ① おすすめ一覧 | グリッド表示 · 理由 1 行 · 詳細リンク · ② pairwise 誘導 · progress chip |
| ② pairwise ループ | 2 枚提示 · left/right/neither/skip · おすすめに戻る · N ラウンド収束 |
| UX 共通 | progress chip · 空状態 CTA · `/match/pairwise` ショートカット |
| 収束 | converged 結果サマリ表示 |
| ValueCheck 詳細 | pairwise 中の詳細オーバーレイ（dimension_matrix） |
| エラー・例外 | 記録失敗 retry · 候補なし空状態 · 未ログイン導線 |

### スコープ外

- MatchApp SAMPLE データのみの PoC（`engine.ts` convergence 数式の単体テストは別）
- IHL tag_event_logger（別 repo）
- SwitchBot / IoT 実機
- Tier D 手動打鍵（人間のみ）
- ① カードのお気に入り / 保存アクション（post-v1 · 別 ADR）
- ③ マッチ結果画面本体（chip 第 3 段は muted のみ · post-v1）

### 前提条件（全シナリオ共通）

```
- test-user-match@ihl.local でログイン済み（エントリー・pairwise シナリオ）
- seed: preference_event 5 件以上（コサイン類似度が計算できる状態）
  ※ cold start シナリオ（SC-10-ENTRY-02）のみ preference_event = 0 件 seed
- seed: recommendation_candidates >= 3（おすすめ算出済み · mock）
- preference_event API は mock で 201 を返す
- 画像は mock CDN URL（本番 R2 不使用）
```

---

## §2 — RTM（REQ × Scenario）

| REQ ID | 内容（要約）| Scenario ID | Tier | ステータス |
|--------|------------|-------------|------|-----------|
| FR-MCH-REC-01 | エントリー遷移: `/match` → ① おすすめ一覧 | SC-10-ENTRY-01, SC-10-ENTRY-02 | B | DESIGNED |
| FR-MCH-REC-02 | おすすめグリッド表示（cosine 類似度 / 人気フォールバック） | SC-10-ENTRY-01, SC-10-REC-01 | B | DESIGNED |
| FR-MCH-REC-03 | pairwise 誘導ボタン（① → ②） | SC-10-REC-01 | B | DESIGNED |
| FR-MCH-REC-04 | 空状態 CTA「まず②で好みを教えて」 | SC-10-ENTRY-02, SC-10-NEG-02 | B | DESIGNED |
| FR-MCH-REC-05 | AI 仮定（cosine stub · post-v1 本番アルゴリズム） | SC-10-ENTRY-01（mock 確認）| B | DESIGNED |
| FR-MCH-REC-06 | 推薦理由 1 行（`mch-rec-reason`） | SC-10-UX-02 | B | DESIGNED |
| FR-MCH-REC-07 | 個体詳細 1 タップ（`mch-rec-detail-link`） | SC-10-UX-03 | B | DESIGNED |
| FR-MCH-UX-01 | progress chip（発見→精緻化→マッチ） | SC-10-UX-01, SC-10-ENTRY-01 | B | DESIGNED |
| FR-MCH-UX-02 | 推薦理由 1 行 | SC-10-UX-02 | B | DESIGNED |
| FR-MCH-UX-03 | 詳細 1 タップ | SC-10-UX-03 | B | DESIGNED |
| FR-MCH-UX-04 | おすすめに戻る（状態保持） | SC-10-UX-04 | B | DESIGNED |
| FR-MCH-UX-05 | 空状態 CTA | SC-10-ENTRY-02 | B | DESIGNED |
| FR-MCH-UX-06 | `/match/pairwise` ショートカット | SC-10-UX-05 | B | DESIGNED |
| FR-MCH-UX-07 | N ラウンド neither + 収束（N=10） | SC-10-UX-06, SC-10-PAIR-02 | B | DESIGNED |
| FR-MCH-PAIR-01 | 2 枚提示 · left/right 1 タップで記録 | SC-10-PAIR-01 | B | DESIGNED |
| FR-MCH-PAIR-02 | [どちらも×] 1 タップ（neither · `mch-pair-neither`） | SC-10-PAIR-02, SC-10-UX-06 | B | DESIGNED |
| FR-MCH-PAIR-03 | preference_event append-only | SC-10-PAIR-01, SC-10-PAIR-02, SC-10-PAIR-03 | B | DESIGNED |
| FR-MCH-PAIR-04 | `/match` は一般ユーザーの好み導線 | SC-10-ENTRY-01, SC-10-ENTRY-02 | B | DESIGNED |
| FR-MCH-PAIR-05 | N ラウンド上限収束（N=10 · `mch-pair-converged`） | SC-10-UX-06, SC-10-PAIR-03 | B | DESIGNED |
| NFR-MCH-02 | ValueCheck セッションは本人のみ（未ログイン禁止）| SC-10-NEG-01 | B | DESIGNED |
| NFR-MCH-04 | stub 明示（MatchApp はサンプルデータと分かる表示） | SC-10-ENTRY-01 | B | DESIGNED |

---

## §3 — シナリオ一覧

### カテゴリ別概要

| カテゴリ | シナリオ ID | 数 |
|---------|------------|-----|
| エントリー遷移 | SC-10-ENTRY-01, SC-10-ENTRY-02 | 2 |
| ① おすすめ一覧 → ② 遷移 | SC-10-REC-01 | 1 |
| UX（2026-06-18 採用） | SC-10-UX-01〜06 | 6 |
| ② pairwise 基本フロー | SC-10-PAIR-01, SC-10-PAIR-02 | 2 |
| ② pairwise 収束 | SC-10-PAIR-03 | 1 |
| ② ValueCheck 詳細オーバーレイ | SC-10-PAIR-04 | 1 |
| Negative | SC-10-NEG-01〜04 | 4 |
| **合計** | | **17** |

---

## §4 — エントリー遷移シナリオ

### SC-10-ENTRY-01: ナビ → /match → ① おすすめ個体一覧（通常 · preference_event あり）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-REC-01, FR-MCH-REC-02, FR-MCH-REC-05, FR-MCH-PAIR-04 |
| **Tier** | B |
| **前提条件** | ログイン済み · preference_event 5 件 seed 済み · recommendation_candidates 3 件 mock |
| **手順** | 1. ナビバーの「マチアプ」または `/match` を開く<br>2. progress chip（`mch-progress-chip`）が visible で「発見」段が active であることを確認<br>3. ① おすすめ個体一覧（`mch-rec-grid`）が表示されることを確認<br>4. 個体カードが 1 件以上表示されることを確認<br>5. 「好みをもっと精緻化する」ボタン（`mch-to-pairwise-btn`）が visible であることを確認 |
| **Assertion** | - `data-testid="mch-progress-chip"` が visible · step「発見」が active<br>- `data-testid="mch-rec-grid"` が visible<br>- `data-testid="mch-rec-card"` が 1 件以上 visible<br>- `data-testid="mch-to-pairwise-btn"` が visible かつ enabled<br>- `data-testid="mch-rec-empty"` が非表示<br>- ② pairwise 画面（`mch-pair-container`）が **即座に表示されない**（① が先） |
| **data-testid** | `mch-progress-chip`, `mch-rec-grid`, `mch-rec-card`, `mch-to-pairwise-btn` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-ENTRY-02: ナビ → /match → ① おすすめ空状態（cold start · preference_event なし）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-REC-01, FR-MCH-REC-04, FR-MCH-UX-05 |
| **Tier** | B |
| **前提条件** | ログイン済み · **preference_event = 0 件 seed** · recommendation_candidates = 0 件 |
| **手順** | 1. `/match` を開く<br>2. ① 空状態（`mch-rec-empty`）が表示されることを確認<br>3. 主 CTA「まず②で好みを教えて」（`mch-empty-to-pairwise`）が visible であることを確認<br>4. CTA をクリックし ② pairwise に遷移できることを確認 |
| **Assertion** | - `data-testid="mch-rec-empty"` が visible<br>- `data-testid="mch-empty-to-pairwise"` が visible かつ enabled（主 CTA）<br>- `data-testid="mch-rec-grid"` が非表示 または 0 件<br>- CTA クリック後: `data-testid="mch-pair-container"` が visible |
| **data-testid** | `mch-rec-empty`, `mch-empty-to-pairwise` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

## §5 — ① おすすめ一覧 → ② 遷移シナリオ

### SC-10-REC-01: 「好みをもっと精緻化する」ボタン → ② pairwise ループ開始

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-REC-03, FR-MCH-PAIR-01, FR-MCH-PAIR-04 |
| **Tier** | B |
| **前提条件** | SC-10-ENTRY-01 完了（① おすすめ一覧表示中）|
| **手順** | 1. ① 画面の「好みをもっと精緻化する」ボタン（`mch-to-pairwise-btn`）をクリック<br>2. ② pairwise ループ画面（`mch-pair-container`）に遷移することを確認<br>3. 2 枚の個体カードが表示されることを確認<br>4. [左を選ぶ] [右を選ぶ] [どちらも×] ボタンが表示されることを確認 |
| **Assertion** | - `data-testid="mch-pair-container"` が visible<br>- `data-testid="mch-progress-chip"` が visible · step「精緻化」が active<br>- `data-testid="mch-pair-left"` および `data-testid="mch-pair-right"` が visible<br>- `data-testid="mch-pair-btn-left"` · `data-testid="mch-pair-btn-right"` · `data-testid="mch-pair-neither"` が visible<br>- `data-testid="mch-rec-grid"` が非表示（② に切り替わっている）|
| **data-testid** | `mch-to-pairwise-btn`, `mch-progress-chip`, `mch-pair-container`, `mch-pair-left`, `mch-pair-right`, `mch-pair-btn-left`, `mch-pair-btn-right`, `mch-pair-neither` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

## §5.5 — UX シナリオ（2026-06-18 採用 · FR-MCH-UX-*）

### SC-10-UX-01: progress chip 表示（発見 → 精緻化 → マッチ）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-01 |
| **Tier** | B |
| **前提条件** | SC-10-ENTRY-01 完了（① 表示中）|
| **手順** | 1. `mch-progress-chip` が visible であることを確認<br>2. 「発見」段が active、「精緻化」「マッチ」が muted であることを確認<br>3. ② pairwise へ遷移後、「精緻化」段が active になることを確認 |
| **Assertion** | - `data-testid="mch-progress-chip"` が ① ② 両方で visible<br>- chip 内 step「発見」/「精緻化」の active 状態が画面に一致 |
| **data-testid** | `mch-progress-chip` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-UX-02: ① カード推薦理由 1 行

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-02, FR-MCH-REC-06 |
| **Tier** | B |
| **前提条件** | SC-10-ENTRY-01 完了 · mock に reason テキスト seed |
| **手順** | 1. ① カード内の `mch-rec-reason` が 1 件以上 visible であることを確認<br>2. 理由テキストが 1 行（改行なし · 80 文字以内）であることを確認 |
| **Assertion** | - `data-testid="mch-rec-reason"` が各カード内で visible<br>- テキストが空でない |
| **data-testid** | `mch-rec-reason` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-UX-03: ① カード → 個体詳細 1 タップ

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-03, FR-MCH-REC-07 |
| **Tier** | B |
| **前提条件** | SC-10-ENTRY-01 完了 |
| **手順** | 1. ① カードの `mch-rec-detail-link` をクリック<br>2. 観測 / 血統個体詳細ページへ遷移することを確認<br>3. ブラウザ戻るで ① に戻れることを確認 |
| **Assertion** | - `data-testid="mch-rec-detail-link"` が visible<br>- クリック後 URL が `/observation/` または `/lineage/` 系に変化<br>- 戻る後 `data-testid="mch-rec-grid"` が visible |
| **data-testid** | `mch-rec-detail-link` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-UX-04: ② 「おすすめに戻る」— 状態保持

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-04 |
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了 · pairwise 2 ラウンド実施済み |
| **手順** | 1. ② 画面の `mch-back-to-rec` をクリック<br>2. ① おすすめ一覧（`mch-rec-grid`）に戻ることを確認<br>3. 再度 ② pairwise へ遷移し、ラウンドカウンタが 2 のまま（リセットされない）ことを確認 |
| **Assertion** | - `data-testid="mch-back-to-rec"` が ② で visible<br>- 戻る後 `data-testid="mch-rec-grid"` が visible<br>- 再入場後ラウンド表示が **2/10** のまま（状態保持） |
| **data-testid** | `mch-back-to-rec` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-UX-05: リピートユーザー `/match/pairwise` 直アクセス

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-06 |
| **Tier** | B |
| **前提条件** | ログイン済み · **preference_event ≥ 1 件 seed**（リピートユーザー）|
| **手順** | 1. `/match/pairwise` を直接開く<br>2. ① をスキップして ② pairwise（`mch-pair-container`）が即表示されることを確認<br>3. **初回ユーザー**（preference_event = 0）で `/match/pairwise` を開き `/match` へリダイレクトされることを確認 |
| **Assertion** | - リピート: `data-testid="mch-pair-container"` が visible · `mch-rec-grid` 非表示<br>- 初回: URL が `/match` にリダイレクト |
| **data-testid** | `mch-pair-container` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-UX-06: N ラウンド neither + 収束メッセージ（N=10）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-UX-07, FR-MCH-PAIR-05 |
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了 · mock が N=10 到達で `converged: true` を返す |
| **手順** | 1. [どちらも×]（`mch-pair-neither`）を含む選択を 10 ラウンド繰り返す<br>2. 10 回目後 `mch-pair-converged` バナーが visible になることを確認<br>3. 収束サマリ（`mch-converged`）へ遷移することを確認 |
| **Assertion** | - `data-testid="mch-pair-neither"` で `choice=neither` が POST される<br>- 10 ラウンド後 `data-testid="mch-pair-converged"` が visible<br>- `data-testid="mch-converged"` が visible |
| **data-testid** | `mch-pair-neither`, `mch-pair-converged`, `mch-converged` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

## §6 — ② pairwise 評価シナリオ

### SC-10-PAIR-01: pairwise 基本フロー（left 選択 · preference_event 記録）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-PAIR-01, FR-MCH-PAIR-03 |
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了（② pairwise 表示中）|
| **手順** | 1. [左を選ぶ] ボタン（`mch-pair-btn-left`）をクリック<br>2. `preference_event` POST リクエストが発行されることを確認（`kind=pairwise_choice, choice=left`）<br>3. 次のペアが表示されることを確認（自動遷移）<br>4. 同様に [右を選ぶ] で `choice=right` の記録を確認 |
| **Assertion** | - POST `/api/preference-event` に `{ kind: "pairwise_choice", choice: "left" }` が含まれる<br>- レスポンス 201（mock）<br>- `data-testid="mch-pair-left"` の asset_id が次ラウンドで変わる（新ペア提示）<br>- 楽観的 UI: ボタンクリック後即座に次ペアへ遷移（ローディングなし）|
| **data-testid** | `mch-pair-btn-left`, `mch-pair-btn-right`, `mch-pair-left`, `mch-pair-right` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-PAIR-02: pairwise [どちらも×]（neither · preference_event 記録）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-PAIR-02, FR-MCH-PAIR-03 |
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了（② pairwise 表示中）|
| **手順** | 1. [どちらも×] ボタン（`mch-pair-neither`）をクリック<br>2. `preference_event` POST に `choice=neither` が含まれることを確認<br>3. 次のペアが表示されることを確認 |
| **Assertion** | - POST `/api/preference-event` に `{ kind: "pairwise_choice", choice: "neither" }` が含まれる<br>- レスポンス 201<br>- 次ペアが表示される（neither も正常ラウンドとして N カウントに含む）|
| **data-testid** | `mch-pair-neither` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-PAIR-03: pairwise 収束 → 結果サマリ

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-PAIR-01, FR-MCH-PAIR-03, FR-MCH-PAIR-05（収束フロー）|
| **Tier** | B |
| **前提条件** | ② pairwise 表示中 · **mock を converge=true で返す**（N=10 到達 or アルゴリズム収束）|
| **手順** | 1. pairwise を mock 収束条件まで繰り返す<br>2. `mch-pair-converged` バナーが表示されることを確認<br>3. 収束状態（`mch-converged`）に遷移することを確認<br>4. 結果サマリ（推定 prefer / avoid 特徴 · 収束度 · 寄与イベント数）が表示されることを確認 |
| **Assertion** | - `data-testid="mch-pair-converged"` が visible（N 到達時）<br>- `data-testid="mch-converged"` が visible<br>- `data-testid="mch-result-prefer"` · `mch-result-avoid` が visible |
| **data-testid** | `mch-pair-converged`, `mch-converged`, `mch-result-prefer`, `mch-result-avoid`, `mch-continue-btn`, `mch-apply-search-btn` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-PAIR-04: pairwise 中の ValueCheck 詳細オーバーレイ

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-01〜09（ValueCheck · dimension_matrix）|
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了（② pairwise 表示中）|
| **手順** | 1. 「詳しく」ボタン（`mch-pair-btn-detail`）をクリック<br>2. ValueCheck 詳細オーバーレイ（`mch-valuecheck-overlay`）が表示されることを確認<br>3. 次元（size / horn / color 等）を ×/−/◯ で入力<br>4. 総合 fit（yes/maybe/no）を選択して送信<br>5. `preference_event` POST に `kind=dimension_matrix` が含まれることを確認<br>6. オーバーレイが閉じて ② pairwise 本線（次ペア）に戻ることを確認 |
| **Assertion** | - `data-testid="mch-valuecheck-overlay"` が visible<br>- POST `/api/preference-event` に `{ kind: "dimension_matrix" }` が含まれる<br>- POST `/api/value-check/sessions` が 201<br>- オーバーレイ閉じ後: `data-testid="mch-pair-container"` が visible（本線継続）|
| **data-testid** | `mch-pair-btn-detail`, `mch-valuecheck-overlay`, `mch-vc-cell-*`, `mch-vc-submit` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

## §7 — Negative シナリオ

### SC-10-NEG-01: 未ログイン → /match アクセス → ログイン誘導

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-MCH-02（プライバシー · 本人 JWT のみ）|
| **Tier** | B |
| **前提条件** | **未ログイン状態** |
| **手順** | 1. `/match` を直接開く<br>2. ログイン誘導画面またはリダイレクトが発生することを確認 |
| **Assertion** | - `data-testid="mch-rec-grid"` が非表示（おすすめ一覧が表示されない）<br>- ログイン誘導テキストまたは `/login` へのリダイレクト |
| **data-testid** | `mch-login-prompt` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-NEG-02: ① おすすめ 0 件 · ② pairwise 誘導確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-REC-04 |
| **Tier** | B |
| **前提条件** | ログイン済み · recommendation_candidates = 0 件 mock |
| **手順** | 1. `/match` を開く<br>2. 空状態（`mch-rec-empty`）が表示される<br>3. 空状態の誘導ボタンから ② pairwise に遷移できることを確認 |
| **Assertion** | - `data-testid="mch-rec-empty"` が visible<br>- `data-testid="mch-to-pairwise-btn"` が空状態内にも visible |
| **data-testid** | `mch-rec-empty`, `mch-to-pairwise-btn` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-NEG-03: pairwise 記録失敗 → retry

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-PAIR-03（append-only · エラーハンドリング）|
| **Tier** | B |
| **前提条件** | SC-10-REC-01 完了 · **mock を 500 で返す（1 回目のみ）** |
| **手順** | 1. [左を選ぶ] をクリック<br>2. API エラー（500）が発生し、トースト / エラー表示が出ることを確認<br>3. 「再試行」ボタンで同じ `preference_event` を再送できることを確認<br>4. 再送成功後に次ペアへ遷移することを確認 |
| **Assertion** | - `data-testid="mch-record-error-toast"` が visible（エラー通知）<br>- `data-testid="mch-retry-btn"` が visible<br>- 再試行後: POST が 201 → 次ペアへ遷移<br>- 楽観的 UI のロールバック（ボタンが再度押せる状態に戻る）|
| **data-testid** | `mch-record-error-toast`, `mch-retry-btn` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

### SC-10-NEG-04: pairwise 候補なし → empty 状態

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MCH-PAIR-01（`load → empty` 遷移）|
| **Tier** | B |
| **前提条件** | ② pairwise 開始 · **capture candidates = 0（mock）** |
| **手順** | 1. ② pairwise を開始する<br>2. 候補なし状態（`mch-pair-empty`）が表示されることを確認<br>3. 観測導線への案内テキスト・ボタンが表示されることを確認 |
| **Assertion** | - `data-testid="mch-pair-empty"` が visible<br>- `data-testid="mch-pair-container"` が非表示<br>- 「まだ評価できる個体がありません」等の説明テキスト visible |
| **data-testid** | `mch-pair-empty` |
| **CI job** | `npx playwright test --project=match-e2e` |

---

## §8 — シナリオ × ユーザーシナリオ 対応表（gap 確認）

> **ユーザー指定シナリオ**: ①「Nav → おすすめ個体一覧表示」· ②「ボタン → pairwise で好み精緻化」

| ユーザーシナリオ要素 | 対応 E2E Scenario | ステータス |
|---------------------|-------------------|------------|
| Nav → `/match` 遷移 | SC-10-ENTRY-01 | ✓ DESIGNED |
| ① おすすめ一覧表示（preference_event あり）| SC-10-ENTRY-01, SC-10-REC-01 | ✓ DESIGNED |
| ① → ② ボタン遷移 | SC-10-REC-01 | ✓ DESIGNED |
| ② pairwise left/right | SC-10-PAIR-01 | ✓ DESIGNED |
| ② pairwise neither | SC-10-PAIR-02 | ✓ DESIGNED |
| ② 収束 · 結果サマリ | SC-10-PAIR-03 | ✓ DESIGNED |
| cold start（① 空状態 · CTA）| SC-10-ENTRY-02, SC-10-NEG-02 | ✓ DESIGNED |
| 未ログイン保護 | SC-10-NEG-01 | ✓ DESIGNED |
| pairwise 候補なし | SC-10-NEG-04 | ✓ DESIGNED |
| プログレス chip（発見→精緻化→マッチ）| SC-10-UX-01 | ✓ DESIGNED |
| 推薦理由 1 行 | SC-10-UX-02 | ✓ DESIGNED |
| 個体カード → 個体詳細リンク | SC-10-UX-03 | ✓ DESIGNED |
| ② → ① バック遷移（状態保持）| SC-10-UX-04 | ✓ DESIGNED |
| `/match/pairwise` ショートカット | SC-10-UX-05 | ✓ DESIGNED |
| N ラウンド neither + 収束 | SC-10-UX-06, SC-10-PAIR-02 | ✓ DESIGNED |
| お気に入り / 保存アクション | **未設計（post-v1）** | DEFERRED — 別 ADR |
| ③ マッチ結果画面 | **未設計（post-v1）** | DEFERRED — chip 第 3 段 muted のみ |

---

## §9 — 実装注意（post-v1 · AI 仮定）

| 項目 | v1 実装 | post-v1 |
|------|---------|---------|
| おすすめアルゴリズム | cosine similarity stub（mock） | 協調フィルタリング（別 ADR） |
| cold start fallback | 人気 / 新着順 | preference_event 蓄積後に自動切替 |
| 1 画面あたり推奨カード数 | **3〜5 件（v1 仮定）**（§設計レビュー §B.5 参照） | ユーザーテスト後に調整 |
| pairwise 収束判定 | mock フラグ · N=10 上限（FR-MCH-UX-07） | `engine.ts` convergence 数式（詳細設計 §5） |
| progress chip 第 3 段 | muted 表示のみ | ③ マッチ結果画面（post-v1） |

---

*DRAFT v1 · 非正本 / 人間レビュー用 / 実装禁止ゲート有効*
