# Phase 1 廃止画面一覧 v1（旧 frontend/src）

> **ステータス**: **v1.0 確定（Phase 1 成果物・人間レビュー済）**  
> **作成日**: 2026-06-18  
> **目的**: 旧 A 系 UI の「廃止 / 移植 / 維持」を理由付きで明確化し、実装段階での混在を防ぐ  
> **参照**: `02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`（Phase 1）· `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` §3.2（HQ-02 Option A）
> **サインオフ**: **HQ-09 Go（2026-06-07）**

---

## §1 判定基準

| 区分 | 定義 |
|------|------|
| **廃止** | 旧 UI JSX/旧スタイル体系を使わない。再構築対象として置換する |
| **移植** | 表示層は廃止し、ロジック・契約（API/hook/型）だけを新構成へ移す |
| **維持** | ver1 到達に必須で、現時点で置換せず参照継続する |

---

## §2 一覧（why 付き）

| 対象 | 判定 | why（理由） | 後継 / 受け皿 |
|------|------|-------------|---------------|
| `frontend/src/` 旧 A 系画面 JSX 全体 | **廃止** | MiniScreenKernel / FeatureNode 前提と不整合。画面単位の古い構造を温存すると再構築が収束しない | Next + shadcn + ScreenDef（W0〜） |
| `frontend/src/ui/civUi.css` | **廃止** | ThemePack-light/dark（HQ-06）へ移行するため。旧クラス体系を残すと token 一元化できない | ThemePack token（Phase 3） |
| 旧画面のインライン style 群 | **廃止** | 再利用不能・見た目が画面ごとに分岐し保守不能 | `PageColumn` / `Stack` / `HubBlock` など共通プリミティブ |
| `frontend/src/lib/api.ts` | **移植** | API 契約は資産価値が高く salvage 対象（HQ-02） | 新 web 側 api layer |
| `frontend/src/observation/` の hook・型定義 | **移植** | 観測 MVP（FR-MVP-01〜05）の契約継承が必要 | W3 観測再構築 |
| `frontend/src/lineage/` の hook・型定義 | **移植** | individual/親子連携（FR-MVP-04）で参照可能性が高い | W3-W4 境界で利用 |
| 旧 route alias（`/home` 等） | **維持（暫定）** | 利用中導線を切ると検証不能。Phase 4 で新ルート表と一括確定するため現時点は暫定維持 | Phase 4 ルートマスターで確定 |
| 既存 auth ガード動作（未認証→`/login`） | **維持** | ver1 の入口品質を担保する基盤。再構築中に崩すと E2E が成立しない | W1 認証 E2E（`03-認証-E2E-v1-DRAFT.md`） |

---

## §3 ver1 / post-ver1 優先度

| 区分 | 優先度 | 廃止・移植の主対象 |
|------|--------|--------------------|
| ver1 in-scope（W0-W3） | P0 | AppShell 旧 JSX 廃止、認証/ホーム/観測の旧画面を置換、api/hook 移植 |
| post-ver1 早期（#06/#10/#11） | P1 | マーケット・マチアプ・裁判の旧画面置換 |
| post-ver1 後続（W4+） | P2 | 血統・掲示板・経済・その他ドメインの旧画面置換 |

---

## §4 人間確認事項（Phase 1 ゲート）

- [x] 廃止対象に **why** を記載  
- [x] 移植対象（HQ-02 Option A）を明示  
- [x] #21 v1.0 格上げ判定（HQ-09）で本書レビュー完了（2026-06-07）。本書を v1.0 確定へ昇格

---

*v1.0 確定（HQ-09 Go / 2026-06-07）· 実装禁止ゲート有効*
