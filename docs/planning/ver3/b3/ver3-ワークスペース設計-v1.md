---
id: V3-AIP-97-DESIGN
title: ver3 ワークスペース全体設計書 — Claude HQ 階層（D:\claude）
date: 2026-07-10
status: draft
requirement_ids: [V3-AIP-97, V3-AIP-96]
phase: B3
authors: [claude-fable-5-subagent]
supersedes: []
canonical: true
---

# ver3 ワークスペース全体設計書 v1 — Claude HQ 階層

> **要求原文**（`docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md:39`）:
> 「D:\claude とかを…Claud の本拠地にして、それに ver3 とかが開発システム単位で従属しているフォルダで階層構造で綺麗に視覚的にも直感的にもわかりやすい感じにしたい」
>
> **本書の位置付け**: B3 成果物。**設計のみ**。移行実施は Phase C 開始時（新 repo 誕生と同時）
> （`docs/planning/ver3/HANDOFF-ver3-phase-b2.md:22`）。
> たたき台は `HANDOFF-ver3-phase-b2.md:12-21`、様式は `05-運用/queues/00-フォルダ構成-v3-OSS.md` §4（157行〜）・§8（259行〜）を踏襲。

## 凡例 — 事実と提案の区別

| マーク | 意味 |
|--------|------|
| 【事実】 | 2026-07-10 に repo / ファイルシステムを実地調査して確認した内容（出典付き） |
| 【提案】 | 本書の設計判断。Phase C 着工前に事後レビュー可能 |

---

## 0. 前提調査結果（すべて【事実】・2026-07-10 実施）

| # | 事実 | 出典 / 確認方法 |
|---|------|----------------|
| F1 | `D:\claude` は**既に存在**し、`yt-transcripts\` のほか skills 開発フォルダ（graphify / impeccable / ponytail / obsidian-skills 等）、ノート md 十数点、名前が壊れたフォルダ（`` ` ``・`Do`・`int`）が**未整理のまま同居**している | `ls /d/claude/` 実行結果 |
| F2 | `D:\notes` は存在し、`CLAUDE.md` / `inbox` / `index.md` / `log.md` / `output` / `projects` / `wiki` の OKF 構成 | `ls /d/notes` 実行結果 |
| F3 | Claude Code のプロジェクト記憶はパス slug に紐づく。現存 slug は `D--Programs-it-hercules-laboratory-clean` と `D--claude` の 2 つ | `ls ~/.claude/projects/` 実行結果 |
| F4 | 現 repo の記憶ファイルは 4 点: `MEMORY.md` / `ihl-env-quirks.md` / `phase6-ultracode-run.md` / `ver3-phase-a-run.md`。**この 4 点の本文に旧絶対パスへの参照は無い**（grep 0 件） | `grep -rl it-hercules-laboratory-clean ~/.claude/projects/D--Programs-it-hercules-laboratory-clean/memory/` |
| F5 | repo 内で文字列 `it-hercules-laboratory-clean` を含むファイルは **21 件**（`docs/planning/ver3/` 配下 7 件、`docs/planning/` 他 10 件、`.cursor/skills/` 1 件、`02-設計/` 1 件、`docs/` 1 件、`99-アーカイブ/` 1 件） | Grep 実行結果（§2.2 に用途別分類） |
| F6 | `.claude/settings.local.json` の permissions.allow 内に旧パス `D:/Programs/it-hercules-laboratory-clean/...` を含むルールが 1 件ある。`.claude/verify.cmd` は相対パス実行（`python.exe -m pytest tests/unit`）で**パス非依存** | 両ファイル実読 |
| F7 | git remote は `origin = it-hercules-laboratory.git` と `ilh-claude = ILH-claude.git` の 2 本。remote は URL 参照なのでフォルダ移動の影響を受けない | `git remote -v` |
| F8 | 新 repo は `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory_ver3.git` で確定済み | `ver3-ユーザー裁定-2026-07-10-第2回.md:9` |
| F9 | 夜間タスク（V3-AIP-96・Tier S）は「1夜あたりコスト上限・自動停止を必須設計」 | `HANDOFF-ver3-phase-b2.md:44` |
| F10 | Claude 可視化の視覚参照は 3 動画分析ノートに集約済み（設計キュー 8 点） | `D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md:91-100` |
| F11 | PII 原本（`pii-output` 配下）は削除保護対象 | メモリ `ihl-env-quirks.md` / `HANDOFF-ver3-phase-b2.md:52` |
| F12 | harvest スキル・OKF 規約は `D:\notes` の絶対パスを対象とする（「D:\notes バンドル専用」） | グローバル skill 定義（harvest） |

