---
slice_id: 05-MICRO-revrtm-004
owner: auto
type: reverse-rtm
layer: acceptance
test_prefix: UAT-05-*
rtm_rows: 53
unique_tcs: 16
---

# 05-MICRO-revrtm-004 — 逆RTM · 受入層（UAT-*）

## 目的

`RTM-v1.csv` の **acceptance 行 53 件**（16 ユニーク TC）について、観測者ストーリー → req_id 逆引きを監査する。playwright / manual / review 混在。retrofit（integration 緑）と **gap/deferred/human** を粉飾なく分離する。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/05-観測/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/05-観測/逆RTM-v1.csv` |
| 受入計画 | `03-テスト計画/features/05-観測/受入テスト計画-v1.md` |
| retrofit pytest | `tests/integration/test_observation_solid.py` · `test_observation_detail.py` |
| playwright | **未配置**（`automation=playwright` は planned） |
| UI 正本 | `apps/web/src/app/observation/` · screen slices |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（UAT） | 16 |
| RTM acceptance 行数 | 53 |
| automation | review 8 · playwright 9 · manual 2 |
| existing（req 行） | OBS-INPUT-* · OBS-PHOTO-01 · OBS-TPL-18 等 · playwright 既存标注 |
| gap 束ね | UAT-05-07 → 10 req（Driver/BPCMS 未配線） |
| human | UAT-05-08 → OBS-NF-09 |

## 孤立 TC 監査

### A. playwright planned — spec ファイル無（orphan-impl · 期待）

| test_case_id | req_count | 主 req | 備考 |
|--------------|-----------|--------|------|
| UAT-05-09 | 4 | OBS-FUP-03 · OBS-RX-UX-03/09 · OBS-QR-03 | confirm / QR · **playwright 未追加** |
| UAT-05-10 | 3 | OBS-RX-UX-05 · OBS-MVP-01/02 | stage 時系列 |
| UAT-05-11 | 1 | OBS-RX-UX-08 | binding サマリー |
| UAT-05-12 | 1 | OBS-RX-UX-10 | 次回ピッカー |
| UAT-05-14 | 3 | OBS-FUP-06 · OBS-RX-UX-01/04 | env chunk UI |
| UAT-05-15 | 10 | OBS-INPUT-01〜05 · OBS-PHOTO-01 · OBS-TPL-18/19 等 | ver2_uat_seed **pytest retrofit 緑** |
| UAT-05-16 | 1 | OBS-IND-02 | sire/dam UI |
| UAT-05-17 | 1 | OBS-RX-UX-06 | schedule UI |

### B. review / manual — 人手・設計受入

| test_case_id | automation | req 例 | 判定 |
|--------------|------------|--------|------|
| UAT-05-01 | review | OBS-SOL-06/08 · OBS-NF-05 · deferred DIG | retrofit API 緑 · UI review |
| UAT-05-02 | review | OBS-TAX-06 · OBS-TGT-04 | alias · deferred |
| UAT-05-13 | manual | OBS-RX-UX-02 | 3 クリック · Tier D |
| UAT-05-08 | manual | OBS-NF-09 | **human** · 実機 SwitchBot |

### C. gap 束ね（UAT-05-07）

| req_id | status | 内容 |
|--------|--------|------|
| OBS-SOL-05 | gap | LabelMe |
| OBS-TAX-02/03/05 | gap | GBIF/Wikidata/Question Driver |
| OBS-REP-01/02/06 | gap/deferred | BPCMS · スケール · market |
| OBS-DRV-01 | gap | Driver runtime |
| OBS-INPUT-06/07 | deferred | ver2 OUT |

**粉飭禁止**: 上記を existing/playwright 緑と記載しない。

### D. retrofit 根拠（UAT-05-01〜06 必須）

| UAT | retrofit pytest | 備考 |
|-----|-----------------|------|
| UAT-05-01 | `test_solid_commit_capture_persist` | 種/性別 commit |
| UAT-05-02 | `test_ut_05_03_*` | ユーザー確定 |
| UAT-05-03 | `test_solid_commit_iot_switchbot_env_chain` | env 2 行 |
| UAT-05-04 | `test_solid_measurements_from_telemetry` + manual origin | 由来分離 |
| UAT-05-05 | search + detail（similar 条件付き） | OBS-IMG-04 planned |
| UAT-05-06 | template LIST/DETAIL UT | OBS-TPL-16 review |

**孤立 TC 0**: 16 UAT 全件が逆RTM で req 保持。

## test → req マッピング（全 UAT）

| test_case_id | req_count | statuses 概要 | automation |
|--------------|-----------|---------------|------------|
| UAT-05-01 | 6 | review · gap · deferred | review |
| UAT-05-02 | 2 | review · deferred | review |
| UAT-05-03 | 2 | xref · deferred | review |
| UAT-05-05 | 5 | deferred · xref | review |
| UAT-05-06 | 2 | deferred · review | review |
| UAT-05-07 | 10 | gap · deferred | review |
| UAT-05-08 | 1 | human | manual |
| UAT-05-09 | 4 | planned | playwright |
| UAT-05-10 | 3 | planned | playwright |
| UAT-05-11 | 1 | planned | playwright |
| UAT-05-12 | 1 | planned | playwright |
| UAT-05-13 | 1 | review | manual |
| UAT-05-14 | 3 | planned · review | playwright |
| UAT-05-15 | 10 | planned · existing | playwright |
| UAT-05-16 | 1 | planned | playwright |
| UAT-05-17 | 1 | planned | playwright |

## UAT-05-15 詳細（existing req · planned TC）

| req_id | RTM status | retrofit |
|--------|------------|----------|
| OBS-INPUT-01〜05 | existing | `ver2_uat_seed` · detail 22 行 |
| OBS-PHOTO-01 | existing | photo_conditions 行 |
| OBS-TPL-18 | existing | confirm テンプレ |
| OBS-TPL-19 | existing | 種族束縛 — **screen slice 参照** |
| OBS-RX-RD-04 · OBS-RX-REP-04 | planned | UI playwright 待ち |

## ギャップ行提案

| 提案 ID | 内容 | 操作 |
|---------|------|------|
| GAP-UAT-01 | playwright spec 0 件 | 全 `automation=playwright` を **planned 維持** |
| GAP-UAT-02 | OBS-TPL-19 RTM existing · fr slice 105 件目 | fr-1id バッチで追従 · status 変更なし |
| GAP-UAT-03 | UAT-05-07 gap 束ね | 1 TC 多 req は逆RTM 正 · Driver 実装まで gap |
| GAP-UAT-04 | UAT-05-08 human | 人間ゲート · AI `[x]` 禁止 |

## screen slice 連携

| UAT 系 | screen slice |
|--------|--------------|
| UAT-05-14/01 | `slices/screens/observation-input.md` |
| UAT-05-09/03 | `observation-confirm.md` |
| UAT-05-05/01 | `observation.md` · `observation-capture-id.md` |

## acceptance 自己チェック

- [x] UAT-* 16 TC 逆引き完備
- [x] 孤立 TC = 0
- [x] gap/human/deferred を existing にしていない
- [x] playwright 未実装を planned と明記
- [x] 60 行以上

## 参照

- seed: `libs/ihl/observation/ver2_uat_seed.py`
- E2E DRAFT: `02-設計/E2E/05-観測-E2E-v1-DRAFT.md`
- 監査: 2026-07-03 · MAD-05 batch 11
