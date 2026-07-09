# PROPOSAL: docs/ 整理提案 v1

> **作成日**: 2026-07-09
> **作成者**: Claude (起草) — 実行は別セッション/サブエージェントへ委譲
> **ステータス**: DRAFT — 提案のみ、未適用

---

## 0. 適用は人間承認後(冒頭厳守)

**この提案書は「移動してよい」という許可ではない。** 本 repo はトレーサビリティ(01-要件 → 02-設計 → 03-テスト計画 → 04-トレーサ の参照網)を正本として扱っており、ファイル移動はリンク切れ・RTM 断絶を招きうる。

- 本提案に基づく `git mv` は、**人間が本ドキュメントの§3(移行マップ)を確認し明示的に Go を出した範囲のみ**、1コミット=1移行単位で実施する。
- 適用担当は Sonnet/Opus サブエージェントまたは別セッションとし、Fable 5 自身は指示・レビューに専念する(グローバル規約)。
- 適用前に対象範囲を `git status` で確認し、無関係な変更を巻き込まない。
- 04-トレーサ/CSV・02-設計/03-テスト計画 の**番号体系(01〜28 の機能番号、テスト4層、RTM)は本提案の対象外・不可侵**。動かすのは docs/ 配下(と、docs/ 外にある明白な孤立 stale ファイルの参考枠)のみ。

---

## 1. 現状の全体マップ(領域別ファイル数・役割)

実ファイル数は `find <dir> -type f | wc -l` で実測(2026-07-09時点)。

