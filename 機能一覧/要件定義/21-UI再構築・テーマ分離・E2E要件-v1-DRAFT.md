# 21 — UI 再構築・ThemePack・観測フロー・E2E/CI 要件定義 v1

> **ステータス**: **v1.0 確定・人間レビュー済**（2026-06-07 / HQ-09 Go）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **関連**: `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md` · `01-要件/05-観測.md` · `01-要件/16-UIbuilder.md`  
> **Changelog**: 2026-06-07 — **HQ-09 Go（ユーザー「OKです」）を受領し v1.0 確定**  
> **Changelog**: 2026-06-18 — 入力ソースと正本・§7.0 REQ→E2E・追加仕様反映手順リンクを追記  
> **Changelog**: 2026-06-18 — **Phase≠ver1** クロス参照（§9 · §7.3）  
> **設計ゲート状態**: 要件定義 — **v1.0 確定・人間レビュー済** / 詳細設計・遷移・UI・テスト設計 — **未着手**  
> **実装**: 5 点ゲートが人間確定するまで禁止

---

## §0 — Advice: AI が「完璧な」Web UI を作るために必要なこと

> 本節はユーザー向けの方法論アドバイス。要件 ID は付与しない。実装指示でもない。

### なぜ AI 単独では「完璧」にならないのか

AI がコード生成能力を持っていても、以下の **4 つの前提が揃わない限り**、出力物は一貫性を欠く：

| 欠落する前提 | 何が起きるか |
|---|---|
| **ScreenDef が凍結されていない** | 実装のたびに「この画面に何が必要か」を AI が再解釈する → 毎回バラバラな UI |
| **ThemePack がない** | コンポーネントごとにトークンをべた書き → テンプレ変更が全画面に伝播しない |
| **プリミティブカタログがない** | Button/Card/Stack を毎回手作り → デザイン言語が画面ごとに分岐 |
| **E2E が受け入れ基準でない** | 「動く」と「出荷してよい」の判断基準がない → 品質の下限が定義されない |

### 推奨ループ（本プロジェクト向け）

```
1. REQ 正本: 01-要件/0X-*.md（FR/NFR）+ 本文書（#21 横断 UI/E2E）
        ↓ リンク: 02-設計/features/NN-*/（詳細・遷移・UI 草案）
2. ScreenDef 凍結 (Phase 5)
        ↓
3. mock ↔ ScreenDef ギャップ RTM (Phase 1: RTM v1)
        ↓
4. ThemePack / プリミティブカタログ確定 (Phase 3)
        ↓
5. 実装 wave (Phase 6: W0→W1→…)
        ↓
6. Playwright E2E — 01-要件/NN から導出（05/06=詳細済み、他=STUB→拡張）
        ↓
7. 人間 Tier D サンプル打鍵 (Phase 7)
        ↓ ──────────────────── 繰り返し
```

> **REQ 入力の正本**: 機能別 FR は **`01-要件/0X-*.md`**（`機能一覧/要件定義/0X` は移行済み・参照禁止）。本文書（#21）は横断 UI/E2E のみ。詳細は §「入力ソースと正本」。