---

## 1. 階層設計の完成形

### 1.1 確定ツリー【提案】（たたき台 `HANDOFF-ver3-phase-b2.md:12-21` を具体化）

```text
D:\claude\                       ← Claude の本拠地（HQ）。この 1 フォルダを開けば全体が見える
├── README.md                    ← HQ 全体の 1 枚地図（spine）。各直下フォルダへ 1 行ずつ
├── 00-hq\                       ← 横断正本（並び順先頭を保証する唯一の番号フォルダ）
│   ├── charter.md               ← HQ 運用規約（グローバル CLAUDE.md との関係は §4.3）
│   ├── decisions\               ← 裁定ログ（append-only・日付+連番 md）
│   ├── dashboard\               ← ダッシュボード定義（§4.1）
│   └── night-tasks\             ← 夜間タスク定義（§4.2。定義=ここ / 実行ログ=ops\）
├── systems\                     ← 開発システム（1 システム = 1 フォルダ = 1 git repo）
│   ├── ihl-ver3\                ← 新 repo it-hercules-laboratory_ver3（実装の主戦場・Phase C でここに誕生）
│   ├── ihl-ver2\                ← 現 it-hercules-laboratory-clean（要件・データ正本 → 段階的に参照専用）
│   └── civilization-os\        ← ver1（読み取り専用アーカイブ。移設は任意・§5.1 M4）
├── knowledge\                   ← 蒸留済み知識（PII 原本は置かない・§3）
│   ├── yt-transcripts\          ← 既存（D:\claude 直下から 1 段降ろす）
│   ├── notes-summaries\         ← 現在 D:\claude 直下に散在する要約 md の収容先
│   └── inbox\                   ← 未分類の一時置き場（月次で振り分け・空が正常状態）
└── ops\                         ← 運転の実体（§4.2）
    ├── schedules\               ← cron / schedule 定義
    ├── runs\                    ← 実行ログ（JSON・ラウンド単位・append-only）
    └── skills-dev\              ← 現在 D:\claude 直下に散在する skills 開発フォルダの収容先
```

