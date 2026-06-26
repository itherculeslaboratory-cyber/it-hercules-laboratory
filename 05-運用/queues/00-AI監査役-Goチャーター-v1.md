# AI 監査役 — Go チャーター v1

> **ステータス**: **草案 · 人間承認済み方針**（2026-06-09）  
> **用途**: 設計ゲート 4 点における **AI 監査役の権限境界**を固定する。ユーザーは数万文字の全文レビューを行わず、**モック目視 + 最終実装デモ**に集中する。  
> **上位**: [`00-実装前ブループリント-スコープ.md`](./00-実装前ブループリント-スコープ.md) · `.cursor/rules/design-before-implementation-gate.mdc` · [`../../00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md)

---

## 1. ユーザー決定（2026-06-09 記録）

| # | 決定 | 内容 |
|---|------|------|
| U-1 | **委任 Go** | モック + 機械チェック合格時、**AI 監査役が 4 点設計の `[x]` をユーザーに代わって付与してよい** |
| U-2 | **人間の焦点** | 全文読解は不要。**モックの視覚レビュー**と**実装完了後のデモ**のみ |
| U-3 | **スコープ** | 機能 **01〜20** を同一の最大完成度まで揃える（順序は AI 易→難） |
| U-4 | **OSS** | Phase 1 **および** Phase 2 のライセンス監査を完走 |
| U-5 | **監査範囲** | ドキュメント整合 + **機械的** mock↔要件↔遷移チェック |
| U-6 | **世界観画像** | 一覧・仕様・配置のみ（生成は後追い。配置はユーザーが慎重に実施） |

---

## 2. AI 監査役が `[x]` を付与できるもの

以下 **3 条件をすべて満たしたとき**、機能単位で **設計ゲート 4 点（委任 Go）** を `[x]` と記録できる。

### 2.1 設計 4 点たたき台の完備

| 点 | 合格基準（機械 + 目視補助） |
|----|---------------------------|
| **要件定義** | `NN-*.md` が存在し、FR/NFR・境界・正本参照が欠落なく列挙されている |
| **詳細設計** | `NN-*-詳細設計-v1.md` が存在し、schema/API/state 契約が FR と矛盾しない |
| **遷移設計** | `NN-*-遷移設計-v1.md` が存在し、全主要 state に入口・出口・エラー導線がある |
| **UI 設計** | `NN-*-UI設計-v1.md` または `02-設計/_ui-global/NN-*.md` が存在し、主要画面がモックまたはワイヤーでカバーされている |

### 2.2 機械トレース合格（Mechanical Trace Pass）

- mock ファイル名 ↔ 画面一覧 ↔ FR ID が **1:1 または明示的 N:1** で対応（[`00-モック要件トレーサビリティ-v1.md`](./00-モック要件トレーサビリティ-v1.md) — Batch 7 で充填）
- 遷移表の各 edge が UI 設計または walkthrough に **参照パス**を持つ
- 横断 ADR（H-04/H-05/H-08 等）との **用語・数値の衝突が 0 件**（スクリプト or チェックリスト）

### 2.3 モックカバレッジ合格（Mock Coverage Pass）

- 機能の **主タスク 3 クリック以内**の画面がモック PNG でカバーされている（[`00-画面一覧-全体像.md`](../02-設計/_ui-global/00-画面一覧-全体像.md) 準拠）
- **空状態・エラー・ローディング**のうち、FR で必須とされたものがモックまたは UI 設計に明記されている
- 差し替え履歴は `mockups/archive/` に残っている（[`ihl-mock-versioning.mdc`](../../../../.cursor/rules/ihl-mock-versioning.mdc)）

> **注**: 上記は **「設計たたき台として実装に渡せる」** 判定。**実装コード着手の Go ではない**（§4 参照）。

---

## 3. AI 監査役が `[x]` を付与できないもの

| 区分 | 内容 | 理由 |
|------|------|------|
| **実装 Go** | `frontend/` `backend/` `components/` への本番実装着手 | 設計ゲートとは別ゲート。ユーザー **Implementation Sign-off** が必要 |
| **GMO 本番** | 実入金・本番 API 鍵・振込照合の live 実行 | 人間ゲート（`P0-NEXT-GMO-LIVE-EXEC`） |
| **法務条文確定** | 利用規約・プライバシーの **最終法務文** | 02 はたたき台まで AI可。確定は人間・法務 |
| **本番秘密** | Tier D 鍵・本番 R2 バケット・署名鍵の投入 | runbook 草案のみ AI可 |
| **哲学的最終判断** | P1–P12 と **CONTRADICTS** が残る場合の例外採用 | 人間が明示 Waive を出すまで BLOCK |
| **世界観画像の生成** | AI によるロゴ/コイン/免罪符の **自動生成・確定** | 一覧・仕様のみ。バイナリ配置はユーザー |

---

## 4. 「委任 Go」vs「人間 Implementation Sign-off」

| 項目 | 委任 Go（AI 監査役） | 人間 Implementation Sign-off |
|------|---------------------|-------------------------------|
| **正式名称** | `DELEGATED-DESIGN-GO` | `HUMAN-IMPL-SIGNOFF` |
| **対象** | 要件・詳細・遷移・UI の **4 点設計** | **コード実装**の着手・マージ・リリース |
| **前提** | モック + 機械チェック PASS | 4 点が委任 Go 済み + ユーザーがモック目視 OK |
| **証跡** | [`00-監査役-実装前ゲート-v1.md`](./00-監査役-実装前ゲート-v1.md) に行追加 | チャット明示 or `00-AI-HANDOFF-BRIEF.md` に **実装 Go** 記録 |
| **誰が `[x]`** | AI 監査役（エージェント ID 付き） | **ユーザー本人のみ** |
| **失効条件** | FR 改訂・ADR 破壊的変更・モック差し替えでトレース FAIL | 設計の委任 Go が取り消された場合 |
| **典型タイミング** | Batch 1〜6 の各機能完了時 | 全 01〜20 が同一完成度 + Batch 7 横断監査後 |

```
設計ドラフト → モック → 機械チェック → [委任 Go: AI] → ユーザー目視モック
                                              ↓
                         実装（Codex 等）← [実装 Go: 人間のみ]
                                              ↓
                                    実装デモ ← 人間最終確認
```

---

## 5. 監査証跡フォーマット（Audit Trail）

[`00-監査役-実装前ゲート-v1.md`](./00-監査役-実装前ゲート-v1.md) および機能別レビューに、**1 判定 = 1 行**で追記する。

| 列 | 必須 | 例 |
|----|:----:|-----|
| `timestamp` | ✓ | `2026-06-09T16:30:00+09:00` |
| `agent` | ✓ | `composer-2.5-fast` / セッション ID |
| `feature_id` | ✓ | `10-マチアプ` |
| `gate` | ✓ | `DELEGATED-DESIGN-GO` / `BLOCK` / `HUMAN-REQUIRED` |
| `four_point` | ✓ | `req,detail,transition,ui` または欠落列 |
| `mechanical_trace` | ✓ | `PASS` / `FAIL` + スクリプト名 |
| `mock_coverage` | ✓ | `PASS` / `FAIL` + 不足 mock ID |
| `evidence` | ✓ | 相対パスリンク（カンマ区切り） |
| `human_action` | △ | `mock_review_pending` / `impl_signoff_pending` / `none` |
| `notes` | △ | 1 行（BLOCK 理由など） |

**記録例**:

```text
2026-06-09T16:30:00+09:00 | agent=composer-2.5-fast | feature=10-マチアプ | gate=DELEGATED-DESIGN-GO | four_point=req,detail,transition,ui | mechanical_trace=PASS(ihl-mock-fr-trace.mjs) | mock_coverage=PASS | evidence=10-マチアプ.md,10-マチアプ-詳細設計-v1.md,02-設計/_ui-global/mockups/mockups/mockups/ihl-10-matchapp-pairwise.png | human_action=mock_review_pending
```

---

## 6. 設計実装伴走（Batch 8+ 必須）

> **正本**: [`02-設計/_横断/00-監査役-設計実装伴走ゲート-v1.md`](../02-設計/_横断/00-監査役-設計実装伴走ゲート-v1.md)  
> **背景**: Batch 7 監査は設計 doc **存在**のみ。Batch 8 で pytest smoke と DoD `✓` が乖離（#19 GitHub / stays 機能等）。**2026-06-10 以降、完了判定に伴走ゲートを必須化。**

### 6.1 監査役の新しい役割

| 従来（Batch 0〜7） | 伴走（Batch 8+ / POST-OSS） |
|-------------------|---------------------------|
| 4 点設計ファイル存在 · mock↔FR トレース | 上記 **+ 実装が設計主張と一致** |
| DELEGATED-DESIGN-GO | DELEGATED-IMPL-GO は **C1–C4 PASS** 必須 |
| 名誉システム（ログのみ） | **機械**: `ihl-design-impl-parity-check.mjs` + チェックリスト |

### 6.2 C1–C4（機能 #NN ごと）

| # | 内容 |
|---|------|
| **C1** | 設計主張が `指示/` に grep 存在 |
| **C2** | 実装一致（GitHub 主張 → mock_store 禁止 · ADR-H-21 → stays-only test 禁止） |
| **C3** | テストが主張を assert（200 OK のみ不可） |
| **C4** | 両層 README（component 機能） |

### 6.3 エージェント禁止事項（伴走）

- parity script **FAIL** 中の POST-B8 / POST-OSS `[x]` · DoD `✓`
- 「実装済み」宣言 without **設計行 + コード行** 引用
- `DELEGATED-IMPL-GO` を C1–C4 なしでログ追記

### 6.4 遡及

既知の偽完了は [`AUDIT-RETROACTIVE-GAPS-2026-06-10.md`](../02-設計/_横断/AUDIT-RETROACTIVE-GAPS-2026-06-10.md)。修復 = POST-OSS キュー（本チャーターでは実装しない）。

---

## 7. 監査役の作業手順（要約）

### 7.1 設計フェーズ（Batch 0〜7 · 従来）

1. 対象機能の FR + 4 点設計 + モックを読む（全文暗記不要・ギャップ表で足りる）
2. 機械スクリプトを実行（`ihl-four-point-inventory.mjs` 等）
3. FAIL なら **BLOCK** を記録し、バッチ担当 AI に差し戻し
4. PASS なら **DELEGATED-DESIGN-GO** を記録し、ユーザーへ **モック目視**を依頼（1 機能ずつでも可）
5. ユーザー目視 OK を受けたら `human_action=mock_review_done` に更新（実装 Go は付けない）

### 7.2 完了フェーズ（Batch 8+ · 伴走）

1. `node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --feature NN`
2. C1–C4 を手動でも照合（設計行 · コード行 · テスト行を引用）
3. FAIL → `AUDIT-FAIL-<id>.md` · `[x]` 禁止
4. PASS → DELEGATED-IMPL-GO ログに `c1..c4` + `parity_script=PASS`

---

## 8. 関連ドキュメント

| パス | 用途 |
|------|------|
| [`00-実装前ブループリント-スコープ.md`](./00-実装前ブループリント-スコープ.md) | 完成定義・01〜20 チェックリスト |
| [`00-ブループリント-成果物配置マップ-v1.md`](./00-ブループリント-成果物配置マップ-v1.md) | 成果物の置き場所 |
| [`00-実装前バッチ実行計画-v1.md`](./00-実装前バッチ実行計画-v1.md) | Batch 0〜7 順序 |
| [`00-設計ゲート4点-ギャップマトリクス-v1.md`](./00-設計ゲート4点-ギャップマトリクス-v1.md) | 現状ギャップ |
| [`00-監査役-実装前ゲート-v1.md`](./00-監査役-実装前ゲート-v1.md) | 監査証跡ログ（スタブ） |
| [`00-監査役-設計実装伴走ゲート-v1.md`](../02-設計/_横断/00-監査役-設計実装伴走ゲート-v1.md) | **Batch 8+ 完了判定** |
| [`.cursor/rules/ihl-design-impl-parity-gate.mdc`](../../../../.cursor/rules/ihl-design-impl-parity-gate.mdc) | エージェント常時ルール |

---

*草案 v1.1 · 2026-06-10 · §6 設計実装伴走追加 · Batch 8+ 必須*
