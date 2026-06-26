# 監査役 — Batch 8 実装前ゲート v1

> **ステータス**: 草案 v1 · **Batch 8 コード着手前の必須チェックリスト**  
> **作成日**: 2026-06-10  
> **正本**: [`00-AI監査役-Goチャーター-v1.md`](../05-運用/queues/00-AI監査役-Goチャーター-v1.md) · [`00-監査役-実装前ゲート-v1.md`](../05-運用/queues/00-監査役-実装前ゲート-v1.md)

---

## 0. 目的

Batch 0〜7 は **設計パック（4 点）** を完了した。Batch 8 は **実装** のフェーズであるが、**盲移植を防ぐ** ため、コード着手前に **追加ゲート** を設ける。

本書は監査役（AI または人間）が **ANY Batch 8 コード変更** の前に確認するチェックリストである。

---

## 1. ゲート一覧（すべて必須）

| # | ゲート | 合格基準 | 証跡パス | 判定 |
|---|--------|----------|----------|------|
| G1 | **ADR-H-18 承認** | stays/salvage/rebuild 表に未解消矛盾なし · #13 解消節あり | [`ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md`](./ADR-H-18-IHLスコープ正本-stays-vs-rebuild-v1.md) | `[x]` **HUMAN-CONFIRMED 2026-06-10** |
| G2 | **DoD マトリクス存在** | 01〜20 の 4 列（route/API/persistence/test）定義済 | [`00-機能別実装DoD-マトリクス-v1.md`](./00-機能別実装DoD-マトリクス-v1.md) | `[ ]` |
| G3 | **Batch 8 実装設計** | レイヤー図 · mock peel 順 · 深さ優先ルール | [`00-Batch8-実装設計-スコープ-v1.md`](./00-Batch8-実装設計-スコープ-v1.md) | `[ ]` |
| G4 | **P0 実装設計 stub ≥1 ページ** | #13 · #12 · #01 · #05 のいずれか先行機能 | `13-データ取得元-実装設計-v1.md` 等 | `[ ]` |
| G5 | **#13 SwitchBot ADR** | 5min poll · バケット UPSERT · provenance · Tier B · series.parquet | [`ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) | `[x]` **HUMAN-CONFIRMED 2026-06-10** |
| G5b | **データクラス ADR（前提読了）** | Tier A/B/C 定義 · 1 device = 1 series.parquet · ProjectRules scoped interpretation | [`ADR-H-20-データクラスと書込方針-v1.md`](./ADR-H-20-データクラスと書込方針-v1.md) | `[x]` **HUMAN-CONFIRMED 2026-06-10** |
| G6 | **C-USB 契約整合** | component manifest · Tier A INSERT ONLY · Tier B UPSERT 分離 | [`ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md) · ADR-H-20 | `[ ]` |
| G7 | **秘密非 R2** | collector/.env のみ · UI から TOKEN 入力禁止 | `13-データ取得元-実装設計-v1.md` §Secrets | `[ ]` |
| G8 | **チャーター整合** | DELEGATED-IMPL-GO vs HUMAN 境界明記 | 本書 §3 | `[ ]` |

> **2026-06-10 更新**: G1 · G5 · G5b は **HUMAN-ADR-H-18/19/20 CONFIRMED**（ユーザー `ADR-H-18 Go ADR-H-19 Go ADR-H-20 Go`）。G2〜G4 · G6〜G8 は設計 doc 存在で **DELEGATED-IMPL-DESIGN-GO 対象**。  
> **次ゲート**: **`HUMAN-IMPL-BATCH8-GO`** — ADR 人間 Go とは **別** · Batch 8 **実装コード**着手の明示許可。  
> **着手前必読**: [`ADR-H-20`](./ADR-H-20-データクラスと書込方針-v1.md) §2.4 · [`13-データ取得元-実装設計-v1.md`](./13-データ取得元-実装設計-v1.md) §9 Occupancy 参照モデル。

---

## 2. 監査手順（Batch 8 着手前）

```
1. G1〜G8（G5b 含む）を上から順に確認（FAIL なら BLOCK 記録）— **G5b（ADR-H-20）は G5・G6 の前提読了**
2. 着手機能 N の DoD 4 列が設計 doc に具体化されているか
3. civ-os からの「抽出リスト」が Batch 8 doc §2 に列挙されているか
4. mock peel 順で N の先行機能が PASS 済みか（#13 が最初）
5. PASS → DELEGATED-IMPL-DESIGN-GO（機能 N）をログに追記
6. ユーザー HUMAN-IMPL-BATCH8-GO 後のみ DELEGATED-IMPL-GO（コード）
```

---

## 3. DELEGATED-IMPL-GO vs HUMAN required

| ゲート名 | 誰が `[x]` | 対象 | チャーター対応 |
|----------|------------|------|----------------|
| **DELEGATED-DESIGN-GO** | AI 監査役 | 4 点設計（Batch 0〜7） | チャーター §2 · **済 20/20** |
| **DELEGATED-IMPL-DESIGN-GO** | AI 監査役 | 実装設計 doc（本 Batch 8 docs） | 本書 G1〜G8 |
| **DELEGATED-IMPL-GO** | AI 監査役（**コード PR 単位**） | 機能 N の DoD 4 列 PASS · CI 緑 | チャーター §4 拡張 |
| **HUMAN-ADR-H-18** | **ユーザー** | スコープ正本 ADR | **✓ CONFIRMED 2026-06-10** |
| **HUMAN-ADR-H-19** | **ユーザー** | SwitchBot poll · 二層モデル | **✓ CONFIRMED 2026-06-10** |
| **HUMAN-ADR-H-20** | **ユーザー** | データクラス · series.parquet | **✓ CONFIRMED 2026-06-10** |
| **HUMAN-IMPL-BATCH8-GO** | **ユーザー** | Batch 8 初回コード着手 | チャーター §4 `HUMAN-IMPL-SIGNOFF` の下位 |
| **HUMAN-COLLECTOR-KEYS** | **ユーザー** | SwitchBot · Ed25519 実機鍵 | Tier D |
| **HUMAN-02-LEGAL** | 人間法務 | 利用規約最終文 | 既存 |
| **HUMAN-23-GMO-LIVE** | 人間 | GMO 本番 | 既存 |

**AI がしてはいけないこと**:

- `HUMAN-IMPL-BATCH8-GO` なしに `it-hercules-laboratory/components/` へ本番ロジック追加
- civ-os からの bulk copy を「salvage」名目でマージ
- DoD マトリクスの `status` を推測で `✓` にする

---

## 4. 監査証跡テンプレート（Batch 8 用）

| timestamp | agent | feature_id | gate | c1 | c2 | c3 | c4 | parity_script | dod_route | dod_api | dod_persist | dod_test | evidence | human_action | notes |
|-----------|-------|------------|------|----|----|----|----|---------------|-----------|---------|-------------|----------|----------|--------------|-------|
| 2026-06-10T12:00:00+09:00 | user | batch8-adr | HUMAN-ADR-H-18 | — | — | — | — | ADR-H-18-IHLスコープ正本 | **confirmed** | ユーザー `ADR-H-18 Go` |
| 2026-06-10T12:00:00+09:00 | user | batch8-adr | HUMAN-ADR-H-19 | — | — | — | — | ADR-H-19-SwitchBot-取得戦略 | **confirmed** | ユーザー `ADR-H-19 Go` · series.parquet 二層モデル |
| 2026-06-10T12:00:00+09:00 | user | batch8-adr | HUMAN-ADR-H-20 | — | — | — | — | ADR-H-20-データクラスと書込方針 | **confirmed** | ユーザー `ADR-H-20 Go` · 1 device = 1 series |
| 2026-06-10T12:01:00+09:00 | composer-2.5-fast | batch8-gate | DELEGATED-IMPL-DESIGN-GO | PASS | PASS | PASS | PASS | ADR-H-18/19/20,13-実装設計§9,DoD matrix | HUMAN-IMPL-BATCH8-GO_pending | 設計 doc 更新完了 · **実装は別ゲート** |
| 2026-06-10T14:00:00+09:00 | composer-2.5-fast | 13 | B8-Q-01-RED-PYTEST | — | — | — | △ | 5 test files · 6 cases · skip/xfail CI green · env_contract_vectors salvage-adapt | HUMAN-IMPL-BATCH8-GO_pending | queue [`00-Batch8-実行キュー-v1.md`](./00-Batch8-実行キュー-v1.md) head=B8-Q-02 |
| 2026-06-10T16:00:00+09:00 | user | batch8 | HUMAN-IMPL-BATCH8-GO | — | — | — | — | ユーザー `HUMAN-IMPL-BATCH8-GO　B8-Q-03　まで続けて` | **confirmed** | Batch 8 初回本番ロジック着手許可 · B8-Q-03 スコープへ |
| 2026-06-10T18:00:00+09:00 | composer-2.5-fast | 13 | B8-Q-03-GREEN-IMPL | △ | △ | △ | ✓ | libs/* · components/env_ingest · apps/api/routes/env.py · pytest 6+ PASS | DELEGATED-IMPL-GO_pending | mock_store.devices peel は B8-Q-04 |
| 2026-06-10T23:30:00+09:00 | composer-2.5-fast | 13 | HUMAN-COLLECTOR-KEYS | △ | △ | — | PASS | SWITCHBOT_LIST/STATUS live PASS; Ed25519 SKIP; docker pytest 5 PASS; collector/smoke-keys.cjs | collector_keys_verified | partial: keys in root .env not collector/.env; Ed25519 pending |
| 2026-06-10T22:00:00+09:00 | composer-2.5-fast | 13 | B8-Q-04-DELEGATED-IMPL-GO | ✓ | ✓ | ✓ | ✓ | libs/device_registry.py · routes/devices.py · mock peel · test_device_registry.py | **DELEGATED-IMPL-GO** | pytest 136 PASS · Batch 8 Q-04〜Q-23 技術完走 |

---

## 5. BLOCK 条件（即差し戻し）

| 条件 | 例 |
|------|-----|
| ADR-H-18 未承認でコード変更 | `apps/api/main.py` に ingest 実装 |
| #13 未 PASS で #05 実ルート | `/observation` が mock 以外の env を要求 |
| 秘密を R2/event に保存 | TOKEN/SECRET が truth JSON に含まれる |
| 毎ポール無条件 insert（ADR-H-19 無視） | poller が値不変でも **新バケット以外** に行を増やし続ける |
| Tier B 境界違反 | `manual_entry` が Tier B 行を上書き · 統治 event の UPSERT |
| ADR-H-20 未読で persistence 実装 | Tier A/B 未分離の `event_store` 一律 INSERT |
| C-USB 違反 | `apps/web` から SwitchBot API 直叩き |

---

## 6. 伴走ゲートへ昇格（Batch 8+ · POST-OSS）

> **2026-06-10**: 設計 doc 存在のみの監査では **実装乖離** が再発した。本書は **実装前** ゲートとして残し、**完了判定** は伴走ゲートへ移管する。

| 段階 | ゲート | 正本 |
|------|--------|------|
| 実装**前** | 本書 G1〜G8 · DELEGATED-IMPL-DESIGN-GO | 本ファイル |
| 実装**後** · `[x]` / DoD `✓` | **C1–C4 パリティ PASS 必須** | [`00-監査役-設計実装伴走ゲート-v1.md`](./00-監査役-設計実装伴走ゲート-v1.md) |
| 機械検証 | `ihl-design-impl-parity-check.mjs` | [`scripts/`](../../scripts/ihl-design-impl-parity-check.mjs) |

**DELEGATED-IMPL-GO の必須条件（追記 2026-06-10）**:

- 従来: DoD 4 列 + pytest 緑 + ログ行
- **追加**: 伴走ゲート **C1–C2–C3–C4 全 PASS** · `parity_script=PASS` 列を証跡テンプレートに必須化
- **FAIL 時**: `[x]` 禁止 · [`AUDIT-FAIL-<id>.md`](./AUDIT-FAIL-19.md) 相当を起票（例: [`AUDIT-RETROACTIVE-GAPS-2026-06-10.md`](./AUDIT-RETROACTIVE-GAPS-2026-06-10.md)）

---

## 7. 関連

| パス | 用途 |
|------|------|
| [`00-監査役-設計実装伴走ゲート-v1.md`](./00-監査役-設計実装伴走ゲート-v1.md) | **完了判定の正本**（Batch 8+） |
| [`00-AI監査役-Goチャーター-v1.md`](../05-運用/queues/00-AI監査役-Goチャーター-v1.md) | 委任境界の上位 · §6 伴走 |
| [`00-監査役-実装前ゲート-v1.md`](../05-運用/queues/00-監査役-実装前ゲート-v1.md) | Batch 0〜7 ログ |
| [`00-実装前バッチ実行計画-v1.md`](../05-運用/queues/00-実装前バッチ実行計画-v1.md) | §Batch 8 |
| [`ADR-H-20-データクラスと書込方針-v1.md`](./ADR-H-20-データクラスと書込方針-v1.md) | **Batch 8 着手前必読** — Tier A/B/C · 書込方針 |

---

*草案 v1.1 · 2026-06-10 · Batch 8 実装前ゲート · 伴走ゲートへ昇格ポインタ追加*
