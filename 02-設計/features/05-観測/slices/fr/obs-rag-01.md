---
slice_id: 05-MICRO-fr-040
type: fr-1id
req_id: OBS-RAG-01
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-040 — OBS-RAG-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.7 OBS-RAG-01 · RTM `status=deferred`
- **acceptance**: OBS-RAG-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測の **正本は R2 セッション JSON**（event store · commit 成果）とし、RAG（`rag/observation_note.csv` 等）は **短文チャンクの派生索引** に留めること。promo-pack §5 — RAG を Truth に昇格させない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit 済み capture · measurements · session JSON · 任意メモ入力 |
| **Transform** | R2 から短文チャンク抽出 · CSV/embedding 索引更新（**非破壊**） |
| **OUT** | RAG チャンク行 · 検索ヒント — **canonical は常に R2 capture_id** |

## 受入基準

1. promo-pack §5: R2 セッション JSON = 正本 · RAG = 補助説明。
2. チャンク生成は INSERT ONLY 索引 — capture イベントの UPDATE 代替にしない。
3. UAT-05-05（deferred）: search + detail 受入と同束ね — RAG 単体 UAT は review。
4. OBS-RAG-02（別 FR）: チャンク必須フィールド（種・日時・環境等）は **本 FR の拡張**。
5. Twin/説明は RAG 参照可だが **数値・確定 taxonomy は R2 直読**（OBS-NF 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| R2 session JSON · capture Truth | 短文 RAG チャンク |
| ユーザー観測メモ | `observation_note.csv` 行 |
| — | RAG チャンクを commit 正本に |
| — | RAG のみから measurement 復元 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1 | capture 正本 |
| §5 OUT | RAG は派生（要件 §4.7） |
| §4.3 | R2 INSERT ONLY |

> 正本: `rag/observation_note.csv` · promo-pack §5 · civ-os R2 セッション JSON。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RAG-01 |
| design_section | §5 OUT |
| test_case_id | UAT-05-05 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-05 — OBS-IMG-04 · OBS-RAG-01 · OBS-REP-05 等（`revrtm-004` · deferred）。

## 実装 surface

| 層 | 参照 |
|----|------|
| R2 | event store · commit session JSON |
| RAG | `rag/observation_note.csv` |
| API | search/detail — Truth 直読 |
| civ-os | promo-pack §5 運用 |
| 将来 | チャンク自動生成バッチ（OBS-RAG-02） |

## gap 注記

- **deferred**: 正本ルールは設計確定 — 自動チャンク生成パイプラインは **未 GATE**。
- **REP-05 連携**: manifest/search は R2 直読 — RAG は説明層のみ。
- **捏造禁止**: Twin 台本は RAG を舞台にするが **数値は CSV/R2 照合**（civ-os ルール継承）。
