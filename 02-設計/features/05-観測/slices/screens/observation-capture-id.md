---
slice_id: 05-MICRO-screen-004
type: screen-state
route: /observation/[capture_id]
route_impl: /observation/[id]
kind: detail
auth: public（Scope A READ）
primary_action: この個体を引用（→ /board/paper?cite_capture=） · reanalysis-manifest
states:
  - loading
  - empty
  - error
  - ok
impl: apps/web/src/app/observation/[id]/page.tsx
components: apps/web/src/components/observation/ObservationDetailSections.tsx
catalog_ref: ../../遷移辞書-v1.json
---

# 05-MICRO-screen-004 — `/observation/[capture_id]`（観測 詳細）

- **owner**: tier-a
- **type**: screen-state
- **inputs**: `/observation/[capture_id]` · `kind=detail` · `ui-reference/preferences.md`
- **acceptance**: loading / empty / error / ok の 4 状態 · 主ボタン 1 · 3 クリック以内（観測詳細）

## 目的

単一 capture の**公開詳細ビュー**。写真（色補正なし）· 撮影条件 · 計測表 · 環境 snapshot · デバイス · 類似個体を提示し、`引用`（掲示板）· `reanalysis-manifest` · `親個体詳細` へ橋渡しする。Scope A のため未ログインでも閲覧可能。

## ルート / 認証

| 項目 | 値 |
|------|-----|
| route（論理） | `/observation/[capture_id]`（遷移辞書 · ROUTE-INDEX） |
| route（実装） | `/observation/[id]`（`app/observation/[id]/page.tsx` · 動的 param 名 `id`） |
| kind | detail（左: 本体 / 右: 類似 aside の 2 カラム） |
| auth | **public** — `GET /api/v1/observation/{capture_id}` は Scope A（401 なし）。画像は `AuthenticatedImage`（blob · OBS-GAP-02） |

> **登録差異メモ**: 論理 param `capture_id` に対し実装フォルダは `[id]`。機能は同一（`String(params.id)`）。

## 画面状態（4 状態）

| 状態 | 判定条件（実装） | 表示 | data-testid |
|------|------------------|------|-------------|
| **loading** | `loading === true`（初回 fetch 中） | `StatePanel kind="loading"`「観測詳細を読み込み中」 | — |
| **empty**（not_found） | `errorState.kind==="empty"`（404 · `ApiError.status===404`） | パンくず + `StatePanel kind="empty"`「capture_id=… の観測データがありません」+ **検索に戻る** | — |
| **error** | `errorState.kind==="error"`（404 以外の失敗） | パンくず + `StatePanel kind="error"`「観測データの取得に失敗しました」+ 理由 + **検索に戻る** | — |
| **ok** | `data` 取得成功 | `ObservationDetailSections`（写真/計測/環境/デバイス/類似） | `obs-detail-page` |

> 遷移辞書は `[loading, not_found, ok]`。本カードは acceptance 共通 4 状態へ拡張（not_found→empty · 通信/500→error）。画像 blob 単体の 404 は詳細内で「画像がありません」プレースホルダに退避（ページは ok のまま · OBS-GAP-02）。

## 表示要素

- **パンくず**（`nav aria-label="パンくず"`）: 観測 › 検索 › 個体詳細（empty/error 時も表示）。
- **ヘッダ**: 見出し（`display_name ?? species ?? capture_id`）· capture id · 観測日時 · 属性（性別 · phase）· individual。右に **親個体詳細へ**（`individual_id` あり時）· **この個体を引用**（primary）。
- **写真 Card**（`obs-detail-photo` / `obs-detail-no-photo`）: `AuthenticatedImage`（`object-contain` · 色補正なし）or `photoAbsentMessage`。写真条件（`obs-detail-photo-conditions`）「色補正なし · 自然光想定」。
- **計測 Card**（`obs-detail-measurements`）: 項目/値/方法/由来テーブル（10 行超は「残り N 行を表示」展開）· `Badge`（value_origin）。
- **環境 snapshot Card**（`obs-detail-env-snapshot`）: 温度/湿度/取得元/計測時刻。
- **デバイス Card**（`obs-detail-devices`）: role: device_id (source)。
- **reanalysis-manifest リンク**（`obs-detail-manifest-link` · 別タブ）。
- **類似個体 aside**（`obs-detail-similar`）: score バー + サムネイル · 空時「類似する個体がまだありません」。

## CTA（1 画面 1 主導線）

| 種別 | ラベル | 遷移 / 動作 | testid |
|------|--------|-------------|--------|
| **主ボタン（画面内 primary）** | この個体を引用 | → `/board/paper?cite_capture={captureId}` | `obs-detail-cite-btn` |
| 主導線（遷移辞書） | reanalysis-manifest | `GET /api/v1/observation/{id}/reanalysis-manifest`（別タブ） | `obs-detail-manifest-link` |
| secondary | 親個体詳細へ | → `/individuals/{individual_id}` | `obs-open-individual` |
| 類似 | 類似個体リンク | → `/observation/{capture_id}`（他個体詳細） | `obs-detail-similar-link` |
| empty/error | 検索に戻る | → `/observation` | — |

