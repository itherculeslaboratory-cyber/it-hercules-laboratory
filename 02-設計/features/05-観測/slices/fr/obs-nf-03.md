---
slice_id: 05-MICRO-fr-056
type: fr-1id
req_id: OBS-NF-03
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-056 — OBS-NF-03

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-03 · RTM `status=review`
- **acceptance**: OBS-NF-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測開始（入力画面到達または commit 可能状態）まで **主要導線 3 クリック以内** とすること（REQ-026 Lane B · `preferences.md` §A）。ホーム/QR/続ける/テンプレ各入口で **迷子 UI 禁止** — 日常記録は入力 DD が主、管理画面は Fork 等 3 タップ契約。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 入口（ホーム · QR · 続ける · テンプレ DD · 検索 CTA）· `entry_mode` · `individual_id` |
| **Transform** | 最短 path 設計 · 中間 LIST 迂回を日常導線から排除 · WorkflowContext プリフィル |
| **OUT** | `/observation/input?…` 到達 ≤3 タップ · テンプレ Fork: 詳細→複製→保存 = 3 クリック |

## 受入基準

1. REQ-026 Lane B: 観測開始まで **≤3 クリック** — 根拠 path を遷移設計に明記。
2. テンプレ: 日常 = 入力 DD · LIST/DETAIL = **管理専用**（TPL-16/17 · 遷移 §4）。
3. ST-05-06（review · manual）: 3 クリック — **人手/system manual** · Tier D 候補（`revrtm-003`）。
4. QR/続ける: `entry_mode` + `individual_id` で server 採番 · プリフィル — タップ数に含めない内部 API。
5. UAT-05-13 等関連 acceptance と **矛盾しない** path 表（遷移 v1 正本）。

## In / Out 境界

| In | Out |
|----|-----|
| 主要入口 CTA | ≤3 タップで input |
| WorkflowContext プリフィル | タップ数に含まない（背景） |
| — | 管理 LIST を日常必須経路に |
| — | 4+ クリックのデフォルト固体導線 |
| — | 全機能一覧からの迂回を唯一導線に |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 3 クリック · OBS-NF-03 |
| §10 | 入力 · テンプレ · 検索導線 |
| 遷移 | `05-観測-入力-遷移設計-v1.md` · テンプレ遷移 §4 |
| ADR-H-34 | UX 3〜5 チャンク |

> UI 正本: `ui-reference/preferences.md` §A · ペア: [`obs-sol-01.md`](obs-sol-01.md) · [`obs-tpl-16.md`](obs-tpl-16.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-03 |
| design_section | §6 3クリック |
| test_case_id | ST-05-06 |
| test_layer | system |
| automation | manual |
| status | **review** |

逆 RTM: ST-05-06 — OBS-NF-03 のみ（`revrtm-003` · review · manual · Tier D 候補）。

## 実装 surface

| 層 | 参照 |
|----|------|
| UI | ホーム · QR · input · template DD |
| 遷移 | 入力/テンプレ/検索 v1 |
| Screen | [`observation-input.md`](../screens/observation-input.md) |
| テスト | ST-05-06 **manual** · Playwright path 表 |

## gap 注記

- **tier-a / review**: 遷移 doc は確定 — **人手 3 クリック検証** が RTM review の理由。
- **manual 維持**: 自動 E2E だけでは tap 定義がぶれる — ST-05-06 は system manual 正本。
- **DIG-01 連携**: 固体/デジタル/環境分離はチャンク — 本 FR は **tap 数** NFR。
