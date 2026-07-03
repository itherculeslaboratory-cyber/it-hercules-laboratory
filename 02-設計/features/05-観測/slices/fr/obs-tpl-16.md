---
slice_id: 05-MICRO-fr-048
type: fr-1id
req_id: OBS-TPL-16
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-048 — OBS-TPL-16

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-16 · RTM `status=review`
- **acceptance**: OBS-TPL-16 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**計測テンプレ一覧 LIST 画面**（`/observation/templates`）で、公開/自分/フォーク済フィルタとカードグリッドによりテンプレを発見・管理できること。日常記録は入力画面 DD が主 — 本画面は **管理・Fork 専用**（遷移設計 §4 · OBS-NF-03 3 クリック）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `GET /templates` · fixture カタログ + event store マージ · WorkflowContext クエリ（任意） |
| **Transform** | 可視性/所有者/フォーク状態でフィルタ · カードグリッド描画 · 空状態/ローディング |
| **OUT** | LIST UI · 詳細/Fork/記録への遷移リンク · `{ items, total }` API 応答 |

## 受入基準

1. ルート `/observation/templates` — 公開/自分/フォーク済フィルタ（UI設計 §2）。
2. `GET /api/v1/observation/templates` — fixture + 永続テンプレマージ（api slice 正本）。
3. UAT-05-06（review）: template LIST/DETAIL UT — OBS-TPL-17 と同束ね。
4. WorkflowContext クエリ引き継ぎ（OBS-CTX-01）— 種族スコープで候補絞り込み（OBS-TPL-19）。
5. mock 仕様 `ihl-05-obs-template-list.png` — PNG 未生成でも **事実ベース文言**（no-user-facing-unimplemented 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| テンプレ catalog API | LIST 画面 |
| 可視性フィルタ | カードグリッド |
| WorkflowContext | スコープ絞り込み |
| — | 入力画面 DD の代替 |
| — | Marketplace 本番（TPL-20 ver2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3 | `GET /templates` LIST |
| §10 | テンプレ一覧 Web |
| 遷移 | `05-観測-計測テンプレ-遷移設計-v1.md` §2 |

> UI: [`05-観測-計測テンプレ/ui/UI設計-v1.md`](../../05-観測-計測テンプレ/ui/UI設計-v1.md) §2 · API: [`get-api-v1-observation-templates.md`](../api/get-api-v1-observation-templates.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-16 |
| design_section | §3.3 LIST |
| test_case_id | UAT-05-06 |
| test_layer | acceptance |
| automation | review |
| status | **review** |

逆 RTM: UAT-05-06 — OBS-TPL-16 review · OBS-TPL-17 planned（`revrtm-004` · OBS-REP-04 deferred 同層）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `GET /api/v1/observation/templates` |
| Screen | `/observation/templates` · カードグリッド |
| UI 設計 | 計測テンプレ UI §2 |
| 遷移 | LIST → DETAIL · LIST → INPUT |
| テスト | UAT-05-06 acceptance review 待ち |

## gap 注記

- **tier-a / review**: API は existing — **LIST UI polish・acceptance レビュー**が残。
- **mock PNG 未生成**: 仕様 md 正本 — 「未実装」UI 文言禁止。
- **3 クリック**: Fork は DETAIL 経由 — LIST は発見専用（NF-03）。
