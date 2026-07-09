# HANDOFF: ver3 Phase A(要件抽出)への引き継ぎ

> 作成: 2026-07-10(Phase 6 完了セッションより)。次セッションはまずこのファイルと intent 原文を読むこと。
> intent 原文: `D:\Programs\追加アイディア\# intent ユーザーの最終指示(そのままAIに渡すことを想定).txt`
> intent は「やりたいことのまとめ」であり厳密仕様ではない — より良い完成度のための逸脱提案は歓迎される。

## 1. ミッション(Phase A のみ)

資料の分類・信頼度付与 → ver1/ver2 差分解析 → **「ver3 システム要件定義抽出書」を重要度順で作成** → Phase B 計画(PLAN-ver3-*.md)提示 → **停止してユーザー承認を待つ**。実装・Phase B 着手は承認後。

ユーザーの明示チェックポイントは抽出書1点: 「私の思想のシステムはどういうものか理解できているか、その文書でチェックする」。

## 2. intent の正誤表(このセッションで実測済みの訂正)

| intent の記載 | 実際 |
|---|---|
| `D:\Programs\cursor`(全セッション見れるはず) | **アプリ本体のインストールフォルダ**(1.7GB、Cursor.exe/locales 等)。セッション実体は `C:\Users\sawad\AppData\Roaming\Cursor\User\globalStorage`(**4.1GB**、state.vscdb = SQLite。chat/composer データはここ)と `...\User\History`(49MB)、`...\User\workspaceStorage`(9MB)。読み出しは SQLite クエリが必要(read-only で開くこと) |
| `docs/rtm/backlog-70-items.md` | 実在しない(例示)。実体は `docs/planning/claude-plans/RTM-requirements-implementation-v1.md`(167項目、バックログ候補70件、人間ゲート30件) |
| YouTube 6本を調査 | **全て字幕取得済み** `D:\claude\yt-transcripts\`(計21本+manifest.md)。JirDfgJcJFU / PW0sgog3kXY / glAoiBWVkmU / HRw-vP0j8OM は既存19本ノートで要約済み(`D:\notes\output\youtube-claude-code-knowledge-2026-07.md`、Tier3 深掘りは `tier3-deep-read-2026-07.md`)。新規2本: hm4aFfaf0FA(**日本語**動画・業務設計術)、gsvZn4nbFus(Fable 5 + GPT 5.6 Sol 対比) |

## 3. 入力インベントリ(実測 2026-07-10)

| ソース | 規模 | 信頼度の扱い |
|---|---|---|
| `…\clean-dataset\Copilot` | 2ファイル / 44MB(巨大エクスポート) | 中〜高(要件整理の対話ログ) |
| `…\clean-dataset\Keep` | 2,660ファイル / 128MB | 中(メモ群、日付重み付け) |
| `…\clean-dataset\雑多テキスト` | 26ファイル / 88KB | **低信頼固定**。cursor 指示下書き混在。由来要件は人間確認候補に分離 |
| Cursor セッション(上記 AppData) | 4.1GB SQLite | 中。抽出は決定論スクリプト(read-only)推奨 |
| ver1 `D:\Programs\civilization-os` | — | **読み取り専用**(編集禁止は CLAUDE.md 禁止事項) |
| ver2 = 本リポジトリ | 01-要件 29本 / RTM 167項目 | 高(正本) |
| `D:\Programs\追加アイディア\` その他 txt | 科学OS原典ほか | 高(DESIGN-science-os-integration.md に統合済み) |

## 4. 既に在る資産(再作成しないこと)

- **知識層**: `docs/knowledge/`(topics 5ページ、検索梯子 `python tools/knowledge_search.py "<質問>"` — 自己証明済みで読解量 1/6.8)。ingest は `tools/knowledge_ingest.py`
- **RTM**: 上記 v1(実装率34%)。intent の指示どおり「ver2 延命でなく ver3 のインプット」として再構成する
- **設計書**: `docs/planning/claude-plans/DESIGN-*.md` 3本(土台/サブブレイン/科学OS)、science-os 成果物3点(観点辞書/テンプレJSON Schema/AI査読チェックリスト)
- **Phase 6 実行報告**: `REPORT-ultracode-phase6-2026-07-09.md`(参照レポートIDとしてコミットメッセージに使える)
- **認証境界の正本**: `AUTH-ROUTE-MATRIX-v1.md`
- **docs 整理**: PROPOSAL-docs-reorg-v1 は M1/M3/M5/M8/M9 適用済み・5件見送り(理由記載済み)

## 5. 環境メモ

- python は PATH 未登録: `C:\Users\sawad\AppData\Local\Programs\Python\Python312\python.exe`(サブエージェントにも明示)
- yt-dlp 2026.07.04 + curl_cffi 導入済み(`python -m yt_dlp --impersonate chrome`。429 対策済み)
- `.claude/verify.cmd` 稼働中: リポジトリ内の Edit/Write ごとに unit テスト(約6秒)が自動実行される
- e2e はローカル Truth ストア(`.ihl-local-r2`)に書き込む。unit は conftest で密閉済み。e2e 後の残渣と port 3000 の残存 node に注意
- PII 原本(`情報\pii-output` の元データ)は読み取り専用。clean-dataset のみ使用
- commit/push 許可済み。ただしコミットメッセージに「自律実行理由」と「参照レポートID」を含める(intent の commit_policy)

## 6. 抽出書の仕様(ユーザーのチェック観点を満たすこと)

`docs/planning/ver3/ver3-要件定義抽出書-v1.md`(日本語。英語版は Phase B)として作成:

1. **重要度順**(事業価値 × 依存関係 × 実装難易度 × ユーザー影響でスコアリング、根拠を明示)
2. 冒頭に**思想の言語化**(この文書でユーザーは理解度を検査する): ①10年続くランニングコスト最小(R2・保存最小化・決定論優先・使われた瞬間だけ発行) ②全ユーザーが改善できるフォーク文化(GitHub 正本、単一ベンダー非依存) ③Truth append-only(削除・上書きしない) ④人間ゲート文化(不可逆・公開・金銭は人間が裁定) ⑤検証されないものは納品されない(批評家ゲート) — これらを「要件の背後にある不変条項」として要件と紐付ける
3. 出典と信頼度を各要件に付与(雑多テキスト由来は「人間確認候補」節に分離)
4. **intent からの逸脱提案**の節(より良い完成度のための代替案。intent 自身が許容)
5. 抜け・曖昧・矛盾の一覧(ver1 vs ver2 差分解析の未解決矛盾を含む)
6. RTM 167項目との整合(受け入れ基準)

## 7. Phase B(承認後)の想定スコープ

最終要件定義書(日英)→ 設計書3種(AI用/一般人用/開発者用、日英)→ ver3 開発計画(K4/W2、W2 再開判断の提案を含む)→ 動画量産パイプライン設計 → deep-research 技術選定(根拠5件以上)→ wiki 分割統合設計 → 改善ループ/KPI 設計。※動画パイプラインの実装(YouTube API 投稿)は設計まで — 実運用開始は人間判断。

## 8. キックオフプロンプト(ユーザー貼り付け用)

```
ultracode +1500k. docs/planning/ver3/HANDOFF-ver3-phase-a.md と
D:\Programs\追加アイディア\「# intent ユーザーの最終指示(そのままAIに渡すことを想定).txt」を読み、
Phase A(要件抽出)を実行してください。
成果物: ver3 システム要件定義抽出書(重要度順、思想の言語化つき)+ Phase B 計画(PLAN-ver3-*.md)。
提示したら停止して私の承認を待つこと。可逆なステップで許可を求めて止まらないこと。
完了と報告する前に自分の成果物を検証すること(批評家ゲート必須)。
```
