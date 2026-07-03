---
queue_head: MAD-COMPLETE
batch_default: 4
phase: DOC-REMED-MAD
magic_phrase: IHL-DOC-REMED MAD
golden_feature: 24
replicate_feature: null
parallel_slices_per_feature: 4
updated: 2026-07-03
last_completed_task: MAD-WAVE-5
note: "MAD 全24機能 GOLDEN 完結 · 横断レジストリ実データ化 · MAD-COMPLETE-REPORT 参照"
---

# IHL DOC-REMED Wave キュー v2（狂気モード）

> **合図**: `IHL-DOC-REMED MAD`（狂気）· 通常 `IHL-DOC-REMED` · 監査 `IHL-DOC-AUDIT`  
> **Skill**: [`.cursor/skills/ihl-doc-remediation/SKILL.md`](../../.cursor/skills/ihl-doc-remediation/SKILL.md)  
> **基盤**: 辞典 [`../automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../automation/IHL-MICRO-SLICE-CATALOG-v1.md) · 採点 [`../automation/IHL-SLICE-SCORECARD-v1.md`](../automation/IHL-SLICE-SCORECARD-v1.md) · オラクル [`../automation/IHL-CONTRACT-ORACLE-v1.md`](../automation/IHL-CONTRACT-ORACLE-v1.md) · 工場 [`../automation/IHL-DOC-REMED-FACTORY-v1.md`](../automation/IHL-DOC-REMED-FACTORY-v1.md)  
> **黄金**: [`../../docs/planning/golden/GOLDEN-05-MANIFEST.md`](../../docs/planning/golden/GOLDEN-05-MANIFEST.md)

---

## Wave 1 — 完了記録（2026-07-03）

- [x] **DOC-REMED-WAVE-1** — #01–#05・#12 の REQ-slim/TD/RTM/GATE 完了 · 全 GATE PASS（[v1 キュー](./00-DOC-REMED-Waveキュー-v1.md)）
- [x] **DOC-REMED-MAD-FOUNDATION-F1-F2** — マイクロスライス爆発 + 契約オラクル + #05 黄金基盤（本セッション）
  - MICRO 作業票 150 スライス · 契約レジスタ YAML（16 routes · check **PASS**）· 逆RTM 56 TC · 遷移辞書 · エラーカタログ · 4 automation rule · registry 4 本

---

## Wave MAD-05 — #05 黄金文明 完成（本番執筆）

> `node scripts/ihl-doc-micro-workorder.mjs --feature 05` の先頭 20 スライスを列挙。残り 130 は [`../../docs/planning/audits/WorkOrder-05-MICRO.json`](../../docs/planning/audits/WorkOrder-05-MICRO.json) 参照。  
> 各スライス: Auto ×4 Best-of-N → 採点 ≥85（C≥25）→ merge → GATE 5 本。

### api-1route（16 · auto · 契約オラクル正本）

> **api-1route 16/16 完了**（2026-07-03 · batch 4: api-013〜016）

- [x] **05-MICRO-api-001** — GET /api/v1/observation/{capture_id}（詳細）
- [x] **05-MICRO-api-002** — GET /api/v1/observation/{capture_id}/image（blob）
- [x] **05-MICRO-api-003** — GET /api/v1/observation/{capture_id}/reanalysis-manifest
- [x] **05-MICRO-api-004** — GET /api/v1/observation/measurement-dictionary
- [x] **05-MICRO-api-005** — GET /api/v1/observation/targets/catalog
- [x] **05-MICRO-api-006** — GET /api/v1/observation/templates（LIST）
- [x] **05-MICRO-api-007** — GET /api/v1/observation/templates/{template_id}（DETAIL）
- [x] **05-MICRO-api-008** — POST /api/captures（solid · 201）
- [x] **05-MICRO-api-009** — POST /api/measurements（solid）
- [x] **05-MICRO-api-010** — POST /api/solid-observation/commit（binding moment · 201）
- [x] **05-MICRO-api-011** — POST /api/v1/observation/dictionary-extensions（201）
- [x] **05-MICRO-api-012** — POST /api/v1/observation/measurements
- [x] **05-MICRO-api-013** — POST /api/v1/observation/search（ScopeA）
- [x] **05-MICRO-api-014** — POST /api/v1/observation/targets/search
- [x] **05-MICRO-api-015** — POST /api/v1/observation/templates（201）
- [x] **05-MICRO-api-016** — POST /api/v1/observation/upload

### schema-field（17/17 完了 · auto · 2026-07-03 batch 8）

> **schema-field 17/17 完了**

- [x] **05-MICRO-schema-001** — CaptureSearchRequest
- [x] **05-MICRO-schema-002** — CaptureUploadRequest
- [x] **05-MICRO-schema-003** — MeasurementRow
- [x] **05-MICRO-schema-004** — MeasurementSaveRequest
- [x] **05-MICRO-schema-005** — ObservationTargetSearchRequest
- [x] **05-MICRO-schema-006** — TemplateMeasurementRow
- [x] **05-MICRO-schema-007** — TemplatePhotoConditionRow
- [x] **05-MICRO-schema-008** — ObservationTemplateCreateRequest
- [x] **05-MICRO-schema-009** — DictionaryExtensionRequest
- [x] **05-MICRO-schema-010** — SolidCaptureBody
- [x] **05-MICRO-schema-011** — SolidMeasurementRow
- [x] **05-MICRO-schema-012** — SolidMeasurementsBody
- [x] **05-MICRO-schema-013** — ObservationCommitMeasurementRow
- [x] **05-MICRO-schema-014** — EnvironmentSnapshotBody
- [x] **05-MICRO-schema-015** — ObservationPhotoConditionRow
- [x] **05-MICRO-schema-016** — ObservationDeviceDeclaration
- [x] **05-MICRO-schema-017** — ObservationCommitBody

### error-code（4/4 完了 · auto · 2026-07-03 batch 9）

> **error-code 4/4 完了**

- [x] **05-MICRO-error-001** — HTTP 400 → [`slices/errors/400.md`](../../02-設計/features/05-観測/slices/errors/400.md)
- [x] **05-MICRO-error-002** — HTTP 401 → [`slices/errors/401.md`](../../02-設計/features/05-観測/slices/errors/401.md)
- [x] **05-MICRO-error-003** — HTTP 404 → [`slices/errors/404.md`](../../02-設計/features/05-観測/slices/errors/404.md)
- [x] **05-MICRO-error-004** — HTTP 409 → [`slices/errors/409.md`](../../02-設計/features/05-観測/slices/errors/409.md)

### screen-state（4/4 完了 · tier-a · 2026-07-03 batch 10）

> **screen-state 4/4 完了**

- [x] **05-MICRO-screen-001** — `/observation` list → [`slices/screens/observation.md`](../../02-設計/features/05-観測/slices/screens/observation.md)
- [x] **05-MICRO-screen-002** — `/observation/input` form → [`slices/screens/observation-input.md`](../../02-設計/features/05-観測/slices/screens/observation-input.md)
- [x] **05-MICRO-screen-003** — confirm → [`slices/screens/observation-confirm.md`](../../02-設計/features/05-観測/slices/screens/observation-confirm.md)
- [x] **05-MICRO-screen-004** — `/observation/[capture_id]` detail → [`slices/screens/observation-capture-id.md`](../../02-設計/features/05-観測/slices/screens/observation-capture-id.md)

### reverse-rtm（4/4 完了 · auto · 2026-07-03 batch 11）

> **reverse-rtm 4/4 完了** · 逆RTM 55 TC · 孤立 TC 0（機械）· orphan-impl/orphan-test はスライス内表

- [x] **05-MICRO-revrtm-001** — UT-* 32 行 → [`slices/reverse-rtm/revrtm-001-unit-layer.md`](../../02-設計/features/05-観測/slices/reverse-rtm/revrtm-001-unit-layer.md)
- [x] **05-MICRO-revrtm-002** — IT-* 18 行 → [`slices/reverse-rtm/revrtm-002-integration-layer.md`](../../02-設計/features/05-観測/slices/reverse-rtm/revrtm-002-integration-layer.md)
- [x] **05-MICRO-revrtm-003** — ST-* 14 行 → [`slices/reverse-rtm/revrtm-003-system-layer.md`](../../02-設計/features/05-観測/slices/reverse-rtm/revrtm-003-system-layer.md)
- [x] **05-MICRO-revrtm-004** — UAT-* 53 行 → [`slices/reverse-rtm/revrtm-004-acceptance-layer.md`](../../02-設計/features/05-観測/slices/reverse-rtm/revrtm-004-acceptance-layer.md)

### fr-1id（105 · auto 84 + tier-a · 2026-07-03 batch 21）

> **MAD-05 MICRO 150/150 完了** · api 16 · schema 17 · error 4 · screen 4 · revrtm 4 · fr 105

- [x] **05-MICRO-fr-001** — OBS-SOL-01 → [`slices/fr/obs-sol-01.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-01.md)
- [x] **05-MICRO-fr-002** — OBS-SOL-02 → [`slices/fr/obs-sol-02.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-02.md)
- [x] **05-MICRO-fr-003** — OBS-SOL-03 → [`slices/fr/obs-sol-03.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-03.md)
- [x] **05-MICRO-fr-004** — OBS-SOL-04 → [`slices/fr/obs-sol-04.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-04.md)
- [x] **05-MICRO-fr-005** — OBS-SOL-05 → [`slices/fr/obs-sol-05.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-05.md)
- [x] **05-MICRO-fr-006** — OBS-SOL-06 → [`slices/fr/obs-sol-06.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-06.md)
- [x] **05-MICRO-fr-007** — OBS-SOL-07 → [`slices/fr/obs-sol-07.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-07.md)
- [x] **05-MICRO-fr-008** — OBS-SOL-08 → [`slices/fr/obs-sol-08.md`](../../02-設計/features/05-観測/slices/fr/obs-sol-08.md)
- [x] **05-MICRO-fr-009** — OBS-ENV-01 → [`slices/fr/obs-env-01.md`](../../02-設計/features/05-観測/slices/fr/obs-env-01.md)
- [x] **05-MICRO-fr-010** — OBS-ENV-02 → [`slices/fr/obs-env-02.md`](../../02-設計/features/05-観測/slices/fr/obs-env-02.md)
- [x] **05-MICRO-fr-011** — OBS-ENV-03 → [`slices/fr/obs-env-03.md`](../../02-設計/features/05-観測/slices/fr/obs-env-03.md)
- [x] **05-MICRO-fr-012** — OBS-ENV-04 → [`slices/fr/obs-env-04.md`](../../02-設計/features/05-観測/slices/fr/obs-env-04.md)
- [x] **05-MICRO-fr-013** — OBS-ENV-05 → [`slices/fr/obs-env-05.md`](../../02-設計/features/05-観測/slices/fr/obs-env-05.md)
- [x] **05-MICRO-fr-014** — OBS-ENV-06 → [`slices/fr/obs-env-06.md`](../../02-設計/features/05-観測/slices/fr/obs-env-06.md)
- [x] **05-MICRO-fr-015** — OBS-DIG-01 → [`slices/fr/obs-dig-01.md`](../../02-設計/features/05-観測/slices/fr/obs-dig-01.md)
- [x] **05-MICRO-fr-016** — OBS-DIG-02 → [`slices/fr/obs-dig-02.md`](../../02-設計/features/05-観測/slices/fr/obs-dig-02.md)
- [x] **05-MICRO-fr-017** — OBS-DIG-03 → [`slices/fr/obs-dig-03.md`](../../02-設計/features/05-観測/slices/fr/obs-dig-03.md)
- [x] **05-MICRO-fr-018** — OBS-DIG-04 → [`slices/fr/obs-dig-04.md`](../../02-設計/features/05-観測/slices/fr/obs-dig-04.md)
- [x] **05-MICRO-fr-019** — OBS-R2-01 → [`slices/fr/obs-r2-01.md`](../../02-設計/features/05-観測/slices/fr/obs-r2-01.md)
- [x] **05-MICRO-fr-020** — OBS-R2-02 → [`slices/fr/obs-r2-02.md`](../../02-設計/features/05-観測/slices/fr/obs-r2-02.md)
- [x] **05-MICRO-fr-021** — OBS-R2-03 → [`slices/fr/obs-r2-03.md`](../../02-設計/features/05-観測/slices/fr/obs-r2-03.md)
- [x] **05-MICRO-fr-022** — OBS-R2-04 → [`slices/fr/obs-r2-04.md`](../../02-設計/features/05-観測/slices/fr/obs-r2-04.md)
- [x] **05-MICRO-fr-023** — OBS-R2-05 → [`slices/fr/obs-r2-05.md`](../../02-設計/features/05-観測/slices/fr/obs-r2-05.md)
- [x] **05-MICRO-fr-024** — OBS-TAX-01 → [`slices/fr/obs-tax-01.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-01.md)
- [x] **05-MICRO-fr-025** — OBS-TAX-02 → [`slices/fr/obs-tax-02.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-02.md)
- [x] **05-MICRO-fr-026** — OBS-TAX-03 → [`slices/fr/obs-tax-03.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-03.md)
- [x] **05-MICRO-fr-027** — OBS-TAX-04 → [`slices/fr/obs-tax-04.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-04.md)
- [x] **05-MICRO-fr-028** — OBS-TAX-05 → [`slices/fr/obs-tax-05.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-05.md)
- [x] **05-MICRO-fr-029** — OBS-TAX-06 → [`slices/fr/obs-tax-06.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-06.md)
- [x] **05-MICRO-fr-030** — OBS-TAX-07 → [`slices/fr/obs-tax-07.md`](../../02-設計/features/05-観測/slices/fr/obs-tax-07.md)
- [x] **05-MICRO-fr-031** — OBS-REP-01 → [`slices/fr/obs-rep-01.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-01.md)
- [x] **05-MICRO-fr-032** — OBS-REP-02 → [`slices/fr/obs-rep-02.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-02.md)
- [x] **05-MICRO-fr-033** — OBS-REP-04 → [`slices/fr/obs-rep-04.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-04.md)
- [x] **05-MICRO-fr-034** — OBS-REP-05 → [`slices/fr/obs-rep-05.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-05.md)
- [x] **05-MICRO-fr-035** — OBS-REP-06 → [`slices/fr/obs-rep-06.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-06.md)
- [x] **05-MICRO-fr-036** — OBS-REP-08 → [`slices/fr/obs-rep-08.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-08.md)
- [x] **05-MICRO-fr-037** — OBS-REP-IHL-01 → [`slices/fr/obs-rep-ihl-01.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-ihl-01.md)
- [x] **05-MICRO-fr-038** — OBS-REP-IHL-02 → [`slices/fr/obs-rep-ihl-02.md`](../../02-設計/features/05-観測/slices/fr/obs-rep-ihl-02.md)
- [x] **05-MICRO-fr-039** — OBS-TAG-01 → [`slices/fr/obs-tag-01.md`](../../02-設計/features/05-観測/slices/fr/obs-tag-01.md)
- [x] **05-MICRO-fr-040** — OBS-RAG-01 → [`slices/fr/obs-rag-01.md`](../../02-設計/features/05-観測/slices/fr/obs-rag-01.md)
- [x] **05-MICRO-fr-041** — OBS-DRV-01 → [`slices/fr/obs-drv-01.md`](../../02-設計/features/05-観測/slices/fr/obs-drv-01.md)
- [x] **05-MICRO-fr-042** — OBS-IMG-04 → [`slices/fr/obs-img-04.md`](../../02-設計/features/05-観測/slices/fr/obs-img-04.md)
- [x] **05-MICRO-fr-043** — OBS-IMG-05 → [`slices/fr/obs-img-05.md`](../../02-設計/features/05-観測/slices/fr/obs-img-05.md)
- [x] **05-MICRO-fr-044** — OBS-TPL-03 → [`slices/fr/obs-tpl-03.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-03.md)
- [x] **05-MICRO-fr-045** — OBS-TPL-04 → [`slices/fr/obs-tpl-04.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-04.md)
- [x] **05-MICRO-fr-046** — OBS-TPL-05 → [`slices/fr/obs-tpl-05.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-05.md)
- [x] **05-MICRO-fr-047** — OBS-TPL-06 → [`slices/fr/obs-tpl-06.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-06.md)
- [x] **05-MICRO-fr-048** — OBS-TPL-16 → [`slices/fr/obs-tpl-16.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-16.md)
- [x] **05-MICRO-fr-049** — OBS-TPL-17 → [`slices/fr/obs-tpl-17.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-17.md)
- [x] **05-MICRO-fr-050** — OBS-CTX-01 → [`slices/fr/obs-ctx-01.md`](../../02-設計/features/05-観測/slices/fr/obs-ctx-01.md)
- [x] **05-MICRO-fr-051** — OBS-CTX-02 → [`slices/fr/obs-ctx-02.md`](../../02-設計/features/05-観測/slices/fr/obs-ctx-02.md)
- [x] **05-MICRO-fr-052** — OBS-TGT-04 → [`slices/fr/obs-tgt-04.md`](../../02-設計/features/05-観測/slices/fr/obs-tgt-04.md)
- [x] **05-MICRO-fr-053** — OBS-TGT-09 → [`slices/fr/obs-tgt-09.md`](../../02-設計/features/05-観測/slices/fr/obs-tgt-09.md)
- [x] **05-MICRO-fr-054** — OBS-NF-01 → [`slices/fr/obs-nf-01.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-01.md)
- [x] **05-MICRO-fr-055** — OBS-NF-02 → [`slices/fr/obs-nf-02.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-02.md)
- [x] **05-MICRO-fr-056** — OBS-NF-03 → [`slices/fr/obs-nf-03.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-03.md)
- [x] **05-MICRO-fr-057** — OBS-NF-04 → [`slices/fr/obs-nf-04.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-04.md)
- [x] **05-MICRO-fr-058** — OBS-NF-05 → [`slices/fr/obs-nf-05.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-05.md)
- [x] **05-MICRO-fr-059** — OBS-NF-08 → [`slices/fr/obs-nf-08.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-08.md)
- [x] **05-MICRO-fr-060** — OBS-NF-09 → [`slices/fr/obs-nf-09.md`](../../02-設計/features/05-観測/slices/fr/obs-nf-09.md)
- [x] **05-MICRO-fr-061** — OBS-FUP-01 → [`slices/fr/obs-fup-01.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-01.md)
- [x] **05-MICRO-fr-062** — OBS-FUP-02 → [`slices/fr/obs-fup-02.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-02.md)
- [x] **05-MICRO-fr-063** — OBS-FUP-03 → [`slices/fr/obs-fup-03.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-03.md)
- [x] **05-MICRO-fr-064** — OBS-FUP-04 → [`slices/fr/obs-fup-04.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-04.md)
- [x] **05-MICRO-fr-065** — OBS-FUP-05 → [`slices/fr/obs-fup-05.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-05.md)
- [x] **05-MICRO-fr-066** — OBS-FUP-06 → [`slices/fr/obs-fup-06.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-06.md)
- [x] **05-MICRO-fr-067** — OBS-FUP-07 → [`slices/fr/obs-fup-07.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-07.md)
- [x] **05-MICRO-fr-068** — OBS-FUP-08 → [`slices/fr/obs-fup-08.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-08.md)
- [x] **05-MICRO-fr-069** — OBS-FUP-09 → [`slices/fr/obs-fup-09.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-09.md)
- [x] **05-MICRO-fr-070** — OBS-FUP-10 → [`slices/fr/obs-fup-10.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-10.md)
- [x] **05-MICRO-fr-071** — OBS-FUP-11 → [`slices/fr/obs-fup-11.md`](../../02-設計/features/05-観測/slices/fr/obs-fup-11.md)
- [x] **05-MICRO-fr-072** — OBS-RX-UX-01 → [`slices/fr/obs-rx-ux-01.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-01.md)
- [x] **05-MICRO-fr-073** — OBS-RX-UX-02 → [`slices/fr/obs-rx-ux-02.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-02.md)
- [x] **05-MICRO-fr-074** — OBS-RX-UX-03 → [`slices/fr/obs-rx-ux-03.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-03.md)
- [x] **05-MICRO-fr-075** — OBS-RX-UX-04 → [`slices/fr/obs-rx-ux-04.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-04.md)
- [x] **05-MICRO-fr-076** — OBS-RX-UX-05 → [`slices/fr/obs-rx-ux-05.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-05.md)
- [x] **05-MICRO-fr-077** — OBS-RX-UX-06 → [`slices/fr/obs-rx-ux-06.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-06.md)
- [x] **05-MICRO-fr-078** — OBS-RX-UX-07 → [`slices/fr/obs-rx-ux-07.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-07.md)
- [x] **05-MICRO-fr-079** — OBS-RX-UX-08 → [`slices/fr/obs-rx-ux-08.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-08.md)
- [x] **05-MICRO-fr-080** — OBS-RX-UX-09 → [`slices/fr/obs-rx-ux-09.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-09.md)
- [x] **05-MICRO-fr-081** — OBS-RX-UX-10 → [`slices/fr/obs-rx-ux-10.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-10.md)
- [x] **05-MICRO-fr-082** — OBS-RX-UX-11 → [`slices/fr/obs-rx-ux-11.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-ux-11.md)
- [x] **05-MICRO-fr-083** — OBS-RX-RD-01 → [`slices/fr/obs-rx-rd-01.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-01.md)
- [x] **05-MICRO-fr-084** — OBS-RX-RD-02 → [`slices/fr/obs-rx-rd-02.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-02.md)
- [x] **05-MICRO-fr-085** — OBS-RX-RD-03 → [`slices/fr/obs-rx-rd-03.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-03.md)
- [x] **05-MICRO-fr-086** — OBS-RX-RD-04 → [`slices/fr/obs-rx-rd-04.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-04.md)
- [x] **05-MICRO-fr-087** — OBS-RX-RD-05 → [`slices/fr/obs-rx-rd-05.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-05.md)
- [x] **05-MICRO-fr-088** — OBS-RX-RD-06 → [`slices/fr/obs-rx-rd-06.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-06.md)
- [x] **05-MICRO-fr-089** — OBS-RX-RD-07 → [`slices/fr/obs-rx-rd-07.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-07.md)
- [x] **05-MICRO-fr-090** — OBS-RX-RD-08 → [`slices/fr/obs-rx-rd-08.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-08.md)
- [x] **05-MICRO-fr-091** — OBS-RX-RD-09 → [`slices/fr/obs-rx-rd-09.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-09.md)
- [x] **05-MICRO-fr-092** — OBS-RX-RD-10 → [`slices/fr/obs-rx-rd-10.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-10.md)
- [x] **05-MICRO-fr-093** — OBS-RX-RD-11 → [`slices/fr/obs-rx-rd-11.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rd-11.md)
- [x] **05-MICRO-fr-094** — OBS-RX-REP-04 → [`slices/fr/obs-rx-rep-04.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rep-04.md)
- [x] **05-MICRO-fr-095** — OBS-RX-REP-05 → [`slices/fr/obs-rx-rep-05.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rep-05.md)
- [x] **05-MICRO-fr-096** — OBS-RX-REP-07 → [`slices/fr/obs-rx-rep-07.md`](../../02-設計/features/05-観測/slices/fr/obs-rx-rep-07.md)
- [x] **05-MICRO-fr-097** — OBS-INPUT-01 → [`slices/fr/obs-input-01.md`](../../02-設計/features/05-観測/slices/fr/obs-input-01.md)
- [x] **05-MICRO-fr-098** — OBS-INPUT-02 → [`slices/fr/obs-input-02.md`](../../02-設計/features/05-観測/slices/fr/obs-input-02.md)
- [x] **05-MICRO-fr-099** — OBS-INPUT-03 → [`slices/fr/obs-input-03.md`](../../02-設計/features/05-観測/slices/fr/obs-input-03.md)
- [x] **05-MICRO-fr-100** — OBS-INPUT-04 → [`slices/fr/obs-input-04.md`](../../02-設計/features/05-観測/slices/fr/obs-input-04.md)
- [x] **05-MICRO-fr-101** — OBS-INPUT-05 → [`slices/fr/obs-input-05.md`](../../02-設計/features/05-観測/slices/fr/obs-input-05.md)
- [x] **05-MICRO-fr-102** — OBS-INPUT-06 → [`slices/fr/obs-input-06.md`](../../02-設計/features/05-観測/slices/fr/obs-input-06.md)
- [x] **05-MICRO-fr-103** — OBS-INPUT-07 → [`slices/fr/obs-input-07.md`](../../02-設計/features/05-観測/slices/fr/obs-input-07.md)
- [x] **05-MICRO-fr-104** — OBS-PHOTO-01 → [`slices/fr/obs-photo-01.md`](../../02-設計/features/05-観測/slices/fr/obs-photo-01.md)
- [x] **05-MICRO-fr-105** — OBS-TPL-18 → [`slices/fr/obs-tpl-18.md`](../../02-設計/features/05-観測/slices/fr/obs-tpl-18.md)

> **MAD-05-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · GATE 5/5 PASS · [`DOC-SPOT-MAD-05.md`](../../docs/planning/audits/DOC-SPOT-MAD-05.md)。次: **MAD-WAVE-REPLICATE-01**。

### #05 GATE（黄金確定）

- [x] **MAD-05-GOLDEN-GATE** — layering · parity · rtm-coverage · **contract-oracle PASS** · 逆RTM 孤立0 · 全 slices 採点 ≥85 · [`DOC-SPOT-MAD-05.md`](../../docs/planning/audits/DOC-SPOT-MAD-05.md)

---

## Wave MAD-REPLICATE — #05 黄金テンプレ横展開

> #05 GOLDEN 手順（[`GOLDEN-05-MANIFEST.md`](../../docs/planning/golden/GOLDEN-05-MANIFEST.md) §横展開）を他機能へ複製。

- [x] **MAD-WAVE-REPLICATE-01** — #01 ログイン: route 調査 · `WorkOrder-01-MICRO.json`（32 slices）· 契約レジスタ 4 routes **PASS** · 逆RTM 36 TC · 骨格 · api 先頭 4 本執筆

---

## Wave MAD-01 — #01 ログイン MICRO 執筆

> **#01 MICRO 32/32 + GOLDEN 確定**（2026-07-03）— `WorkOrder-01-MICRO.json` · api4 · schema3 · error2 · revrtm4 · fr19 · 契約オラクル **4/4 PASS** · GATE **5/5 PASS** · [`GOLDEN-01-MANIFEST.md`](../../docs/planning/golden/GOLDEN-01-MANIFEST.md) · [`DOC-SPOT-MAD-01.md`](../../docs/planning/audits/DOC-SPOT-MAD-01.md)

### api-1route（4 · auto · 契約オラクル正本）

- [x] **01-MICRO-api-001** — GET /api/v1/auth/session → [`slices/api/get-api-v1-auth-session.md`](../../02-設計/features/01-ログイン/slices/api/get-api-v1-auth-session.md)
- [x] **01-MICRO-api-002** — POST /api/v1/auth/magic-link → [`slices/api/post-api-v1-auth-magic-link.md`](../../02-設計/features/01-ログイン/slices/api/post-api-v1-auth-magic-link.md)
- [x] **01-MICRO-api-003** — POST /api/v1/auth/register → [`slices/api/post-api-v1-auth-register.md`](../../02-設計/features/01-ログイン/slices/api/post-api-v1-auth-register.md)
- [x] **01-MICRO-api-004** — POST /api/v1/auth/verify → [`slices/api/post-api-v1-auth-verify.md`](../../02-設計/features/01-ログイン/slices/api/post-api-v1-auth-verify.md)

### schema-field（3 · auto）

- [x] **01-MICRO-schema-001** — MagicLinkRequest → [`slices/schema/magiclinkrequest.md`](../../02-設計/features/01-ログイン/slices/schema/magiclinkrequest.md)
- [x] **01-MICRO-schema-002** — MagicLinkVerifyRequest → [`slices/schema/magiclinkverifyrequest.md`](../../02-設計/features/01-ログイン/slices/schema/magiclinkverifyrequest.md)
- [x] **01-MICRO-schema-003** — RegisterRequest → [`slices/schema/registerrequest.md`](../../02-設計/features/01-ログイン/slices/schema/registerrequest.md)

### error-code（2 · auto）

- [x] **01-MICRO-error-001** — HTTP 400 → [`slices/errors/400.md`](../../02-設計/features/01-ログイン/slices/errors/400.md)
- [x] **01-MICRO-error-002** — HTTP 401 → [`slices/errors/401.md`](../../02-設計/features/01-ログイン/slices/errors/401.md)

### reverse-rtm（4 · auto）

- [x] **01-MICRO-revrtm-001** — UT-* 単体層 → [`slices/reverse-rtm/revrtm-001-unit-layer.md`](../../02-設計/features/01-ログイン/slices/reverse-rtm/revrtm-001-unit-layer.md)
- [x] **01-MICRO-revrtm-002** — IT-* 結合層 → [`slices/reverse-rtm/revrtm-002-integration-layer.md`](../../02-設計/features/01-ログイン/slices/reverse-rtm/revrtm-002-integration-layer.md)
- [x] **01-MICRO-revrtm-003** — ST-* システム層 → [`slices/reverse-rtm/revrtm-003-system-layer.md`](../../02-設計/features/01-ログイン/slices/reverse-rtm/revrtm-003-system-layer.md)
- [x] **01-MICRO-revrtm-004** — UAT-* 受入層 → [`slices/reverse-rtm/revrtm-004-acceptance-layer.md`](../../02-設計/features/01-ログイン/slices/reverse-rtm/revrtm-004-acceptance-layer.md)

### fr-1id（19 · tier-a/auto）

- [x] **01-MICRO-fr-001** — FR-LOGIN-01 → [`slices/fr/fr-login-01.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-01.md)
- [x] **01-MICRO-fr-002** — FR-LOGIN-02 → [`slices/fr/fr-login-02.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-02.md)
- [x] **01-MICRO-fr-003** — FR-LOGIN-03 → [`slices/fr/fr-login-03.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-03.md)
- [x] **01-MICRO-fr-004** — FR-LOGIN-04 → [`slices/fr/fr-login-04.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-04.md)
- [x] **01-MICRO-fr-005** — FR-LOGIN-05 → [`slices/fr/fr-login-05.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-05.md)
- [x] **01-MICRO-fr-006** — FR-LOGIN-06 → [`slices/fr/fr-login-06.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-06.md)
- [x] **01-MICRO-fr-007** — FR-LOGIN-07 → [`slices/fr/fr-login-07.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-07.md)
- [x] **01-MICRO-fr-008** — FR-LOGIN-08 → [`slices/fr/fr-login-08.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-08.md)
- [x] **01-MICRO-fr-009** — FR-LOGIN-09 → [`slices/fr/fr-login-09.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-09.md)
- [x] **01-MICRO-fr-010** — FR-LOGIN-10 → [`slices/fr/fr-login-10.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-10.md)
- [x] **01-MICRO-fr-011** — FR-LOGIN-11 → [`slices/fr/fr-login-11.md`](../../02-設計/features/01-ログイン/slices/fr/fr-login-11.md)
- [x] **01-MICRO-fr-012** — NFR-LOGIN-01 → [`slices/fr/nfr-login-01.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-01.md)
- [x] **01-MICRO-fr-013** — NFR-LOGIN-02 → [`slices/fr/nfr-login-02.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-02.md)
- [x] **01-MICRO-fr-014** — NFR-LOGIN-03 → [`slices/fr/nfr-login-03.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-03.md)
- [x] **01-MICRO-fr-015** — NFR-LOGIN-04 → [`slices/fr/nfr-login-04.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-04.md)
- [x] **01-MICRO-fr-016** — NFR-LOGIN-05 → [`slices/fr/nfr-login-05.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-05.md)
- [x] **01-MICRO-fr-017** — NFR-LOGIN-06 → [`slices/fr/nfr-login-06.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-06.md)
- [x] **01-MICRO-fr-018** — NFR-LOGIN-07 → [`slices/fr/nfr-login-07.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-07.md)
- [x] **01-MICRO-fr-019** — NFR-LOGIN-08 → [`slices/fr/nfr-login-08.md`](../../02-設計/features/01-ログイン/slices/fr/nfr-login-08.md)

