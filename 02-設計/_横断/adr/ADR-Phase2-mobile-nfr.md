# ADR-Phase2-mobile-nfr: スマートフォンブラウザ NFR

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可（Phase2 UI 設計前に確定）
> **作成日**: 2026-06-08
> **解消ギャップ**: B-01（レイテンシ予算）/ B-02（thumbnail ページネーション）/ B-03（低帯域・CDN）
> **正本前提**: [`00-設計網羅監査-専門班-B-ランタイム.md`](./00-設計網羅監査-専門班-B-ランタイム.md) §1/§7 · [`ADR-Phase2-web-architecture.md`](./ADR-Phase2-web-architecture.md)（署名 URL 直取得）

---

## 文脈

ユーザー懸念「スマートフォンブラウザ vs Docker」。Phase1（Streamlit）は **モバイル最適化は非要求**（FOUND-N06 の延長）。Phase2 Web UI ではスマホ閲覧が想定されるが、レイテンシ予算・thumbnail 表示件数・低帯域配信が未定義。

---

## 決定（Phase2 NFR）

### D-1. レイテンシ予算（P95 目標 · モバイル 4G 想定）

| 操作 | P95 目標 |
|------|---------|
| 検索グリッド 初回表示 | **≤ 2.5s** |
| フィルタ適用（再クエリ）| **≤ 1.2s** |
| 個体詳細 + 類似 | **≤ 2.0s** |
| thumbnail 1 枚 | **≤ 800ms**（CDN ヒット時 ≤ 200ms）|

### D-2. thumbnail グリッド（B-02）

- 既定 **24 件/ページ**、**無限スクロール**（ページング併用可）。
- グリッドは **遅延読込（IntersectionObserver）**。先読みは次 1 画面分まで。
- 画像は **4:3 固定枠**（CLS 防止）。色補正なし（preferences §C）。

### D-3. 低帯域・配信（B-03）

| 項目 | 決定 |
|------|------|
| 形式 | thumbnail は **webp 優先**（fallback jpg）。原画は詳細画面でのみ取得 |
| 段階配信 | グリッド = 小 thumbnail（〜256px）/ 詳細 = 中（〜1024px）/ 原寸 = 明示操作時のみ |
| 署名 URL | TTL **15 分**（短め）。期限切れは再発行（[`ADR-Phase2-web-architecture.md`](./ADR-Phase2-web-architecture.md) D-1）|
| CDN | Cloudflare キャッシュを **thumbnail のみ**許可（原画・manifest はキャッシュしない）。R2 同一エッジ前提 |

### D-4. 役割分担（懸念「スマホ vs Docker」への回答）

- **重い計算（embedding / ingest / 集計）= Docker component（サーバ）**。スマホは絶対に計算しない。
- **スマホブラウザ = 表示と軽いフィルタのみ**（DuckDB はサーバ実行が既定・web-architecture D-1）。
- → 「性能分担」は **Docker=計算 / ブラウザ=表示** に固定。スマホ性能に依存させない。

---

## 影響

- Phase2 UI 設計（グリッド/詳細）の実装前にこの NFR を満たす測定計画を立てる。
- thumbnail component の出力サイズ段階（256/1024）を pipeline 設計に反映。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — Phase2 UI 設計前に確定*
