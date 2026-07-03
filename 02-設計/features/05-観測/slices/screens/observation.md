---
slice_id: 05-MICRO-screen-001
type: screen-state
route: /observation
kind: list
auth: public
primary_action: 観測を追加（→ /observation/input）
states:
  - loading
  - empty
  - error
  - ok
impl: apps/web/src/app/observation/page.tsx
catalog_ref: ../../遷移辞書-v1.json
---

# 05-MICRO-screen-001 — `/observation`（観測 検索 · 一覧）

- **owner**: tier-a
- **type**: screen-state
- **inputs**: `/observation` · `kind=list` · `ui-reference/preferences.md`（血統 OS UI 好み）
- **acceptance**: loading / empty / error / ok の 4 状態 · 主ボタン 1 · 3 クリック以内（観測ホーム/検索）

## 目的

Scope A の**コミュニティカタログ横断検索**。ログイン不要で capture 一覧をグリッド表示し、種 / 性別フィルタで絞り込む。ここが観測フィーチャの**ホーム導線**であり、`計測入力`（新規観測）と `詳細`（個体詳細）への 2 大分岐点。

## ルート / 認証

| 項目 | 値 |
|------|-----|
| route | `/observation`（Next.js App Router · `app/observation/page.tsx`） |
| kind | list（フィルタ + カードグリッド） |
| auth | **public**（`useObservationSearch` → `POST /api/v1/observation/search` は Scope A · 401 なし） |
| 画像 | `AuthenticatedImage`（`api.fetchBlob` · `IHL_AUTH_REQUIRED=1` でも 200 · OBS-GAP-02） |

## 画面状態（4 状態）

| 状態 | 判定条件（実装） | 表示 | data-testid |
|------|------------------|------|-------------|
| **loading** | `loading === true`（初回 `search({})` 実行中） | `StatePanel kind="loading"`「検索中」+「読み込み中…」 | — |
| **empty** | `!loading && !error && emptyMessage`（API `status="empty"`） | `StatePanel kind="empty"`「該当なし」+ `emptyMessage`（`条件に一致する観測データがありません` / `観測データが未登録です`） | — |
| **error** | `error` 非空（通信/検証失敗） | `StatePanel kind="error"`「検索エラー」+ 理由 + **再試行**ボタン（`onRetry=search({})`） | — |
| **ok** | `items.length > 0` | 件数（`{total} 件`）+ カードグリッド（`sm:2 / lg:3` 列） | `obs-grid-page` |

> 4 状態は排他。`StatePanel`（`components/ui/state-panel.tsx`）は `role="status"` `aria-live="polite"`、loading は `aria-busy`。

## 表示要素

- **ヘッダ**: 見出し「観測 検索」/ 補足「色補正なし · 撮影条件を併記」（観測写真ポリシー · preferences §C）。
- **アクション群**（ヘッダ右）: `ContextPicker` · **文脈設定**（→ `/observation/context`）· **計測入力**（→ `/observation/input`）· **テンプレ**（→ `/observation/templates`）。
- **フィルタ Card**: 種（`Input` · `aria-label="種"`）· 性別（`select` · 雄/雌/不明）· **絞り込む**（variant=primary）。
- **結果カード**（`items[]` 各件）: サムネイル（`image_url` あり時 `AuthenticatedImage` / なし時 `photoAbsentMessage`）· 表示名（`display_name ?? species ?? capture_id`）· 種 · capture_id · 観測日時（`formatObservedAt`）· 属性（性別 · phase · view_type）· 主要計測（`key_measurements` 最大 3）· **詳細を見る**（→ `/observation/{capture_id}`）· **個体へ**（`individual_id` あり時 → `/individuals/{id}`）。

## CTA（1 画面 1 主導線）