| 領域 | ファイル数 | 役割 | 本提案での扱い |
|---|---:|---|---|
| repo直下 loose `*.md` | 8 | README/CLAUDE.md/CONTRIBUTING(正本) + 00/01/03/05番の pre-promotion たたき台4本(stale) | 参考枠(§5)。今回の git mv 本体には含めない |
| `01-要件/` | 33 | FR正本(#00〜28)+ `_横断/` インベントリ。V-model 起点 | 不可侵 |
| `02-設計/` | 1,386 | features(24機能 × slices/ui/schema等)+ `_ui-global/` + `_横断/`(ADR/schema/component) | 不可侵(問題は別ADRで扱う。§5) |
| `03-テスト計画/` | 100 | features 4層テスト計画 + `_横断/` テスト設計書 | 不可侵 |
| `04-トレーサ/` | 49 | features RTM/逆RTM CSV | 不可侵 |
| `05-運用/` | 54 | automation/manual/queues/runbooks(V-model運用) | 不可侵(リンク切れのみ§2に記録、修正は別途) |
| `UI設計/` + `_legacy-index/` | 1 + 4 | `02-設計/_ui-global/` への移行済みレガシー索引 | **今回の主対象**(削除候補) |
| `99-アーカイブ/` | 20 | 2026.06 レガシー原本・監査・たたき台の既存アーカイブ場所 | 移行先として利用 |
| `docs/`直下ファイル | 17 | ARCHITECTURE/OSS-READINESS/デプロイ手順等の運用正本 + stale 混在 | **今回の主対象** |
| `docs/components/` | 9 | コンポーネント掲示板 BOARD.md 群(2026-06-10 stale scaffold) | **今回の主対象**(参考枠寄り) |
| `docs/design/` | 1 | Phase2移行済レガシー索引 stub | **今回の主対象** |
| `docs/registry/` | 8 | 機械生成 CSV レジストリ + 用語彙 | 不可侵(正本) |
| `docs/runbooks/` | 1 | ローカル起動手順 | 不可侵 |
| `docs/planning/` 直下 | 5 | README/STATUS/Go記録/完了レポート2件 | **今回の主対象**(README.md 実態乖離) |
| `docs/planning/w2-checkpoint/` | 144 | W2並行チーム成果物一式 + 作業用一時ファイル混入 | **今回の主対象**(一時ファイルのみ) |
| `docs/planning/claude-plans/` | 13 | PLAN/DESIGN 系(本ファイルもここ) | 不可侵 |
| `docs/planning/audits/` | 194 | 機械生成監査(スコープ外指定) | 対象外 |
| `docs/planning/golden/` | 24 | GOLDEN マニフェスト(スコープ外指定) | 対象外 |
| `docs/planning/quantum/` | 1,820 | QUANTUM シャード群(スコープ外指定) | 対象外 |
| `docs/planning/versions/`・`phases/`・`backlog/`・`migrations/`・`science-os/` | 1+1+2+2+3 | version/phase索引・backlog・移行計画・科学OS設計 | 一部**今回の主対象**(migrations の重複) |

---

## 2. 問題一覧(調査結果の集約・根拠パス付き)

### 2-1. 重複(duplicate)

| # | 内容 | 根拠パス |
|---|---|---|
| D1 | `docs/ihl-single-folder-migration-plan.md` と `docs/planning/migrations/single-folder.md` が相互に「設計正本はこちら」と参照し合う循環構造。両方とも「Phase 0 未着手・2026-07-03時点」で更新停止 | `docs/ihl-single-folder-migration-plan.md:2-6`, `docs/planning/migrations/single-folder.md:2-5` |
| D2 | `UI設計/README.md` と `_legacy-index/UI設計-README.md` がほぼ同一内容(02-設計/_ui-globalへの移行索引)を重複保持 | `UI設計/README.md`, `_legacy-index/UI設計-README.md` |
| D3 | `docs/ihl-tomorrow-memo-2026-06-27.md` は `docs/planning/backlog/2026-06-27-tomorrow.md` への1行リダイレクトstub。実体は既に移動済みで stub のみ残存 | `docs/ihl-tomorrow-memo-2026-06-27.md` |
| D4 | `03-CIV-OS-AI-SPEC-統合版.md` §1が `99-アーカイブ/.../AI実装指示書` の全文コピー | `03-CIV-OS-AI-SPEC-統合版.md:34-50` |

### 2-2. 矛盾(contradiction)

| # | 内容 | 根拠パス |
|---|---|---|
| C1 | `docs/planning/README.md`(計画ハブ入口)の「フォルダ構成」節が `backlog/・versions/・phases/・migrations/` のみ列挙。実際には `w2-checkpoint/・claude-plans/・audits/・golden/・quantum/・science-os/` も存在し `STATUS.md` はこれらに直接依存。新規参加者が主要フォルダに辿り着けない | `docs/planning/README.md:26-36`, `docs/planning/STATUS.md` |
| C2 | `STATUS.md`(2026-07-05)と `docs/DESIGN-IMPL-AUDIT.md`(2026-07-03)は `test_csv_import.py` を未完了と記載するが、`claude-plans/PLAN-INDEX.md`(2026-07-09)は同PLANを完了(6/6 green・未commit)と記録。更新順序が逆転し重複着手リスクあり | `docs/planning/STATUS.md`, `docs/DESIGN-IMPL-AUDIT.md`, `docs/planning/claude-plans/PLAN-INDEX.md` |
| C3 | root直下 `00-AI-HANDOFF-BRIEF.md`ほか3本は「たたき台・非正本」「`指示/it-hercules-laboratory/` 前提」の pre-promotion 記述だが、`README.md` は単一repo正本化(2026-07-03)を宣言済みで前提が破綻。README.mdの「読む順#1」が古い文書を指す導線矛盾 | `README.md:7,18`, `00-AI-HANDOFF-BRIEF.md:1-4` |

### 2-3. リンク切れ(broken_link) — docs/ 関連分

| # | 内容 | 根拠パス |
|---|---|---|
| L1 | `docs/implementation-deferrals.md` 冒頭の `../../../docs/CONTINUE_QUEUE.md` は本repo内に存在しない(civ-os想定の相対パス残存) | `docs/implementation-deferrals.md` |
| L2 | `docs/ver4-infra-agreement.md` の `../../../docs/runbooks/production-deploy.md` が本repo未存在 | `docs/ver4-infra-agreement.md` |
| L3 | `docs/vps-api-deploy.md` の `../../../docs/runbooks/sakura-vps-rocky512-civilization-api-ja.md` が本repo未存在 | `docs/vps-api-deploy.md` |
| L4 | `01-USER-INTENT-SUMMARY.md` が挙げる `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md` 等は `指示/` フォルダ自体が本repoに存在せず参照不能 | `01-USER-INTENT-SUMMARY.md:39-41` |
| L5 | `IMPLEMENTATION.md` の CI トリガー記述 `指示/it-hercules-laboratory/**` は現行構成に存在しない | `IMPLEMENTATION.md:189` |
| L6 | `05-運用/automation/` 配下 複数ファイルの `.cursor/rules|skills/...` 相対パスが2階層行き過ぎで壊れている(docs/直接の問題ではないが同種のstale相対パス問題として記録) | `05-運用/automation/IHL-Vモデル自律完走.md` ほか |

### 2-4. 陳腐化(stale)

| # | 内容 | 根拠パス |
|---|---|---|
| S1 | `docs/github-mirror-push.md`・`docs/ihl-single-folder-migration-plan.md` は split-brain 解消前提(2026-06-26〜07-03)の計画。現行は単一repo(it-hercules-laboratory-clean)が正本としてgit管理済みで前提が過去化 | `docs/github-mirror-push.md`, `docs/ihl-single-folder-migration-plan.md` |
| S2 | `docs/design/OSS-REPO-LAYOUT-v1.md`・`docs/design/README.md` は Phase2移行済みのレガシー索引・設計。実体は `05-運用/queues/`・`02-設計/_横断/` 等へ移行済み | `docs/design/README.md` |
| S3 | `docs/components/*/BOARD.md` 8ファイルは全て2026-06-10付の scaffold 記録のみで以後更新停止。実運用はGitHub Discussions側が正本と自己記載 | `docs/components/*/BOARD.md`(8件) |
| S4 | `docs/planning/w2-checkpoint/` 直下の作業用一時ファイル(`_patch_docs.py`, `_tmp_*.txt`, `_tmp_design_tail.md`)がドキュメントと混在 | `docs/planning/w2-checkpoint/_patch_docs.py` ほか5件 |
| S5 | repo直下 `00-AI-HANDOFF-BRIEF.md`・`01-USER-INTENT-SUMMARY.md`・`03-CIV-OS-AI-SPEC-統合版.md`・`05-GitHub運用-コンポーネント掲示板.md` は pre-promotion 思考メモの残存(§2-2 C3 と同根) | 同上4ファイル |

> 02-設計 / 03-テスト計画 / 04-トレーサ / 05-運用 内の重複・矛盾(例: `02-設計/features/05-観測-入力/` 孤立フォルダ、`08-カルマ/詳細設計-v2.md` 二重ファイル、`13-データ取得元管理/`・`23-GMO/` 孤立フォルダ等)は**番号体系の内部**にあり本提案のスコープ外。§5で別ADR送りとする。

---

## 3. 移行マップ(現在地 → 新配置)

対象は **docs/ 配下 + repo直下の明白な孤立レガシー索引(UI設計/, _legacy-index/)** のみ。◎=リンク書き換え必須、○=参照元なし(安全)。

| # | 現在地 | 新配置 | 理由 | リンク書き換え要否・参照元 |
|---|---|---|---|---|
| M1 | `docs/ihl-single-folder-migration-plan.md` | `99-アーカイブ/superseded/ihl-single-folder-migration-plan.md` | D1: `docs/planning/migrations/single-folder.md` と重複、正本は後者(README/STATUSから辿れる) | ◎ `docs/planning/migrations/single-folder.md:2` の相互参照リンクを削除、`docs/planning/README.md` に「旧計画は99-アーカイブへ」の1行注記を追加 |
| M2 | `docs/github-mirror-push.md` | `99-アーカイブ/superseded/github-mirror-push.md` | S1: split-brain解消済みの過去計画 | ○ 他ファイルからの参照は未確認(要 grep 実施、§4手順内で確認) |
| M3 | `docs/ihl-tomorrow-memo-2026-06-27.md` | 削除(`git rm`) | D3: リダイレクトstubのみ、実体は移動済み | ○ 参照元なし想定(要grep) |
| M4 | `docs/design/` フォルダ全体(`README.md`, `OSS-REPO-LAYOUT-v1.md`) | `99-アーカイブ/superseded/docs-design/` | S2: Phase2移行済みレガシー索引 | ◎ `02-設計/_横断/README-OSS-REPO-LAYOUT.md` が `../../docs/design/OSS-REPO-LAYOUT-v1.md` を参照(該当リンク先を新パスへ更新 or 削除して直接 `02-設計/_横断/` を案内) |
| M5 | `UI設計/`(フォルダ全体) | 削除(`git rm -r`) | D2: 実体は `02-設計/_ui-global/` に移動済み、`_legacy-index/UI設計-README.md` と重複索引 | ○ README.md冒頭に「UI設計/へのリンク」があれば要確認(§4で grep) |
| M6 | `_legacy-index/`(フォルダ全体: UI設計-README.md, UI設計/, 機能一覧-要件定義-README.md, 機能一覧/) | `99-アーカイブ/superseded/legacy-index/` | 役割上は既にアーカイブ相当。99-アーカイブと重複する置き場所を一本化 | ○ 参照元なし想定(§4で grep) |
| M7 | `docs/components/*/BOARD.md`(8件) | 変更なし(現状維持) | S3: 内容は stale だが GitHub Discussions 正本への案内という現役の役割を持つ。移動する実益がない | — (対象外・現状維持を推奨) |
| M8 | `docs/planning/w2-checkpoint/_patch_docs.py`, `_tmp_cal_analysis.txt`, `_tmp_checks.txt`, `_tmp_des_analysis.txt`, `_tmp_design_tail.md`, `_tmp_doc_report.txt` | 削除(`git rm`) | S4: 作業用一時ファイル、正式ドキュメントではない | ○ 参照元なし想定(§4で grep) |
| M9 | `docs/planning/README.md` の「フォルダ構成」節 | 同一ファイルを編集(移動ではない) | C1: 実態と乖離。`w2-checkpoint/・claude-plans/・audits/・golden/・quantum/・science-os/` を追記 | ◎ 編集のみ、移動なし |
| M10 | repo直下 `00-AI-HANDOFF-BRIEF.md`・`01-USER-INTENT-SUMMARY.md`・`03-CIV-OS-AI-SPEC-統合版.md`・`05-GitHub運用-コンポーネント掲示板.md` | `99-アーカイブ/superseded/pre-promotion-drafts/` | S5/C3: pre-promotion 前提が崩れたたたき台。README.md「読む順」からは既に外れている | ◎ `README.md` 内に4ファイルへの直接リンクがあれば更新(§4で grep必須。**docs/ 外だが同根問題のため参考枠として本表に記載、適用は別途人間確認**) |

### 3-1. 適用の優先順位(独立性が高い順)

1. **低リスク・参照元なし想定**: M3, M8(一時ファイル削除)
2. **低リスク・単純移動**: M6(_legacy-index/ 一本化)、M5(UI設計/ 削除)
3. **中リスク・リンク書き換え1箇所**: M1, M4
4. **中リスク・編集のみ**: M9(README.md構成節の追記)
5. **要・別途人間確認**(docs/ 外、スコープ境界上): M10
6. **保留・現状維持**: M2(要grep確認後に判断)、M7

---

## 4. 適用手順(git mv 単位)とロールバック

### 4-1. 共通手順(各 M# ごとに1コミット)

```bash
# 0. 事前確認: 移動対象への参照元を確認(残存リンクを潰さないため)
grep -rn "<対象ファイル名>" --include="*.md" --include="*.yaml" --include="*.json" .

# 1. 移動先ディレクトリがなければ作成
mkdir -p 99-アーカイブ/superseded/<サブフォルダ>

# 2. git mv で移動(履歴を保持)
git mv "<現在地>" "99-アーカイブ/superseded/<サブフォルダ>/<ファイル名>"

# 3. 参照元がある場合のみ、そのファイルのリンクを新パスに書き換え(Edit)

# 4. コミット(1移行単位=1コミット、まとめない)
git add -A
git commit -m "docs: archive <対象> (superseded by <正本>) — PROPOSAL-docs-reorg-v1 M#"
```

### 4-2. 削除系(M3, M8)

```bash
grep -rn "<対象ファイル名>" --include="*.md" .   # 参照元ゼロを確認してから
git rm "<対象ファイル>"
git commit -m "docs: remove stale redirect stub / scratch file — PROPOSAL-docs-reorg-v1 M#"
```

### 4-3. ロールバック

- 各移行が独立コミットのため、問題が出た移行単位だけ `git revert <commit>` で戻せる(他の移行に影響しない)。
- 誤って force push 等の不可逆操作をする前提にはしない。通常の `git revert` で復旧可能な範囲に留める。
- 万一 `99-アーカイブ/` への移動後にリンク切れが新規発生した場合、当該ファイルの `revert` を優先し、リンク修正は改めて別コミットで行う(revert と修正を1コミットに混ぜない)。

### 4-4. 検証

- 移行後、`grep -rn "旧パス" .`(拡張子 md/yaml/json/csv)を実行し残存参照ゼロを確認。
- `docs/planning/README.md` は編集後に目視で「読む順」が実フォルダと一致するか確認。
- CI/verify フックがあれば通す(本repoは `pytest -q` / `apps/web` テスト)。ただし docs 移動のみでは通常テストに影響しないため必須ではない。

---

## 5. 今回の対象外・別提案送り

- **`02-設計/features/` 内の孤立フォルダ・重複ファイル**(`05-観測-入力/`, `05-観測-計測テンプレ/`, `13-データ取得元管理/`, `23-GMO/`, `08-カルマ/詳細設計-v2.md` 二重化, `09-論文/slices/fr/fr-paper-*` vs `fr-ppr-*` 二重命名, `12-設定` と `17-UI選択画面改善` の schema 重複)は RTM・テスト計画からの参照有無を1件ずつ精査する必要があり、本提案の粒度を超える。**別ADR(`ADR-機能番号内-孤立ファイル整理-v1`)として起案し、機能ごとの設計ゲート文脈で判断すべき**。
- **`05-運用/automation/` の相対パス階層ズレ**(`.cursor/rules/...` へのリンクが2階層行き過ぎ)は単純な文字列修正で対応可能だが、対象ファイル数が多いため別途「リンク修正のみ」の小さい PLAN として起案する方が安全(本提案とコミット単位を分離)。
- **知の広場関連の PROVISIONAL 表記**は本提案の対象外。「決定済み」ではなく仮採用・ゲート中である旨は既存文書の記載を変更しない。
- **`docs/planning/audits/`・`golden/`・`quantum/`・`science-os/`** は機械生成物/大量シャードでありユーザー指示によりスコープ外(§1参照)。

---

*本提案は起草のみ。§0の通り、人間承認後に該当セクションの `git mv`/`git rm` のみを実行する。*