### 1.2 各フォルダの存在意図（`00-フォルダ構成-v3-OSS.md` §4 様式踏襲）【提案】

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない |
|----------|----------|------------|------------------|
| **`D:\claude\`（root）** | HQ の顔。開いた瞬間に全体像 | `README.md` + 直下 4 フォルダ**のみ** | ばら撒き md・作業ファイル・repo 本体（F1 の散在状態を再発させない） |
| **`00-hq\`** | 横断正本。人間と AI が最初に読む | charter・裁定ログ・ダッシュボード定義・夜間タスク定義 | 実行ログ（→ `ops\runs\`）・システム固有の設計書（→ 各 repo 内） |
| **`systems\`** | 開発システムの並列置き場 | git repo をトップ 1 階層に 1 つずつ | repo でないフォルダ・repo 間の共有コード（正本は各 repo 内） |
| **`systems\ihl-ver3\`** | 実装の主戦場 | 新 repo 一式（内部構成は別紙: 新 repo フォルダ設計） | ver2 からの手コピー正本（継承はデータ移行手順を通す） |
| **`systems\ihl-ver2\`** | 要件・データ・思想の正本（継承元） | 現 repo 一式そのまま | 新規実装（Phase C 以降の実装は ver3 側） |
| **`systems\civilization-os\`** | ver1 読み取り専用アーカイブ | 現 civ-os 一式 | あらゆる編集（CLAUDE.md の禁止事項を継承） |
| **`knowledge\`** | 蒸留済み知識・トランスクリプト | 要約 md・字幕・カタログ | **PII 原本**（F11）・git repo・実行ログ |
| **`ops\`** | 夜間運転とスキル開発の実体 | スケジュール定義・実行ログ JSON・skills 開発 | 裁定や規約の正本（→ `00-hq\`） |

### 1.3 深度制限【提案】

| ツリー | 最大深度（D:\claude 起点） | 超過時 |
|--------|---------------------------|--------|
| `00-hq\` | **3**（例: `00-hq\dashboard\layout.json`） | flatten |
| `systems\` | **2 で repo 境界**（`systems\<name>\` から先は各 repo の構成憲法に従う） | HQ 側は関知しない |
| `knowledge\` | **3** | inbox へ戻して再分類 |
| `ops\` | **4**（`ops\runs\<night-id>\round-NN.json` を許容） | 月次アーカイブ |

### 1.4 命名規約 —「視覚的・直感的」要求への応答【提案】

1. **英語 kebab-case・小文字を標準とする**（`00-hq`・`night-tasks`・`yt-transcripts`）。
   理由: (a) Windows は大文字小文字非区別だが、git・grep・slug 生成（§2.1）はパスをそのまま文字列化するため、表記ゆれが事故源になる。(b) 既存の `yt-transcripts` が既に kebab-case（F1）。(c) 日本語フォルダ名は ver2 repo 内（`01-要件` 等）では正本として維持するが、**HQ 階層（repo の外側）はターミナル・スクリプト・slug で最頻出のパスなので ASCII に統一**する。
2. **番号プレフィックスは `00-hq` の 1 個だけに限定**。たたき台の `00-HQ` は大文字だったが小文字に倒す（上記 1）。`systems\` 配下は対等な並列であり順序に意味がないため番号を振らない。番号の乱用は ver2 repo で観測されたスプロールの一因（`00-フォルダ構成-v3-OSS.md:1` の「スプロール抑止」趣旨を継承）。
3. **直下 4 フォルダ + README 1 枚**という上限自体が「視覚的に綺麗」の実装である。エクスプローラで `D:\claude` を開いたとき 5 項目しか見えない状態を正常とし、6 項目目の追加は `00-hq\charter.md` の改訂（＝裁定ログ 1 件）を要する。
4. **既存の散在物（F1）は移行時に一括収容**する: 要約 md → `knowledge\notes-summaries\`、skills 開発フォルダ → `ops\skills-dev\`、壊れた名前のフォルダ（`` ` `` / `Do` / `int`）は中身確認のうえ削除またはアーカイブ（§5.1 M2）。

---

## 2. 記憶引っ越しチェックリスト（必須設計項目）

> **実行タイミング: Phase C 開始時（新 repo 誕生と同時）。B3 では設計のみ**（`HANDOFF-ver3-phase-b2.md:22`）。

### 2.1 slug の仕組み【事実】

Claude Code のプロジェクト記憶・設定は起動フォルダの絶対パスから生成される slug に紐づく:
`C:\Users\sawad\.claude\projects\<パスslug>\memory\`。
現 slug は `D--Programs-it-hercules-laboratory-clean`（F3）。移設後の起動フォルダが
`D:\claude\systems\ihl-ver2` なら新 slug は `D--claude-systems-ihl-ver2` になる。
**注意**: `D--claude` slug が既に存在する（F3）。`D:\claude` 直下で claude を起動した履歴があるためで、
systems 配下の各 repo で起動すれば別 slug になる（記憶は勝手に統合されない）。

### 2.2 チェックリスト【提案】

- [ ] **C-1: 記憶ディレクトリの slug 引っ越し（コピーで元を残す）**
  ```powershell
  Copy-Item -Recurse "$env:USERPROFILE\.claude\projects\D--Programs-it-hercules-laboratory-clean" `
            "$env:USERPROFILE\.claude\projects\D--claude-systems-ihl-ver2"
  ```
  元ディレクトリは削除しない（ロールバック原資・C-6）。ihl-ver3 の slug（`D--claude-systems-ihl-ver3`）は
  新規まっさら開始とし、ver2 記憶のうち環境固有事項（`ihl-env-quirks.md`）だけ手動で選別コピーする。
