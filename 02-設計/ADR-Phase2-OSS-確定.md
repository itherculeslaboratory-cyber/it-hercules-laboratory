# ADR-Phase2-OSS-確定

> **ステータス**: **v1.0 確定・人間レビュー済**（2026-06-07 承認反映）  
> **作成日**: 2026-06-18  
> **対象**: IHL UI Rebuild Phase 2（OSS 選定）  
> **関連**: `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md` · `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` · `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`  
> **実装制約**: `DELEGATED-IMPL-GO` まで実装コード変更禁止（設計ドキュメントのみ）

---

## 1. 目的

Phase 2（OSS 選定）として、IHL UI rebuild の実装前提を「比較可能な候補」から「採用 1 本 + 代替 + 不採用理由」に落とし、Phase 3（詳細設計）へ引き渡す。

---

## 2. 前提とスコープ境界

### 2.1 ver1 / post-ver1 境界

| 区分 | 扱い |
|------|------|
| **ver1 IN** | 観測 MVP + W0-W3（Shell / 認証 / ホーム / 観測） |
| **ver1 OUT** | #06 マーケット・#10 マチアプ・#11 裁判（`00-プロダクト方針` §1.1） |
| **Phase 2 の役割** | ver1 IN を阻害しない範囲で、post-ver1 を含む OSS 方針を確定 |

### 2.2 先行確定（HQ）

| 項目 | 判定 | 根拠 |
|------|------|------|
| Web Shell | **Next.js 15 + shadcn/ui 採用（確定）** | **2026-06-07 ユーザー確認（HQ-01 Go）** |
| ThemePack | **light / dark 2 パック（確定）** | `#21` §4.1・HQ-06 |
| Salvage | **Option A（確定）** | `#21` §3.2・HQ-02（api/hook移植、旧 UI JSX 廃棄） |

---

## 3. Phase 2 決定サマリー（採用 1 本）

| レイヤー | 採用（推奨デフォルト） | 代替 | 判定 |
|---------|------------------------|------|------|
| Web Shell | **Next.js 15 + App Router + shadcn/ui** | Remix + DaisyUI | **確定** |
| UI primitives | **shadcn vendoring + IHL 薄ラップ** | 独自 DS 新設 | **確定** |
| ルーティング | **Next App Router（`app/`）** | Pages Router | **確定** |
| 状態/取得 | **RSC 優先 + server action/API route + client は最小状態管理** | 全面 client fetch | **確定（運用推奨）** |
| E2E | **Playwright（CI ゲート）** | Cypress | **確定** |
| Forum（post-ver1） | **Next 内カスタム埋め込み UI（board FR 準拠）** | Discourse / GitHub Discussions 直利用 | **推奨（§AI仮定）** |
| Market UI（post-ver1） | **Next カスタムページ + 既存 backend API 契約** | Medusa/Saleor full 採用 | **推奨（§AI仮定）** |
| Auth 連携 | **既存 civ-os login-gated パターン整合** | 新規認証基盤導入 | **確定（方針）** |

---

## 4. Web Shell / UI 基盤（確定）

### 4.1 Web Shell 比較

| 観点 | Next.js 15 + shadcn | Remix + DaisyUI |
|------|---------------------|-----------------|
| IHL 既定方針（HQ-01） | **既に Go** | 未採用 |
| App Router / RSC | **標準で利用可** | Loader/Action 中心 |
| ThemePack 連携 | CSS 変数との親和性高 | 可能だが追加調整多め |
| 導入実績（civ-os 文脈） | 流用知見が多い | 相対的に少ない |
| 判定 | **採用** | 不採用 |

### 4.2 UI primitives 方針

- shadcn を `components/ui` で vendoring し、IHL 用に薄くラップする。
- 新規デザインシステムは増やさず、`ThemePack-light` / `ThemePack-dark` と `ui-reference/preferences.md` を正本にする。
- 画面固有の複雑な合成は `PageColumn` / `Stack` / `HubBlock` ベースで行い、トークン定義は Phase 3 で固定する。

### 4.3 Routing / Data fetch 推奨

- ルーティングは Next App Router を正本とする。
- データ取得は「**RSC で初期データ、クライアントは操作系のみ**」を既定にする。
- fetch は `hooks/`・`lib/api.ts`・`lib/types.ts` へ集約し、ページ内べた書きを禁止する（3 層分離）。

---

## 5. E2E / CI（確定）

| 項目 | 方針 | 根拠 |
|------|------|------|
| E2E フレームワーク | **Playwright** | `#21` §7（Tier A/B） |
| CI ゲート | `tsc` / `vitest` / `Playwright` | `#21` §7.3 |
| ver1 判定 | ver1 in-scope の Tier A/B + 人間 Tier D | `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md` |

---

## 6. Forum レイヤー決定（post-ver1）

### 6.1 比較表

| 案 | 長所 | 短所 | ver1 影響 |
|----|------|------|-----------|
| **A: Next 内カスタム埋め込み UI（推奨）** | `01-要件/07-掲示板.md` の board 要件と整合しやすい。UI/導線統一が容易 | 投稿編集や通知機能を自前設計する範囲が出る | **非ブロッカー**（post-ver1） |
| B: Discourse 埋め込み | forum 機能が豊富、運用実績が多い | IA/権限/争い導線の統合コストが高い | 非ブロッカー |
| C: GitHub Discussions ブリッジ | 外部 OSS コスト低、履歴透明性 | 製品内 UX 一貫性が弱い。一般ユーザー導線が分断 | 非ブロッカー |

