# ADR-Phase2-migration-trigger: Streamlit → Next.js 移行トリガー

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **作成日**: 2026-06-08
> **解消ギャップ**: B-11（移行トリガー未定義）/ B-12（filter state 互換）/ B-16（Streamlit 残置条件）
> **正本前提**: [`00-設計網羅監査-専門班-B-ランタイム.md`](./00-設計網羅監査-専門班-B-ランタイム.md) §3 · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) §3（Phase 境界）

---

## 文脈

設計は「Phase1=Streamlit / Phase2=Next.js」と述べるが、**いつ移行するか**の定量条件が無い（B-11）。検索 URL/filter の互換（B-12）と、移行後に Streamlit を残すか（B-16）も未決。

---

## 決定

### D-1. 移行トリガー（OR 条件 · どれか満たせば Phase2 着手検討）

| # | トリガー | 閾値（目安・詳細設計で微調整）|
|---|---------|------|
| T1 | データ規模 | capture 件数 > **50,000** または manifest が Streamlit メモリで重い |
| T2 | 同時利用 | 想定同時ユーザー > **20**（Streamlit のプロセス共有メモリが限界）|
| T3 | 機能要件 | **認証付き書込導線 / マーケット / 掲示板** など Streamlit で無理な UI が必要 |
| T4 | モバイル要件 | スマホ最適化が正式要件化（[`ADR-Phase2-mobile-nfr.md`](./ADR-Phase2-mobile-nfr.md)）|

> いずれも **単一指標で機械的に移行しない**。T1〜T4 を満たした上で人間が Phase2 Go を判断（設計ゲート同様）。

### D-2. filter/search state 互換（B-12）

- Phase1 から **URL クエリパラメータの語彙を固定**する（`?species=&year=&sex=&stage=&min_len=&qc=&lineage=`）。
- Next.js は **同じパラメータ名**を読む（リダイレクト不要・ブックマーク継続）。
- 互換できない新パラメータは追加のみ（旧 URL は壊さない）。

### D-3. Streamlit 残置ポリシー（B-16）

- Phase2 移行後、Streamlit は **開発者専用 internal tool** として残置可（一般公開導線からは外す）。
- 残置条件: ①一般ユーザー向けナビから不可視 ②本番認証と分離 ③運用コストが小さい範囲。
- 上記を満たせないなら **廃止**（二重 UI を一般提供しない）。

---

## 影響

- Phase1 実装時に **URL パラメータ語彙を確定**しておく（移行コストを前借りで下げる）。
- Phase2 着手は runtime-dispatch / web-architecture ADR の人間確定とセット。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
