---
slice_id: 05-MICRO-fr-055
type: fr-1id
req_id: OBS-NF-02
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-055 — OBS-NF-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-02 · RTM `status=planned`
- **acceptance**: OBS-NF-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

SwitchBot token · R2 鍵 · collector 署名鍵等の **秘密値をリポジトリ・docs 本文・API 応答・ログに含めない** こと（REQ-025 §3.1.2 · ADR-H-30 秘密非保持）。環境変数 / ユーザー PC ローカル `.env` のみが秘密の正本。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | env 設定 · collector ingest · SwitchBot poll/import · telemetry 応答 |
| **Transform** | 秘密列の redact · docs は **プレースホルダ参照のみ** · 応答 JSON から鍵フィールド除外 |
| **OUT** | 公開可能な API/docs · ログ — **token/secret 文字列なし** |

## 受入基準

1. REQ-025 §3.1.2: repo/docs に実鍵を書かない — 例示は `<REDACTED>` / env 名のみ。
2. `POST /api/env/collector/ingest` 等: 応答に SwitchBot token 無（OBS-ENV-04 整合）。
3. ST-05-07（planned）: telemetry/env 応答 **秘密列除外** — 専用断言未追加（`revrtm-003` GAP-ST-01）。
4. ADR-H-30: IHL サーバは SwitchBot live fetch しない — 秘密は collector 側のみ。
5. CI/docs grep: 既知 secret パターンが **設計スライス本文に無い**。

## In / Out 境界

| In | Out |
|----|-----|
| env 変数（実行時） | redact 済みログ/応答 |
| docs プレースホルダ | 運用手順 |
| — | repo への `.env` 実値 |
| — | API 応答への token  echo |
| — | エラーメッセージへの secret 全文 |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 秘密非表示 |
| §X Connector | SwitchBot · collector |
| ADR-H-30 | 秘密非保持 |

> ペア: [`obs-env-02.md`](obs-env-02.md) · [`obs-env-04.md`](obs-env-04.md) · REQ-025 §3.1.2。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-02 |
| design_section | §6 秘密非表示 |
| test_case_id | ST-05-07 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-07 — OBS-NF-02 のみ（`revrtm-003` · planned · GAP-ST-01 断言未追加）。

## 実装 surface

| 層 | 参照 |
|----|------|
| ADR | ADR-H-30 |
| API | env ingest · poll 応答スキーマ |
| Ops | collector `.env` · CI secret scan |
| テスト | ST-05-07 retrofit 待ち |

## gap 注記

- **planned**: 運用ルールは ADR 確定 — **ST-05-07 専用 pytest 未追加**（GAP-ST-01）。
- **ENV-02/04 連携**:  ingest 経路は設計済 — 本 FR は **横断 NFR**。
- **NF-09 境界**: 実機確認は human gate — 秘密 **非保持** は機械断言可能域。
