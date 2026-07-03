---
slice_id: 05-MICRO-fr-028
type: fr-1id
req_id: OBS-TAX-05
owner: tier-a
rtm_status: gap
---

# 05-MICRO-fr-028 — OBS-TAX-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.5 OBS-TAX-05 · RTM `status=gap`
- **acceptance**: OBS-TAX-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**Question Kernel**（Akinator 式絞り込み）が観測対象/domain を **選択式質問で候補を狭める** が、**確定はしない** こと（TOT-OBS-03 · ADR-H-16 §4 経路②）。Phase 2 · IHL **未配線（gap）**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | domain · 直前候補集合 · ユーザー回答（綱/目/用途/素材等） |
| **Transform** | Question Kernel が次質問 + 絞込候補を算出 |
| **OUT** | 縮小された TaxonomyCandidate/target リスト · **commit 未確定** |

## 受入基準

1. 質問経路は **候補提示のみ** — 最終 confirm はユーザー（OBS-SOL-04 · OBS-TGT-03）。
2. 3 タブ UI（検索/質問/ツリー）の **② 質問で絞る**（ADR-H-16 §4）。
3. **gap 維持**: UAT-05-07 · P1 Driver 群 — Question Kernel **runtime 未配線**。
4. AI 推論で species/target を **自動確定しない**（監査役禁止事項 · ADR-H-16）。
5. 空候補時: 理由 + 他経路導線（NF-04 · 3 クリック以内維持）。

## In / Out 境界

| In | Out |
|----|-----|
| Question Kernel · ユーザー回答 | 絞込候補 |
| 観測対象ナビゲータ UI（Phase 2） | — |
| — | Akinator 終了時の自動 commit |
| — | 質問ログの R2 Truth（将来は derived · 別 FR） |

## DET 参照

| 節 | 内容 |
|----|------|
| §7.2 P1 | Question Kernel gap |
| ADR-H-16 | 3 経路 · Phase 2 |
| §7 | TOT-OBS-03 |
| §0 | 確定はユーザー |

> OBS-TGT-03: 各 domain 3 経路 — 本 FR は **② 質問** の kernel 側。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAX-05 |
| design_section | §7 P1 Question |
| test_case_id | UAT-05-07 |
| test_layer | acceptance |
| automation | review |
| status | **gap** |

逆 RTM: UAT-05-07 — OBS-TAX-02/03/05 等（`revrtm-004` §C）。

## 実装 surface

| 層 | 参照 |
|----|------|
| 将来 | TOT-OBS-03 · OBS-DRV-01 |
| ADR | `ADR-H-16-観測対象ナビゲータ.md` §4 経路② |
| UI | 観測対象ナビゲータ（**deferred** · Phase 2） |
| テスト | UAT-05-07 · **gap** |

## gap 注記

- **tier-a / gap**: Phase 2 roadmap — ver1 固体 commit **非ブロッカー**。
- **TAX-04 補完**: catalog/search は即時 · Question は **対話絞込** — 併用可。
- **粉飭禁止**: 未実装 kernel を existing としない。