- [ ] **C-2: 絶対パス参照の一括更新**。grep 対象パターン（すべての表記ゆれを列挙）:

  | パターン | 主な出現箇所 |
  |----------|-------------|
  | `D:\Programs\it-hercules-laboratory-clean` | PowerShell/バッチ・Windows 表記の md |
  | `D:/Programs/it-hercules-laboratory-clean` | bash・URL 風表記（`.claude/settings.local.json` に 1 件 = F6） |
  | `/d/Programs/it-hercules-laboratory-clean` | Git Bash 表記 |
  | `D:\\Programs\\it-hercules-laboratory-clean` | JSON エスケープ表記 |
  | `D--Programs-it-hercules-laboratory-clean` | slug 直書き（スクリプト・メモリ内リンク） |

  【事実】repo 内ヒットは 21 ファイル（F5）。うち履歴文書（`docs/planning/ver3/` の裁定・抽出記録、
  `99-アーカイブ/`）は**歴史的記録として書き換えない**【提案】。書き換え対象は「今後も参照される導線」
  のみ: `docs/planning/README.md`・`.cursor/skills/ihl-doc-remediation/SKILL.md`・
  `docs/planning/ver3/HANDOFF-*.md`（キックオフプロンプト部分）・`.claude/settings.local.json`。
  repo 外の書き換え対象: グローバル `~/.claude/CLAUDE.md`・`~/.claude/settings.json` の
  permissions/hooks・メモリ 4 ファイル（本文にパス参照なし = F4 だが、MEMORY.md のインデックスリンクは相対なので追従不要を確認）。
- [ ] **C-3: git remote 不変確認**。移設後に `git remote -v` を実行し F7 の 2 本（origin / ilh-claude）が
  そのまま表示されること、`git status` が clean であること、`git log -1` が移設前と一致することを確認。
- [ ] **C-4: プロジェクト設定の追従**。`.claude/settings.local.json`（F6 の旧パスルール 1 件を更新）・
  `.claude/verify.cmd`（相対パスのため**変更不要** = F6、動作確認のみ）・`.cursor/` ルール群の絶対パス grep。
- [ ] **C-5: 検証手順**。移設先 `D:\claude\systems\ihl-ver2` で `claude` を起動し、
  ①「MEMORY.md の内容を要約して」と指示して 4 ファイル（F4）が読めること
  ②`pytest -q` が移設前と同数 pass すること ③Edit 実行で verify.cmd フックが発火すること を確認。
- [ ] **C-6: ロールバック手順**。①旧フォルダ `D:\Programs\it-hercules-laboratory-clean` は
  検証完了まで削除せず残す（§5.2） ②失敗時は新フォルダを削除し旧フォルダで再起動するだけで完全復旧
  （記憶はコピーなので旧 slug が無傷 = C-1） ③`D:\バックアップ` の事前バックアップを最終防衛線とする。

---

## 3. `knowledge\` の扱い — D:\notes を移すか

### 3.1 影響分析【事実】

- `D:\notes` は inbox/wiki/output/projects の OKF バンドルで、専用 `CLAUDE.md` を持つ独立プロジェクト（F2）。
- harvest スキルは「D:\notes バンドル専用」と絶対パスで定義されている（F12）。
- `.claude/settings.local.json` に `Read(//d/notes/**)` 許可ルールがある（F6 実読）。
- `summary-claude-ux-refs-2026-07-10.md:11` も `cross_ref: D:\notes\output\...` と絶対パス参照。
- つまり移動すると **スキル定義・permission ルール・既存ノートの相互参照**の 3 系統が同時に壊れる。

### 3.2 段階案と推奨【提案】

