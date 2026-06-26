# Phase 3 — ThemePackトークン定義 v1（light/dark 2 pack）

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1（W0 Shell / W1 auth / W2 home / W3 observation）  
> **前提**: `ADR-Phase2-OSS-確定.md` v1.0 確定（2026-06-07）  
> **正本参照**: `ui-reference/preferences.md` · `ADR-H-17-DesignTheme-テーマパック.md` · `dictionaries/design_token.yaml` · `Phase5-人間判断記録-v1.md`

---

## 1. 目的

Phase 3 の実装前設計として、IHL UI rebuild の見た目契約を `ThemePack-light` と `ThemePack-dark` の 2 pack で固定する。  
本書は「トークン値」と「適用ルール」の正本であり、ScreenDef は本書のトークンを参照して画面を構成する。

---

## 2. pack 定義

| pack_id | 用途 | 適用方針 |
|---------|------|----------|
| `ThemePack-dark` | 血統/観測系の黒基調 | `05*`（観測）を既定 dark。将来 `03` 血統にも適用 |
| `ThemePack-light` | コア明基調 | W0/W1/W2（Shell/Auth/Home）既定。設定で dark へ切替可 |

> 方針整合: `preferences.md` §A（全体認知科学）と §B（血統OS黒基調）を 2 pack で両立。

---

## 3. トークン値（v1）

### 3.1 ThemePack-dark

| token key | value | 備考 |
|-----------|-------|------|
| `--civ-bg-deep` | `#0D0D0D` | 背景（深） |
| `--civ-bg-section` | `#121212` | セクション |
| `--civ-bg-card` | `#1A1A1A` | カード |
| `--civ-fg` | `#E6E6E6` | 本文 |
| `--civ-fg-muted` | `#B3B3B3` | 補足 |
| `--civ-fg-disabled` | `#666666` | 無効 |
| `--civ-border` | `#2A2A2A` | 枠線 |
| `--civ-border-subtle` | `#333333` | 枠線（弱） |
| `--civ-semantic-success` | `#5CD68D` | 成功/生存 |
| `--civ-semantic-danger` | `#FF6B6B` | 失敗 |
| `--civ-semantic-info` | `#4DA3FF` | 情報 |
| `--civ-semantic-warning` | `#FFD66B` | 注意 |
| `--civ-space-section` | `32px` | セクション間 |
| `--civ-space-card` | `24px` | カード内 |
| `--civ-space-graph` | `40px` | グラフ余白 |
| `--civ-radius-card` | `12px` | カード角丸 |
| `--civ-radius-button` | `8px` | ボタン角丸 |
| `--civ-font-family` | `Inter, 'Noto Sans JP', system-ui, sans-serif` | フォント |
| `--civ-font-size-body` | `16px` | 本文 |
| `--civ-line-height` | `1.6` | 行間 |

### 3.2 ThemePack-light

| token key | value | 備考 |
|-----------|-------|------|
| `--civ-bg-deep` | `#F8FAFC` | 背景（深） |
| `--civ-bg-section` | `#F1F5F9` | セクション |
| `--civ-bg-card` | `#FFFFFF` | カード |
| `--civ-fg` | `#1A1A2E` | 本文 |
| `--civ-fg-muted` | `#666666` | 補足 |
| `--civ-fg-disabled` | `#999999` | 無効 |
| `--civ-border` | `#E0E0E0` | 枠線 |
| `--civ-border-subtle` | `#E5E7EB` | 枠線（弱） |
| `--civ-semantic-success` | `#166534` | 成功/生存 |
| `--civ-semantic-danger` | `#C62828` | 失敗 |
| `--civ-semantic-info` | `#1A73E8` | 情報 |
| `--civ-semantic-warning` | `#E65100` | 注意 |
| `--civ-space-section` | `32px` | セクション間 |
| `--civ-space-card` | `24px` | カード内 |
| `--civ-space-graph` | `40px` | グラフ余白 |
| `--civ-radius-card` | `12px` | カード角丸 |
| `--civ-radius-button` | `8px` | ボタン角丸 |
| `--civ-font-family` | `Inter, 'Noto Sans JP', system-ui, sans-serif` | フォント |
| `--civ-font-size-body` | `16px` | 本文 |
| `--civ-line-height` | `1.6` | 行間 |

---

## 4. shadcn / Tailwind マッピング

| レイヤ | マッピング方針 |
|--------|---------------|
| shadcn base token | `:root` または `html[data-theme=*]` で `--civ-*` を注入 |
| Tailwind semantic class | 背景/文字/枠線は `--civ-*` 参照のカスタムトークンに束ねる |
| component variant | `ui_primitive_catalog.yaml` の `token_variant` を優先 |
| 禁止 | 画面内インライン色指定・装飾目的の新色追加 |

---

## 5. 適用スコープ（ver1）

| 画面群 | 既定 theme | 理由 |
|--------|------------|------|
| W0 AppShell | light | 全導線の可読性を優先 |
| W1 Auth（O1〜O4） | light | 初回導線の視認性 |
| W2 Home（01） | light | 司令塔として情報密度を制御 |
| W3 Observation（05ctx/05i/05confirm/05done/05a/05b/05tl/05td/05t） | dark | 観測・標本 UI の黒基調原則 |

---

## 6. 切替仕様（Phase 3 設計値）

1. 既定は `theme_pack_id` をユーザー設定から取得。  
2. 未設定時は `prefers-color-scheme` を参照し、`dark` を優先。  
3. `screen_override` は Phase 3 では未使用（Phase 5 以降で必要時のみ）。  
4. 保存は INSERT ONLY（修正時は新 `theme_pack_id` を発行）。

---

## 7. 受入条件（Phase 3）

- [x] light/dark 2 pack のトークン値が定義されている  
- [x] `design_token.yaml` の許可キーのみ使用している  
- [x] ver1 画面群の既定 pack を定義している  
- [x] `ADR-H-17` と `preferences.md` に矛盾しない

---

## 8. 人間ゲート（Phase 3）承認記録

2026-06-07 承認で以下を確定:

1. dark/light の既定適用範囲（とくに W3 観測 dark 固定）: **承認**  
2. 意味色（success/danger/info/warning）の運用定義: **承認**  
3. WCAG を満たす最終コントラスト（light/dark 両方）: **推奨値で承認**

---

## 9. 関連文書

- `02-設計/_横断/Phase3-shadcnプリミティブカタログ-v1-DRAFT.md`
- `02-設計/_横断/Phase3-AppShellレイアウト仕様-v1-DRAFT.md`
- `02-設計/_横断/Phase4-ルートマスター-ver1-v1-DRAFT.md`
- `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 3 設計正本 / 2026-06-07 人間承認*
