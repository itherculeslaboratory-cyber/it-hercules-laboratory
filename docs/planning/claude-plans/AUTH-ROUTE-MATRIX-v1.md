# AUTH-ROUTE-MATRIX v1 — 認証境界 裁定表

> **正本**: 本表が `apps/web/src/middleware.ts` の公開/保護境界の裁定根拠。
> **方針**: **デフォルトデナイ**（疑わしきは保護）。明示的に公開したルートのみ未ログイン通過、他は全て `/login` へ 307。
> **作成**: 2026-07-09 / **根拠**: `docs/planning/STATUS.md`（Scope A・知の広場 PROVISIONAL）・`01-要件/00-プロダクト方針…`・`04-ホーム画面`（H-001）・`07-掲示板`・`05-観測`（§4.13 QR）・`18-写真解析`

---

## 1. 裁定原則

| # | 原則 | 適用 |
|---|------|------|
| P1 | **デフォルトデナイ** | 列挙されない全ルートは保護。middleware の fallback が redirect。新規ルートは自動で安全側に落ちる。 |
| P2 | **要件整合** | 公開は要件に明示根拠があるものだけ（Scope A の観測 READ・認証入口・規約・言語）。 |
| P3 | **PROVISIONAL は公開前提にしない** | 知の広場（`/board`）はゲート中 → **保護**が安全側。 |
| P4 | **prefix 設計で将来安全** | 公開は明示 prefix、保護は fallback。観測配下のみ「READ 既定・WRITE 列挙」の deny-list（動的 detail ID が WRITE keyword と同名前空間のため）。 |

---

## 2. 分類バケット

- **BYPASS**: middleware 素通し（`/_next` `/favicon` `/api` `/health`）— フレームワーク/プローブ。
- **PUBLIC**: 未ログイン閲覧可。
- **PROTECTED**: 未ログインは `/login?next=…` へ。

---

## 3. 全ルート × 公開/保護 対応表

| ルート | 判定 | 根拠 |
|--------|------|------|
| `/` | **PROTECTED** | ホーム H-001「`/`・`/home` は認証済みのみ、未認証は login」。`/` は prefix でなく exact 扱い（全パスが `/` で始まるため公開 prefix にしない）。 |
| `/home` | **PROTECTED** | 同上 H-001。 |
| `/login` | **PUBLIC** | 認証入口。到達不能だとログイン不可。認証済みは `next` へ 307。 |
| `/register` | **PUBLIC** | 新規登録入口（#03）。 |
| `/terms` | **PUBLIC** | 利用規約（#02）。登録前に閲覧必須。 |
| `/language` | **PUBLIC** | 言語選択（#21）。login/terms を母語で読むため未ログイン許可。PII なし・書込なし。 |
| `/observation` | **PUBLIC(READ)** | Scope A：観測 search/list は未ログイン可（STATUS「観測 search/list/detail/image は Scope A」）。 |
| `/observation/templates` | **PUBLIC(READ)** | Scope A：テンプレカタログ READ。 |
| `/observation/templates/[id]` | **PUBLIC(READ)** | テンプレ詳細 READ。 |
| `/observation/[id]` | **PUBLIC(READ)** | 観測セッション detail READ（Scope A）。動的 ID。 |
| `/observation/input` | **PROTECTED** | WRITE（commit）。`IHL_AUTH_REQUIRED` 対象。 |
| `/observation/input/confirm` | **PROTECTED** | WRITE 確認。 |
| `/observation/context` | **PROTECTED** | WRITE 導線。 |
| `/observation/solid` | **PROTECTED** | 固体観測 WRITE（写真/計測 commit）。 |
| `/observation/done` | **PROTECTED** | WRITE 完了。 |
| `/observation/templates/[id]/fork` | **PROTECTED** | テンプレ fork = WRITE（本人スコープ生成）。`/fork` で判定。 |
| `/scan` | **PROTECTED** | QR スキャン→観測再開（WRITE 起点）。個人導線。 |
| `/individuals/[id]` | **PROTECTED** | 個体プロフィール。親個体編集（PUT parents）＝本人 WRITE。Scope A は「観測」明示・個体詳細は非公開（疑わしきは保護）。 |
| `/individuals/[id]/qr` | **PROTECTED** | QR は `ihl://individual/<id>` の**アプリスキーム deep link**（アプリ内 `/scan` が読む）。**公開 Web URL ではない**＝匿名ブラウザ到達先が存在しないため公開読取要件なし（05-観測 §4.13）。個体 QR 再発行は本人ツール → 保護。 |
| `/market` | **PROTECTED** | #06 マーケット（Phase 2 OUT）。PT 経済。 |
| `/market/[id]` | **PROTECTED** | 出品詳細。 |
| `/market/[id]/transfer` | **PROTECTED** | PT 送金 WRITE。 |
| `/board` | **PROTECTED** | 知の広場（掲示板）。**PROVISIONAL・ゲート中 → 保護が安全側**（STATUS・タスク裁定 (a)）。 |
| `/board/[category]` | **PROTECTED** | 掲示板カテゴリ。同上。 |
| `/board/[category]/dispute` | **PROTECTED** | 指摘→二人部屋（裁判 §3）。要保護。 |
| `/board/paper` | **PROTECTED** | 論文板。知の広場配下。 |
| `/board/paper/template` | **PROTECTED** | 論文テンプレ。 |
| `/board/component` | **PROTECTED** | コンポーネント掲示板（#19）。 |
| `/match` | **PROTECTED** | #10 マチアプ（Phase 2 OUT）。 |
| `/me/profile` | **PROTECTED** | マイページ（本人スコープ）。 |
| `/cross/[id]` | **PROTECTED** | 交配ログ（本人 WRITE）。 |
| `/cross/[id]/mortality` | **PROTECTED** | 死亡記録 WRITE。 |
| `/contribution` | **PROTECTED** | 貢献度（#14）。アプリは login-gated（プロダクト方針：全ログインユーザー閲覧）。 |
| `/vote` | **PROTECTED** | 投票（#20 プラチナコイン）。認証アクション。 |
| `/economy/shop` | **PROTECTED** | PT ショップ。 |
| `/settings` | **PROTECTED** | 設定（#12・本人スコープ）。 |
| `/settings/ui-template` | **PROTECTED** | UI テンプレ設定。 |
| `/settings/devices` | **PROTECTED** | デバイス管理（#13・本人スコープ）。 |
| `/builder` | **PROTECTED** | UI builder（#16）。 |
| `/component/photo-analysis` | **PROTECTED** | 写真解析（#18）。解析ツール。login-gated（Scope A は「観測 READ」限定・解析は含まない）。 |
| `/env/shelf` | **PROTECTED** | 環境棚/Placement（本人スコープ）。 |
| `/admin/karma` | **PROTECTED** | 管理（#08 カルマ）。※将来 role ゲート要（現状は最低限 auth）。 |
| `/admin/gmo` | **PROTECTED** | 管理（#23 GMO 判定）。※将来 role ゲート要。 |
| `/health` `/api/*` `/_next/*` `/favicon*` | **BYPASS** | プローブ/API/静的/framework。 |