### #01 GATE（黄金確定 · 5 本）

- [x] **MAD-01-GOLDEN-GATE** — layering · parity · rtm-coverage · **contract-oracle PASS** · 逆RTM 孤立0 · spot 8/8 · 全 slices 32/32 · [`DOC-SPOT-MAD-01.md`](../../docs/planning/audits/DOC-SPOT-MAD-01.md) · [`GOLDEN-01-MANIFEST.md`](../../docs/planning/golden/GOLDEN-01-MANIFEST.md)

> **MAD-01-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · GATE 5/5 PASS · [`DOC-SPOT-MAD-01.md`](../../docs/planning/audits/DOC-SPOT-MAD-01.md)。次: **MAD-WAVE-REPLICATE-03**。

---

## Wave MAD-REPLICATE-03 — #03 新規登録（完了）

> #01/#05 黄金手順（[`GOLDEN-01-MANIFEST.md`](../../docs/planning/golden/GOLDEN-01-MANIFEST.md) §横展開）を #03 へ複製。

- [x] **MAD-WAVE-REPLICATE-03** — #03 新規登録: route 調査 · `WorkOrder-03-MICRO.json`（52 slices）· 契約レジスタ 6 routes **PASS** · 逆RTM 34 TC · 骨格 · 全 slices 執筆