| 案 | 内容 | 評価 |
|----|------|------|
| A: Phase C で一括移設 | `D:\notes` → `D:\claude\knowledge\notes\` に移動し全参照を更新 | ✗ systems 移設と故障箇所が重なり切り分け不能になる |
| **B: systems のみ先行（推奨）** | Phase C では `systems\` だけ移設。knowledge 統合は別ステップ（K1）として後日、harvest スキル改修とセットで実施 | ○ 1 度に壊れる系統が 1 つ。V3-AIP-97 の主眼（開発システムの階層化）は満たされる |
| C: junction で見かけ統合 | `D:\claude\knowledge\notes` を `D:\notes` への directory junction にする | △ 見た目は即座に統合されるが、二重パスは grep・slug・バックアップの事故源。恒久策にしない |

**推奨は B**。Phase C の knowledge\ 作業は「D:\claude 直下の散在物の収容（§1.4-4）」のみに限定し、
`D:\notes` は当面現位置のまま。K1（別ステップ）で移す場合も **PII 原本
（`D:\Programs\追加アイディア\情報\pii-output` 配下・削除保護 = F11）は永久に knowledge\ へ移さない**。
knowledge\ に置いてよいのは蒸留済み・匿名化済みの成果物のみ。暫定の橋渡しとして案 C の junction を
併用してもよいが、その場合 `00-hq\charter.md` に「junction は暫定・正本は D:\notes」と明記する。

---

## 4. `00-hq\` と `ops\` の中身設計

### 4.1 ダッシュボード定義（`00-hq\dashboard\`）【提案】

参照 3 動画の設計キュー（F10 = `summary-claude-ux-refs-2026-07-10.md:91-100`）を HQ の観測要件として採録する。
実装は B7/Phase C 以降。ここでは**定義ファイルの置き場と機械可読形式**を定める。

| # | 設計キュー（出典行） | HQ での定義ファイル |
|---|---------------------|---------------------|
| 1 | 状態別 3 カラムかんばん（対応待ち/実行中/完了）（summary:93） | `dashboard\layout.json` の `columns` |
| 2 | 覗き見プレビュー（フル遷移なしで経過時間・要約・簡易操作）（summary:94） | 同 `peek` セクション |
| 3 | 破壊的操作に確認ダイアログ必須（summary:95） | 同 `confirm_destructive: true`（変更不可のガード値） |
| 4 | ワンクリックボタングリッド（スキル/自動化の一発実行）（summary:96） | `dashboard\buttons.json`（1 ボタン = skill 名 + 引数） |
| 5 | 利用枠パネル（レート制限窓・実行回数を専用サイドエリアに常時表示）（summary:97) | `layout.json` の `side_panel.metrics` |
| 6 | ラウンド単位 JSON 構造化ログの再生（summary:98） | ログ正本は `ops\runs\`（§4.2）。dashboard は読むだけ |
| 7 | 表示項目・レイアウトのカスタマイズ可能性（summary:99） | `layout.json` 自体をユーザー編集可の正本とする（固定テンプレ禁止） |
| 8 | バックグラウンド実行の取り込み導線（「見えないものは忘れる」対策）（summary:100） | `layout.json` の `ingest`（`/bg` 相当の登録 API を B7 で設計） |

夜間運転の「朝レビュー用スタック」と Claude 運用ダッシュボードは同じ 1 枚に統合する方針
（`HANDOFF-ver3-phase-b2.md:45`【事実】）。よって朝レビューはかんばんの「対応待ち」カラムに
夜間 run の成果物カードが積まれる形で表現する【提案】。

### 4.2 夜間運転（`00-hq\night-tasks\` + `ops\`）【提案】

V3-AIP-96 の必須制約 =「1夜あたりコスト上限・自動停止」（F9）を構造で担保する。

| パス | 内容 | 形式 |
|------|------|------|
| `00-hq\night-tasks\<task-id>.md` | タスク定義: 目的・対象 system・成功条件・**上限（max_cost_usd / max_rounds / max_minutes）** | frontmatter 付き md（上限 3 値は必須キー・欠落時は実行拒否） |
| `ops\schedules\night.json` | どのタスクをどの夜に走らせるか + **夜間全体のコスト上限**（タスク別上限とは別に総枠） | JSON |
| `ops\runs\<YYYY-MM-DD>-<task-id>\round-NN.json` | ラウンド単位ログ: 開始/終了時刻・消費トークン・累積コスト・成果物パス・停止理由 | JSON append-only（キュー 6 に対応） |
| `ops\runs\<...>\STOP` | 自動停止マーカー: 上限到達時にランナーが書き、以降のラウンドは起動しない | 空ファイル + 理由 1 行 |

朝レビュー: `ops\runs\` の当夜分を dashboard が読み、成果物カード（成功/要対応/停止）を
かんばんに積む。破壊的な後始末（run の破棄等）はキュー 3 に従い必ず確認を挟む。

### 4.3 運用規約（`00-hq\charter.md`）とグローバル CLAUDE.md の関係【提案】

| 層 | 正本 | 書くこと |
|----|------|----------|
| マシン全体（全プロジェクト共通） | `~/.claude/CLAUDE.md`（既存・変更最小） | モデル役割分担・permission 方針・危険操作規約 — 現行のまま |
| HQ 横断（D:\claude 配下共通） | `00-hq\charter.md`（新設） | 本書 §1 の階層・命名・深度・散在物禁止ルール、junction の暫定宣言（§3.2）、夜間運転の総枠 |
| system 固有 | 各 repo の `CLAUDE.md` | repo 内の読む順・禁止事項（現行どおり） |

グローバル CLAUDE.md には「D:\claude 配下では `00-hq\charter.md` を参照」の 1 行だけ追記する
（重複記述は作らない・第二 spine 禁止の思想は `00-フォルダ構成-v3-OSS.md:52-59` を継承）。
裁定ログ（`00-hq\decisions\`）は append-only。ver2 repo 内の既存裁定記録
（`docs/planning/ver3/ver3-裁定記録-*.md` 等）は移設せず、`decisions\README.md` からリンクする。

---

## 5. 移行順序と安全策

### 5.1 移設方式: clone ではなく「コピー→検証→退役」【提案・推奨】

**fresh clone を推奨しない理由**: clone では git 管理外のローカル実体
（`.claude/settings.local.json`・`.env` 系・仮想環境・ローカルデータ・開発キー格納物 =
`HANDOFF-ver3-phase-b2.md:10` の「GMO 開発キー格納済み」）が**運ばれない**。git repo 自体は
フォルダ移動に対して完全に可搬（remote は URL 参照 = F7）なので、丸ごとコピーが安全かつ十分。

| # | マイルストーン | 操作 | 不可逆? |
|---|---------------|------|---------|
| M0 | 事前バックアップ確認 | `D:\バックアップ` に ver2 / civ-os / D:\claude の当日版があることを確認（ユーザー確認済み前提。ただし実行直前に一言報告 — グローバル規約踏襲） | — |
| M1 | HQ 骨格作成 | `D:\claude` 直下に README + 4 フォルダを作成（既存物はまだ触らない） | 可逆 |
| M2 | 直下散在物の収容 | F1 の散在物を §1.4-4 に従い `knowledge\` / `ops\skills-dev\` へ移動。壊れた名前 3 件は中身確認→アーカイブ | 可逆（アーカイブ保持） |
| M3 | **ihl-ver3 誕生** | `git clone it-hercules-laboratory_ver3.git D:\claude\systems\ihl-ver3`（新 repo はここが初出なので移設問題なし） | 可逆 |
| M4 | **ihl-ver2 移設** | `robocopy /E /COPYALL` で `D:\Programs\it-hercules-laboratory-clean` → `D:\claude\systems\ihl-ver2` に**コピー**。§2.2 チェックリスト C-1〜C-5 を全消化 | 可逆（旧を残す） |
| M5 | 旧フォルダ退役 | C-5 検証合格 + 1 週間の並走後、旧フォルダをリネーム（`-retired` 付与）し新パスのみ使用。**削除はさらに後**・削除直前に一言報告 | ここから不可逆 |
| M6 | civilization-os 移設（任意） | 読み取り専用アーカイブなので急がない。M5 完了後に同手順 | 可逆 |
| K1 | knowledge 統合（別ステップ） | §3.2 案 B。harvest スキル改修とセットで別途計画 | — |

### 5.2 安全策の要点

1. **並走期間**: M4〜M5 の間、新旧両パスが存在する。この間の**編集は新パスのみ**で行い、旧パスは
   読み取り専用扱い（二重編集が最大のリスク）。旧フォルダ直下に `MOVED.md`（新パスへの 1 行案内）を置く。
2. **記憶はコピー・原本不滅**: C-1 のとおり slug ディレクトリは移動でなくコピー。失敗時は旧フォルダで
   起動すれば移設前と完全に同じ状態。
3. **不可逆操作の報告義務**: M5 のリネーム・削除、M2 の壊れフォルダ処分は、実行直前に何をするか
   一言報告してから行う（グローバル CLAUDE.md 規約の踏襲・無言実行禁止）。
4. **pii-output は移行対象外**: 削除保護（F11）。HQ 階層に一切登場させない。

---

## 6. 残課題（本書スコープ外・後続へ）

| 課題 | 担当フェーズ |
|------|-------------|
| 新 repo（ihl-ver3）内部のフォルダ設計 | B3 別紙（`00-フォルダ構成-v3-OSS.md` + 設計書憲法 C1-C6 を出発点に新規最適化 — `ver3-ユーザー裁定-2026-07-10-第2回.md:11`） |
| ダッシュボード実装（layout.json スキーマ確定・かんばん UI） | B7 設計 → Phase C 以降 |
| 夜間ランナー実装（コスト計測・STOP 機構） | B7 設計後に試験導入（F9） |
| K1: D:\notes の knowledge 統合 + harvest スキル改修 | Phase C 以降の別計画 |
| 英語版 | B4 一括生成（日本語正本確定後） |
