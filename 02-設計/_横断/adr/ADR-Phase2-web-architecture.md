# ADR-Phase2-web-architecture: Next.js ↔ FastAPI ↔ DuckDB

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可（Phase2 移行 Go 前に人間確定必須）
> **作成日**: 2026-06-08
> **解消ギャップ**: B-04（DuckDB 実行位置）/ B-13（詳細アーキ図）/ B-15（shadcn と catalog の管理分離）
> **正本前提**: [`00-設計網羅監査-専門班-B-ランタイム.md`](./00-設計網羅監査-専門班-B-ランタイム.md) §3/§7 · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) §1 · [`ADR-Phase2-runtime-dispatch.md`](./ADR-Phase2-runtime-dispatch.md)

---

## 文脈

Phase1 は Streamlit が in-process で DuckDB を実行する。Phase2 で Next.js 15（App Router）+ shadcn/ui に移行する際、**DuckDB クエリの実行位置**（ブラウザ DuckDB-Wasm か サーバ FastAPI か）が未決（B-04）。Next.js↔FastAPI↔DuckDB の責務境界図も未作成（B-13）。

---

## 検討した選択肢

| 観点 | Option A: サーバサイド（FastAPI→DuckDB） | Option B: ブラウザ（DuckDB-Wasm）|
|------|------|------|
| 秘密鍵 | R2 鍵をサーバに隠せる ◎ | 署名 URL 配布が必要・露出リスク △ |
| 大きな manifest | サーバメモリで処理・スマホに優しい ◎ | クライアント転送量大 △ |
| オフライン/即応 | サーバ往復 △ | ローカル即応 ◎ |
| 実装一貫性 | Phase1 の whitelist クエリを移植しやすい ◎ | 別実装になりがち △ |

---

## 決定

### D-1. 既定は Option A（サーバサイド DuckDB · FastAPI 経由）

```
[Browser: Next.js 15 App Router + shadcn/ui]
   │  fetch (server action / route handler)
   ▼
[FastAPI]  ──(whitelist query)──▶ [DuckDB in-process] ──▶ R2 Parquet (D-01 pointer)
   │                                                      └▶ embeddings.npy (locator)
   └─ R2 signed URL 発行（thumbnail）→ Browser が直接取得
```

- 秘密鍵をサーバに閉じられる・スマホ低帯域でも安定（B-04 → サーバ既定）。
- thumbnail は **署名 URL で直接取得**（API を通さず帯域節約・モバイル NFR と整合）。

### D-2. DuckDB-Wasm は限定オプトイン（Phase2.1+）

- 「小さな subset の即応フィルタ」だけ DuckDB-Wasm を **任意で**使う余地を残す（既定ではない）。
- 採用時も **クエリ whitelist は同一定義**を共有し、二重実装にしない。

### D-3. Next.js ↔ FastAPI ↔ DuckDB 責務境界（B-13）

| 層 | 責務 | 持たない責務 |
|----|------|------|
| Next.js | 画面・状態・フィルタ UI・SSR/RSC・署名 URL の表示 | ドメインロジック・DB 直アクセス |
| FastAPI | API 契約・認可・whitelist クエリ実行・ジョブ dispatch（runtime-dispatch ADR）| 画面 |
| DuckDB | Parquet/numpy のクエリ実行（in-process）| 永続 DB（常駐 DB 禁止・FOUND-D05）|

### D-4. shadcn/ui と catalog/screen_defs の管理分離（B-15）

| 対象 | 正本 | 役割 |
|------|------|------|
| shadcn/ui コンポーネント | `apps/web/components/ui/`（**コピーイン/vendoring**）| 見た目の素材（独自 DS 禁止）|
| catalog/components.yaml | `catalog/`（REFRAME 用登録簿）| **どの C-USB component を画面に紐づけるか** |
| screen_defs | `catalog/screens/` | 配置（ScreenDef）|

→ shadcn は **素材**、catalog/screen_defs は **配置と機能紐づけ**。両者は別管理で、UIbuilder REFRAME は後者のみ編集する（ADR-H-01）。

### D-5. OpenAPI 正本・CI 検証

- 正本: `apps/api/openapi.yaml`。FastAPI 実装から生成し、**生成物と正本の差分を CI で fail**（契約ドリフト防止）。

---

## 影響

- **B-mobile-nfr**: 署名 URL TTL・thumbnail ページネーションは [`ADR-Phase2-mobile-nfr.md`](./ADR-Phase2-mobile-nfr.md)。
- **B-runtime-dispatch**: ジョブ実行は [`ADR-Phase2-runtime-dispatch.md`](./ADR-Phase2-runtime-dispatch.md)。
- **vector store**: FAISS index 再生成（B-14）は別 ADR（ADR-Phase2-vector-store・本バッチ範囲外）。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — Phase2 移行 Go 前に人間確定必須*
