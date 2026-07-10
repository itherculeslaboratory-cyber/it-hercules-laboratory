---
id: REPORT-ver3-phase-c0-2026-07-10
date: 2026-07-10
phase: C0
status: done
---

# REPORT-ver3-phase-c0 — Phase C0（ワークスペース移行・新repo初期化・sunabar実証・B2再検証）実行レポート

> 実行: 2026-07-10（ultracode、Fable 5 統括 + サブエージェント分業）。
> ミッション: `HANDOFF-ver3-phase-c.md` §「C0 の作業」の4項目。
> 本 ID はコミットメッセージの「参照レポートID」として使用する。

## 0. 受領指示との差異（重要・人間確認推奨）

本レポート起票担当への当初キックオフ指示では **③ sunabar = 「キー所在待ちで未実施」** と記載されていた。
しかし本レポート作成時点の新パス `c0/` には、別担当が同日実施した **sunabar sandbox 疎通実証の証跡4ファイル**（`sunabar-evidence-2026-07-10.md`（status: done）+ 応答JSON3本）が既に存在し、**3 API とも HTTP 200 で疎通成功**を示していた。開発キーの所在は解決済み・sandbox テストは完了している。

したがって本レポートは **誇張ゼロ／実測主義** に従い、キックオフ文言（未実施）ではなく **ディスク上の実証跡（実施・成功）** を正として記録する。フロントマターの `status` も `done-except-sunabar` ではなく `done` とした。残る人間ゲートは sandbox ではなく **本番実キー投入・本番入金**（既存 STATUS 記載のゲート）である。

## 1. C0 4作業の結果

| # | 作業 | 結果 | 証跡 |
|---|------|------|------|
| ① | ワークスペース移行（コピー→検証→退役方式） | **完了** | M0-M4 robocopy（FAILED=0）+ 記憶引っ越し。§3 参照 |
| ② | 新 repo `it-hercules-laboratory_ver3` 初期化（`D:\claude\systems\ihl-ver3`） | **完了** | root-commit `9229c57`（フォルダ設計§8 の11手順） |
| ③ | GMO sunabar sandbox 疎通実証 | **完了（実施・成功）** | `c0/sunabar-evidence-2026-07-10.md` — 3 API × HTTP 200。※キックオフ指示の「未実施」から更新（§0） |
| ④ | B2 選定の再検証条項の確認 | **完了** | 研究8本を再検証・追記（§4） |

## 2. 完了条件との突合

| 完了条件 | 判定 | 根拠 |
|----------|------|------|
| CI green | **PASS** | pytest tests/unit 315 passed（旧=新一致）。verify.cmd 新パスで 315 passed / exit 0 |
| C-5（3項目: pytest一致 / 記憶ファイル数一致 / verify.cmd実行） | **PASS**（①claude起動確認のみ deferred） | pytest 315=315、記憶 旧6/新6 一致、verify.cmd exit 0。C-5① は対話セッション必須のため未実施 |
| sunabar 証跡 | **済**（当初「未」→更新） | `c0/` に4ファイル・3 API 200（§0） |
| B2 再検証追記 | **済** | 研究8本に再検証 verdict 付与（§4） |

## 3. 各担当の evidence 要約