### 6.2 推奨（§AI仮定）

> **§AI仮定-FORUM-01**: ver1 は掲示板本番運用を必須にしないため、Phase 2 では **A 案（Next 内カスタム埋め込み UI）を post-ver1 デフォルト** とする。  
> **理由**: `07-掲示板` 要件の「4 入口」「指摘導線」「知の広場タブ統合」に対し、最小の IA 断裂で一貫運用できるため。  
> **補足**: Discourse 連携は **将来オプション**（同期/ミラー用途）として保持する。

---

## 7. Market UI 決定（post-ver1）

### 7.1 比較表

| 案 | 長所 | 短所 | ver1 影響 |
|----|------|------|-----------|
| **A: Next カスタムページ + 既存 backend API（推奨）** | `01-要件/06-マーケット.md` の state machine と直結しやすい | UI 実装コストは一定必要 | **非ブロッカー**（#06 は ver1 OUT） |
| B: Medusa テンプレ全面採用 | e-commerce UI の初速が高い | 非エスクロー/8%/争い導線とのズレ調整が大きい | 非ブロッカー |
| C: Saleor storefront 参照 | UI 部品の成熟度が高い | IHL 固有ルールとの整合に追加 adapter が必要 | 非ブロッカー |

### 7.2 推奨（§AI仮定）

> **§AI仮定-MARKET-01**: post-ver1 既定は **A 案（Next カスタムページ + 既存 backend API）**。  
> **理由**: `FR-MKT-*` の取引ステージ・trade-events・8% 起算ルールが強く、UI テンプレの全面流用より「契約優先で薄い画面」を積み上げる方が破綻しにくい。  
> **補足**: Medusa/Saleor はレイアウト参照として活用し、状態遷移の正本は IHL 要件を優先する。

---

## 8. Auth 連携方針（既存 civ-os 整合）

- 認証は「アプリ全体 login-gated」を前提とし、`01-要件/01-ログイン.md`・`03-新規登録.md`・`04-ホーム画面.md` の導線を踏襲する。
- 新規認証基盤（外部 IdP 前提）を Phase 2 では追加しない。
- Phase 3 で「セッション境界」「未ログイン時ルート」「locale/利用規約同意」と合わせて遷移設計へ反映する。

---

## 9. ThemePack と OSS の責務境界

| 層 | OSS が担う | ThemePack が担う |
|----|------------|------------------|
| Next / shadcn | ルーティング・部品構造・アクセシブルな基本挙動 | 色・余白・タイポ・明暗切替トークン |
| E2E | 画面遷移と主要導線の検証 | トークン変更時の視覚整合確認（snapshot/比較） |
| 市場/掲示板 UI | コンポーネント構築の土台 | IHL 固有の意味色・表示密度調整 |

**原則**: OSS は構造、ThemePack は見た目。役割を混ぜない。

---

## 10. Salvage Option A（HQ-02）との整合

- `frontend/src/lib/api.ts` の API 呼び出しパターンは移植対象。
- `frontend/src/observation/`・`frontend/src/lineage/` の hook/型はロジックのみ移植対象。
- `frontend/src/ui/civUi.css` と旧 UI JSX は廃棄対象。
- 本 ADR の採用（Next + shadcn）は Option A 前提と矛盾しない。

---

## 11. Phase 2 完了判定（本 ADR 内）

| チェック | 状態 | 備考 |
|----------|------|------|
| Web Shell / UI primitives / Routing / E2E 方針を明文化 | **[x]** | 本 ADR §4–§5 |
| Forum / Market 比較表と推奨を明文化 | **[x]** | 本 ADR §6–§7 |
| ver1 / post-ver1 境界を明文化 | **[x]** | 本 ADR §2 |
| Auth / ThemePack / Salvage 整合を明文化 | **[x]** | 本 ADR §8–§10 |
| 人間レビュー（採用最終確定） | **[x]** | 2026-06-07 ユーザー承認 |

---

## 12. 承認記録（2026-06-07）

| 承認項目 | 判定 | 根拠 |
|----------|------|------|
| §AI仮定-FORUM-01（Forum 既定 A） | **承認** | ユーザーチャット（2026-06-07） |
| §AI仮定-MARKET-01（Market 既定 A） | **承認** | ユーザーチャット（2026-06-07） |
| Auth 方針（既存 login-gated 維持） | **追加要件なし・承認** | ユーザーチャット（2026-06-07） |
| 本 ADR の格上げ | **v1.0 確定・人間レビュー済** | 本承認記録により確定 |

---

## 13. Phase 3 着手条件

- 本 ADR の人間ゲートは完了済み（§12）。
- Phase 3〜5 は **設計ドキュメント作業のみ**進行可。
- 実装コード変更は `DELEGATED-IMPL-GO` 発行まで禁止。

---

## 14. 参照

- `02-設計/ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md`（Phase 2 章）
- `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md`（§5 OSS 要件）
- `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`（§1.1, §1.5, §8）
- `01-要件/07-掲示板.md`
- `01-要件/06-マーケット.md`

---

*v1.0 確定・人間レビュー済（2026-06-07） / 実装禁止ゲート有効*
