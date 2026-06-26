# 05 — 観測 E2E 設計 v1

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **REQ 正本**: `01-要件/05-観測.md` · `ADR-H-13`, `ADR-H-15`, `ADR-H-16`  
> **HQ-03 確定（2026-06-18）**: 略称 **DHH** = 学名 ***Dynastes hercules hercules***（ヘラクレスオオカブト亜種）。E2E seed・分類ツリー・assert は本学名を正とする。
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う  
> **シナリオ数**: 計 **13 シナリオ**（Happy Path 8 + Negative 5）  
> **モックギャップ（HQ-08 確定）**: [`mock-gap-RTM-観測-v1-DRAFT.md`](../_ui-global/mock-gap-RTM-観測-v1-DRAFT.md) — 5 ステップ完走に P0 mock **6 枚不足**  
> **Tier B 優先度（HQ-07 確定）**: 観測は Tier B **第1優先**。順序: ①観測 → ②マーケット → ③カルマ → ④ホーム・掲示板。正本: [`00-E2E設計・運用正本-v1-DRAFT.md`](./00-E2E設計・運用正本-v1-DRAFT.md) §2 HQ-07  
> **Wave スコープ（HQ-05 確定）**: 観測テンプレ（05tl/05td/05t）は **W3** に含む。ADR: [`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](../ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) Phase 6

---

## §1 — スコープと前提

### スコープ

| 対象 | 含む |
|------|------|
| 観測 5 ステップ | コンテキスト選択 → 採取物/機器選択 → タイミング/方法分岐 → 確認 → 登録 |
| デュアルプライマリボタン | [一括取得] と [写真撮影] の両方が primary として確認 |
| テンプレ機能 | テンプレ選択・フォーク |
| コンテキスト引き継ぎ | WorkflowContext の 05i/05a/05tl 伝播 |
| Negative | API エラー · 未選択 · 権限なし |

### スコープ外

- IHL image lake（別 repo の E2E）
- SwitchBot 実機 IoT（人間確認ゲート）
- Twin 台本・動画投稿
- Tier D 手動打鍵（人間のみ）

### 前提条件（全シナリオ共通）

```
- test-user-obs@ihl.local でログイン済み
- seed: observation_template「E2E-Standard-Male-Template」（雄標準計測テンプレ）
- seed: ObservationTarget alias **DHH** = ***Dynastes hercules hercules*** · biological/Coleoptera/Scarabaeidae/Dynastes/Dynastes hercules/Dynastes hercules hercules
- R2 INSERT は E2E バケット（it-hercules-laboratory-e2e）に書く
- SwitchBot/IoT は mock。バルクフェッチ API は mock で 200 を返す
```

---

## §2 — RTM（REQ × Scenario）

| REQ ID | 内容（要約）| Scenario ID | Tier | ステータス |
|--------|------------|-------------|------|-----------|
| OBS-SOL-01 | 固体観測フロー全体 | SC-05-SOL-01, SC-05-SOL-02, SC-05-SOL-03 | B | DESIGNED |
| OBS-SOL-04 | 種・亜種はユーザー確定のみ | SC-05-CTX-01 | B | DESIGNED |
| OBS-SOL-06 | 撮影条件の併記・色補正しない | SC-05-SOL-02 | B | DESIGNED |
| OBS-ENV-01 | SolidEnvironmentSnapshot を commit に載せる | SC-05-SOL-03 | B | DESIGNED |
| UI-REBUILD-OBS-01 | 種族選択 UI が存在する | SC-05-CTX-01 | B | DESIGNED |
| UI-REBUILD-OBS-02 | 種族・段階が WorkflowContext として引き継がれる | SC-05-CTX-01 | B | DESIGNED |
| UI-REBUILD-OBS-03 | コンテキストはプリフィルのみ・ユーザー確定 | SC-05-CTX-01 | B | DESIGNED |
| UI-REBUILD-OBS-04 | コンテキスト未選択で空状態 | SC-05-NEG-01 | B | DESIGNED |
| UI-REBUILD-OBS-05 | 採取アイテム選択 UI | SC-05-SOL-01 | B | DESIGNED |
| UI-REBUILD-OBS-06 | 採取機器選択 | SC-05-SOL-01 | B | DESIGNED |
| UI-REBUILD-OBS-08 | **[一括取得ボタン]** が存在する | SC-05-BULK-01 | B | DESIGNED |
| UI-REBUILD-OBS-09 | **[写真撮影ボタン]** が存在する | SC-05-PHOTO-01 | B | DESIGNED |
| UI-REBUILD-OBS-10 | 両ボタンが視覚的に区別できる | SC-05-BULK-01, SC-05-PHOTO-01 | B | DESIGNED |
| UI-REBUILD-OBS-11 | 分岐後の状態（フェッチ中・完了・エラー）明示 | SC-05-BULK-01, SC-05-PHOTO-01, SC-05-NEG-03 | B | DESIGNED |
| UI-REBUILD-OBS-12 | 確認画面に 3 チャンク（写真・計測・定期取得） | SC-05-CONFIRM-01 | B | DESIGNED |
| UI-REBUILD-OBS-13 | 確認画面から修正できる導線 | SC-05-CONFIRM-01 | B | DESIGNED |
| UI-REBUILD-OBS-14 | 確認画面の主ボタンは「登録」のみ | SC-05-CONFIRM-01 | B | DESIGNED |
| UI-REBUILD-OBS-15 | 登録で R2 セッション JSON INSERT | SC-05-REG-01 | B | DESIGNED |
| UI-REBUILD-OBS-16 | INSERT ONLY（UPDATE/DELETE 禁止）| SC-05-REG-01 | B | DESIGNED |
| UI-REBUILD-OBS-17 | 完了後に成功状態 + 次アクション | SC-05-REG-01 | B | DESIGNED |
| UI-REBUILD-OBS-18 | 失敗時にエラー + 再試行 | SC-05-NEG-02 | B | DESIGNED |
| OBS-TPL-13 | テンプレ選択でフォーム自動展開 | SC-05-TPL-01 | B | DESIGNED |
| OBS-CTX-01 | WorkflowContext の伝播 | SC-05-CTX-01 | B | DESIGNED |
| OBS-CTX-02 | プリフィルのみ・確定はユーザー | SC-05-CTX-01 | B | DESIGNED |
| OBS-TGT-01 | 5 ドメインから選択 | SC-05-CTX-01 | B | DESIGNED |
| OBS-TGT-02 | テキストのみ（画像なし）| SC-05-CTX-01 | B | DESIGNED |
| OBS-TGT-04 | 生物は亜種まで or 明示 | SC-05-NEG-04 | B | DESIGNED |

---

## §3 — シナリオ一覧

### カテゴリ別概要

| カテゴリ | シナリオ ID | 数 |
|---------|------------|-----|
| コンテキスト選択 | SC-05-CTX-01 | 1 |
| 一括取得フロー | SC-05-BULK-01 | 1 |
| 写真撮影フロー | SC-05-PHOTO-01 | 1 |
| 固体観測完全フロー | SC-05-SOL-01〜03 | 3 |
| 確認画面 | SC-05-CONFIRM-01 | 1 |
| 登録（R2 INSERT）| SC-05-REG-01 | 1 |
| テンプレ | SC-05-TPL-01 | 1 |
| Negative | SC-05-NEG-01〜05 | 5 |
| **合計** | | **13** |

---

## §4 — コンテキスト選択シナリオ

### SC-05-CTX-01: 観測対象選択（ObservationTarget）と WorkflowContext 伝播

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-CTX-01〜03, OBS-TGT-01〜05, UI-REBUILD-OBS-01〜03 |
| **Tier** | B |
| **前提条件** | ログイン済み · `/observation` を開く |
| **手順** | 1. `/observation/context`（または文脈バーのボトムシート）を開く<br>2. ドメイン「生物（biological）」を選択（`data-testid="obs-tgt-domain-biological"`）<br>3. 分類ツリーを「目 Coleoptera › 科 Scarabaeidae › 属 Dynastes › 種 *Dynastes hercules* › 亜種 *Dynastes hercules hercules* (DHH)」まで辿る<br>4. 「この種で観測する」ボタンをクリック（`data-testid="obs-ctx-confirm"`）<br>5. `/observation/input` に遷移してプリフィルを確認 |
| **Assertion** | - 文脈バーに「*Dynastes hercules hercules* (DHH)」が表示<br>- `/observation/input?species=Dynastes%20hercules%20hercules&stage=&scope_route=biological` にクエリパラメータが付与<br>- 入力画面の「観測対象」フィールドに「*Dynastes hercules hercules*」がプリフィルされている<br>- ピッカー UI に `img` 要素が存在しない（テキストのみ確認）<br>- `/observation/templates` を開いた場合にも `?species=Dynastes%20hercules%20hercules` が引き継がれる |
| **Negative Branch** | SC-05-NEG-01（コンテキスト未選択）参照 |
| **data-testid** | `obs-tgt-domain-biological`, `obs-tgt-search-input`, `obs-tgt-tree-node`, `obs-ctx-confirm`, `obs-ctx-chip` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §5 — 一括取得・写真撮影フロー

### SC-05-BULK-01: [一括取得ボタン] → バルクデータフェッチ → 登録

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-08, UI-REBUILD-OBS-10, UI-REBUILD-OBS-11 |
| **Tier** | B |
| **前提条件** | SC-05-CTX-01 完了（*Dynastes hercules hercules* / DHH コンテキスト設定済み）· `/observation/input` を開く |
| **手順** | 1. 採取アイテムを選択（「体長」「胸幅」にチェック）<br>2. 採取機器を選択（「手入力」）<br>3. **[一括取得ボタン]** をクリック（`data-testid="obs-bulk-fetch"`）<br>4. StatusStrip に「フェッチ中...」が表示されることを確認<br>5. フェッチ完了後に計測値フィールドが自動入力されることを確認<br>6. `/observation/input/confirm` に進む |
| **Assertion** | - `data-testid="obs-bulk-fetch"` が visible かつ enabled<br>- `data-testid="obs-photo-capture"` が visible かつ enabled（両方 primary）<br>- フェッチ中: `data-testid="obs-status-strip"` に「フェッチ中」表示<br>- フェッチ完了: `data-testid="obs-status-strip"` に「フェッチ完了」<br>- 計測値フィールドが mock データで自動入力される<br>- [一括取得] と [写真撮影] の両ボタンが `aria-disabled="false"` |
| **Negative Branch** | SC-05-NEG-03（フェッチ API エラー）参照 |
| **data-testid** | `obs-bulk-fetch`, `obs-photo-capture`, `obs-status-strip`, `obs-measurement-input` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-PHOTO-01: [写真撮影ボタン] → 撮影 + フェッチ + 登録

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-09, UI-REBUILD-OBS-10, UI-REBUILD-OBS-11, OBS-SOL-06 |
| **Tier** | B |
| **前提条件** | SC-05-CTX-01 完了 · `/observation/input` を開く |
| **手順** | 1. 採取アイテムを選択（「体長」「写真」にチェック）<br>2. **[写真撮影ボタン]** をクリック（`data-testid="obs-photo-capture"`）<br>3. ファイル選択ダイアログ（または camera API）で mock 画像を選択<br>4. 写真プレビューが表示されることを確認<br>5. 「撮影時点でデータフェッチ」が実行されることを確認<br>6. 撮影条件テキスト入力フィールドが表示されることを確認<br>7. `/observation/input/confirm` に進む |
| **Assertion** | - `data-testid="obs-photo-capture"` が visible かつ enabled<br>- `data-testid="obs-bulk-fetch"` が visible かつ enabled（両方 primary）<br>- 写真選択後: `data-testid="obs-photo-preview"` に画像が表示<br>- `data-testid="obs-shooting-condition-input"` が visible（撮影条件入力 · 色補正禁止）<br>- フェッチが自動実行: `data-testid="obs-status-strip"` に「フェッチ完了」 |
| **Negative Branch** | 写真なしで「写真」チェック済みのまま次へ → バリデーションエラー |
| **data-testid** | `obs-photo-capture`, `obs-bulk-fetch`, `obs-photo-preview`, `obs-shooting-condition-input`, `obs-status-strip` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §6 — 固体観測完全フロー

### SC-05-SOL-01: 観測 5 ステップ完全フロー（一括取得経路）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-SOL-01, UI-REBUILD-OBS-01〜17（全体）|
| **Tier** | B |
| **前提条件** | ログイン済み |
| **手順** | **ステップ①②: コンテキスト選択**<br>1. `/observation` を開く<br>2. 文脈バーから「*Dynastes hercules hercules* (DHH)」を選択（SC-05-CTX-01 と同じ）<br><br>**ステップ③: 採取物・機器選択**<br>3. `/observation/input` で「体長・胸幅（雄テンプレ）」にチェック<br>4. 採取機器「手入力」を選択<br><br>**ステップ④: 一括取得**<br>5. [一括取得ボタン] をクリック → フェッチ完了<br>6. 計測値フィールドが自動入力されたことを確認<br><br>**ステップ⑤: 確認画面**<br>7. 「確認へ」ボタンをクリック<br>8. `/observation/input/confirm` に遷移<br>9. 写真チャンク・計測データチャンク・定期取得チャンクが表示されることを確認<br><br>**ステップ⑥: 登録**<br>10. [登録ボタン] をクリック（`data-testid="obs-register-submit"`）<br>11. 成功メッセージと次アクションボタンを確認 |
| **Assertion** | - ステップごとの遷移が正常<br>- 確認画面: 3 チャンクが visible<br>- 登録後: `data-testid="obs-success-msg"` visible<br>- 登録後: `data-testid="obs-goto-grid-btn"` または `data-testid="obs-goto-home-btn"` visible<br>- POST `/api/solid-observation/commit` が 201<br>- レスポンスに `sessionId`・`r2Key` が含まれる<br>- 観測グリッド `/observation` で新しいセッションが一覧に表示される |
| **Negative Branch** | SC-05-NEG-02（登録 API エラー）参照 |
| **data-testid** | `obs-ctx-confirm`, `obs-measurement-check-*`, `obs-device-select`, `obs-bulk-fetch`, `obs-confirm-next`, `obs-chunk-photo`, `obs-chunk-measurement`, `obs-chunk-periodic`, `obs-register-submit`, `obs-success-msg`, `obs-goto-grid-btn` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-SOL-02: 写真撮影経路での完全フロー

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-SOL-01, OBS-SOL-06, UI-REBUILD-OBS-09〜17 |
| **Tier** | B |
| **前提条件** | ログイン済み · mock camera API または file input を使用 |
| **手順** | 1〜4: SC-05-SOL-01 ステップ①②③と同じ<br>5. [写真撮影ボタン] をクリック<br>6. mock 画像ファイルを選択<br>7. 撮影条件テキスト（「光源: 自然光」等）を入力<br>8. 写真プレビューを確認<br>9〜11: SC-05-SOL-01 ステップ⑤⑥と同じ |
| **Assertion** | - `data-testid="obs-photo-preview"` に画像が表示<br>- 撮影条件テキストが確認画面に表示される<br>- コミット後のセッション JSON に `evidenceMode` または `shootingCondition` が記録<br>- 色補正処理が施されていないこと（mock: 元画像と同一 hash） |
| **Negative Branch** | 画像ファイルサイズ超過（例: 20MB 超）→ バリデーションエラー |
| **data-testid** | SC-05-SOL-01 と共通 + `obs-photo-preview`, `obs-shooting-condition-input` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-SOL-03: 環境スナップショット付き観測

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-ENV-01, OBS-SOL-07 |
| **Tier** | B |
| **前提条件** | SwitchBot mock が 温度 25.0℃ · 湿度 60% を返す設定 |
| **手順** | 1〜4: SC-05-SOL-01 と同じ<br>5. 環境データ取得オプションを有効にする<br>6. [一括取得ボタン] をクリック<br>7. 環境スナップショット（温度・湿度）が取得されることを確認<br>8. 確認画面の「定期取得項目」チャンクに環境データが表示されることを確認<br>9. 登録 |
| **Assertion** | - `data-testid="obs-chunk-periodic"` に「温度: 25.0℃ · 湿度: 60%」表示<br>- コミット後のセッション JSON に `environmentSnapshot.temperature: 25.0` が含まれる<br>- SwitchBot API の `source: "switchbot"` と `manual` が区別されている |
| **Negative Branch** | SwitchBot mock が 503 → 「環境データを取得できません」表示 · 手入力にフォールバック |
| **data-testid** | `obs-env-enable-toggle`, `obs-chunk-periodic`, `obs-env-manual-input` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §7 — 確認画面シナリオ

### SC-05-CONFIRM-01: 確認画面の 3 チャンクと修正導線

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-12, UI-REBUILD-OBS-13, UI-REBUILD-OBS-14 |
| **Tier** | B |
| **前提条件** | `/observation/input/confirm` に遷移済み（入力データあり）|
| **手順** | 1. 確認画面を開く<br>2. 「写真」チャンクが表示されることを確認<br>3. 「計測データ」チャンクが表示されることを確認<br>4. 「定期取得項目」チャンクが表示されることを確認<br>5. 「計測データ」チャンクの「修正」ボタンをクリック<br>6. 入力画面に戻って値を変更<br>7. 再び確認画面へ進む<br>8. [登録ボタン] のみが主ボタンとして表示されることを確認 |
| **Assertion** | - `data-testid="obs-chunk-photo"` visible<br>- `data-testid="obs-chunk-measurement"` visible<br>- `data-testid="obs-chunk-periodic"` visible<br>- `data-testid="obs-edit-measurement"` をクリックで入力画面へ遷移<br>- `data-testid="obs-register-submit"` が 1 つだけ（1 画面 1 主ボタン）<br>- キャンセルボタンは `secondary` または `ghost` スタイル（主ボタンは登録のみ）|
| **Negative Branch** | 確認画面で全チャンクが空 → バリデーションエラー（「計測データを入力してください」）|
| **data-testid** | `obs-chunk-photo`, `obs-chunk-measurement`, `obs-chunk-periodic`, `obs-edit-photo`, `obs-edit-measurement`, `obs-edit-periodic`, `obs-register-submit`, `obs-cancel-btn` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §8 — 登録（R2 INSERT）シナリオ

### SC-05-REG-01: 登録完了と次アクション誘導

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-15, UI-REBUILD-OBS-16, UI-REBUILD-OBS-17, OBS-R2-01〜03 |
| **Tier** | B |
| **前提条件** | SC-05-CONFIRM-01 を通過（確認画面で [登録] 直前）|
| **手順** | 1. [登録ボタン] をクリック<br>2. POST `/api/solid-observation/commit` のリクエストを確認<br>3. 成功レスポンス（201）を確認<br>4. 成功メッセージと次アクションボタンを確認<br>5. 観測グリッド（`/observation`）に移動し、新しいセッションが表示されることを確認 |
| **Assertion** | - POST `/api/solid-observation/commit` が 201<br>- リクエストボディに `sessionId`, `r2Key` が含まれる（OBS-SOL-02/03 準拠）<br>- `data-testid="obs-success-msg"` visible<br>- `data-testid="obs-goto-grid-btn"` または `data-testid="obs-goto-home-btn"` が visible かつ enabled<br>- UPDATE/DELETE エンドポイントが呼ばれていない（network log 確認）<br>- 新しいセッションが `/observation` グリッドに表示 |
| **Negative Branch** | SC-05-NEG-02（登録 API エラー）参照 |
| **data-testid** | `obs-register-submit`, `obs-success-msg`, `obs-goto-grid-btn`, `obs-goto-home-btn` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §9 — テンプレシナリオ

### SC-05-TPL-01: テンプレ選択とフォーム自動展開

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-TPL-13, OBS-TPL-14, OBS-TPL-16〜17 |
| **Tier** | B |
| **前提条件** | seed「E2E-Standard-Male-Template」が公開されている · SC-05-CTX-01 完了 |
| **手順** | 1. `/observation/templates` を開く<br>2. 「E2E-Standard-Male-Template」カードをクリック<br>3. テンプレ詳細画面で項目リストを確認<br>4. 「このテンプレで記録する」をクリック（`data-testid="obs-tpl-use-btn"`）<br>5. `/observation/input` に遷移してフォームが展開されることを確認<br>6. `TemplateUsageEvent` が記録されることを確認（API）|
| **Assertion** | - `/observation/templates` でカードグリッドが表示<br>- テンプレ詳細: 項目リスト（体長・胸幅・角長）が表示<br>- 適用後: `/observation/input` のフォームに「体長」「胸幅」「角長」が展開<br>- POST `/api/observation/template/use` が呼ばれる（usage event INSERT）<br>- フォーク: `data-testid="obs-tpl-fork-btn"` をクリック → `TemplateForkEvent` INSERT |
| **Negative Branch** | テンプレ 0 件 → EmptyState（`data-testid="obs-tpl-empty-state"`）|
| **data-testid** | `obs-tpl-card`, `obs-tpl-use-btn`, `obs-tpl-fork-btn`, `obs-tpl-empty-state`, `obs-tpl-filter-public`, `obs-tpl-filter-mine` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §10 — Negative シナリオ

### SC-05-NEG-01: コンテキスト未選択の空状態

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-04 |
| **Tier** | B |
| **前提条件** | コンテキスト未設定の状態で `/observation/input` を開く |
| **手順** | 1. 文脈バーをクリアした状態で `/observation/input` を開く |
| **Assertion** | - `data-testid="obs-empty-state"` visible<br>- 「種族を選ぶ」ボタンが表示される（`data-testid="obs-select-species-btn"`）<br>- 入力フォームは表示されない |
| **data-testid** | `obs-empty-state`, `obs-select-species-btn` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-NEG-02: 登録 API エラー（ErrorBoundary）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-18 |
| **Tier** | B |
| **前提条件** | POST `/api/solid-observation/commit` が 500 を返す mock |
| **手順** | 1. 通常フローで [登録ボタン] をクリック<br>2. API が 500 を返す |
| **Assertion** | - `data-testid="obs-error-boundary"` visible<br>- エラー内容が表示（「登録に失敗しました」等）<br>- 「再試行」ボタンが visible（`data-testid="obs-retry-btn"`）<br>- 「キャンセルして戻る」ボタンが visible |
| **data-testid** | `obs-error-boundary`, `obs-retry-btn` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-NEG-03: バルクフェッチ API エラー

| 項目 | 内容 |
|------|------|
| **対応 REQ** | UI-REBUILD-OBS-11 |
| **Tier** | B |
| **前提条件** | バルクフェッチ API が 503 を返す mock · `/observation/input` を開く |
| **手順** | 1. [一括取得ボタン] をクリック<br>2. フェッチ API が 503 を返す |
| **Assertion** | - `data-testid="obs-status-strip"` に「データ取得に失敗しました」表示<br>- 手動入力フォームにフォールバック（フィールドが手動入力可能になる）<br>- [一括取得ボタン] が再クリック可能（再試行可）<br>- [写真撮影ボタン] も引き続き使用可能 |
| **data-testid** | `obs-bulk-fetch`, `obs-status-strip`, `obs-measurement-manual-input` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-NEG-04: 亜種未到達の確定禁止（OBS-TGT-04）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-TGT-04（亜種まで到達 or 「亜種未区別」明示が必須）|
| **Tier** | B |
| **前提条件** | 生物ドメインで「種」レベル止まりで確定しようとする |
| **手順** | 1. 分類ツリーで「Dynastes hercules」（種）まで選択<br>2. 亜種を選ばずに「確定」をクリック |
| **Assertion** | - 確定ボタンが disabled または確定バリデーションエラー<br>- 「亜種まで選んでください（または「亜種未区別」を選択）」が表示<br>- 「亜種未区別（種まで）」チェックボックスが visible |
| **data-testid** | `obs-tgt-confirm`, `obs-tgt-subspecies-error`, `obs-tgt-undetermined-check` |
| **CI job** | `npx playwright test --project=obs-e2e` |

### SC-05-NEG-05: AI 種候補のみ・ユーザー確定前は保存不可（OBS-SOL-04）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | OBS-SOL-04, OBS-TAX-07（AI 候補は確定しない）|
| **Tier** | B |
| **前提条件** | Vision API が「Dynastes hercules」候補を返す mock |
| **手順** | 1. 写真をアップロード<br>2. AI 種候補が表示される<br>3. ユーザーが確定ボタン（`data-testid="obs-ctx-confirm"`）を押さずに [登録ボタン] をクリック |
| **Assertion** | - AI 候補表示: `data-testid="obs-ai-candidate"` visible · 候補表示のみ（確定ではない）<br>- ユーザー確定なしで登録試み → 「観測対象を確定してください」バリデーションエラー<br>- 確定ボタンを押して初めて観測対象が確定し、登録可能になる |
| **data-testid** | `obs-ai-candidate`, `obs-tgt-confirm`, `obs-ctx-confirm`, `obs-register-submit` |
| **CI job** | `npx playwright test --project=obs-e2e` |

---

## §11 — ブランチマトリクス

| 条件 | 期待 UI アクション | Assertion |
|------|------------------|-----------|
| コンテキスト設定済み | 入力画面にプリフィル | `obs-ctx-chip` に種名表示 |
| コンテキスト未設定 | EmptyState + 「種族を選ぶ」ボタン | `obs-empty-state` visible |
| [一括取得] クリック（成功）| StatusStrip「フェッチ完了」・フィールド自動入力 | `obs-status-strip` = 完了 |
| [一括取得] クリック（失敗）| StatusStrip「取得失敗」・手動入力にフォールバック | `obs-status-strip` = エラー |
| [写真撮影] クリック（成功）| 画像プレビュー + 自動フェッチ | `obs-photo-preview` visible |
| [写真撮影] クリック（ファイル未選択）| 選択ダイアログ表示のまま | フォームに変化なし |
| 確認画面で「修正」クリック | 入力画面へ戻る（データ保持）| 修正値が反映される |
| 確認画面の登録（成功）| 成功メッセージ + 次アクション | `obs-success-msg` visible |
| 確認画面の登録（500）| ErrorBoundary + 再試行ボタン | `obs-error-boundary` visible |
| AI 候補のみ（未確定）で登録試み | バリデーションエラー | 登録されない |
| 亜種未到達で確定試み | 確定ボタン disabled / エラー | `obs-tgt-subspecies-error` visible |
| SwitchBot 503 | 「環境データ取得失敗」・手動入力可能 | `obs-env-manual-input` enabled |
| テンプレ選択・フォーム展開 | 項目リストがフォームに展開 | `OBS-TPL-*` フィールドが visible |
| 両ボタン（一括取得 + 写真撮影）の表示 | 両方 primary で visible · enabled | `obs-bulk-fetch` AND `obs-photo-capture` enabled |

---

## §12 — data-testid 一覧（本機能）

| testid | 場所 | 説明 |
|--------|------|------|
| `obs-tgt-domain-biological` | コンテキスト選択 | 生物ドメイン選択 |
| `obs-tgt-domain-artifact` | コンテキスト選択 | 器物ドメイン |
| `obs-tgt-search-input` | コンテキスト選択 | 検索入力 |
| `obs-tgt-tree-node` | コンテキスト選択 | 分類ツリーノード |
| `obs-tgt-confirm` | コンテキスト選択 | 観測対象確定ボタン |
| `obs-tgt-subspecies-error` | コンテキスト選択 | 亜種未到達エラー |
| `obs-tgt-undetermined-check` | コンテキスト選択 | 亜種未区別チェック |
| `obs-tgt-ai-candidate` | コンテキスト選択 | AI 種候補（確定でない）|
| `obs-ctx-confirm` | 文脈バー | 種族コンテキスト確定 |
| `obs-ctx-chip` | 文脈バー | 選択中の種族チップ |
| `obs-empty-state` | 入力（未選択）| 空状態 |
| `obs-select-species-btn` | 入力（未選択）| 「種族を選ぶ」ボタン |
| `obs-measurement-check-body-length` | 入力 | 体長チェックボックス |
| `obs-measurement-check-horn-length` | 入力 | 角長チェックボックス |
| `obs-measurement-check-thorax-width` | 入力 | 胸幅チェックボックス |
| `obs-device-select` | 入力 | 採取機器選択 |
| `obs-bulk-fetch` | 入力 | **[一括取得] ボタン**（primary）|
| `obs-photo-capture` | 入力 | **[写真撮影] ボタン**（primary）|
| `obs-status-strip` | 入力 | StatusStrip（フェッチ状態）|
| `obs-measurement-input` | 入力 | 計測値入力フィールド |
| `obs-measurement-manual-input` | 入力（フォールバック）| 手動入力 |
| `obs-photo-preview` | 入力（撮影後）| 写真プレビュー |
| `obs-shooting-condition-input` | 入力（撮影後）| 撮影条件テキスト |
| `obs-env-enable-toggle` | 入力 | 環境データ取得トグル |
| `obs-env-manual-input` | 入力 | 環境データ手動入力 |
| `obs-confirm-next` | 入力 | 「確認へ」ボタン |
| `obs-chunk-photo` | 確認 | 写真チャンク |
| `obs-chunk-measurement` | 確認 | 計測データチャンク |
| `obs-chunk-periodic` | 確認 | 定期取得項目チャンク |
| `obs-edit-photo` | 確認 | 写真を修正 |
| `obs-edit-measurement` | 確認 | 計測データを修正 |
| `obs-edit-periodic` | 確認 | 定期取得を修正 |
| `obs-register-submit` | 確認 | **[登録] ボタン**（1 画面 1 主ボタン）|
| `obs-cancel-btn` | 確認 | キャンセル（secondary）|
| `obs-success-msg` | 登録完了 | 成功メッセージ |
| `obs-goto-grid-btn` | 登録完了 | グリッドへ移動 |
| `obs-goto-home-btn` | 登録完了 | ホームへ移動 |
| `obs-error-boundary` | エラー | ErrorBoundary |
| `obs-retry-btn` | エラー | 再試行ボタン |
| `obs-tpl-card` | テンプレ一覧 | テンプレカード |
| `obs-tpl-use-btn` | テンプレ詳細 | 「このテンプレで記録する」|
| `obs-tpl-fork-btn` | テンプレ詳細 | フォーク |
| `obs-tpl-empty-state` | テンプレ一覧（空）| 空状態 |
| `obs-tpl-filter-public` | テンプレ一覧 | 公開フィルタ |
| `obs-tpl-filter-mine` | テンプレ一覧 | 自分のフィルタ |

---

## §13 — 観測フロー画面対応表

| Screen ID | URL | E2E シナリオ | Tier |
|-----------|-----|------------|------|
| `obs.ctx` | `/observation/context` | SC-05-CTX-01 | B |
| `obs.input` | `/observation/input` | SC-05-BULK-01, SC-05-PHOTO-01, SC-05-SOL-01〜03 | B |
| `obs.confirm` | `/observation/input/confirm` | SC-05-CONFIRM-01, SC-05-REG-01 | B |
| `obs.grid` | `/observation` | SC-05-SOL-01（完了後確認）| A + B |
| `obs.detail` | `/observation/:id` | — | A |
| `obs.template-list` | `/observation/templates` | SC-05-TPL-01 | B |
| `obs.template-detail` | `/observation/templates/:id` | SC-05-TPL-01 | B |

---

*DRAFT · 人間レビュー後に「v1.0 確定」に格上げ · 実装禁止ゲート有効 · 2026-06-18*