### #03 GATE（黄金確定 · 5 本）

- [x] **MAD-03-GOLDEN-GATE** — layering · parity · rtm-coverage · **contract-oracle PASS** · 逆RTM 孤立0 · spot 8/8 · 全 slices 52/52 · [`DOC-SPOT-MAD-03.md`](../../docs/planning/audits/DOC-SPOT-MAD-03.md) · [`GOLDEN-03-MANIFEST.md`](../../docs/planning/golden/GOLDEN-03-MANIFEST.md)

> **MAD-03-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · GATE 5/5 PASS · [`DOC-SPOT-MAD-03.md`](../../docs/planning/audits/DOC-SPOT-MAD-03.md)。次: **MAD-WAVE-REPLICATE-04**。

---

## Wave MAD-REPLICATE-04 — #04 ホーム（完了）

> #01/#03 黄金手順を #04 へ複製。

- [x] **MAD-WAVE-REPLICATE-04** — #04 ホーム: route 調査 · `WorkOrder-04-MICRO.json`（45 slices）· 契約レジスタ 1 route **PASS** · 逆RTM 16 TC · 骨格 · 全 slices 執筆

### #04 GATE（黄金確定 · 5 本）

- [x] **MAD-04-GOLDEN-GATE** — layering · parity · rtm-coverage · **contract-oracle PASS** · 逆RTM 孤立0 · spot 8/8 · 全 slices 45/45 · [`DOC-SPOT-MAD-04.md`](../../docs/planning/audits/DOC-SPOT-MAD-04.md) · [`GOLDEN-04-MANIFEST.md`](../../docs/planning/golden/GOLDEN-04-MANIFEST.md)

