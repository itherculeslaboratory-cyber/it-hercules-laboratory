# OSS 機能ギャップ表 v1（#00–#23 · current vs OSS-READY）

> **正本**: [`ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](./ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md)  
> **完了キュー**: [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) **POST-OSS-***  
> **技術 DoD**: [`00-機能別実装DoD-マトリクス-v1.md`](./00-機能別実装DoD-マトリクス-v1.md)  
> **更新**: 2026-06-14（POST-B8 salvage-adapt 反映 · V-WAVE 168/168 機械完走）

---

## 凡例

| 記号 | 意味 |
|------|------|
| **✓** | OSS-READY（当該列の完了条件を満たす） |
| **△** | 部分（stub · smoke · mock 残 · 設計未確定） |
| **—** | 未着手 |
| **N/A** | 画面なし（横断 schema 等）— 理由を POST-OSS 行に記載 |

**OSS-READY 行**: 全列が **✓** または正当な **N/A**（ADR-H-21 + USER-DONE §0 準拠）

---

## サマリー

| OSS-READY | 件数 |
|-----------|------|
| **✓ 完走** | 0 / 24（#00–#23） |
| **△ 部分** | 22 |
| **— 未着手** | 0 |
| **stays→salvage 再実装済** | 5（#06 #07 #14 #16 #17 · POST-B8 salvage-adapt 2026-06-10〜14） |

---

## ギャップ表（#00–#23）

| # | 機能 | 設計4点 | コード | テスト | UI route | README | 現状 | OSS-READY | POST-OSS |
|---|------|---------|--------|--------|----------|--------|------|-----------|----------|
| **00** | 土台 | △ | ✓ | ✓ | N/A | ✓ | schema · event_store · libs README | △ | POST-OSS-00 ✓ |
| **01** | ログイン | △ | ✓ | ✓ | ✓ | △ | magic link 実装済 | △ | POST-OSS-01 ✓ |
| **02** | 利用規約 | △ | ✓ | ✓ | ✓ | △ | stub · USER-WAIVED | △ | POST-OSS-02 ✓ |
| **03** | 新規登録 | △ | ✓ | ✓ | ✓ | △ | onboarding 実装済 | △ | POST-OSS-03 ✓ |
| **04** | ホーム | △ | ✓ | ✓ | ✓ | △ | summary API 済 | △ | POST-OSS-04 ✓ |
| **05** | 観測 | △ | ✓ | ✓ | ✓ | △ | solid commit 済 | △ | POST-OSS-05 ✓ |
| **06** | マーケット | △ | △ | △ | △ | △ | salvage-adapt · listing/trade API · pytest | △ | POST-OSS-06 ✓ |
| **07** | 掲示板 | △ | △ | △ | △ | △ | salvage-adapt · board_store · category isolation | △ | POST-OSS-07 ✓ |
| **08** | カルマ | △ | ✓ | ✓ | ✓ | △ | economy_logic · fib · profile/metrics | △ | POST-OSS-08 ✓ |
| **09** | 論文 | △ | ✓ | ✓ | ✓ | △ | research/papers · research/match | △ | POST-OSS-09 ✓ |
| **10** | マチアプ | △ | ✓ | ✓ | ✓ | △ | match/pair · preference_event | △ | POST-OSS-10 ✓ |
| **11** | 裁判 | △ | ✓ | ✓ | ✓ | △ | dispute-room · dispute_event | △ | POST-OSS-11 ✓ |
| **12** | 設定 | △ | ✓ | ✓ | ✓ | △ | preferences · device registry | △ | POST-OSS-12 ✓ |
| **13** | データ取得元 | △ | ✓ | ✓ | ✓ | △ | env ingest · placement · telemetry | △ | POST-OSS-13 ✓ |
| **14** | 貢献度 | △ | ✓ | ✓ | ✓ | △ | `/contribution` · `/api/v1/contribution` | △ | POST-OSS-14 ✓ |
| **15** | データ設計 | △ | ✓ | ✓ | N/A | △ | schema-pack 45 · inventory PASS | △ | POST-OSS-15 ✓ |
| **16** | UIbuilder | △ | △ | △ | △ | △ | ThemePack · builder canvas · NFR-16-01 INSERT ONLY | △ | POST-OSS-16 ✓ |
| **17** | UI選択 | △ | △ | △ | △ | △ | **IHL固有実装なし** · #12 settings 流用 | △ | POST-OSS-17 ✓ |
| **18** | 写真解析 | △ | ✓ | ✓ | ✓ | △ | embedding pipeline · photo-analysis UI | △ | POST-OSS-18 ✓ |
| **19** | コンポ掲示板 | △ | ✓ | ✓ | ✓ | △ | improve route 済 | △ | POST-OSS-19 |
| **20** | 投票 | △ | ✓ | ✓ | ✓ | △ | vote_event · `/api/v1/votes` | △ | POST-OSS-20 ✓ |
| **21** | 翻訳 | △ | ✓ | ✓ | △ | △ | i18n catalog · locale prefs | △ | POST-OSS-21 ✓ |
| **22** | PT ショップ | △ | ✓ | ✓ | ✓ | △ | pt_event · `/api/v1/economy/shop` | △ | POST-OSS-22 ✓ |
| **23** | GMO 振込 | △ | ✓ | ✓ | ✓ | △ | stub/stg connector · keys-pending live | △ | POST-OSS-23 ✓ |

---

## 列定義（OSS-READY 判定）

| 列 | 完了条件 |
|----|----------|
| **設計4点** | 要件 · 詳細 · 遷移 · UI が `指示/` にあり **人間確定 or v1.0** マーク |
| **コード** | `it-hercules-laboratory/` に component/libs + API · **mock_store 経由でない** |
| **テスト** | L1 pytest 該当 PASS · contract/integration あり |
| **UI route** | 遷移設計の主要 state が実ルート到達（N/A は ADR 理由付き） |
| **README** | `指示/…/component分解/` + `components|libs/…/README.md` 両方 |

---

## stays → salvage-adapt 優先（ADR-H-21）

| # | 旧状態 | OSS ギャップ |
|---|--------|--------------|
| **06** | civ-os deep link | market component · listing API · `/market/*` · event_store |
| **07** | mock board | board component · 板種別サブツリー · `/board/*` |
| **14** | ホーム要約のみ | contribution 専用 UI/API · 経済イベント完走 |
| **16** | Phase 2 先送り | context 編集 Builder · theme pack · `/builder` |
| **17** | dev のみ | 一般ユーザー向け routing UI · registry 整合 |

---

## 横断ギャップ（全機能共通）

| 項目 | 現状 | OSS-READY 条件 |
|------|------|----------------|
| **mock_store peel** | POST-B8-03 完了（salvage-adapt 5 機能） | 残ドメイン event_store 接続は継続 |
| **Playwright E2E** | POST-B8-04 部分（IHL smoke） | クリティカルジャーニー拡充は継続 |
| **route-matrix** | civ-os 側生成物参照 | IHL `docs/generated/route-matrix.*` 100% or N/A 理由 |
| **CONTRIBUTING / ARCHITECTURE** | 骨格 v1 | POST-OSS 完走に伴い充実 |
| **ui-design-review U-*** | 未監査一覧 | L5 層 · 機能別 PASS 記録 |

---

## 更新手順

1. POST-OSS-NN 完了時に当該行を **✓** へ更新
2. 全列 ✓ で当該機能 **OSS-READY**
3. 24 機能すべて OSS-READY + POST-B8 exhaust → **USER-DONE**

---

*v1 · 2026-06-10 · Batch 8 後スナップショット*
