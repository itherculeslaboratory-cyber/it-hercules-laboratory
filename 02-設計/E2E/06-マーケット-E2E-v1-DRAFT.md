# 06 — マーケット E2E 設計 v1

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **REQ 正本**: `01-要件/06-マーケット.md` · `01-要件/06-マーケット-取引方式-v1.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う  
> **シナリオ数**: 計 **17 シナリオ**（Happy Path 10 + Negative 7）

---

## §1 — スコープと前提

### スコープ

| 対象 | 含む |
|------|------|
| 出品チャネル | 固定価格 · オークション · 抽選(TX-LOTTERY) · プラチナコイン順(TX-PLATINUM-PRIORITY) · テンプレ市場 |
| 取引ステージ | Stage 0（マッチング前）· Stage 1（P2P ボード）· Stage 2（配送完了）· Stage 3（取引成立）|
| Engagement | Q&A · 称賛 · 未出品オファー |
| 8% 貢献費 | 取引成立後の振込案内表示 |
| Negative | 不正遷移 · 代金未払い · 入力バリデーション |

### スコープ外（本 E2E 文書では扱わない）

- GMO 本番 Webhook（mock のみ · 人間ゲート）
- 宅配便匿名配送（v1 不採用）
- Kernel 経由完全寄せ（MVP ギャップ）
- Tier D 手動打鍵（人間のみ）

### 前提条件（全シナリオ共通）

```
- テスト用ユーザー test-user-mkt@ihl.local でログイン済み
- seed: chunk_id=test-chunk-e2e-001（固定価格出品用）
- seed: chunk_id=test-chunk-e2e-002（オークション出品用）
- seed: chunk_id=test-chunk-e2e-003（抽選出品用）
- seed: chunk_id=test-chunk-e2e-004（プラチナコイン順出品用）
- R2 INSERT は E2E バケット（it-hercules-laboratory-e2e）に書く
- GMO Webhook は Playwright mock で intercepte
```

---

## §2 — RTM（REQ × Scenario）

| REQ ID | 内容（要約）| Scenario ID | Tier | ステータス |
|--------|------------|-------------|------|-----------|
| FR-MKT-01 | 三チャネル分離管理 | SC-06-BROWSE-01 | B | DESIGNED |
| FR-MKT-02 | Listing 状態機械・不正遷移 409 | SC-06-NEG-01 | B | DESIGNED |
| FR-MKT-03 | 現在状態はイベント列末尾 | SC-06-BROWSE-01 | B | DESIGNED |
| FR-MKT-04 | オークション open/settled | SC-06-AUC-01, SC-06-AUC-02 | B | DESIGNED |
| FR-MKT-05 | Engagement（Q&A・称賛）| SC-06-ENG-01 | B | DESIGNED |
| FR-MKT-07 | 8% 積立・取引成立後振込案内 | SC-06-TRADE-04 | B | DESIGNED |
| FR-MKT-13 | 取引成立判定（配送完了 + 評価）| SC-06-TRADE-03, SC-06-TRADE-04 | B | DESIGNED |
| FR-MKT-14 | 抽選出品 TX-LOTTERY | SC-06-LOT-01, SC-06-LOT-02 | B | DESIGNED |
| FR-MKT-15 | プラチナコイン順 TX-PLATINUM-PRIORITY | SC-06-PRI-01 | B | DESIGNED |
| FR-MKT-08 | 住所非保持・局留めヒント | SC-06-TRADE-02 | B | DESIGNED |
| FR-MKT-11 | 公開取引ログ | SC-06-TRADE-04 | B | DESIGNED |
| FR-MKT-12 | UI ルート群（browse タブ全チャネル）| SC-06-BROWSE-01 | A | DESIGNED |
| NFR-MKT-02 | INSERT ONLY | 全シナリオ共通 assert | B | DESIGNED |
| NFR-MKT-03 | 認可（requireMarketListingStateWrite）| SC-06-NEG-02 | B | DESIGNED |
| Y02 解決 | 代金未払い 2 週間タイムアウト | SC-06-NEG-03 | B | DESIGNED |
| Y08 解決 | 報復評価・タグ+理由必須 | SC-06-NEG-04 | B | DESIGNED |

---

## §3 — シナリオ一覧

### カテゴリ別概要

| カテゴリ | シナリオ ID | 数 |
|---------|------------|-----|
| ブラウズ・フィルタ | SC-06-BROWSE-01 | 1 |
| 固定価格取引フロー | SC-06-FIXED-01, SC-06-TRADE-01〜04 | 5 |
| オークション | SC-06-AUC-01〜02 | 2 |
| 抽選（TX-LOTTERY）| SC-06-LOT-01〜02 | 2 |
| プラチナコイン順 | SC-06-PRI-01 | 1 |
| テンプレ市場 | SC-06-TMPL-01 | 1 |
| Engagement | SC-06-ENG-01 | 1 |
| Negative | SC-06-NEG-01〜04 | 4 |
| **合計** | | **17** |

---

## §4 — ブラウズ・フィルタシナリオ

### SC-06-BROWSE-01: マーケット一覧・全チャネルタブ表示

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-01, FR-MKT-12 |
| **Tier** | A（route-matrix 兼）|
| **前提条件** | 未ログインでも閲覧可（公開ページ）|
| **手順** | 1. `/market` を開く<br>2. ブラウズタブ（出品 / オークション / 抽選 / 優先順 / テンプレ）を確認<br>3. 各タブをクリックしてコンテンツ切り替えを確認<br>4. 空状態の場合は EmptyState が表示されることを確認 |
| **Assertion** | - `data-testid="mkt-browse-tab-fixed"` visible<br>- `data-testid="mkt-browse-tab-auction"` visible<br>- `data-testid="mkt-browse-tab-lottery"` visible<br>- `data-testid="mkt-browse-tab-priority"` visible<br>- `data-testid="mkt-browse-tab-template"` visible<br>- 各タブ切り替えで URL が `/market?channel=auction` 等に変わる<br>- 空状態では `data-testid="mkt-empty-state"` visible |
| **Negative Branch** | なし（リスト取得失敗 → ErrorBoundary + 「再読み込み」ボタン）|
| **data-testid** | `mkt-browse-tab-*`, `mkt-listing-card`, `mkt-empty-state` |
| **CI job** | `npx playwright test --project=route-matrix` |

---

## §5 — 固定価格取引フロー

### SC-06-FIXED-01: 固定価格出品作成

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-01, FR-MKT-02, FR-MKT-12 |
| **Tier** | B |
| **前提条件** | ログイン済み · 出品権限あり（`requireMarketListingStateWrite`）|
| **手順** | 1. `/market/new` を開く<br>2. chunk を選択（test-chunk-e2e-001）<br>3. チャネル「固定価格」を選択（`data-testid="mkt-listing-channel-fixed"`）<br>4. 価格を入力（例: 3000）<br>5. 「出品する」ボタンをクリック<br>6. 状態が `listed_fixed_price` になったことを確認 |
| **Assertion** | - 出品後に `/market/listing/{id}` にリダイレクト<br>- `data-testid="mkt-listing-status"` に「出品中」表示<br>- POST `/api/market/listing-state/transition` が 200<br>- レスポンス `to_state === "listed_fixed_price"` |
| **Negative Branch** | 価格 0 → バリデーションエラー表示（`data-testid="mkt-price-error"`）|
| **data-testid** | `mkt-listing-channel-fixed`, `mkt-price-input`, `mkt-listing-submit`, `mkt-listing-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-TRADE-01: 固定価格マッチング（Stage 0 → Stage 1）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-02, FR-MKT-03, FR-MKT-06, §11.0 Stage 1 |
| **Tier** | B |
| **前提条件** | SC-06-FIXED-01 完了 · 別ユーザー（buyer）でログイン |
| **手順** | 1. `/market/listing/{id}` を開く<br>2. 「購入する」ボタンをクリック（`data-testid="mkt-buy-btn"`）<br>3. 確認画面で「確定」をクリック<br>4. プライベートボードに遷移することを確認 |
| **Assertion** | - `/market/trade/{trade_id}` にリダイレクト<br>- `data-testid="mkt-private-board"` visible<br>- `data-testid="mkt-trade-stage"` に「Stage 1：取引中」表示<br>- 第三者からアクセス不可（403 確認）|
| **Negative Branch** | 在庫なし（既に sold）→ 「この商品は既に売り切れです」表示 |
| **data-testid** | `mkt-buy-btn`, `mkt-private-board`, `mkt-trade-stage` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-TRADE-02: Stage 1 P2P ボード（振込・発送調整）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | §11.0 Stage 1, FR-MKT-08 |
| **Tier** | B |
| **前提条件** | SC-06-TRADE-01 完了 · プライベートボードを開いている |
| **手順** | 1. `/market/trade/{trade_id}` を開く（出品者）<br>2. 振込案内を確認（振込コード `U-XXXX` 形式）<br>3. 局留めヒントリンクが表示されることを確認<br>4. 「発送完了」を報告する（`data-testid="mkt-ship-done-btn"`）|
| **Assertion** | - 振込コードが `U-[A-Z0-9]{4,6}` 形式で表示<br>- 局留めリンクが外部 URL で `rel="noopener"` 設定<br>- 「発送完了」後に Stage 2 ステータスが表示<br>- 住所フィールドが UI に存在しない（非保持原則） |
| **Negative Branch** | 2 週間タイムアウトは SC-06-NEG-03 で検証 |
| **data-testid** | `mkt-transfer-code`, `mkt-post-office-hint`, `mkt-ship-done-btn`, `mkt-trade-stage` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-TRADE-03: Stage 2 → Stage 3（受取確認・評価→取引成立）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-13, §11.0.1 取引成立判定 |
| **Tier** | B |
| **前提条件** | SC-06-TRADE-02 完了（発送完了報告済み）· 買い手ユーザーでログイン |
| **手順** | 1. `/market/trade/{trade_id}` を開く（買い手）<br>2. 「荷物届きました」ボタンをクリック（`data-testid="mkt-receive-confirm-btn"`）<br>3. Stage 2 ステータスになることを確認<br>4. 評価フォームを入力（「良い」を選択）<br>5. 「評価を確定」をクリック（`data-testid="mkt-rate-submit-btn"`）<br>6. Stage 3（取引成立）になることを確認 |
| **Assertion** | - `data-testid="mkt-trade-stage"` に「取引成立」表示<br>- trade-event に `allocation_completed` 相当のイベントが append<br>- 売り手側に「8% 貢献費振込案内」が表示 |
| **Negative Branch** | 評価なし 1 ヶ月後 → 自動「評価:良い」（mock timer で検証）|
| **data-testid** | `mkt-receive-confirm-btn`, `mkt-rate-form`, `mkt-rate-submit-btn`, `mkt-trade-stage` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-TRADE-04: 8% 貢献費振込案内表示（取引成立後）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-07, §11.7, §11.7.3 |
| **Tier** | B |
| **前提条件** | SC-06-TRADE-03 完了（取引成立）· 出品者でログイン |
| **手順** | 1. `/market/trade/{trade_id}` または マイページを開く<br>2. 8% 振込案内プロンプトを確認<br>3. 振込先（GMO VA）· 金額 · 振込コードが表示されることを確認<br>4. 公開取引ログ（trade-events）に fee_unpaid イベントが存在することを確認 |
| **Assertion** | - `data-testid="mkt-fee-prompt"` visible<br>- 振込コード `U-[A-Z0-9]{4,6}` が表示<br>- 金額が「成約額 × 8%」で正しい<br>- `GET /api/market/trade-events` に `type: "fee_unpaid"` イベントが存在<br>- マッチング直後（Stage 1）には振込案内が表示されない |
| **Negative Branch** | 全額入金後 → `data-testid="mkt-fee-paid"` が表示（fee_unpaid 停止）|
| **data-testid** | `mkt-fee-prompt`, `mkt-fee-amount`, `mkt-transfer-code`, `mkt-fee-paid` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §6 — オークションシナリオ