---

## 4. 裁定が必要だった論点（タスク明示）

| 論点 | 裁定 | 理由 |
|------|------|------|
| **(a) `/board`** | **PROTECTED** | 知の広場 PROVISIONAL・ゲート中。公開前提にしない（P3）。将来 GO したら PUBLIC 側へ明示追加。 |
| **(b) `/individuals/*/qr` 等 QR 共有先** | **PROTECTED（公開ページ不要）** | QR は `ihl://…` アプリ deep link で、匿名がブラウザで開く公開 Web 到達先が存在しない。共有機能上「公開読取が必要な QR 到達ページ」自体がないため、公開露出はゼロで要件充足。 |
| **(c) ルート `/`** | **PROTECTED** | H-001。exact 扱い（`/` を公開 prefix にすると全ルート公開になるため matchesPrefix には入れない）。 |
| **(d) その他グレー** | 全て **PROTECTED** | Scope A に明示のない個体詳細・解析・貢献度・投票・admin 等は default-deny（P1/P2）。 |

---

## 5. 実装（middleware）と将来拡張

- **公開 prefix**: `/login /register /terms /language`（`PUBLIC_PATH_PREFIXES`）。
- **観測 READ**: `isObservationPublicRead` — `/observation` 配下は READ 既定、`OBSERVATION_WRITE_PREFIXES` と `/fork` のみ保護。
  - **維持ルール**: 観測配下に**新 WRITE ルートを足す時のみ** `OBSERVATION_WRITE_PREFIXES` へ追記（観測配下は READ 既定のため列挙漏れは公開事故になる。他サブツリーは fallback で自動保護）。
- **その他全ルート**: fallback redirect → 新規ルートは自動で PROTECTED（P4）。
- **open-redirect ガード**: 認証済み `/login?next=…` は内部絶対パス（`/` 始まり・`//` 不可）のみ許可、外部 URL は `/` へ。

---

## 6. テスト

`apps/web/src/middleware.test.ts`（vitest）:
公開ルート通過・観測 READ 通過・保護ルート redirect（`next` 付与）・観測 WRITE redirect・`/health` バイパス・token 付き `/login` の `next` 遷移・open-redirect ガード。`npm test` green（59 passed）。

---

*裁定正本 / middleware 変更根拠。境界変更時は本表を先に更新。*
