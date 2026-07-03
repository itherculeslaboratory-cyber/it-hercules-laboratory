---
slice_id: 05-MICRO-screen-003
type: screen-state
route: /observation/confirm
route_impl: /observation/input/confirm
kind: confirm
auth: session（commit API · IHL_AUTH_REQUIRED=1 時 401）
primary_action: 登録する（→ /observation/done）
states:
  - loading
  - empty
  - error
  - ok
impl: apps/web/src/app/observation/input/confirm/page.tsx
catalog_ref: ../../遷移辞書-v1.json
---

# 05-MICRO-screen-003 — `/observation/confirm`（登録前の確認 · binding moment）

- **owner**: tier-a
- **type**: screen-state
- **inputs**: `/observation/confirm` · `kind=confirm` · `ui-reference/preferences.md`
- **acceptance**: loading / empty / error / ok の 4 状態 · 主ボタン 1 · 3 クリック以内（観測 confirm（binding moment））

## 目的

入力ドラフトの**最終確認と commit（binding moment）**。3 チャンク（観測個体データ · 写真 · 撮影時環境）+ 命名 + 環境設置 + 次回観測サマリーを提示し、`登録する` で `POST /api/solid-observation/commit` を発火する。ここが**個体・計測・写真・血統が確定する唯一の瞬間**（INSERT ONLY · R2 事象化）。

## ルート / 認証

| 項目 | 値 |
|------|-----|
| route（登録正本） | `/observation/confirm`（遷移辞書 · ROUTE-INDEX の論理名） |
| route（実装） | **`/observation/input/confirm`**（`app/observation/input/confirm/page.tsx` · `moveToConfirm` の push 先） |
| kind | confirm（読み取り主体 + 主 commit ボタン） |
| auth | commit API は **session 必須**（`IHL_AUTH_REQUIRED=1` で未ログインは 401 `AUTH_REQUIRED`）。ページ描画自体はガードなし（draft は sessionStorage） |

> **登録差異メモ**: 論理ルート `/observation/confirm` に対し実装は `/observation/input/confirm`。ROUTE-INDEX-v1.csv を実装値へ更新（`route=/observation/input/confirm` · note に別名併記）。

## 画面状態（4 状態）

| 状態 | 判定条件（実装） | 表示 | data-testid |
|------|------------------|------|-------------|
| **loading** | `submitting === true`（commit 実行中） | 主ボタンが「登録中...」で `disabled` | `obs-register-submit` |
| **empty** | `!draft`（sessionStorage に draft なし · 直接来訪/リロード欠落） | 「確認データが見つかりません」Card + **入力へ戻る** | `obs-error-boundary` / `obs-retry-btn` |
| **error** | `error` 非空（commit 400/401/404/409 等） | 「登録エラー」Card + `text-civ-danger` 理由 + **再試行** | `obs-error-boundary` / `obs-retry-btn` |
| **ok** | `draft` 有 · 未送信（`review`） | 全サマリー Card + 主ボタン「登録する」活性 | `obs-confirm-page` |

> commit 成功時は `writeCommitRecord` 後に `/observation/done` へ遷移（`committed` は done 画面が受ける）。`isReady`（計測行に item+value が 1 行以上）不成立で送信すると即 error（「入力値が不足しています」）。

## 表示要素

- **ヘッダ**: 「登録前の確認」/「3 チャンク（観測個体データ · 写真 · 撮影時環境）を確認してから登録します」。
- **観測個体データ**（`obs-chunk-individual-data`）: フェーズ/性別 · 計測行一覧（item: value unit · source）· 環境スナップショット同梱注記 · **計測値を編集**（→ input `?edit=measurement`）。
- **写真追加**（`obs-chunk-photo`）: プレビュー or「写真は未登録です」· **写真を編集**（`?edit=photo`）。
- **写真撮影時 環境データ**（`obs-chunk-photo-env` · 写真あり時）: 撮影条件サマリー · **撮影時環境を編集**。
- **命名チャンク**（`obs-name-history`）: individual / display_name / 父母 · 改名履歴（最新 5）。
- **環境・設置サマリー**（`obs-chunk-periodic`）: placement · 設置開始日 · 機器（role:id）。
- **次回観測サマリー**（`obs-next-observation-summary`）: 予定日 / skip / 由来。
- **エラー Card**（error 時）: 理由 + 再試行。

## CTA（1 画面 1 主導線）