> **MAD-04-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · GATE 5/5 PASS · [`DOC-SPOT-MAD-04.md`](../../docs/planning/audits/DOC-SPOT-MAD-04.md)。次: **MAD-WAVE-REPLICATE-12**（#12 設定 · 完了）。

---

## Wave MAD-REPLICATE-12 — #12 設定（完了）

> #03/#04 黄金手順を #12 へ複製。

- [x] **MAD-WAVE-REPLICATE-12** — #12 設定: route extract · `WorkOrder-12-MICRO.json`（35 slices）· 契約レジスタ 5 routes **PASS** · 逆RTM 20 TC · 骨格 · 全 slices 執筆

### #12 GATE（黄金確定 · 5 本）

- [x] **MAD-12-GOLDEN-GATE** — layering · parity · rtm-coverage · **contract-oracle PASS** · 逆RTM 孤立0 · spot 8/8 · 全 slices 35/35 · [`DOC-SPOT-MAD-12.md`](../../docs/planning/audits/DOC-SPOT-MAD-12.md) · [`GOLDEN-12-MANIFEST.md`](../../docs/planning/golden/GOLDEN-12-MANIFEST.md)

> **MAD-12-GOLDEN-GATE 完了**（2026-07-03）— Wave1 P0+P2 MAD 全完了（#01/#03/#04/#05/#12）。次: **MAD-WAVE-2**（#06/#07/#16/#17/#23）。

