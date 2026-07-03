---
slice_id: 05-MICRO-screen-002
type: screen-state
route: /observation/input
kind: form
auth: public（READ 系フェッチのみ · commit は confirm で session）
primary_action: 確認へ（→ /observation/input/confirm）
states:
  - loading
  - empty
  - error
  - ok
impl: apps/web/src/app/observation/input/page.tsx
catalog_ref: ../../遷移辞書-v1.json
---

# 05-MICRO-screen-002 — `/observation/input`（計測入力フォーム）

- **owner**: tier-a
- **type**: screen-state
- **inputs**: `/observation/input` · `kind=form` · `ui-reference/preferences.md`
- **acceptance**: loading / empty / error / ok の 4 状態 · 主ボタン 1 · 3 クリック以内（観測入力）

## 目的

固体観測（solid observation）の**入力ドラフト作成**画面。フェーズ/性別 · 計測テンプレ · 命名 · 環境・設置 · 次回観測 · 計測行 · 写真 · 撮影条件を `sessionStorage` draft（`observation-draft`）に集約し、`確認へ` で binding moment（confirm）へ橋渡しする。ここでは**書き込み commit をしない**（READ 系 API のみ）。

## ルート / 認証

| 項目 | 値 |
|------|-----|
| route | `/observation/input`（`app/observation/input/page.tsx`） |
| kind | form（複数 Card チャンク · draft 編集） |
| auth | **public** — このページ自体はガードなし。呼ぶ API は READ（templates / dictionary / devices / placements / individuals）。実 commit は次画面 confirm の `POST /api/solid-observation/commit`（session） |
| draft | `readDraft` / `writeDraft`（`sessionStorage` · 300ms デバウンス保存） |

## 画面状態（4 状態）

| 状態 | 判定条件（実装） | 表示 | data-testid |
|------|------------------|------|-------------|
| **loading** | `hydrated === false`（draft ハイドレート前）· 各 READ フェッチ進行中 | チャンクは即描画されるが選択肢が空（テンプレ/辞書/機器 反映待ち）· `statusStrip` 「待機中」 | `obs-status-strip` |
| **empty** | `!hasContext`（`draft.species` 空 → クエリ未指定で直接来訪） | 「観測対象が未設定です」Card + **種族を選ぶ**（→ `/observation/context`） | `obs-empty-state` / `obs-select-species-btn` |
| **error** | READ 失敗（`devicesError` · `envSnapshotError` · `rowSyncError[i]` · `placementError` · `templateError` · `photoCaptureError`） | 各チャンク内に理由テキスト（`text-civ-danger`）· 手入力/再試行導線 | `obs-placement-empty` 他 |
| **ok** | `hasContext && hydrated`（種族確定 · draft 編集可） | 全チャンク編集可 · 主ボタン「確認へ」活性 | `obs-input-page` |

> 環境値取得失敗（`TELEMETRY_NOT_FOUND`）は**手入力に自動フォールバック**（`formatEnvTelemetryFetchError` + rows を `manual_entry` 化）。UX を止めない設計（OBS-ENV / preferences §C）。

## 表示要素（チャンク構成 · 3〜5 の原則を機能単位で拡張）

- **観測対象** Card: species / scope_route / target / individual サマリー。
- **発育フェーズ / 性別**（`obs-phase-sex-section`）: `obs-phase-select`（初令〜生体）· `obs-sex-select`。
- **計測テンプレート**（`obs-measurement-template-section`）: 種族紐づきテンプレ select · 種族一致注記。
- **個体命名**（`obs-name-summary`）: ブランドテンプレ · 表示名 · 父/母 select · テンプレから自動命名 · テンプレ追加インライン。
- **環境・設置**（`obs-env-placement-chunk`）: placement select · 棚追加インライン · 設置開始日 · 機器/役割宣言。
- **次回観測日**（`obs-next-observation-chunk`）: date picker · skip checkbox。
- **採取アイテム / 観測個体データ**（`obs-chunk-individual-data`）: `StructuredRow` 計測行 · 行追加 · 一括取得 · 環境スナップショット同梱。
- **写真追加**（`obs-chunk-photo-add`）: 撮影 / 写真選択 · プレビュー。写真ありで**撮影時環境データ**（`obs-chunk-photo-env`）。
- **カメラモーダル**（`obs-camera-modal`）: HTTPS/localhost 限定注記付き。

## CTA（1 画面 1 主導線）

| 種別 | ラベル | 遷移 / 動作 | testid |
|------|--------|-------------|--------|
| **主ボタン** | 確認へ | `moveToConfirm()` → `writeDraft` → `/observation/input/confirm` | `obs-confirm-next` |
| 戻り導線 | ← 文脈選択に戻る | → `/observation/context` | — |
| secondary | 撮影する / 写真を選択 / 一括取得 / 棚を追加 / テンプレ追加 | 各動作 | `obs-photo-capture` 他 |
| empty 時 | 種族を選ぶ | → `/observation/context` | `obs-select-species-btn` |

