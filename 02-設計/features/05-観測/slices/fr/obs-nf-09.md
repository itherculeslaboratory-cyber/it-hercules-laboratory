---
slice_id: 05-MICRO-fr-060
type: fr-1id
req_id: OBS-NF-09
owner: tier-a
rtm_status: human
---

# 05-MICRO-fr-060 — OBS-NF-09

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-09 · RTM `status=human`
- **acceptance**: OBS-NF-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**実機 SwitchBot 連携** と **本番 R2 への成功書き込み** は **人間確認ゲート** とし、エージェント/CI だけでは `[x]` 完了にしないこと（promo-pack · CONTINUE_QUEUE · ADR-H-30/32/33 運用境界）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー PC collector · SwitchBot 実機 · 本番 R2 資格 · 手動検証チェックリスト |
| **Transform** | ingest/poll 実経路で env snapshot 取得 → commit 同梱 · R2 に INSERT 確認 |
| **OUT** | **human 署名付き証跡** — ST/UAT automation では代替不可 |

## 受入基準

1. RTM `status=human` — UAT-05-08 · automation=manual · **エージェントが `[x]` にしない**。
2. UAT-05-08: 実機 SwitchBot · 本番 R2 成功 — promo-pack 受入（`revrtm-004` §human）。
3. ADR-H-30: 秘密は collector 側 — 人間が実機 `.env` を設定して検証。
4. OBS-ENV-02 gap 注記同型: poll/import 本番 R2 実機確認は **本 FR スコープ**。
5. CONTINUE_QUEUE: `P0-NEXT-GMO-LIVE-EXEC` 等と同型 — **人手専用ゲート**（観測 env 系）。

## In / Out 境界

| In | Out |
|----|-----|
| 人間による実機検証 | 署名付きチェックリスト |
| collector + SwitchBot 実機 | ingest 成功証跡 |
| 本番 R2 write 確認 | capture/env 行存在 |
| — | CI/mock のみで human 完了 |
| — | エージェントによる gate `[x]` |
| — | docs への実 secret 記載（NF-02 違反） |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 §7 | 人間ゲート · OBS-NF-09 |
| §X | SwitchBot · collector · R2 |
| ADR-H-30/32/33 | デバイス/環境/追記 |

> ペア: [`obs-env-02.md`](obs-env-02.md) · CONTINUE_QUEUE 人間ゲート · promo-pack 実機節。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-09 |
| design_section | §6 §7 人間ゲート |
| test_case_id | UAT-05-08 |
| test_layer | acceptance |
| automation | manual |
| status | **human** |

逆 RTM: UAT-05-08 — OBS-NF-09 のみ（`revrtm-004` · **human** · 実機 SwitchBot）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Ops | collector Docker · SwitchBot 実機 |
| R2 | 本番 bucket write |
| ADR | H-30 · H-32 · H-33 |
| キュー | CONTINUE_QUEUE 人間ゲート |
| テスト | UAT-05-08 **manual human** |

## gap 注記

- **human 固定**: 設計・mock・CI 緑 ≠ 本 FR 完了 — **製品責任者/運用者サインオフ**待ち。
- **tier-a**: ゲート定義とチェックリスト整備は doc 完走 — 実行は人手のみ。
- **NF-02 整合**: 証跡に secret を含めない — 成功ログは redact 済みスクリーンショット可。