---

## Wave MAD-WAVE-2 — #06 #07 #16 #17 #23（完了）

> 各機能: route extract · micro-workorder · contract-oracle · reverse-rtm · slices · GATE。

- [x] **MAD-WAVE-2** — #06 #07 #16 #17 #23（Tier A 弱点 · MICRO 展開）

### #06 マーケット（黄金確定）

- [x] **MAD-WAVE-REPLICATE-06** — route `market.py` · WorkOrder-06-MICRO（34 slices）· 契約 5 routes PASS · 逆RTM 16 TC
- [x] **MAD-06-GOLDEN-GATE** — GATE 5/5 PASS · [`GOLDEN-06-MANIFEST.md`](../../docs/planning/golden/GOLDEN-06-MANIFEST.md) · [`DOC-SPOT-MAD-06.md`](../../docs/planning/audits/DOC-SPOT-MAD-06.md)

### #07 掲示板（黄金確定）

- [x] **MAD-WAVE-REPLICATE-07** — route `board.py` · WorkOrder-07-MICRO（32 slices）· 契約 5 routes PASS · 逆RTM 11 TC
- [x] **MAD-07-GOLDEN-GATE** — GATE 5/5 PASS · [`GOLDEN-07-MANIFEST.md`](../../docs/planning/golden/GOLDEN-07-MANIFEST.md) · [`DOC-SPOT-MAD-07.md`](../../docs/planning/audits/DOC-SPOT-MAD-07.md)

