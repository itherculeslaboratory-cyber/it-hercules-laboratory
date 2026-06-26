# Phase 5 — ScreenDef ver1（P0先行）v1

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1 P0（W0〜W3） + post-ver1 P1/P2 stub  
> **参照**: `Phase4-ルートマスター-ver1-v1-DRAFT.md` · `05-観測-E2E-v1-DRAFT.md` · `Phase1-RTM-v1-観測-ver1-DRAFT.md` · `Phase5-人間判断記録-v1.md`

---

## 1. 目的

実装前に ScreenDef を画面単位で固定し、各画面のチャンク構成・主要 `data-testid`・E2E 対応・`mock_ref` を一意化する。

---

## 2. ScreenDef 共通フォーマット（v1）

```yaml
screen_id: obs.input
route_id: obs.input
path: /observation/input
wave: W3
priority: P0
shell_variant: observation-focus
theme_pack_id: ThemePack-dark
chunks:
  - { id: hero, primitive: card/surface }
  - { id: main_form, primitive: card/surface }
states: [loading, empty, error, success]
primary_cta_testid: obs-bulk-fetch
secondary_cta_testids: [obs-photo-capture, obs-confirm-next]
e2e_refs: [SC-05-BULK-01, SC-05-PHOTO-01]
mock_ref: 02-設計/_ui-global/mockups/ihl-05-obs-input-dual-primary.png
```

---

## 3. ver1 P0 ScreenDef 一覧（W0〜W3）

| screen_id | route_id / path | chunks（3〜5） | 主 testid | E2E | mock_ref | 状態 |
|-----------|------------------|----------------|----------|-----|----------|------|
| `shell.global` | `shell.root` / `/*` | header, context, nav, main, footer | `home-obs-cta` | route-matrix | `ihl-01-shell-home-dark.png` | DRAFT |
| `auth.login` | `auth.login` / `/login` | hero, form, help | `auth-login-btn` | auth skeleton | `ihl-01-login.png` | DRAFT |
| `auth.register` | `auth.register` / `/register` | hero, form, agreement | `auth-register-submit` | auth skeleton | `ihl-03-register.png` | DRAFT |
| `auth.terms` | `auth.terms` / `/terms` | terms_body, agreement, continue | `terms-agree-btn` | auth skeleton | `ihl-02-terms.png` | DRAFT |
| `auth.language` | `auth.language` / `/language` | locale_select, preview, continue | `lang-continue-btn` | auth skeleton | `ihl-21-language-select.png` | DRAFT |
| `home.main` | `home.main` / `/` | hero, hub_cards, quick_status, recent | `home-obs-cta` | `04-home-*` | `ihl-04-home.png` | DRAFT |
| `obs.context` | `obs.context` / `/observation/context` | domain_tabs, target_picker, context_chip, apply | `obs-ctx-confirm` | `SC-05-CTX-01` | `ihl-05-obs-context-picker.png` | DRAFT |
| `obs.input` | `obs.input` / `/observation/input` | target_summary, measurement_form, fetch_actions, status_strip | `obs-bulk-fetch` | `SC-05-BULK-01`, `SC-05-PHOTO-01` | `ihl-05-obs-input-dual-primary.png` | **HQ-08 GAP** |
| `obs.confirm` | `obs.confirm` / `/observation/input/confirm` | chunk_photo, chunk_measurement, chunk_periodic, commit_actions | `obs-register-submit` | `SC-05-CONFIRM-01` | `ihl-05-obs-input-confirm.png` | **HQ-08 GAP** |
| `obs.done` | `obs.done` / `/observation/done` | success_summary, next_actions, trace | `obs-goto-grid-btn` | `SC-05-REG-01` | `ihl-05-obs-register-success.png` | **HQ-08 GAP** |
| `obs.grid` | `obs.grid` / `/observation` | hero, filters, grid, support | `obs-open-detail` | `SC-05-SOL-01` | `ihl-05-obs-search-grid.png` | DRAFT |
| `obs.detail` | `obs.detail` / `/observation/:id` | media, measurement, lineage_link, similar | `obs-open-individual` | route-matrix + `SC-05-SOL-*` | `ihl-05-obs-detail-similar.png` | DRAFT |
| `obs.template.list` | `obs.template.list` / `/observation/templates` | filter_tabs, template_grid, primary_action | `obs-tpl-card` | `SC-05-TPL-01` | `ihl-05-obs-template-list.png` | DRAFT |
| `obs.template.detail` | `obs.template.detail` / `/observation/templates/:id` | template_meta, items, actions | `obs-tpl-use-btn` | `SC-05-TPL-01` | `ihl-05-obs-template-detail.png` | DRAFT |
| `obs.template.fork` | `obs.template.fork` / `/observation/templates/:id/fork` | fork_form, device_link, save | `obs-tpl-fork-btn` | `SC-05-TPL-01` | `ihl-05-obs-template-fork.png` | DRAFT |
| `individual.detail` | `individual.detail` / `/individuals/:id` | identity, parent_links, session_timeline, actions | `ind-open-qr` | ver1追加E2E予定 | `mock_ref=TODO` | **HQ-08 GAP関連** |
| `individual.qr` | `individual.qr` / `/individuals/:id/qr` | qr_canvas, print_action, scan_action | `ind-qr-download` | ver1追加E2E予定 | `mock_ref=TODO` | **HQ-08 GAP関連** |
| `obs.qr.scan` | `obs.qr.scan` / `/scan` | camera_view, result, fallback_input | `qr-scan-start` | ver1追加E2E予定 | `mock_ref=TODO` | **HQ-08 GAP関連** |