### SC-06-AUC-01: オークション入札〜落札（settleDueAuctions）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-04, FR-MKT-02 |
| **Tier** | B |
| **前提条件** | chunk_id=test-chunk-e2e-002 が `auction.open` 状態 · 買い手ユーザーでログイン |
| **手順** | 1. `/market?channel=auction` を開く<br>2. test-chunk-e2e-002 の詳細を開く<br>3. 入札金額を入力（現在最高額 +100 以上）<br>4. 「入札する」ボタンをクリック（`data-testid="mkt-bid-submit"`）<br>5. 入札完了通知を確認<br>6. `ends_at` 経過（mock timer）後に `settleDueAuctions` が実行<br>7. ステータスが `settled` になり、落札者・落札額が確定することを確認 |
| **Assertion** | - 入札後 `data-testid="mkt-bid-current"` が更新される<br>- `settleDueAuctions` 後: `data-testid="mkt-auction-status"` に「落札済み」表示<br>- 落札者に「取引を開始する」ボタンが表示（→ Stage 1）<br>- POST `/api/market/auction/bid` が 200<br>- 入札なし締切 → `settled` + 「落札者なし」表示 |
| **Negative Branch** | 入札額が現在最高額以下 → `data-testid="mkt-bid-error"` に「入札額が不足しています」|
| **data-testid** | `mkt-bid-input`, `mkt-bid-submit`, `mkt-bid-current`, `mkt-auction-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-AUC-02: オークション落札後 P2P 取引フロー

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-04, §11.0 Stage 1 |
| **Tier** | B |
| **前提条件** | SC-06-AUC-01 完了（settled 状態）|
| **手順** | 1. 落札者として `/market/trade/{trade_id}` を開く<br>2. プライベートボードが表示されることを確認<br>3. 以降は SC-06-TRADE-02〜04 と同フロー |
| **Assertion** | - `data-testid="mkt-private-board"` visible<br>- trade_type が `auction` として記録されている |
| **Negative Branch** | オークション `open` 中に状態遷移（`listed_*` 以外）→ 409 エラー |
| **data-testid** | SC-06-TRADE-02 と共通 |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §7 — 抽選（TX-LOTTERY）シナリオ

### SC-06-LOT-01: 抽選出品・応募フロー

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-14, `06-マーケット-取引方式-v1.md` §3.6 |
| **Tier** | B |
| **前提条件** | chunk_id=test-chunk-e2e-003 が `listed_lottery`→`lottery.open` 状態 |
| **手順** | 1. `/market?channel=lottery` を開く<br>2. test-chunk-e2e-003 の詳細を開く<br>3. 「抽選に応募する」ボタンをクリック（`data-testid="mkt-lottery-apply"`）<br>4. 応募完了メッセージを確認<br>5. 同一ユーザーが再応募 → 409 エラーを確認 |
| **Assertion** | - 応募後 `data-testid="mkt-lottery-status"` に「応募済み」表示<br>- POST `/api/market/lottery/apply` が 200<br>- 再応募 → 409「すでに応募済みです」<br>- Coin/PT で当選率が変化しないこと（確率表示に Coin 影響なし）|
| **Negative Branch** | 応募期間外 → 「応募期間は終了しました」表示 |
| **data-testid** | `mkt-lottery-apply`, `mkt-lottery-status`, `mkt-lottery-deadline` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-LOT-02: 抽選確定（均等乱数・当選者通知）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-14（`ends_at` 経過後 CSPRNG 当選）|
| **Tier** | B |
| **前提条件** | SC-06-LOT-01 完了 · mock timer で ends_at を経過させる |
| **手順** | 1. `ends_at` を mock timer で経過<br>2. バッチ処理（`settleLotteries`）を実行（mock）<br>3. 当選者ユーザーで `/market/listing/{id}` を確認<br>4. 落選者ユーザーで確認 |
| **Assertion** | - 当選者: `data-testid="mkt-lottery-won"` visible · 「取引を開始する」ボタン表示<br>- 落選者: `data-testid="mkt-lottery-lost"` visible · 「落選しました」表示<br>- Listing state が `sold` に遷移<br>- trade-events に `allocation_completed` イベントが存在 |
| **Negative Branch** | 応募者 0 名で締切 → 「当選者なし」で `delisted` に遷移 |
| **data-testid** | `mkt-lottery-won`, `mkt-lottery-lost`, `mkt-listing-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §8 — プラチナコイン順（TX-PLATINUM-PRIORITY）シナリオ