### #16 UIbuilder（黄金確定）

- [x] **MAD-WAVE-REPLICATE-16** — route `main.py` theme/builder · WorkOrder-16-MICRO（29 slices）· 契約 4 routes PASS · 逆RTM 15 TC
- [x] **MAD-16-GOLDEN-GATE** — GATE 5/5 PASS · [`GOLDEN-16-MANIFEST.md`](../../docs/planning/golden/GOLDEN-16-MANIFEST.md) · [`DOC-SPOT-MAD-16.md`](../../docs/planning/audits/DOC-SPOT-MAD-16.md)

### #17 UI選択（黄金確定）

- [x] **MAD-WAVE-REPLICATE-17** — route #12 共有 2 · WorkOrder-17-MICRO（19 slices）· 契約 2 routes PASS · 逆RTM 11 TC
- [x] **MAD-17-GOLDEN-GATE** — GATE 5/5 PASS · [`GOLDEN-17-MANIFEST.md`](../../docs/planning/golden/GOLDEN-17-MANIFEST.md) · [`DOC-SPOT-MAD-17.md`](../../docs/planning/audits/DOC-SPOT-MAD-17.md)

### #23 GMO振込（黄金確定）

- [x] **MAD-WAVE-REPLICATE-23** — route `gmo.py` · WorkOrder-23-MICRO（29 slices）· 契約 6 routes PASS · 逆RTM 13 TC
- [x] **MAD-23-GOLDEN-GATE** — GATE 5/5 PASS · [`GOLDEN-23-MANIFEST.md`](../../docs/planning/golden/GOLDEN-23-MANIFEST.md) · [`DOC-SPOT-MAD-23.md`](../../docs/planning/audits/DOC-SPOT-MAD-23.md)