---

## 4. HQ-08 mock gap（P0不足6画面）対応

| placeholder screen | 対応 mock | 用途 |
|--------------------|-----------|------|
| `obs.input.bulk.primary` | `ihl-05-obs-input-dual-primary.png` | dual primary 同時表示 |
| `obs.input.bulk.fetching` | `ihl-05-obs-input-bulk-fetching.png` | フェッチ中状態 |
| `obs.input.bulk.done` | `ihl-05-obs-input-bulk-done.png` | フェッチ完了状態 |
| `obs.input.photo.capture` | `ihl-05-obs-input-photo-capture.png` | 撮影経路 |
| `obs.confirm` | `ihl-05-obs-input-confirm.png` | 3チャンク確認 |
| `obs.done` | `ihl-05-obs-register-success.png` | 登録完了 |

> `mock_ref` が未配置の行は Phase 5 人間レビューまでに `placeholder` 扱いとし、実装前に差し替える。

---

## 5. post-ver1 P1/P2 stub ScreenDef

### 5.1 P1（早期）

| screen_id | route_id | 備考 |
|-----------|----------|------|
| `market.browse` | `/market` | #06 ver1 OUT |
| `match.pairwise` | `/match` | #10 ver1 OUT |
| `dispute.room` | `/board/.../dispute` | #11 ver1 OUT |

### 5.2 P2（後続）

| screen_id | route_id | 備考 |
|-----------|----------|------|
| `knowledge.hub` | `/knowledge` | post-ver1。`features/_横断/知の広場-遷移設計-v1-DRAFT.md` を参照 |
| `lineage.cross` | `/cross/:id` | W4 以降 |
| `pt.shop` | `/economy/shop` | W7 以降 |

---

## 6. E2E / data-testid マッピング規約

1. `primary_cta_testid` は ScreenDef に必須。  
2. `obs-*` は `05-観測-E2E-v1-DRAFT.md` の testid 一覧を正本にする。  
3. E2E シナリオ未割当の ScreenDef は `e2e_refs: [TODO]` を付与し、凍結対象外とする。

---

## 7. 観測 #05 の4層テスト計画（存在確認）

`03-テスト計画/features/05-観測/` に 4 層計画が存在するため、本 Phase 5 では新規作成不要。  
実装 Go 前に ScreenDef 参照を以下へ結線する。

- `単体テスト計画-v1.md`
- `結合テスト計画-v1.md`
- `システムテスト計画-v1.md`
- `受入テスト計画-v1.md`

---

## 8. 凍結確定・人間ゲート記録

### 8.1 凍結確定（v1.0）

- `obs.context`, `obs.input`, `obs.confirm`, `obs.done`, `obs.grid`, `obs.detail`
- `auth.*`, `home.main`, `obs.template.*`

### 8.2 凍結除外（2-5 指定）

- `individual.detail`, `individual.qr`, `obs.qr.scan` の `mock_ref=TODO` 部分
- HQ-08 gap の placeholder 6画面（差し替え前提）

### 8.3 人間承認結果（2026-06-07）

1. P0 ScreenDef のチャンク順序（とくに `obs.confirm` 3チャンク）: **承認**  
2. `primary_cta_testid` の命名と E2E 対応: **承認**  
3. HQ-08 gap 6画面の `mock_ref` 最終確定: **除外付き承認（2-5）**  
4. `individual/qr/scan` 3画面の ScreenDef 追加確定: **ver1 必須として承認（6-1〜6-3）**  
5. 本書を Phase 5 設計として承認するか: **承認（凍結 v1.0）**

---

## 9. 関連文書

- `02-設計/features/05-観測/sub/WaveB-context-ScreenDef差分-v1-DRAFT.md`（PW-3 差分）
- `02-設計/features/05-観測/sub/WaveC-input-ScreenDef差分-v1-DRAFT.md`（PW-3 差分）
- `02-設計/features/05-観測/sub/WaveD-photo-ScreenDef差分-v1-DRAFT.md`（PW-3 差分）
- `02-設計/features/28-個体命名/ScreenDef差分-v1-DRAFT.md`（PW-3 差分）
- `02-設計/_横断/Phase3-ThemePackトークン定義-v1-DRAFT.md`
- `02-設計/_横断/Phase4-遷移設計-ver1-v1-DRAFT.md`
- `02-設計/E2E/05-観測-E2E-v1-DRAFT.md`
- `02-設計/_ui-global/mock-gap-RTM-観測-v1-DRAFT.md`
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 5 設計正本（2-5 除外あり） / 2026-06-07 人間承認 / 実装禁止ゲート解除条件を充足*