### SC-06-PRI-01: プラチナコイン順・申込と確定

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-15, `06-マーケット-取引方式-v1.md` §3.7, PlatinumCoinRules §17 |
| **Tier** | B |
| **前提条件** | chunk_id=test-chunk-e2e-004 が `listed_priority`→`priority.open` · 複数ユーザー（Coin 数異なる）を seed |
| **手順** | 1. `/market?channel=priority` を開く<br>2. 申込時に「自分の累計 Coin と順位帯」のみ表示されることを確認<br>3. 「申し込む」をクリック（`data-testid="mkt-priority-apply"`）<br>4. `closes_at` を mock timer で経過<br>5. `settlePriority` 実行後に Coin 降順で定員内が確定<br>6. 確定者・落選者の表示を確認 |
| **Assertion** | - 申込時: 自分の Coin 数と「現在 N 位帯」が表示（他者の Coin 数は非表示）<br>- 確定後: Coin 上位 K 名が当選<br>- Pay To Win でないこと: PT を使っても Coin ランクが変わらない<br>- 確定時に「順位表スナップショット ID」が trade-events に記録<br>- Coin 同点: `created_at` 昇順（先着）で決定（※人間レビュー待ち）|
| **Negative Branch** | 申込期間外 → 「申込期間は終了しました」|
| **data-testid** | `mkt-priority-apply`, `mkt-priority-my-rank`, `mkt-priority-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §9 — テンプレ市場シナリオ

### SC-06-TMPL-01: テンプレ閲覧・適用

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-01（templateMarketStore）|
| **Tier** | B |
| **前提条件** | テンプレ 1 件が公開状態で seed されている |
| **手順** | 1. `/market?channel=template` を開く<br>2. テンプレカードをクリックして詳細を確認<br>3. 「このテンプレを使う」をクリック（`data-testid="mkt-tmpl-apply"`）<br>4. 出品フォームにテンプレ内容が適用されることを確認 |
| **Assertion** | - `data-testid="mkt-tmpl-card"` が visible<br>- テンプレ詳細に「公開者」「更新日」が表示<br>- 適用後に出品フォームの各フィールドにデフォルト値が設定される |
| **Negative Branch** | テンプレ 0 件 → `data-testid="mkt-empty-state"` visible（EmptyState）|
| **data-testid** | `mkt-tmpl-card`, `mkt-tmpl-apply`, `mkt-tmpl-detail` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §10 — Engagement シナリオ

### SC-06-ENG-01: Q&A・出品への質問

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-05, ProjectRules §6.6 |
| **Tier** | B |
| **前提条件** | 出品中の listing が存在 · 閲覧者ユーザーでログイン |
| **手順** | 1. `/market/listing/{id}` を開く（Stage 0 公開）<br>2. Q&A セクションに質問を入力（`data-testid="mkt-qa-input"`）<br>3. 「質問する」をクリック<br>4. 質問が即座に公開表示されることを確認<br>5. 出品者が回答する<br>6. 「回答済み」フラグが表示されることを確認 |
| **Assertion** | - 質問投稿直後に `data-testid="mkt-qa-item"` が visible<br>- 回答後 `data-testid="mkt-qa-answered"` が visible<br>- Q&A は全ユーザーに公開（Stage 0）|
| **Negative Branch** | 未ログインで質問 → ログインページへリダイレクト |
| **data-testid** | `mkt-qa-input`, `mkt-qa-submit`, `mkt-qa-item`, `mkt-qa-answered` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §11 — Negative シナリオ

### SC-06-NEG-01: 不正状態遷移（409）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-MKT-02（不正遷移は 409）|
| **Tier** | B |
| **前提条件** | `sold` 状態の listing が存在 |
| **手順** | 1. `POST /api/market/listing-state/transition` に `to_state: "listed_fixed_price"` を送信（sold → 再出品は不正）<br>2. API レスポンスを確認<br>3. UI 上の遷移ボタンが disabled であることを確認 |
| **Assertion** | - API: 409 レスポンス<br>- `data-testid="mkt-listing-status"` が `sold` のまま変化なし<br>- 不正遷移ボタンが `disabled` または 非表示 |
| **data-testid** | `mkt-listing-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-NEG-02: 権限なしで出品状態変更（認可エラー）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-MKT-03（requireMarketListingStateWrite）|
| **Tier** | B |
| **前提条件** | 他ユーザーの listing に対して状態変更を試みる |
| **手順** | 1. 他ユーザーの listing の詳細ページを開く<br>2. 状態変更ボタンが非表示または disabled であることを確認<br>3. API 直接 POST → 403 レスポンスを確認 |
| **Assertion** | - 状態変更 UI が非表示<br>- API: 403 レスポンス |
| **data-testid** | `mkt-listing-status` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-NEG-03: 代金未払い 2 週間タイムアウト（Y02 解決）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | §11.0 Y02（2 週間で売り手クローズ可）|
| **Tier** | B |
| **前提条件** | SC-06-TRADE-01 完了 · mock timer で 2 週間経過 |
| **手順** | 1. マッチング後 2 週間を mock timer で経過<br>2. 出品者が「取引をクローズする」を実行（`data-testid="mkt-trade-close-btn"`）<br>3. 買い手の Δcount +1 が記録されることを確認<br>4. 買い手のマイページに「タグ付き悪評価」が表示されることを確認 |
| **Assertion** | - `data-testid="mkt-trade-close-btn"` が 2 週間後に visible<br>- クローズ後: `trade-events` に `timeout_close` イベント<br>- 買い手: `data-testid="kma-delta-badge"` に +1 表示 |
| **Negative Branch** | 2 週間未満はクローズボタン非表示 |
| **data-testid** | `mkt-trade-close-btn`, `kma-delta-badge` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