**ポイント**:
- ステップ 2 の ScreenDef が「凍結」されていないと ステップ 5 を何度やり直しても収束しない
- ステップ 6 の E2E を「受け入れ基準」として先に書くと、AI は「テストを通す実装」を目標にできる
- ステップ 7 の人間打鍵サンプルは全画面でなくてよい（**ver1 in-scope** の主要導線）が、**これを省くと出荷判断ができない**
- **Phase ≠ ver1**: Phase 7 は工程の終端。ver1 shippable は **ver1 スコープ限定**の Phase 7 完了。段階打鍵は Phase 6 各 Wave から実施（[`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](../../02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) · [`00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](../../01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.5）

### モック（shadcn/ui ベース）の位置づけ

- モックは「レイアウトの意図を伝えるワイヤーフレーム」であり、**最終デザインではない**
- 機能・ボタン・状態の **RTM ギャップ** は必ずモックと要件 ID の突き合わせで発見する
- ThemePack を導入すれば「モックの見た目のまま全画面を一括変更できる」状態を維持できる

---

## 入力ソースと正本

| 層 | 正本パス | 役割 |
|----|---------|------|
| **機能要件（#00–#23）** | [`01-要件/NN-*.md`](../../01-要件/README.md) | FR/NFR の凍結正本。**STUB E2E 拡張の一次入力** |
| **横断 UI/E2E（#21）** | **本文書**（`機能一覧/要件定義/21-UI再構築・…`）| ThemePack · 観測 5 ステップ · CI ゲート。`#21` のみ本フォルダに残留 |
| **詳細・遷移・UI 草案** | [`02-設計/features/NN-*/`](../../02-設計/features/README.md) | REQ 下流。`詳細設計-v2.md` · `遷移設計-v1.md` · `ui/` |
| **E2E 仕様** | [`02-設計/E2E/`](../../02-設計/E2E/) | `01-要件/NN-*.md` から導出。`05`/`06`=詳細記述済み、他=STUB→拡張 |

**移行済み（参照禁止）**: `機能一覧/要件定義/0X-*.md`（`00`〜`23`）→ **`01-要件/0X-*.md`**。旧パスはリダイレクト stub のみ（[`機能一覧/要件定義/README.md`](./README.md)）。

**05/06 パターン（E2E 拡張の型）**:

1. `01-要件/05-観測.md`（または `06-マーケット.md`）の FR/NFR を読む
2. [`02-設計/E2E/05-観測-E2E-v1-DRAFT.md`](../../02-設計/E2E/05-観測-E2E-v1-DRAFT.md)（または `06-マーケット-E2E-v1-DRAFT.md`）にシナリオ・RTM を記述
3. STUB 機能（`04`/`07`/`08`/`22` 等）は同手順で `01-要件/NN-*.md` → `02-設計/E2E/NN-*-E2E-v1-DRAFT.md` を埋める

**追加仕様反映**: [`01-要件/README.md`](../../01-要件/README.md) の **追加仕様反映手順** を参照。

---

## §1 — 目的・スコープ

### 1.1 目的

| 目的 | 内容 |
|---|---|
| 既存 UI の完全廃止 | 旧 `frontend/src/` の A 系 120 画面構造を IHL FeatureNode 設計に合わせて全面再構築する |
| ThemePack 導入 | デザインテンプレートを 1 か所で変更すると全画面に伝播する仕組みを確立する |
| 観測フロー確立 | ユーザーが 5 ステップで「種族選択 → 採取物・機器選択 → タイミング/方法分岐 → 確認 → 登録（R2 INSERT）」を完走できる UI を設計・実装する |
| E2E/CI の整備 | 機能別に「入力 → 実行 → 保存」を Playwright で自動検証し、CI でゲートとして使う |
| UI Builder との整合 | Feature #16 UIBuilder（ScreenDef 管理）と連携し、ScreenDef が配線の正本になる |

### 1.2 スコープ

| 対象 | 内容 | 優先度 |
|---|---|---|
| **IN** | IHL フロントエンド全画面（O1〜O4 + 01〜23 の再構築対象）| 全体 |
| **IN** | ThemePack（CSS 変数 + Tailwind token）機構 | P0 |
| **IN** | 観測フロー（05ctx / 05i / 05a / 05b / 05tl）| P0 |
| **IN** | E2E Playwright シナリオ（機能別）| P0 |
| **IN** | route-matrix 自動テスト（全画面 200 OK + 主 CTA 表示）| P0 |
| **OUT** | 既存 civ-os backend の大規模変更 | 別 ADR |
| **OUT** | GMO 決済 live API（#23 人間ゲート）| 人間ゲート |
| **OUT** | IHL 新 repo の Streamlit 検索 UI | 別 repo |
| **OUT** | 実装コード（本文書段階では設計ゲート未通過）| 実装禁止 |

---

## §2 — 非機能要件

| ID | 要件 | 基準 | ゲート |
|---|---|---|---|
| UI-REBUILD-NFR-01 | 主要導線は 3 クリック以内 | ホームから主タスク到達 ≤ 3 クリック | Phase 4 3クリック検証表 |
| UI-REBUILD-NFR-02 | 1 画面 1 主ボタン | CTA は 1 つ（補助ボタン除く）| Phase 5 ScreenDef レビュー |
| UI-REBUILD-NFR-03 | 空状態・エラー・ローディング必須 | 全画面 3 状態を実装 | Wave 完了条件 |
| UI-REBUILD-NFR-04 | キーボード操作 | Tab 到達・Enter 実行・Esc キャンセル | Tier C 半自動 |
| UI-REBUILD-NFR-05 | AI 完走スコープ | 実装・E2E・ドキュメント整合を人間ゲートなしで完走 | 機械テスト緑 |
| UI-REBUILD-NFR-06 | 人間ゲート | ScreenDef 全画面目視・Tier D 打鍵・OSS 確定 | Phase 0/2/5/7 |
| UI-REBUILD-NFR-07 | TypeScript strict | tsc エラー 0・vitest PASS | Wave 完了条件 |
| UI-REBUILD-NFR-08 | ThemePack 変更の全画面伝播 | CSS 変数 1 箇所変更で全画面反映確認 | Phase 3 完了条件 |

---

## §3 — 既存 UI 廃止方針

### 3.1 廃止対象

| ID | 廃止対象 | 理由 |
|---|---|---|
| UI-REBUILD-DEP-01 | `frontend/src/` の A 系 120 画面ルート全体 | IHL FeatureNode / C-USB アーキと不整合。旧 legacy 構造 |
| UI-REBUILD-DEP-02 | 旧 `screens/`・`views/` 単位のルーティング | 画面単位設計は ProjectRules で禁止（Kernel UUID ルーティング）|
| UI-REBUILD-DEP-03 | インライン style・散在した tailwind クラスのべた書き | ThemePack・CSS 変数管理に移行 |
| UI-REBUILD-DEP-04 | ページ内 fetch べた書き | `hooks/`・`lib/api.ts` に集約（三層分離）|

### 3.2 Salvage 対象（**HQ-02 Option A 確定 · 2026-06-18**）

| 対象 | 移植判断 | 備考 |
|---|---|---|
| `frontend/src/lib/api.ts` の fetch パターン | **✅ 移植** | api layer として `apps/web/` へ |
| `frontend/src/ui/civUi.css` のクラス名体系 | **❌ 廃棄** | ThemePack（`tokens.css` + プリミティブ）を新規構築。旧クラスは参照のみ |
| `frontend/src/observation/` の hook・型定義 | **✅ 移植** | R2 契約を維持（logic のみ） |
| `frontend/src/lineage/` の血統 hook | **✅ 移植** | logic のみ |
| 旧 UI JSX 全体（`frontend/src/` の画面コンポーネント） | **❌ 廃棄** | shadcn/ui + ScreenDef から再構築 |

### 3.3 廃止完了条件

- [ ] 廃止画面一覧（URL・理由・代替ルート）が Phase 1 で確定
- [ ] 旧 URL → 新 URL のリダイレクト規則が Phase 4 で確定
- [ ] `frontend/src/` アーカイブコミットが存在（削除でなく保存）

---

## §4 — UI Builder / ThemePack 要件

> 関連: `01-要件/16-UIbuilder.md` · `ADR-H-01`（UIBuilder REFRAME）

### 4.1 ThemePack（テンプレ変更 → 全画面反映）

> **HQ-06 確定（2026-06-18）**: **明/暗 2 パック必須** — `ThemePack-light` + `ThemePack-dark`。ユーザー手動切替または OS `prefers-color-scheme` に追随。

| ID | 要件 | 詳細 |
|---|---|---|
| UI-REBUILD-THEME-01 | CSS 変数の pack 別一元管理 | **`ThemePack-light`** と **`ThemePack-dark`** の 2 パックを正本とする。各 pack は独立した CSS 変数定義（例: `tokens-light.css` · `tokens-dark.css`、または ADR-H-17 の `theme_pack_id` 別 `tokens` オブジェクト）を持つ。**dark**: `#0D0D0D / #121212 / #1A1A1A / #E6E6E6 / #5CD68D / #FF6B6B` 等（`preferences.md` §B）。**light**: コア画面向け明基調トークン（`preferences.md` §A + 既存 civ 明テーマ参照） |
| UI-REBUILD-THEME-02 | Tailwind config 連携 | `tailwind.config.ts` が **active pack** の CSS 変数を参照。クラス変更なしに token 値変更だけで当該 pack 適用画面が更新される |
| UI-REBUILD-THEME-03 | ThemePack 切り替え機構 | **確定 2 パック（light / dark）**。切替は **ユーザー設定**（設定 UI・UIBuilder）または **`prefers-color-scheme`**（system 追随）。実装は `<html data-theme="light\|dark">` または active `theme_pack_id` で `:root` CSS 変数を差し替え。将来の追加 pack は同構造で拡張可 |
| UI-REBUILD-THEME-04 | テーマ変更の検証 | **各 pack** で 1 変数変更 → `vitest` コンポーネントスナップショット差分確認 → light/dark 切替後の全画面スクリーンショット比較で目視確認 |
| UI-REBUILD-THEME-05 | `preferences.md` §A/§B との整合 | **§B（血統・観測）→ `ThemePack-dark`**、**§A コア画面は light 維持可 → `ThemePack-light`**。**2 パック体制で両立**（lineage/obs は dark 既定、検索・経済・Twin 等コアは light 維持可）。矛盾時は `preferences.md` 優先 |
| UI-REBUILD-THEME-06 | UI Builder（#16）との連携 | UIBuilder テーマ編集は **light/dark 両 pack を編集**するか、**単一 pack セレクタ**で編集対象を切り替える（ADR-H-17 · `02-設計/features/16-UIbuilder/ui/テーマ.md`）。保存は pack 単位（INSERT ONLY） |

### 4.2 プリミティブカタログ

| ID | コンポーネント | 責務 |
|---|---|---|
| UI-REBUILD-PRIM-01 | `PageColumn` | 水平 max-width・中央寄せ |
| UI-REBUILD-PRIM-02 | `Stack` | 縦積み gap（`civ-stack*` 後継）|
| UI-REBUILD-PRIM-03 | `HubBlock` | `civ-hubBlock*` 後継・ドメインブロック枠 |
| UI-REBUILD-PRIM-04 | `HeroBanner` | 画面目的 + 1 CTA |
| UI-REBUILD-PRIM-05 | `StatusStrip` | 保存・API・権限状態バー |
| UI-REBUILD-PRIM-06 | `ChunkCard` | 1 目的 1 カード |
| UI-REBUILD-PRIM-07 | `EmptyState` | なぜ空か + 最初の操作（必須）|
| UI-REBUILD-PRIM-08 | `ErrorBoundary` | 事実 + 次アクション（必須）|
| UI-REBUILD-PRIM-09 | `CivButton` | shadcn Button を IHL トークンで薄くラップ |

### 4.3 ScreenDef との連携

| ID | 要件 |
|---|---|
| UI-REBUILD-SDEF-01 | 全画面が ScreenDef（YAML 形式）を持つ。ScreenDef が実装の正本 |
| UI-REBUILD-SDEF-02 | ScreenDef は「chunk 構成・使用プリミティブ・props・状態バリアント・mock_ref」を含む |
| UI-REBUILD-SDEF-03 | UIBuilder (#16) の catalog/screen_defs と整合する（ADR-H-01 · B-15）|
| UI-REBUILD-SDEF-04 | ScreenDef 変更はドメインテンプレ（6 種）を経由し、個別上書きを最小化する |

### 4.4 ドメインテンプレ 6 種

| テンプレ | 対象ドメイン | チャンク構成 |
|---|---|---|
| `obs-input` | 観測入力（05i）| コンテキスト選択 → フォーム → 確認 → 登録 |
| `obs-grid` | 観測検索グリッド（05a）| Hero + フィルタ + GridCard + SupportPanel |
| `board-thread` | 掲示板スレッド（07b）| タイトル + コメント連鎖 + 投稿フォーム |
| `market-browse` | マーケット一覧（06a）| フィルタバー + 商品カード + ページング |
| `economy-panel` | 経済・貢献度（14）| スコア + 活動履歴 + アクション |
| `builder-view` | UIBuilder（16）| ScreenDef 一覧 + プレビュー + 保存 |

---

## §5 — OSS・Shell・配線アーキテクチャ要件

> 正本は `ADR-Phase2-OSS-確定.md`（Phase 2 後に作成）。本節は要件の骨格のみ記述。

| ID | 要件 | 詳細 |
|---|---|---|
| UI-REBUILD-OSS-01 | Web Shell は **Next.js 15 + shadcn/ui（確定 · 2026-06-07 ユーザー確認 · HQ-01 Go）** | App Router / RSC で FastAPI 連携。CSS 変数上書きで **ThemePack-light / ThemePack-dark** 両対応（HQ-06） |
| UI-REBUILD-OSS-02 | shadcn/ui は vendoring（コピーイン）方式 | `components/ui/` に取り込み、IHL 仕様に合わせて薄くカスタム |
| UI-REBUILD-OSS-03 | フォーラム UI は Discourse 埋め込みまたは GitHub Discussions ブリッジ | Phase 2 で 1 本確定 |
| UI-REBUILD-OSS-04 | DuckDB-Wasm 将来対応を設計で担保 | データ分析画面で Wasm 統合できる構成 |
| UI-REBUILD-OSS-05 | OSS 選定は Phase 2 の人間ゲートで確定 | 確定前に AppShell 配線図は書かない |
| UI-REBUILD-OSS-06 | AppShell 配線図（Phase 3 成果物）| ヘッダ / 文脈バー（ADR-H-14/H-15/H-16）/ ナビ / コンテンツ / フッタの責務 |

---

## §6 — 観測フロー要件

> ユーザーが示した 5 ステップを IHL 要件に形式化する。関連: `01-要件/05-観測.md` §4.1〜4.11

### 6.1 フロー全体

```
[05ctx] 観測コンテキスト選択
    ① 種族（ObservationTarget）を選ぶ
    ② 発育段階・phase を選ぶ（任意）
          ↓
[05i] 観測入力（本体）
    ③ 採取物・採取機器を選択
    ④ タイミング・方法を選択
       ├─ [一括取得ボタン] → バルクデータフェッチ
       └─ [写真撮影ボタン] → 撮影時点でデータフェッチ
    ⑤ 確認画面
       - 写真・計測データ・定期取得項目の確認
    ⑥ 登録完了 → R2 INSERT（セッション JSON）
```

### 6.2 ステップ別要件

#### ステップ①②: 種族・発育段階選択（観測コンテキスト）

| ID | 要件 | 受入 |
|---|---|---|
| UI-REBUILD-OBS-01 | 種族を選択する UI が存在する（ObservationTarget ナビゲータ）| 種族選択ボタンが表示され、選択後にコンテキストに反映される |
| UI-REBUILD-OBS-02 | 選択した種族・発育段階が 05i / 05a / 05tl に WorkflowContext として引き継がれる | 入力画面に「選択中: *Dynastes hercules hercules* (DHH)」等が表示される（**HQ-03 確定**） |
| UI-REBUILD-OBS-03 | コンテキストは「既定値（プリフィル）のみ」。taxonomy の確定は常にユーザー（OBS-SOL-04 · OBS-TAX-07）| AI 候補は提示のみ。ユーザーが確定ボタンを押すまでコミットしない |
| UI-REBUILD-OBS-04 | コンテキスト未選択時は空状態を表示し「種族を選ぶ」ボタンを提示 | EmptyState コンポーネントが表示される |

#### ステップ③: 採取物・採取機器選択

| ID | 要件 | 受入 |
|---|---|---|
| UI-REBUILD-OBS-05 | 採取アイテム（measurement_name.yaml）から選択できる UI が存在する | チェックリスト or タグ選択 UI |
| UI-REBUILD-OBS-06 | 採取機器（センサ・SwitchBot 等）を選択できる | デバイスバインディング選択 |
| UI-REBUILD-OBS-07 | 選択状態はセッション中保持される | 別ステップに遷移しても選択が消えない |

#### ステップ④: タイミング・方法選択（分岐）

| ID | 要件 | 受入 |
|---|---|---|
| UI-REBUILD-OBS-08 | **[一括取得ボタン]** が存在する | ボタン 1 クリックでバルクデータフェッチを実行 |
| UI-REBUILD-OBS-09 | **[写真撮影ボタン]** が存在する | ボタン押下時点でデータフェッチを実行し、写真と紐づける |
| UI-REBUILD-OBS-10 | 両ボタンが画面上で視覚的に区別できる | **両方が primary ボタン（2026-06-18 確定 · HQ-04 Go）** — [一括取得] と [写真撮影] は同等に重要 |
| UI-REBUILD-OBS-11 | 分岐後の状態（フェッチ中・完了・エラー）が明示される | StatusStrip or インライン状態表示 |

#### ステップ⑤: 確認画面

| ID | 要件 | 受入 |
|---|---|---|
| UI-REBUILD-OBS-12 | 確認画面に「写真」「計測データ」「定期取得項目」の 3 チャンクが表示される | 各項目が ChunkCard 形式で表示 |
| UI-REBUILD-OBS-13 | 確認画面から各項目を修正できる導線がある | 「修正」または戻るボタン |
| UI-REBUILD-OBS-14 | 確認画面の主ボタンは「登録」のみ（キャンセルは補助）| 1 画面 1 主ボタン原則 |

#### ステップ⑥: 登録（R2 INSERT）

| ID | 要件 | 受入 |
|---|---|---|
| UI-REBUILD-OBS-15 | 登録ボタン押下で R2 セッション JSON を INSERT する | `observation_sessions` テーブルへの INSERT イベント |
| UI-REBUILD-OBS-16 | R2 INSERT は INSERT ONLY（UPDATE/DELETE 禁止）| 上書き・削除 API を呼ばない |
| UI-REBUILD-OBS-17 | 登録完了後に成功状態を表示し、観測グリッド（05a）または ホームへ誘導する | 「登録完了」メッセージ + 次アクションボタン |
| UI-REBUILD-OBS-18 | 登録失敗時はエラー内容と再試行導線を表示 | ErrorBoundary 形式 |

### 6.3 観測フロー画面一覧

| Screen ID | URL | 役割 | Wave |
|---|---|---|---|
| `obs.ctx` | `/observation/context` | 種族・発育段階選択 | W3 |
| `obs.input` | `/observation/input` | 採取物・機器・タイミング入力 | W3 |
| `obs.confirm` | `/observation/input/confirm` | 確認 + 登録 | W3 |
| `obs.grid` | `/observation` | 観測検索グリッド | W3 |
| `obs.detail` | `/observation/:id` | 観測詳細 | W3 |
| `obs.template-list` | `/observation/templates` | テンプレ一覧 | W4 |
| `obs.template-detail` | `/observation/templates/:id` | テンプレ詳細 | W4 |

---

## §7 — E2E/CI 要件

### 7.0 入力ソース（REQ → E2E）

| 入力 | 正本 | 下流 |
|------|------|------|
| 機能 FR/NFR | **`01-要件/0X-*.md`** | `02-設計/E2E/NN-*-E2E-v1-DRAFT.md` |
| E2E 規約 | [`02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md`](../../02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md) §3 | 全機能 E2E 文書 |
| 詳細・遷移・UI | [`02-設計/features/NN-*/`](../../02-設計/features/README.md) | シナリオ手順・assert の補足 |

**STUB 拡張ルール**: `01-要件/NN-*.md` の受入基準ごとに `SC-NN-*` を起票。`05`/`06` と同型（REQ 正本 → シナリオ表 → RTM → Playwright）。`機能一覧/要件定義/0X` は使わない。

### 7.1 E2E 設計の方針

| ID | 要件 |
|---|---|
| UI-REBUILD-E2E-01 | E2E は「機能別」で書く（ドメインスモークだけでなく機能単位の入力→実行→保存）|
| UI-REBUILD-E2E-02 | Playwright を使用する。CI で自動実行される |
| UI-REBUILD-E2E-03 | E2E は実装前に「受け入れ基準」として先に仕様記述する（テスト設計ゲート #5）|
| UI-REBUILD-E2E-04 | route-matrix（全画面 200 OK + 主 CTA 表示 + 空状態テキスト）を Tier A 自動テストとして確立 |
| UI-REBUILD-E2E-05 | 機能別 E2E 詳細仕様は専用文書（`02-設計/E2E/NN-機能名-E2E-v1-DRAFT.md`）に分離する |

### 7.2 機能別 E2E シナリオ一覧

> **正本**: 機能別 E2E 文書が詳細仕様の正本。本節はサマリー・ポインタのみ。  
> **E2E 文書フォルダ**: [`02-設計/E2E/`](../../02-設計/E2E/)（2026-06-18 作成）  
> **E2E 正本インデックス**: [`02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md`](../../02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md)

#### 機能別 E2E シナリオ総数サマリー

| 機能 | 文書 | シナリオ数 | Tier B | ステータス |
|------|------|-----------|--------|-----------|
| **観測 (#05)** | [`05-観測-E2E-v1-DRAFT.md`](../../02-設計/E2E/05-観測-E2E-v1-DRAFT.md) | **13** | 13 | DRAFT 詳細記述済み |
| **マーケット (#06)** | [`06-マーケット-E2E-v1-DRAFT.md`](../../02-設計/E2E/06-マーケット-E2E-v1-DRAFT.md) | **17** | 17 | DRAFT 詳細記述済み |
| ホーム (#04) | [`04-ホーム-E2E-v1-DRAFT.md`](../../02-設計/E2E/04-ホーム-E2E-v1-DRAFT.md) | 5（計画）| — | STUB |
| 掲示板 (#07) | [`07-掲示板-E2E-v1-DRAFT.md`](../../02-設計/E2E/07-掲示板-E2E-v1-DRAFT.md) | **10** | 10 | DRAFT 詳細記述済み（2026-06-18） |
| **知の広場 Hub (#07·09·24)** | [`KN-知の広場-E2E-v1-DRAFT.md`](../../02-設計/E2E/KN-知の広場-E2E-v1-DRAFT.md) | **18** | 17（+Tier A 1） | DRAFT 詳細記述済み（2026-06-18） |
| 記事・ブログ (#24) | [`24-記事・ブログ-E2E-v1-DRAFT.md`](../../02-設計/E2E/24-記事・ブログ-E2E-v1-DRAFT.md) | **10** | 10 | DRAFT 詳細記述済み（2026-06-18） |
| ~~知の広場 UX提案~~ | [`07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](../../02-設計/E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md) | 4（骨子） | — | KN マスターに統合・UX 参照用 |
| カルマ (#08) | [`08-カルマ-E2E-v1-DRAFT.md`](../../02-設計/E2E/08-カルマ-E2E-v1-DRAFT.md) | 5（計画）| — | STUB |
| PT マーケット (#22) | [`22-プラチナコイン-E2E-v1-DRAFT.md`](../../02-設計/E2E/22-プラチナコイン-E2E-v1-DRAFT.md) | 5（計画）| — | STUB |

> **Tier B 実装優先度（HQ-07 確定）**: **①観測 → ②マーケット → ③カルマ → ④ホーム・掲示板**。詳細は [`00-E2E設計・運用正本-v1-DRAFT.md`](../../02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md) §2。

#### 観測 E2E シナリオ（SC-05-*）サマリー

| Scenario ID | 概要 | REQ |
|------------|------|-----|
| SC-05-CTX-01 | ObservationTarget 選択 + WorkflowContext 伝播 | OBS-CTX-01〜03, OBS-TGT-01〜05 |
| SC-05-BULK-01 | **[一括取得] → フェッチ完了 → 登録**（デュアルプライマリ確認）| UI-REBUILD-OBS-08, 10, 11 |
| SC-05-PHOTO-01 | **[写真撮影] → 撮影 + フェッチ + 登録**（デュアルプライマリ確認）| UI-REBUILD-OBS-09, 10, 11 |
| SC-05-SOL-01 | **5 ステップ完全フロー（一括取得経路）** | OBS-SOL-01, 全観測 REQ |
| SC-05-SOL-02 | 5 ステップ完全フロー（写真撮影経路）| OBS-SOL-01, OBS-SOL-06 |
| SC-05-SOL-03 | 環境スナップショット付き観測 | OBS-ENV-01 |
| SC-05-CONFIRM-01 | 確認画面 3 チャンク + 修正導線 + 1 主ボタン | UI-REBUILD-OBS-12〜14 |
| SC-05-REG-01 | 登録完了（R2 INSERT）+ 次アクション | UI-REBUILD-OBS-15〜17 |
| SC-05-TPL-01 | テンプレ選択・フォーム展開・フォーク | OBS-TPL-13〜17 |
| SC-05-NEG-01 | コンテキスト未選択 → 空状態 | UI-REBUILD-OBS-04 |
| SC-05-NEG-02 | 登録 API エラー → ErrorBoundary + 再試行 | UI-REBUILD-OBS-18 |
| SC-05-NEG-03 | バルクフェッチ API エラー → 手動入力フォールバック | UI-REBUILD-OBS-11 |
| SC-05-NEG-04 | 亜種未到達で確定禁止 | OBS-TGT-04 |
| SC-05-NEG-05 | AI 候補のみ・ユーザー確定前は登録不可 | OBS-SOL-04 |

> **デュアルプライマリ確認（HQ-04 確定）**: [一括取得] と [写真撮影] は**両方が primary ボタン**。SC-05-BULK-01 / SC-05-PHOTO-01 で両ボタンの `enabled` を同時 assert する。

#### マーケット E2E シナリオ（SC-06-*）サマリー

| Scenario ID | 概要 | チャネル |
|------------|------|---------|
| SC-06-BROWSE-01 | 全チャネルタブ表示 | 全 |
| SC-06-FIXED-01 | 固定価格出品作成 | 固定価格 |
| SC-06-TRADE-01 | 固定価格マッチング（Stage 0→1）| 固定価格 |
| SC-06-TRADE-02 | Stage 1 P2P ボード（振込コード・局留めヒント）| 全 |
| SC-06-TRADE-03 | 受取確認・評価→取引成立（Stage 2→3）| 全 |
| SC-06-TRADE-04 | 8% 貢献費振込案内（取引成立後）| 全 |
| SC-06-AUC-01 | オークション入札〜settleDueAuctions | オークション |
| SC-06-AUC-02 | オークション落札後 P2P フロー | オークション |
| SC-06-LOT-01 | **抽選応募・重複防止**（TX-LOTTERY）| 抽選 |
| SC-06-LOT-02 | **抽選締切・CSPRNG 当選確定** | 抽選 |
| SC-06-PRI-01 | **Coin 降順確定**（TX-PLATINUM-PRIORITY）| 優先順 |
| SC-06-TMPL-01 | テンプレ閲覧・適用 | テンプレ |
| SC-06-ENG-01 | Q&A 投稿・回答済みフラグ | Engagement |
| SC-06-NEG-01 | 不正状態遷移（409）| 全 |
| SC-06-NEG-02 | 権限なし状態変更（403）| 全 |
| SC-06-NEG-03 | 代金未払い 2 週間タイムアウト（Y02 解決）| 全 |
| SC-06-NEG-04 | 評価タグ+理由必須（Y08 解決）| 全 |

### 7.3 CI ゲート設計

| ゲート | 内容 | Tier |
|---|---|---|
| `tsc --noEmit` | TypeScript エラー 0 | 自動 |
| `vitest run` | ユニット・コンポーネントテスト | 自動 |
| Playwright route-matrix | 全画面 200 OK | A 自動 |
| Playwright E2E（主要 3 導線以上）| 観測・認証・掲示板 | B 自動 |
| axe-core アクセシビリティ基本 | Tab 到達・コントラスト | C 半自動 |
| 全画面手動打鍵 | 迷わない・戻れる・回復できる | D 人間のみ |

> **Phase ≠ ver1 · 段階打鍵**: Tier D は Phase 7 最終日の一括のみとせず、**Phase 6 各 Wave 完了時**に in-scope 画面を打鍵する。ver1 出荷判定は **ver1 in-scope** の Tier D 完走 + Tier B 緑。全 28 画面 Tier D は ver1 shippable の必須条件ではない。正本: [`ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`](../../02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md) §「Phase と ver1」· [`00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](../../01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.5。

### 7.4 ボタン・画面の存在確認要件

| ID | 要件 |
|---|---|
| UI-REBUILD-E2E-EXIST-01 | E2E テストはボタンの存在（`data-testid` または aria-label）を必ず assert する |
| UI-REBUILD-E2E-EXIST-02 | 画面の主 CTA ボタンが「押せる状態」であることを確認する（disabled でない）|
| UI-REBUILD-E2E-EXIST-03 | 観測フローの [一括取得] [写真撮影] ボタンを `data-testid="obs-bulk-fetch"` / `"obs-photo-capture"` で識別 |
| UI-REBUILD-E2E-EXIST-04 | 要件に記載されたボタンが mock に存在しない場合は RTM のギャップとして記録し Phase 1 で解消 |

---

## §8 — モックの位置づけ

| ID | 要件 |
|---|---|
| UI-REBUILD-MOCK-01 | モック（`02-設計/_ui-global/mockups/ihl-*.png` 53 枚）は**ワイヤーフレーム＝たたき台**であり、最終デザインではない |
| UI-REBUILD-MOCK-02 | モックと要件 ID の RTM（Phase 1 成果物）でギャップを可視化する |
| UI-REBUILD-MOCK-03 | モックに存在するが要件 ID がない項目は「要件漏れ候補」として記録する |
| UI-REBUILD-MOCK-04 | 要件に存在するがモックにない項目は「モック追加または ScreenDef で補完」として処理する |
| UI-REBUILD-MOCK-05 | ThemePack が確定した後でモックのトークン反映を確認する（モックを正本にしすぎない）|
| UI-REBUILD-MOCK-06 | 観測フロー 5 ステップのモックが 53 枚に含まれるか確認し、不足分を Phase 5 前に追加する | **HQ-08 ギャップ確定** — [`mock-gap-RTM-観測-v1-DRAFT.md`](../../02-設計/_ui-global/mock-gap-RTM-観測-v1-DRAFT.md) 参照（P0 不足 6 枚）|

---

## §9 — ウォーターフォール工程との対応

> 正本: `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`  
> **用語**: **Phase 0〜7 = HOW（工程）** · **ver1 = WHAT（初回出荷スコープ）** · **ver1 shippable = Phase 0〜7 完走（ver1 in-scope のみ）**。Phase 7 の Tier D は ver1 範囲 + Phase 6 Wave 段階打鍵。詳細は ADR 用語正本 § + `00-プロダクト方針` §1.5。

| フェーズ | 本文書との対応 |
|---|---|
| Phase 0 前提確定 | §3.2 salvage 判断・OSS ADR v1 確定（人間ゲート）|
| Phase 1 要件定義 | **本文書（§1〜§10）** が Phase 1 成果物の核。RTM を別 CSV として作成 |
| Phase 2 OSS 選定 | §5 の OSS 要件から 1 本確定（人間ゲート）|
| Phase 3 詳細設計 | §4.2 プリミティブ・§4.3 ScreenDef・§5 AppShell 配線図を設計書化 |
| Phase 4 遷移設計 | §6.3 観測フロー画面一覧 + ルートマスター表を確定 |
| Phase 5 UI 設計 | §4.4 ドメインテンプレ 6 種の ScreenDef 全 28 画面を確定（人間目視必須）|
| Phase 6 実装 Wave | **W3 観測（コア+テンプレ）** が §6 の要件を実装（`DELEGATED-IMPL-GO` 後のみ · **HQ-05 確定**）|
| Phase 7 検証 | §7.2 E2E シナリオ（**ver1 in-scope**）+ Tier D 段階打鍵の総括サインオフ（人間）|

---

## §10 — 未確定・人間確認事項

> 以下は AI が推測で決定しない。次フェーズ着手前に人間がレビューする。  
> **2026-06-18 更新**: **HQ-01〜HQ-09 すべて確定**（ユーザー確認済み）。

### 確定済み（2026-06-18）

| 番号 | 確認事項 | 確定内容 |
|------|---------|---------|
| **HQ-01** | OSS 選定 | **✅ Next.js 15 + shadcn/ui で Go（2026-06-07 ユーザー確定）** |
| **HQ-02** | salvage 4 点 + 旧 UI | **✅ Option A Go** — **移植**: api layer · observation hooks · lineage hooks（logic）· **廃棄**: `civUi.css` · 旧 UI JSX 全体 |
| **HQ-03** | 観測ターゲット DHH | **✅ DHH = *Dynastes hercules hercules***（学名・亜種。略称 DHH の正体。taxonomy ルート: Coleoptera › Scarabaeidae › Dynastes › *D. hercules* › *D. h. hercules*）|
| **HQ-04** | [一括取得] と [写真撮影] の分岐 | **✅ 両方が primary ボタン**（優先路なし · SC-05-BULK-01 / SC-05-PHOTO-01 で同時 assert）|
| **HQ-05** | 観測テンプレ（05tl / 05td / 05t）の Wave | **✅ W3 に含める** — W3=観測コア+テンプレ（05ctx / 05a / 05b / 05i / obs.confirm / 05tl / 05td / 05t）。旧「W4 観測テンプレ」Wave は廃止・W3 統合。ADR Phase 6 W4 以降は前詰め |
| **HQ-06** | ThemePack パック数 | **✅ 明/暗 2 パック必須** — `ThemePack-light` + `ThemePack-dark`。pack 別 CSS 変数。ユーザー手動切替または `prefers-color-scheme`。UI Builder は両 pack 編集または単一 pack セレクタ。**`preferences.md` §B（lineage dark）と §A（コア light 維持可）を 2 パックで両立** |
| **HQ-07** | E2E Tier B の対象機能優先度（§7.2）| **✅ ①観測 ②マーケット ③カルマ ④ホーム・掲示板** — 正本: [`00-E2E設計・運用正本-v1-DRAFT.md`](../../02-設計/E2E/00-E2E設計・運用正本-v1-DRAFT.md) §2 HQ-07 |
| **HQ-08** | モック 53 枚の観測 5 ステップ充足 | **ギャップあり確定** — デュアルプライマリ・確認・登録完了の P0 mock **6 枚不足**。正本: [`mock-gap-RTM-観測-v1-DRAFT.md`](../../02-設計/_ui-global/mock-gap-RTM-観測-v1-DRAFT.md) · Phase 1 RTM に転記 · Phase 5 前に補完 |
| **HQ-09** | 本文書（21）v1.0 格上げタイミング | **✅ Go（2026-06-07 ユーザー承認）** — Phase 1 人間サインオフ完了により本書を **v1.0 確定・人間レビュー済** へ格上げ |

---

## 付録 A — REQ ID 索引（本文書）

| REQ ID | 内容 | 節 |
|---|---|---|
| UI-REBUILD-NFR-01〜08 | 非機能要件 | §2 |
| UI-REBUILD-DEP-01〜04 | 廃止方針 | §3 |
| UI-REBUILD-THEME-01〜06 | ThemePack | §4.1 |
| UI-REBUILD-PRIM-01〜09 | プリミティブカタログ | §4.2 |
| UI-REBUILD-SDEF-01〜04 | ScreenDef | §4.3 |
| UI-REBUILD-OSS-01〜06 | OSS・配線 | §5 |
| UI-REBUILD-OBS-01〜18 | 観測フロー | §6 |
| UI-REBUILD-E2E-01〜04 | E2E 方針 | §7.1 |
| UI-REBUILD-E2E-OBS-01〜04 | 観測 E2E | §7.2 |
| UI-REBUILD-E2E-AUTH-01 | 認証 E2E | §7.2 |
| UI-REBUILD-E2E-BOARD-01 | 掲示板 E2E | §7.2 |
| UI-REBUILD-E2E-MKT-01 | マーケット E2E | §7.2 |
| UI-REBUILD-E2E-ROUTE-01 | route-matrix | §7.2 |
| UI-REBUILD-E2E-EXIST-01〜04 | ボタン・画面存在確認 | §7.4 |
| UI-REBUILD-MOCK-01〜06 | モック位置づけ | §8 |

---

*v1.0 確定（2026-06-07 / HQ-09 Go）· 実装禁止ゲート有効 · 2026-06-18 更新 · **HQ-01〜09 すべて確定***
