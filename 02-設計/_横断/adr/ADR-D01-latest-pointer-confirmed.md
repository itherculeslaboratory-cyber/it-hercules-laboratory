# ADR-D01: latest manifest pointer 方式（確定 — 方式 B）

> **ステータス**: 採用（人間確定 — ユーザー「方式 B で OK」2026-06 / 設計方針）
> **決定日**: 2026-06-08
> **判断 ID**: D-01-latest-pointer
> **解消ギャップ**: P0-DATA-02 / AO-G-01（latest manifest pointer 未決 → immutability テスト・CI 期待値が確定できない）
> **正本前提**: [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) §6 · [`CI設計書-v1.md`](./CI設計書-v1.md) §7 · [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §8（Truth/Snapshot）· [`ADR-H-03-r2-bucket-dedicated.md`](./ADR-H-03-r2-bucket-dedicated.md)

---

## 文脈

R2 は **append-only / no-overwrite**（同一キー再 put 拒否）が固定前提（HANDOFF §4 · FOUND-D05）。一方で検索 UI・component は「**最新の manifest**」を 1 つ参照する必要がある。`manifests/latest/` をどう更新するかが未決のままだと:

- immutability テスト（同キー再 put が 409 になること）の **期待値が書けない**。
- CI の contract / manifest validation が「どのファイルを latest とみなすか」を確定できない。

この未決が P0-DATA-02 として実装ゲートを直接阻止していた。

---

## 検討した方式

| 方式 | 概要 | 長所 | 短所 |
|------|------|------|------|
| **A. 上書き pointer** | `manifests/latest/manifest.parquet` を **同キー上書き** | 参照が単純 | **no-overwrite 原則に違反**。履歴が消える |
| **B. 不変 manifest + pointer JSON** ★採用 | 実体は `manifests/<run_id>/manifest.parquet`（不変）。`manifests/latest.json`（小さな pointer）を **新規キーで世代管理**し、読み手は最新 pointer を解決 | append-only 維持・履歴完全・ロールバック可 | pointer 解決の 1 ホップが増える |
| **C. list して最大 run_id** | latest を持たず list から最大を計算 | pointer 不要 | list コスト・run_id の単調性に依存・並行時に曖昧 |

---

## 決定（方式 B）

### B-1. 実体は不変

```
ihl/<domain>/manifests/<run_id>/manifest.parquet        # 不変（no-overwrite）
ihl/<domain>/manifests/<run_id>/run_info.json
```

### B-2. pointer は「新規キーで追記」する世代管理

`latest` を **上書きしない**。pointer 自体を append-only にする:

```
ihl/<domain>/manifests/pointers/<ts>-<run_id>.json      # pointer レコード（不変・新規キー）
```

pointer JSON（最小）:

```json
{
  "pointer_schema_version": 1,
  "domain": "capture",
  "current_run_id": "run_20260608T1200_ab12",
  "manifest_key": "ihl/capture/manifests/run_20260608T1200_ab12/manifest.parquet",
  "supersedes_pointer_key": "ihl/capture/manifests/pointers/20260607T0900-run_...json",
  "created_at": "2026-06-08T12:05:00Z"
}
```

### B-3. latest 解決ルール

読み手（検索 UI / component）は:

1. `manifests/pointers/` を **prefix list**（小さな JSON のみ）。
2. `created_at`（タイブレークはキー名の ts）が **最大の pointer** を 1 つ採用。
3. その `manifest_key` を読む。

> `latest.json` という固定名の **キャッシュ用ミラー**を置く運用も可能だが、その場合も「ミラーは上書きしてよい派生キャッシュ」と明記し、**正本は pointers/ の最大 created_at** とする（ミラー消失で再構築可能）。本 ADR では **pointers/ を正本**とする。

---

## immutability テスト・CI への影響（期待値の確定）

| テスト | 期待値（本 ADR 確定により書けるようになる） |
|--------|------|
| 同キー再 put | `manifest.parquet` / pointer レコードの **同キー再 put は 409**（no-overwrite）|
| latest 解決 | pointers/ の **最大 created_at** が示す manifest を読むこと |
| ロールバック | 古い pointer を **新しい created_at で再発行**（過去 manifest を再 latest 化）。実体は不変のまま |
| 履歴 | pointers/ を時系列に辿ると全 latest 遷移が再現できること |

参照: [`CI設計書-v1.md`](./CI設計書-v1.md) §7（immutability）· [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) §3/§4。

---

## 影響

- **schema**: `02-設計/_横断/schema/manifest/` に `pointer.schema.yaml`（pointer JSON 契約）を追加（schema-yaml-draft 次版）。
- **B-runtime**: 検索 UI の「いつ latest をリロードするか」は pointers/ list のポーリング/起動時解決で確定（[`00-設計網羅監査-専門班-B-ランタイム.md`](./00-設計網羅監査-専門班-B-ランタイム.md) §8 の未解決点を解消）。
- **実装 Go 不可** — 設計ゲート 4 点は別途人間確定。

---

## 参照

- [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) §6（未決一覧から D-01 を解消）
- [`02-設計/_横断/schema-yaml-draft-v1.md`](../02-設計/_横断/schema-yaml-draft-v1.md)
- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §8

---

*採用（方式 B）· 非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