### SC-06-NEG-04: 評価入力時のタグ+理由必須（Y08 解決）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | §11.2 Y08（低評価はタグ+理由必須）|
| **Tier** | B |
| **前提条件** | SC-06-TRADE-02 完了・買い手として評価フォームを開く |
| **手順** | 1. 評価フォームで「悪い」を選択<br>2. タグ・理由を入力せずに「評価を確定」をクリック<br>3. バリデーションエラーが表示されることを確認<br>4. タグと理由を入力後に送信 → 成功 |
| **Assertion** | - `data-testid="mkt-rate-error"` に「タグと理由を入力してください」<br>- タグ未選択で submit → 送信されない<br>- タグ・理由入力後: 評価が確定 |
| **data-testid** | `mkt-rate-tag-select`, `mkt-rate-reason-input`, `mkt-rate-error`, `mkt-rate-submit-btn` |
| **CI job** | `npx playwright test --project=mkt-e2e` |

---

## §12 — ブランチマトリクス

| 条件 | 期待 UI アクション | Assertion |
|------|------------------|-----------|
| 固定価格 → 購入確定（在庫あり）| `sold` に遷移 · プライベートボード開始 | `mkt-trade-stage` = Stage 1 |
| 固定価格 → 購入（在庫なし）| 「売り切れ」エラー表示 | `mkt-sold-out` visible |
| オークション open → 入札（有効）| `mkt-bid-current` 更新 | POST 200 |
| オークション open → 入札（無効：最高額以下）| エラー表示 | `mkt-bid-error` visible |
| オークション closed → 入札試み | 入札ボタン disabled | `mkt-bid-submit` disabled |
| 抽選応募（初回）| 応募済み表示 | `mkt-lottery-status` = 応募済み |
| 抽選応募（2 回目）| 409 エラー | `mkt-lottery-error` = 重複 |
| 抽選締切後・当選 | 当選通知 · 取引開始ボタン | `mkt-lottery-won` visible |
| 抽選締切後・落選 | 落選通知 | `mkt-lottery-lost` visible |
| PT 順申込（PT 消費で Coin 変動なし）| Coin ランク変化なし | PT 購入 → `mkt-priority-my-rank` 変化なし |
| Stage 1 → 2 週間経過 | 出品者にクローズボタン表示 | `mkt-trade-close-btn` visible |
| Stage 3 達成後 | 8% 振込案内表示 | `mkt-fee-prompt` visible |
| Stage 3 達成前（Stage 1）| 振込案内非表示 | `mkt-fee-prompt` not visible |
| 不正遷移（sold → listed）| 409 | API 409 + UI 変化なし |
| 権限なし状態変更 | 403 | `mkt-listing-status` 変化なし |

