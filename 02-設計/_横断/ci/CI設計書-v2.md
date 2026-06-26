# CI 設計書 v2

> **ステータス**: **Batch 7 充填**（2026-06-09）  
> **正本 v1**: [`../02-設計/_横断/ci/CI設計書-v1.md`](../02-設計/_横断/ci/CI設計書-v1.md)

---

## 1. v2 追加（設計ゲート機械チェック）

| ジョブ | スクリプト | トリガ | 失敗時 |
|--------|-----------|--------|--------|
| `ihl-design-four-point` | `ihl-four-point-inventory.mjs` | PR · `指示/**` | 4 点欠落 |
| `ihl-design-mock-trace` | `ihl-mock-fr-trace.mjs` | PR · mock 変更 | トレース不整合 |
| `ihl-design-mock-coverage` | `ihl-mock-coverage.mjs` | PR · mock 変更 | 必須 mock 欠落 |
| `ihl-design-transition` | `ihl-transition-edge-trace.mjs` | PR · 遷移 md | edge 不足 |
| `ihl-design-adr-terms` | `ihl-adr-term-conflict.mjs` | PR · ADR 変更 | ADR 不足 |
| `ihl-design-oss-license` | `ihl-oss-license-audit.mjs` | PR · 監査表 | 表行不足 |

v1 ジョブ（lint · unit · contract · immutability）は **変更なし**。

---

## 2. workflow 案（`.github/workflows/ihl-design-gate.yml`）

```yaml
name: IHL Design Gate
on:
  pull_request:
    paths: ['指示/it-hercules-laboratory/**', 'scripts/ihl-*.mjs']
jobs:
  design-mechanical:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: node scripts/ihl-four-point-inventory.mjs
      - run: node scripts/ihl-mock-coverage.mjs
      - run: node scripts/ihl-mock-fr-trace.mjs
      - run: node scripts/ihl-transition-edge-trace.mjs
      - run: node scripts/ihl-adr-term-conflict.mjs
      - run: node scripts/ihl-oss-license-audit.mjs
```

> **実装 Go 後**に workflow ファイルを追加（設計のみ本バッチ）。

---

## 3. 関連

- [`テスト設計書-v2.md`](./テスト設計書-v2.md)
- [`OSS-ライセンス監査表-v1.md`](./OSS-ライセンス監査表-v1.md)

*Batch 7 · 2026-06-09*
