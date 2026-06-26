# Phase 1 RTM v1 — 観測 ver1（W0-W3）

> **ステータス**: **v1.0 確定（Phase 1 成果物・人間レビュー済）**  
> **作成日**: 2026-06-18  
> **スコープ**: ver1 shippable（W0 Shell + W1 auth + W2 home + W3 observation core）  
> **前提**: #06 / #10 / #11 は ver1 OUT（post-ver1）  
> **サインオフ**: **HQ-09 Go（2026-06-07）**
> **参照正本**:  
> - `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`（FR-MVP-01〜05）  
> - `01-要件/05-観測.md`（OBS-*）  
> - `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md`（HQ-08/09）  
> - `02-設計/_ui-global/mock-gap-RTM-観測-v1-DRAFT.md`

---

## §1 ver1 画面スコープ（W0-W3）

| Wave | 画面ID | route / surface | 優先度 | ver1 | 対応 FR（要約） | mock_ref |
|------|--------|------------------|--------|------|-----------------|----------|
| W0 | shell.global | AppShell（header / context / nav / status） | P0 | IN | FR-MVP 到達の土台 | `02-設計/_ui-global/mockups/ihl-01-shell-home-dark.png`（Shell 参考） |
| W1 | O1 | `/login` | P0 | IN | 認証入口（#01） | `02-設計/_ui-global/mockups/ihl-01-login.png` |
| W1 | O2 | `/register`（または onboarding entry） | P0 | IN | 初回導線（#03） | `02-設計/_ui-global/mockups/ihl-03-register.png` |
| W1 | O3 | `/terms` | P0 | IN | 利用規約同意（#02） | `02-設計/_ui-global/mockups/ihl-02-terms.png` |
| W1 | O4 | `/language` | P0 | IN | 言語選択（#21 連携） | `02-設計/_ui-global/mockups/ihl-21-language-select.png` |
| W2 | 01 | `/` / `/home` | P0 | IN | ver1 司令塔導線 | `02-設計/_ui-global/mockups/ihl-04-home.png` |
| W3 | 05ctx | `/observation/context` | P0 | IN | FR-MVP-01, OBS-CTX-01〜03 | `02-設計/_ui-global/mockups/ihl-05-obs-context-picker.png` |
| W3 | 05i | `/observation/input` | P0 | IN | FR-MVP-01/02/04/05, OBS-SOL-01〜03 | `02-設計/_ui-global/mockups/ihl-05-obs-input-row.png`（旧）+ GAP |
| W3 | 05confirm | `/observation/input/confirm` | P0 | IN | FR-MVP-01/02/03, UI-REBUILD-OBS-12〜14 | **GAP**（`mock-gap-RTM-観測-v1-DRAFT.md`） |
| W3 | 05done | `/observation/done`（完了表示） | P0 | IN | FR-MVP-01/03/05, UI-REBUILD-OBS-15〜17 | **GAP**（`mock-gap-RTM-観測-v1-DRAFT.md`） |
| W3 | 05a | `/observation` | P0 | IN | FR-MVP-03（一覧/再開） | `02-設計/_ui-global/mockups/ihl-05-obs-search-grid.png` |
| W3 | 05b | `/observation/:id` | P0 | IN | FR-MVP-03（詳細） | `02-設計/_ui-global/mockups/ihl-05-obs-detail-similar.png` |
| W3 | 05tl | `/observation/templates` | P0 | IN | FR-MVP-01（テンプレ入力支援） | `02-設計/_ui-global/mockups/ihl-05-obs-template-list.png` |
| W3 | 05td | `/observation/templates/:id` | P0 | IN | FR-MVP-01（テンプレ詳細） | `02-設計/_ui-global/mockups/ihl-05-obs-template-detail.png` |
| W3 | 05t | template fork/apply surface | P0 | IN | FR-MVP-01（テンプレ適用/Fork） | `02-設計/_ui-global/mockups/ihl-05-obs-template-fork.png` |
| W3 | IND | `/individuals/:id` | P0 | IN | FR-MVP-04（親個体連携） | `mock_ref=TODO（Phase 5 追加）` |
| W3 | IND-QR | `/individuals/:id/qr` | P0 | IN | FR-MVP-05（QR 発行） | `mock_ref=TODO（Phase 5 追加）` |
| W3 | QR-SCAN | `/scan`（または同等） | P0 | IN | FR-MVP-05（QR スキャン再開） | `mock_ref=TODO（Phase 5 追加）` |