---

## §13 — data-testid 一覧（本機能）

| testid | 場所 | 説明 |
|--------|------|------|
| `mkt-browse-tab-fixed` | `/market` | 固定価格タブ |
| `mkt-browse-tab-auction` | `/market` | オークションタブ |
| `mkt-browse-tab-lottery` | `/market` | 抽選タブ |
| `mkt-browse-tab-priority` | `/market` | 優先順タブ |
| `mkt-browse-tab-template` | `/market` | テンプレタブ |
| `mkt-listing-card` | `/market` | 出品カード |
| `mkt-empty-state` | 各タブ | 空状態 |
| `mkt-listing-channel-fixed` | 出品フォーム | 固定価格チャネル選択 |
| `mkt-listing-channel-auction` | 出品フォーム | オークションチャネル選択 |
| `mkt-listing-channel-lottery` | 出品フォーム | 抽選チャネル選択 |
| `mkt-listing-channel-priority` | 出品フォーム | 優先順チャネル選択 |
| `mkt-price-input` | 出品フォーム | 価格入力 |
| `mkt-listing-submit` | 出品フォーム | 出品ボタン |
| `mkt-listing-status` | 出品詳細 | 状態表示 |
| `mkt-buy-btn` | 出品詳細 | 購入ボタン |
| `mkt-bid-input` | オークション | 入札額入力 |
| `mkt-bid-submit` | オークション | 入札ボタン |
| `mkt-bid-current` | オークション | 現在最高入札額 |
| `mkt-bid-error` | オークション | 入札エラー |
| `mkt-auction-status` | オークション | 落札ステータス |
| `mkt-lottery-apply` | 抽選 | 応募ボタン |
| `mkt-lottery-status` | 抽選 | 応募状態 |
| `mkt-lottery-won` | 抽選 | 当選表示 |
| `mkt-lottery-lost` | 抽選 | 落選表示 |
| `mkt-lottery-deadline` | 抽選 | 締切日時 |
| `mkt-priority-apply` | 優先順 | 申込ボタン |
| `mkt-priority-my-rank` | 優先順 | 自分のランク帯 |
| `mkt-priority-status` | 優先順 | 申込状態 |
| `mkt-tmpl-card` | テンプレ | テンプレカード |
| `mkt-tmpl-apply` | テンプレ | テンプレ適用 |
| `mkt-tmpl-detail` | テンプレ | テンプレ詳細 |
| `mkt-qa-input` | Q&A | 質問入力 |
| `mkt-qa-submit` | Q&A | 質問送信 |
| `mkt-qa-item` | Q&A | 質問アイテム |
| `mkt-qa-answered` | Q&A | 回答済みフラグ |
| `mkt-private-board` | 取引ボード | プライベートボード |
| `mkt-trade-stage` | 取引ボード | ステージ表示 |
| `mkt-transfer-code` | 取引ボード | 振込コード |
| `mkt-post-office-hint` | 取引ボード | 局留めヒント |
| `mkt-ship-done-btn` | 取引ボード | 発送完了ボタン |
| `mkt-receive-confirm-btn` | 取引ボード | 受取確認ボタン |
| `mkt-rate-form` | 評価 | 評価フォーム |
| `mkt-rate-submit-btn` | 評価 | 評価確定ボタン |
| `mkt-rate-tag-select` | 評価 | タグ選択 |
| `mkt-rate-reason-input` | 評価 | 理由入力 |
| `mkt-rate-error` | 評価 | 評価バリデーションエラー |
| `mkt-fee-prompt` | 取引成立後 | 8% 振込案内 |
| `mkt-fee-amount` | 取引成立後 | 振込金額 |
| `mkt-fee-paid` | 取引成立後 | 支払完了表示 |
| `mkt-trade-close-btn` | 取引タイムアウト | クローズボタン |
| `mkt-sold-out` | 出品詳細 | 売り切れ表示 |

---

*DRAFT · 人間レビュー後に「v1.0 確定」に格上げ · 実装禁止ゲート有効 · 2026-06-18*