> **MAD-23-GOLDEN-GATE 完了**（2026-07-03）— Wave2 GOLDEN 5件完了。次: **MAD-WAVE-4**（P1 機能群）。

---

## Wave MAD-03〜05（狂気展開）

- [x] **MAD-WAVE-3** — #01 #03 #04 #12（Wave1 済機能の MICRO + 契約オラクル生成 · Wave1 で実質完了）
- [x] **MAD-WAVE-4** — P1 機能群 GOLDEN 12件（#02/#11 除外）
- [x] **MAD-WAVE-5** — #11 裁判 + #02 利用規約 GOLDEN · 横断レジストリ AUTH/ENV/ROUTE-INDEX 実データ化

### MAD-WAVE-4 完了記録（2026-07-03 · P1 12件 · route 無し · oracle PASS 許容）

| # | 機能 | slices | 逆RTM | GATE | 成果物 |
|---|------|--------|-------|------|--------|
| 00 | 土台 | 35 | 42 TC | 5/5 | [`GOLDEN-00-MANIFEST.md`](../../docs/planning/golden/GOLDEN-00-MANIFEST.md) |
| 08 | カルマ | 20 | 23 TC | 5/5 | [`GOLDEN-08-MANIFEST.md`](../../docs/planning/golden/GOLDEN-08-MANIFEST.md) |
| 09 | 論文 | 30 | 19 TC | 5/5 | [`GOLDEN-09-MANIFEST.md`](../../docs/planning/golden/GOLDEN-09-MANIFEST.md) |
| 10 | マチアプ | 26 | 16 TC | 5/5 | [`GOLDEN-10-MANIFEST.md`](../../docs/planning/golden/GOLDEN-10-MANIFEST.md) |
| 13 | データ取得元 | 23 | 20 TC | 5/5 | [`GOLDEN-13-MANIFEST.md`](../../docs/planning/golden/GOLDEN-13-MANIFEST.md) |
| 14 | 貢献度 | 19 | 19 TC | 5/5 | [`GOLDEN-14-MANIFEST.md`](../../docs/planning/golden/GOLDEN-14-MANIFEST.md) |
| 15 | データ設計 | 24 | 20 TC | 5/5 | [`GOLDEN-15-MANIFEST.md`](../../docs/planning/golden/GOLDEN-15-MANIFEST.md) |
| 18 | 写真解析 | 22 | 21 TC | 5/5 | [`GOLDEN-18-MANIFEST.md`](../../docs/planning/golden/GOLDEN-18-MANIFEST.md) |
| 19 | コンポ掲示板 | 17 | 17 TC | 5/5 | [`GOLDEN-19-MANIFEST.md`](../../docs/planning/golden/GOLDEN-19-MANIFEST.md) |
| 20 | 投票 | 20 | 19 TC | 5/5 | [`GOLDEN-20-MANIFEST.md`](../../docs/planning/golden/GOLDEN-20-MANIFEST.md) |
| 21 | 翻訳 | 27 | 17 TC | 5/5 | [`GOLDEN-21-MANIFEST.md`](../../docs/planning/golden/GOLDEN-21-MANIFEST.md) |
| 22 | PT ショップ | 16 | 15 TC | 5/5 | [`GOLDEN-22-MANIFEST.md`](../../docs/planning/golden/GOLDEN-22-MANIFEST.md) |