### 準備（バックアップ・M0-M2）
- 設計書 `ver3-ワークスペース設計-v1.md` §1・§5.1（M0-M2）・§1.4-4 を読了。
- 移動対象フォルダ（graphify/impeccable/ponytail/obsidian-skills/notebooklm-py/yt-transcripts 等）への絶対パス参照を `~/.claude/settings.json`・plugins config・skills/ で grep 確認 → ヒットなし（plugin 参照はマーケットプレイス名参照でパス非依存、`~/.claude/skills/` 配下は別実体）。deferred なし、全項目実施。
- M0: robocopy で `it-hercules-laboratory-clean`（1.622GB / 33,257 files / 3,859 dirs）と `D:\claude`（252.61MB / 4,866 files / 965 dirs）を `D:\バックアップ\` に当日版として複製。両方とも FAILED=0・Mismatch=0（終了コード=正常コピー完了）。`D:\claude` は 263MB（<15GB）のため除外なし。

### 移行（M4 コピー・記憶引っ越し）
- M4: robocopy で `D:\Programs\it-hercules-laboratory-clean` → `D:\claude\systems\ihl-ver2` コピー完了（1回で成功、終了コード=成功範囲）。
- C-1: 記憶 slug を `D--claude-systems-ihl-ver2` へコピー（元は無傷）。ihl-ver3 用 slug を新規作成し `ihl-env-quirks.md` のみ選別コピー + 新規 `MEMORY.md`（1行インデックスのみ）を作成。
- C-3: git remote（origin / ilh-claude 2本）・status（clean）・log -1（`4a56cf6`）すべて旧と一致確認。
- C-5: pytest tests/unit が旧パス 315 passed・新パス 315 passed で一致。記憶ファイル数 旧6/新6 一致。verify.cmd は新パスに存在し実行（315 passed, exit 0）。claude 起動確認（C-5①）は対話セッション必須のため未実施（deferred）。

### 監査（独立再検証）
独立再検証: 全7項目 PASS（自分でコマンド実行、報告は鵜呑みにせず再実行）。ただし項目2に「移行不良ではない」逸脱を1件検出したので明記する。

- **[1] PASS** バックアップ2点 実在・非ゼロ（`-Force` で隠しファイル込み再計測し robocopy 報告値と一致）。
- **[2] PASS（逸脱あり）** ver2 git: remote 2本・log -1=`4a56cf6` 一致、C-2 の3ファイルは意図どおり書換済。★ただし移行担当が「status=C-2の3件のみ」と報告した点は現時点では不成立 — ver2 には移行後の Phase C0 作業（`b2/`・research .md 8件の modified + 未追跡 `c0/` の sunabar 証拠4ファイル）が追加で存在する。これらは source（`D:\Programs\...`）には無く、設計 §5.1「並走期間の編集は新パスのみ」に沿った正当な後続作業であり、コピー破損や移行欠陥ではない。「C-2分のみ」という文言は超過しているが移行成否には影響しないため PASS 扱い・逸脱として記録。
- **[3] PASS** memory（旧6/新6 一致・選別コピー内容確認）ほか [4]-[7] PASS。

### CI（新 repo 初期化・秘密検査・初回コミット）
- `D:\claude\systems\ihl-ver3` で `git add -A` → `git status` で一覧確認。node_modules / .env は staged なし（`.env.example` のダミー値のみ）。
- `git diff --cached` を対象に秘密値パターン（api_key/secret/token/password 代入、`sk-`/`ghp_`/`AIza`/`AKIA`/`xox` 系トークン）を grep 検査 → 検出なし。
- 初回コミット（root-commit）作成: `9229c57459ebdc20767cf12ded74afc70ee0d706` 「chore(c0): 新repo初期化 — フォルダ設計§8 の11手順を実施」。

## 4. B2 再検証条項の verdict（研究8本）

| ファイル | verdict |
|----------|---------|
| `ADR-V3-EMB-01-embedding-dimension-v1.md` | unchanged |
| `research-gmo-aozora-api-v1.md` | unchanged |
| `research-workers-vs-vps-v1.md` | unchanged |
| `research-tts-video-stack-v1.md` | partially-changed |
| `research-wiki-integration-v1.md` | unchanged |
| `research-ai-first-data-design-v1.md` | partially-changed |
| `research-smtp-secrets-migration-v1.md` | partially-changed |
| `research-external-knowledge-v1.md` | unchanged |

partially-changed 3本は料金・スタック小変動の追記のみで、B2 の技術選定（384 / Workers+Hono / Resend / VOICEVOX / ruri-v3-70m）そのものの覆りは無し。

## 5. deferred（人間裁定待ちを分離）

1. **C-5① claude 起動確認**（`D:\claude\systems\ihl-ver2` で claude を起動し MEMORY.md 要約を読み取り確認）は対話セッションが必要なため本ワークフローでは未実施。ユーザー実施が必要。
2. 旧フォルダで発見した **文字化けした未追跡アイテム**（`?? 正本は` 相当）は本タスクの作成物ではなく、由来不明・実体未特定。旧フォルダは読み取り専用方針のため削除等せず報告のみ。
3. **M1/M2/M3/M5/M6**（HQ骨格作成・散在物収容・ihl-ver3 clone・旧フォルダ退役・civilization-os 移設）は本指示の対象外のため未実施。design doc §5.1 のマイルストーン表を参照。
4. 監査項目2の status 検証で「C-2 の書換分のみ modified」は文字どおりには不成立（移行後 Phase C0 の `b2/` 8件 modified + `c0/` untracked が追加存在）。source には無く §5.1「並走期間の編集は新パスのみ」に整合する正当な後続作業のため PASS 扱い・逸脱として明記。「純粋な移行直後スナップショット」を厳格に求める場合は要人間判断。
5. **§0 の指示差異**（sunabar 未実施 → 実施・成功）そのものを人間確認事項として残す。

## 6. 人間ゲート残（AI 完走不可）

| ゲート | 内容 |
|--------|------|
| ~~sunabar sandbox キー所在~~ | **解決済**（sandbox 疎通成功・§0）。以降は本番実キーのみ |
| LICENSE 確定 | 新 repo（ihl-ver3）の LICENSE 選定・確定 |
| 旧フォルダ削除 | 1週間並走後の退役（M5） |
| schtasks XML 内パス | 自動運転スケジューラの登録パスが旧パス依存の場合の更新（該当時） |
| GMO 本番実キー・本番入金 | sandbox とは別。既存 STATUS の人間ゲート |