> 画面内 `variant="primary"` は「撮影する」「一括取得」等の局所主操作もあるが、**画面全体の前進主ボタンは「確認へ」1 つ**（最下部 · 全チャンク確定後）。

## API 呼び出し（すべて READ）

| タイミング | 呼び出し | 用途 |
|-----------|----------|------|
| マウント | `GET /api/v1/observation/measurement-dictionary?scope=solid` | 計測項目/単位/方法候補 |
| マウント | `GET /api/v1/observation/templates?species=` | 観測テンプレ一覧 |
| マウント | `GET /api/v1/naming/templates` · `/api/v1/devices` · `/api/env/placements` · `/api/v1/individuals/search` | 命名/機器/棚/親個体 |
| 辞書拡張 | `POST /api/v1/observation/dictionary-extensions`（項目/単位追加時 · 失敗は黙認） | 語彙拡張 |
| IoT 取得 | `POST /api/v1/devices/{id}/sync` · `GET /api/env/devices/{id}/latest` | SwitchBot / ingest 値 |

> **commit はこの画面で発火しない**。関連スライス: [`../api/get-api-v1-observation-templates.md`](../api/get-api-v1-observation-templates.md) · [`../api/get-api-v1-observation-measurement-dictionary.md`](../api/get-api-v1-observation-measurement-dictionary.md) · [`../api/post-api-v1-observation-dictionary-extensions.md`](../api/post-api-v1-observation-dictionary-extensions.md)

## data-testid 一覧（抜粋）

| testid | 対象 |
|--------|------|
| `obs-input-page` | ページルート（ok） |
| `obs-empty-state` / `obs-select-species-btn` | 種族未設定（empty） |
| `obs-phase-select` / `obs-sex-select` | フェーズ・性別 |
| `obs-measurement-rows` / `obs-dd-add-custom` / `obs-bulk-fetch` | 計測行・追加・一括取得 |
| `obs-photo-capture` / `obs-photo-file-select` / `obs-photo-preview` | 写真 |
| `obs-status-strip` | 状態ストリップ（loading/進行表示） |
| `obs-confirm-next` | 主ボタン「確認へ」 |

## キーボード導線

- **Tab 順**: 戻りリンク → 各 Card の select/Input（フェーズ → 性別 → テンプレ → 命名 → 環境・設置 → 次回観測 → 計測行 → 写真）→ 最下部「確認へ」。全要素ネイティブ操作可（`select` 矢印、`checkbox` Space、`Input` 直接入力）。
- **Enter**: 棚追加 Input は `onKeyDown Enter` で `createPlacement()` 実行（明示配線）。他の Input は Tab→ボタン Enter。
- **min-h-[44px]**: 主要 select/ボタンは 44px 高でフォーカス/タップ領域確保。
- **カメラモーダル**: `obs-camera-device-select` → 撮影/再読み込み/閉じる の順に Tab。閉じるでストリーム停止。
- **3 クリック以内**: `/observation` →（計測入力 1）→ 入力 → 「確認へ」（確定は confirm 側）。空状態でも「種族を選ぶ」1 クリックで復帰。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-INPUT-01〜05 | UT-05-input | 入力ドラフト・チャンク構成 |
| OBS-TPL-03/04 | IT-05-tpl | テンプレ適用・計測保存前段 |
| OBS-ENV-01/02 | IT-05-env | 環境スナップショット同梱 / 手入力フォールバック |
| OBS-NF-04 | — | empty / error / loading 完備 |
| OBS-RX-UX-01 | — | 3 データチャンク UX |

## impl 引用

```1044:1058:apps/web/src/app/observation/input/page.tsx
  if (!hasContext) {
    return (
      <PageColumn>
        <Card data-testid="obs-empty-state">
          <CardTitle>観測対象が未設定です</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">先に種族コンテキストを設定してください。</p>
          <Link href="/observation/context" className="no-underline">
            <Button className="mt-4" data-testid="obs-select-species-btn">
              種族を選ぶ
            </Button>
          </Link>
        </Card>
      </PageColumn>
    );
  }
```

```868:876:apps/web/src/app/observation/input/page.tsx
  const moveToConfirm = () => {
    const next = {
      ...draft,
      statusStrip: draft.statusStrip === "待機中" ? "入力確認待ち" : draft.statusStrip,
    };
    setDraft(next);
    writeDraft(next);
    router.push("/observation/input/confirm");
  };
```

## 整合

- 遷移辞書 `web_routes[/observation/input].states = [draft, validation_error, ready]` は編集モデル語彙。本カードは acceptance の共通 4 状態（loading/empty/error/ok）に**マッピング**して記述（draft→ok · validation_error→error · 未文脈→empty）。差異は意図的で ROUTE-INDEX の states と両立。
- `no-user-facing-unimplemented` 遵守: 環境自動計測外は「手入力が正」と事実表記。
- 実 commit 経路は [`observation-confirm.md`](./observation-confirm.md) 参照。