| 種別 | ラベル | 遷移 / 動作 | 備考 |
|------|--------|-------------|------|
| **主導線（意味）** | 観測を追加 | → `/observation/input` | 遷移辞書 `primary_action`。新規観測の起点 |
| 画面内 primary | 絞り込む | `search({species, sex})` | variant=primary の唯一のボタン（検索実行） |
| secondary | 計測入力 / 文脈設定 / 詳細を見る | 各ルート | 3 クリック以内の分岐 |
| ghost | テンプレ | → `/observation/templates` | |

> **1 画面 1 主ボタン**: 画面内で `variant="primary"` は「絞り込む」1 つ。観測追加は意味的主導線として secondary リンクで提示（検索画面の第一目的が「探す」であるため）。差異は preferences §A の許容範囲として記録。

## API 呼び出し

| タイミング | 呼び出し | 状態への反映 |
|-----------|----------|--------------|
| マウント時 | `POST /api/v1/observation/search`（`useObservationSearch.search({})`） | loading → ok / empty / error |
| フィルタ実行 | `POST /api/v1/observation/search`（`{species?, sex?}`） | 同上 |
| サムネイル | `GET /api/v1/observation/{capture_id}/image`（`AuthenticatedImage` 経由 blob） | 画像 or `photo_absent_reason` プレースホルダ |
| 文脈適用 | `ContextPicker onApply` → `search({stage_name:"adult"})` | ok/empty |

関連スライス: [`../api/post-api-v1-observation-search.md`](../api/post-api-v1-observation-search.md) · [`../api/get-api-v1-observation-capture-id-image.md`](../api/get-api-v1-observation-capture-id-image.md)

## data-testid 一覧

| testid | 対象 |
|--------|------|
| `obs-grid-page` | ページルート（PageColumn） |
| `obs-open-context` | 文脈設定ボタン |
| `obs-grid-thumbnail-wrap` / `obs-grid-no-photo` | サムネイル枠（写真有無） |
| `obs-grid-thumbnail` | `AuthenticatedImage` |
| `obs-open-detail` | 詳細を見るリンク |

## キーボード導線

- **Tab 順**: 文脈設定 → 計測入力 → テンプレ → 種 Input → 性別 select → 絞り込む → （結果）詳細を見る → 個体へ。すべてネイティブ `button` / `a` / `input` / `select` でフォーカス可能。
- **Enter**: フィルタ Input/select にフォーカス後、Tab で「絞り込む」へ移動し Enter 実行（Input 内 Enter の暗黙 submit は未配線 · 明示ボタン方式）。
- **select**: 性別は矢印キー選択。`min-h-[44px]` でタップ/フォーカス領域を確保。
- **StatePanel error**: 「再試行」は Tab 到達可能な `button`。
- **3 クリック以内**: ホーム(`/observation`) → 計測入力 は 1 クリック / 詳細は「詳細を見る」1 クリック。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-GAP-01 | IT-05-21 | Scope A public search · auth ON でも一覧表示 |
| OBS-RX-RD-01 | UAT-05-01 | 一覧カード enrich（key_measurements / photo_absent_reason） |
| OBS-NF-04 | — | empty / error / loading の 3 状態必須 |
| OBS-GAP-02 | — | `AuthenticatedImage` によるサムネイル |

## impl 引用

```31:32:apps/web/src/app/observation/page.tsx
  return (
    <PageColumn data-testid="obs-grid-page">
```

```84:90:apps/web/src/app/observation/page.tsx
        {loading ? <StatePanel kind="loading" title="検索中" /> : null}
        {error ? (
          <StatePanel kind="error" title="検索エラー" description={error} onRetry={() => void search({})} />
        ) : null}
        {!loading && !error && emptyMessage ? (
          <StatePanel kind="empty" title="該当なし" description={emptyMessage} />
        ) : null}
```

## 整合

- 状態語は遷移辞書 `web_routes[/observation].states = [loading, empty, error, ok]` と一致。
- `no-user-facing-unimplemented` 遵守: 空状態は事実ベース文言、「未実装」語なし。
- ROUTE-INDEX: [`docs/registry/ROUTE-INDEX-v1.csv`](../../../../docs/registry/ROUTE-INDEX-v1.csv) `05,/observation,list` 行と整合。