> 注: O2/O3/O4 の最終 route は Phase 4 遷移設計確定で微修正可。Phase 1 では「ver1 到達導線として必要」の判定を優先。

---

## §2 FR-MVP / OBS 要件トレース（画面・route）

| req_id | 要件（要約） | 主要画面 / route | 優先度 | ステータス |
|--------|--------------|------------------|--------|-----------|
| FR-MVP-01 | 観測データ収集（入力→保存） | `05ctx`, `05i`, `05confirm`, `05done` | P0 | DESIGNED |
| FR-MVP-02 | 写真登録 | `05i`, `05confirm`, `05b` | P0 | DESIGNED |
| FR-MVP-03 | 詳細ビュー | `05a`, `05b`, `05done` | P0 | DESIGNED |
| FR-MVP-04 | 親個体連携 | `IND`, `05i`, `05b` | P0 | DESIGNED（mock gap） |
| FR-MVP-05 | QR 発行・スキャン再開 | `IND-QR`, `QR-SCAN`, `05i` | P0 | DESIGNED（mock gap） |
| OBS-CTX-01 | コンテキスト伝播 | `05ctx` → `05i/05a/05tl` | P0 | DESIGNED |
| OBS-CTX-02 | プリフィルのみ（確定はユーザー） | `05ctx`, `05i` | P0 | DESIGNED |
| OBS-SOL-01 | 固体観測一連フロー | `05i`, `05confirm`, `05done` | P0 | DESIGNED |
| OBS-SOL-04 | taxonomy はユーザー確定 | `05ctx`, `05i` | P0 | DESIGNED |
| OBS-TPL-13 | テンプレ適用で入力展開 | `05tl`, `05td`, `05i` | P0 | DESIGNED |
| OBS-IND-01〜05 | 個体紐づけ / sire-dam / 履歴 | `IND`, `05i`, `05b` | P0 | DESIGNED（UI詳細は Phase 5） |
| OBS-QR-01〜05 | QR 生成・読取・再開 | `IND-QR`, `QR-SCAN`, `05i` | P0 | DESIGNED（UI詳細は Phase 5） |

---

## §3 HQ-08 観測 mock ギャップ（P0 不足 6 枚）

| 優先 | 不足 mock | 対象画面 | 対応 req_id |
|------|-----------|----------|-------------|
| P0 | `ihl-05-obs-input-dual-primary.png` | `05i` | UI-REBUILD-OBS-08〜11 |
| P0 | `ihl-05-obs-input-bulk-fetching.png` | `05i` | UI-REBUILD-OBS-11 |
| P0 | `ihl-05-obs-input-bulk-done.png` | `05i` | UI-REBUILD-OBS-08/11 |
| P0 | `ihl-05-obs-input-photo-capture.png` | `05i` | UI-REBUILD-OBS-09/11, FR-MVP-02 |
| P0 | `ihl-05-obs-input-confirm.png` | `05confirm` | UI-REBUILD-OBS-12〜14 |
| P0 | `ihl-05-obs-register-success.png` | `05done` | UI-REBUILD-OBS-15〜17 |

参照正本: `02-設計/_ui-global/mock-gap-RTM-観測-v1-DRAFT.md` §3。

---

## §4 post-ver1 画面（Phase 1 時点の優先度付け）

| 区分 | 優先度 | 対象 | 根拠 |
|------|--------|------|------|
| post-ver1 早期 | P1 | #06 マーケット / #10 マチアプ / #11 裁判 | `00-プロダクト方針` §1.1（ver1 OUT） |
| post-ver1 後続 | P2 | W4 以降（血統/掲示板/経済/その他） | `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md` Phase 6 wave |

---

## §5 Phase 1 完了メモ（HQ-09 連動）

- RTM v1（本書）作成: ✅  
- HQ-08 mock gap 転記: ✅  
- #21 v1.0 への格上げ: **✅ HQ-09 Go（2026-06-07）** — `21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` は **v1.0 確定・人間レビュー済**

---

*v1.0 確定（HQ-09 Go / 2026-06-07）· 実装禁止ゲート有効*