> 画面内 `variant="primary"` は「この個体を引用」1 つ（1 画面 1 主ボタン）。遷移辞書の `primary_action=再解析マニフェスト` は API 導線として manifest リンクで提示。

## API 呼び出し

| タイミング | 呼び出し | auth | 成功 | エラー |
|-----------|----------|------|------|--------|
| マウント | `GET /api/v1/observation/{capture_id}` | public | 200 → ok | 404 → empty · その他 → error |
| 写真 | `GET /api/v1/observation/{capture_id}/image`（`AuthenticatedImage` blob） | public | 200 | 404 → 「画像がありません」枠 |
| manifest | `GET /api/v1/observation/{capture_id}/reanalysis-manifest` | public | 200（別タブ JSON） | — |

関連スライス: [`../api/get-api-v1-observation-capture-id.md`](../api/get-api-v1-observation-capture-id.md) · [`../api/get-api-v1-observation-capture-id-image.md`](../api/get-api-v1-observation-capture-id-image.md) · [`../api/get-api-v1-observation-capture-id-reanalysis-manifest.md`](../api/get-api-v1-observation-capture-id-reanalysis-manifest.md) · エラー: [`../errors/404.md`](../errors/404.md)

## data-testid 一覧

| testid | 対象 |
|--------|------|
| `obs-detail-page` | 詳細 article ルート（ok） |
| `obs-detail-photo` / `obs-detail-photo-img` / `obs-detail-no-photo` | 写真枠 |
| `obs-detail-photo-conditions` | 撮影条件 |
| `obs-detail-measurements` | 計測テーブル |
| `obs-detail-env-snapshot` / `obs-detail-devices` | 環境 / デバイス |
| `obs-detail-manifest-link` | reanalysis-manifest |
| `obs-detail-cite-btn` | この個体を引用（primary） |
| `obs-open-individual` | 親個体詳細へ |
| `obs-detail-similar` / `obs-detail-similar-link` | 類似 aside |

## キーボード導線

- **Tab 順**: パンくず（観測/検索リンク）→ 親個体詳細へ → この個体を引用 → 計測「残り N 行を表示」（`button`）→ reanalysis-manifest → 類似個体リンク群。全ネイティブ `a` / `button`。
- **Enter**: 「この個体を引用」でフォーカス Enter → 掲示板 paper へ。manifest は別タブ（`target="_blank" rel="noreferrer"`）。
- **empty/error**: 「検索に戻る」リンクが Tab 到達可能（代替導線必須 · OBS-NF-04）。
- **展開**: 計測 10 行超の「残り N 行を表示」はネイティブ `button`（`role` 明示不要）。
- **3 クリック以内**: `/observation` →（詳細を見る 1）→ 詳細 → 引用/manifest/親個体（各 1 クリック）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-GAP-01 | — | Scope A 詳細 public READ |
| OBS-GAP-02 | — | `AuthenticatedImage` blob 表示 |
| OBS-IMG-04/05 | UAT-05 | 詳細動的セクション（計測/類似/環境） |
| OBS-RX-RD-06 | — | reanalysis-manifest 導線 |
| OBS-NF-04 | — | loading / not_found / error 完備 |

## impl 引用

```92:116:apps/web/src/app/observation/[id]/page.tsx
  if (loading) {
    return (
      <PageColumn className="max-w-6xl">
        <StatePanel kind="loading" title="観測詳細を読み込み中" />
      </PageColumn>
    );
  }

  if (errorState || !data) {
    return (
      <PageColumn className="max-w-6xl">
        <Stack>
          <ObservationBreadcrumb />
          <StatePanel
            kind={errorState?.kind ?? "error"}
            title={errorState?.title ?? "観測データを表示できません"}
            description={errorState?.description}
          />
          <Link href="/observation" className="text-sm text-civ-info">
            検索に戻る
          </Link>
        </Stack>
      </PageColumn>
    );
  }
```

```148:153:apps/web/src/components/observation/ObservationDetailSections.tsx
          <Link href={`/board/paper?cite_capture=${captureId}`} className="no-underline">
            <Button variant="primary" data-testid="obs-detail-cite-btn">
              この個体を引用
            </Button>
          </Link>
```

## 整合

- 遷移辞書 `web_routes[/observation/[capture_id]].states = [loading, not_found, ok]` を 4 状態へマッピング（not_found→empty · 通信失敗→error）。
- DET §3.11 フロント観測ルート `/observation/[capture_id]` = 詳細 と整合。
- `no-user-facing-unimplemented` 遵守: 環境グラフ・時系列は「今後のバージョンで表示」と事実表記（「未実装」語なし）。