> **MAD-22-GOLDEN-GATE 完了**（2026-07-03）— MAD-WAVE-4 P1 全完了 · 累計 GOLDEN **22** 機能 · 次: **MAD-WAVE-5**。
> **Oracle**: 全機能 route 無し · `VERDICT: PASS`（0 routes · DET §3.9 空）— 理由は各 [`GOLDEN-NN-MANIFEST.md`](../../docs/planning/golden/GOLDEN-00-MANIFEST.md) 記載。
> **RTM**: legacy 8 列 → 6 列正規化（[`ihl-rtm-mad-normalize.mjs`](../../scripts/ihl-rtm-mad-normalize.mjs)）· #02/#11 は MAD-WAVE-5 で完了。

### MAD-WAVE-5 完了記録（2026-07-03 · 残2機能 · 横断レジストリ）

| # | 機能 | slices | 逆RTM | GATE | Oracle | 成果物 |
|---|------|--------|-------|------|--------|--------|
| 11 | 裁判 | 30 | 20 TC | 5/5 | 3 routes PASS | [`GOLDEN-11-MANIFEST.md`](../../docs/planning/golden/GOLDEN-11-MANIFEST.md) |
| 02 | 利用規約 | 50 | 27 TC | 5/5 | route 無 PASS | [`GOLDEN-02-MANIFEST.md`](../../docs/planning/golden/GOLDEN-02-MANIFEST.md) · **HUMAN-02-LEGAL 条文不変更** |

> **MAD-COMPLETE**（2026-07-03）— 狂気モード **全 24 機能 GOLDEN** · 累計 **816 MICRO slices** · 横断 [`docs/registry/`](../../docs/registry/) 実データ化 · [`MAD-COMPLETE-REPORT.md`](../../docs/planning/MAD-COMPLETE-REPORT.md)

---

## § AI 完走チェックリスト（狂気モード · 毎ラン）

```
[ ] queue_head の先頭 - [ ] を拾ったか（batch_default=4）
[ ] MICRO 作業票が存在するか（無ければ micro-workorder --feature NN）
[ ] 1 スライス/ワーカーで Auto ×4 並列したか
[ ] Best-of-N 採点 ≥85 · C(コード一致)≥25 か
[ ] 契約オラクル --check PASS か（FAIL は DET §3.9 追記）
[ ] 逆RTM 孤立 TC 0 か
[ ] 実装コード未変更 · civ-os 二重執筆なし
```