| 種別 | ラベル | 遷移 / 動作 | testid |
|------|--------|-------------|--------|
| **主ボタン** | 登録する | `registerObservation()` → `POST /api/solid-observation/commit` → `/observation/done` | `obs-register-submit` |
| secondary | この設定をテンプレートとして保存 | `POST /api/v1/observation/templates` | `obs-save-template-btn` |
| secondary | 各チャンク「編集」 | → `/observation/input?from=confirm&edit=…` | `obs-edit-measurement` 他 |
| ghost | キャンセル | → `/observation` | `obs-cancel-btn` |
| empty/error | 入力へ戻る / 再試行 | → input / 再 commit | `obs-retry-btn` |

## API 呼び出し

| タイミング | 呼び出し | auth | 成功 | エラー |
|-----------|----------|------|------|--------|
| 登録する | `POST /api/solid-observation/commit` | session | 201 → `/observation/done` | 400（`DIGEST_MISMATCH`/計測なし）· 401（`AUTH_REQUIRED`）· 404（PRIOR/TELEMETRY not found）· **409（表示名重複 → 命名やり直し）** |
| テンプレ保存 | `POST /api/v1/observation/templates` | session | 201 | 400/401 |
| 命名履歴 | `GET /api/v1/naming/history/{individualId}` | public | 200 | 黙認（空表示） |

> commit body は `computeObservationClientContentDigest`（`clientContentDigest`）+ `resolvePhotoDataUrl` を含む。関連スライス: [`../api/post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · エラー: [`../errors/409.md`](../errors/409.md) · [`../errors/400.md`](../errors/400.md) · [`../errors/401.md`](../errors/401.md)

## data-testid 一覧

| testid | 対象 |
|--------|------|
| `obs-confirm-page` | ページルート（ok） |
| `obs-error-boundary` / `obs-retry-btn` | empty / error Card |
| `obs-register-submit` | 主ボタン「登録する」 |
| `obs-save-template-btn` / `obs-template-name-input` | テンプレ保存 |
| `obs-edit-measurement` / `obs-edit-photo` / `obs-edit-periodic` | 各編集導線 |
| `obs-cancel-btn` | キャンセル |

## キーボード導線

- **Tab 順**: 各サマリー Card の「編集」ボタン群 → 最下部「登録する」→ テンプレート名 Input → 「テンプレートとして保存」→ 「キャンセル」。全ネイティブ `button`。
- **Enter**: 「登録する」フォーカス時 Enter で commit。送信中は `disabled` で二重送信防止。
- **error 復帰**: エラー Card の「再試行」は Tab 到達可能。409 は 命名編集（→ input）へ誘導。
- **3 クリック以内**: input「確認へ」→ confirm → 「登録する」→ done（実質 2 クリックで確定）。各チャンク編集も 1 クリックで input 該当 section へ。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | IT-05-commit | binding moment · commit INSERT |
| OBS-RX-REP-05 | UAT-05 | `clientContentDigest` 整合 |
| OBS-TPL-18 | — | confirm からのテンプレ保存 |
| OBS-GAP-03 | — | WRITE session 境界（401） |
| OBS-NF-04 | — | empty(draft なし) / error(commit 失敗) 完備 |

## impl 引用

```191:203:apps/web/src/app/observation/input/confirm/page.tsx
  if (!draft) {
    return (
      <PageColumn>
        <Card data-testid="obs-error-boundary">
          <CardTitle>確認データが見つかりません</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">入力画面からやり直してください。</p>
          <Button className="mt-4" onClick={() => router.push("/observation/input")} data-testid="obs-retry-btn">
            入力へ戻る
          </Button>
        </Card>
      </PageColumn>
    );
  }
```

```379:381:apps/web/src/app/observation/input/confirm/page.tsx
          <Button onClick={registerObservation} disabled={submitting} data-testid="obs-register-submit">
            {submitting ? "登録中..." : "登録する"}
          </Button>
```

## 整合

- 遷移辞書 `web_routes[/observation/confirm].states = [review, submitting, commit_error, committed]` を acceptance 共通 4 状態へマッピング（review→ok · submitting→loading · commit_error→error · committed→done 遷移 · draft 欠落→empty）。
- ROUTE-INDEX-v1.csv は実装ルート `/observation/input/confirm` に更新（本バッチ）。
- `no-user-facing-unimplemented` 遵守: binding 差分サマリー（OBS-RX-UX-08）は v2 defer だが UI は静的設置サマリーで代替導線を提示（DET §10 ver2 defer）。
