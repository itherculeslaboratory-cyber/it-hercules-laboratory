# Phase 3 — shadcnプリミティブカタログ v1（IHL UI rebuild）

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1（W0〜W3）  
> **正本参照**: `dictionaries/ui_primitive_catalog.yaml` · `ADR-H-17-DesignTheme-テーマパック.md` · `ui-reference/preferences.md` · `Phase5-人間判断記録-v1.md`

---

## 1. 目的

Next.js + shadcn 採用後の「どのプリミティブを何に使うか」を機能単位で固定し、Phase 5 ScreenDef から直接参照できる形にする。

---

## 2. 採用プリミティブ（基礎 5 種）

| primitive_id | shadcn ref | 主 variant | 主用途 |
|--------------|------------|-----------|--------|
| `button` | `Button` | `primary`, `secondary`, `ghost`, `danger` | CTA・戻る・破壊操作 |
| `input` | `Input` | `default`, `error` | フォーム入力 |
| `card` | `Card` | `surface`, `elevated` | 3〜5 チャンク構成 |
| `tab` | `Tabs` | `underline`, `pill` | 画面内切替 |
| `badge` | `Badge` | `muted`, `success`, `danger`, `info` | 状態ラベル |

---

## 3. IHL 合成プリミティブ（ScreenDef 用）

| 合成 primitive | 構成 | 目的 |
|----------------|------|------|
| `PageColumn` | `card` + spacing token | 横幅制御・中央寄せ |
| `Stack` | gap token + children | 縦積み統一 |
| `HubBlock` | `card/surface` + `badge` | ハブ画面の入口ブロック |
| `StatusStrip` | `badge` + status text | loading/empty/error/saved の即時表示 |
| `EmptyState` | `card/elevated` + `button/secondary` | 空状態導線 |
| `ErrorBoundary` | `card/elevated` + `button/primary` | 回復導線 |

> `PageColumn` / `Stack` / `HubBlock` は Phase 3 の配置契約で、Phase 5 ScreenDef では `layout` と `design.token_variant` の両方を明示する。

---

## 4. ver1 画面への割当（W0〜W3）

| 画面ID | 主プリミティブ | 補助プリミティブ |
|--------|----------------|-----------------|
| `shell.global` | `PageColumn`, `tab/underline` | `badge/muted`, `button/ghost` |
| `O1` / `O2` / `O3` / `O4` | `card/surface`, `input/default` | `button/primary`, `button/secondary` |
| `01`（home） | `HubBlock`, `card/surface` | `badge/info`, `button/primary` |
| `05ctx` | `tab/pill`, `input/default` | `button/primary`, `badge/muted` |
| `05i` | `card/surface`, `input/default` | `button/primary`（dual primary）, `StatusStrip` |
| `05confirm` | `card/surface`, `badge/muted` | `button/primary`, `button/secondary` |
| `05done` | `card/elevated` | `button/primary`, `button/secondary` |
| `05a` | `card/surface`, `input/default` | `badge/info`, `EmptyState` |
| `05b` | `card/surface`, `badge/info` | `button/secondary`, `ErrorBoundary` |
| `05tl` / `05td` / `05t` | `card/surface`, `tab/pill` | `button/primary`, `button/secondary` |

---

## 5. ルール（UI品質）

1. 1 画面 1 主ボタンを原則とする。  
   - 例外: `05i` は `obs-bulk-fetch` と `obs-photo-capture` を dual primary とする。  
2. 意味色は `badge` と `status strip` のみで使用する。  
3. 画像表示にトークンで色補正をかけない（観測写真は無加工）。  
4. 画面内の繰り返しレイアウトは `PageColumn` / `Stack` を再利用する。

---

## 6. data-testid との対応

| primitive | 必須 testid 例 |
|-----------|----------------|
| `button/primary` | `obs-bulk-fetch`, `obs-photo-capture`, `obs-register-submit` |
| `input/default` | `obs-shooting-condition-input`, `auth-email-input` |
| `card/surface` | `obs-chunk-photo`, `obs-chunk-measurement`, `obs-chunk-periodic` |
| `tab/pill` | `obs-tpl-filter-public`, `obs-tpl-filter-mine` |
| `badge/*` | `obs-ctx-chip`, `home-status-chip` |

---

## 7. 受入条件（Phase 3）

- [x] 基礎 5 種の variant を定義済み  
- [x] ver1 P0 画面（W0〜W3）に割当済み  
- [x] data-testid 運用と整合済み  
- [x] `ThemePack`（light/dark）と矛盾しない

---

## 8. 人間ゲート（Phase 3）承認記録

2026-06-07 承認で以下を確定:

1. dual primary 例外（05i）を許容するか: **Yes**  
2. `card`/`tab` の既定 variant（surface/underline）: **推奨どおり採用**  
3. 05confirm の「登録のみ主ボタン」配置: **Yes**

---

## 9. 関連文書

- `02-設計/_横断/Phase3-ThemePackトークン定義-v1-DRAFT.md`
- `02-設計/_横断/Phase3-AppShellレイアウト仕様-v1-DRAFT.md`
- `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 3 設計正本 / 2026-06-07 人間承認*
