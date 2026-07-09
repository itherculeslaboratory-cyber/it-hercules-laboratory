# REPORT: Phase 6 統合実行(ultracode)実行報告書

> 実行日: 2026-07-09 〜 2026-07-10(深夜跨ぎ) / 起票: 2026-07-10
> 前提計画: `PLAN-ultracode-integration.md`
> 実行様式: ultracode(指揮=Fable 5、実行=Sonnet/Opus エージェント群、検証=批評家エージェント群 ※I2/V はユーザー指示により Opus 4.8)
> ステータス: **全変更が未コミット**。commit/push は人間ゲート(§6)。
> コア思想の不可侵条項: ①ランニングコスト最小 ②全ユーザーが改善できる(フォーク文化) / Truth は append-only(削除・上書き禁止)。

---

## ① 実行サマリ(Stage P / R / I1 / I2 / V の成否と証拠)

| Stage | 内容 | 成否 | 証拠 |
|---|---|---|---|
| **P** 前提条件 | unit テスト・環境・前提4項目の機械検証 | **合格(条件付き)** | `unit 299 passed`。前提4項目のうち3項目クリア、`docs/knowledge` のみ未作成 → 計画どおり Stage I2 冒頭(K1)で作成し充足 |
| **R** 調査 | deep-research 統合 + Tier3 精読 + 提案書群 | **合格** | 成果物7点(下表)。批評家 must_fix 2件を修正済み。fatal_contradiction なし |
| **I1** 実装(整地・認証・マジックリンク) | repo-hygiene / login-flow / magic-link | **合格** | 各サブタスク green。**重大バグ2件を発見・修正**(middleware 非活性 / トークン URL エンコード漏れ)。テスト汚染を根治 |
| **I2** 実装(知識層) | K1→K2→蒸留実演→K3 | **合格** | 全段で批評家が一発通過(must_fix ゼロ)。`314 passed`。決定論 ingest の冪等性を実証、本物ストアは無汚染 |
| **V** 検証 | 全テスト / 批評家パネル / 知識層自己証明 / 環境監査 / harvest | **合格(2項目は人間ゲート待ち)** | pytest **338+8 passed** / vitest **51 passed**。自己証明はラウンド1で勝利。build/e2e の最終再実測のみ残存プロセス(§6-12)により保留 — I1 時点の build 成功(全44ルート)・e2e green は実測済み |

### Stage R 成果物(7点)

1. deep-research 統合レポート → `D:\notes\output\deep-research-claude-code-foundation-2026-07.md`
2. Tier3 精読ノート → `D:\notes\output\tier3-deep-read-2026-07.md`
3. `PROPOSAL-docs-reorg-v1.md`(フォルダ構成整理・移行マップ M1〜M10。**適用は人間承認後**)
4. `RTM-requirements-implementation-v1.md` — 167項目、実装率 **34%**(実装57/部分29/未実装41/人間ゲート30/対象外10)
5〜7. science-os 文書成果物3点 → `docs/planning/science-os/`(観点辞書 v0 / 論文テンプレート JSON Schema v0 / AI査読チェックリスト v0)
- 付随: 追加ツール評価(R6): grill-me=**trial** / grill-me-codex=**hold**(二重ベンダー依存がフォーク文化と不整合) / karpathy skills=**reject**(増分価値なし) / PostHog=**trial**(無料枠内、本番は人間ゲート)

### Stage I1 主要成果

- **repo-hygiene**: shim import を60ファイル置換、旧 `apps/ui-parts-lab`(承認済み)+ `apps/ihl-ui-catalog` 削除、w2 の `setup-assets.mjs` パスバグ修正(旧 lab を再生成していた)。
- **login-flow**: 逆導線は既存実装済みと判明(backlog 未更新)。testid 追加 + 新 e2e spec `ihl-login-flow.spec.ts` green。**`middleware.ts` が `src/` レイアウト外にあり Next.js が一度も認証ミドルウェアを登録していなかった重大バグを発見・修正**(未認証で /settings 等が 200 を返していた → 修正後 /home は 307→/login)。
- **magic-link**: 7テスト新設。**トークン URL エンコード漏れの実バグを1行修正**。CRLF ヘッダインジェクションは stdlib 二重ガードで既に安全と実証。
- **テスト汚染の根治**: e2e がローカル Truth ストア(`.ihl-local-r2`)に書き込む構造を発見 → `tests/conftest.py` の autouse fixture で密閉化(IHL_EVENT_ROOT/IHL_R2_LOCAL_ROOT → tmp)。残渣183+15ファイルを隔離(削除せず移動、MANIFEST 付き)。

### Stage I2 主要成果(すべて批評家一発通過)

- **K1**: `docs/knowledge` 骨格 + topics 5ページ(OKF v0.1、index 乖離ゼロ、Citations 全実在)。
- **K2**: 決定論 ingest CLI `tools/knowledge_ingest.py` + 7テスト。冪等性(2回目0件)・post_append 追記・state 破損時の二重防止を実証。モデル/ネットワーク呼び出しゼロ。
- **蒸留実演**: 本物 scan=0件(board/research ストリーム無し)を確認の上、tmp バンドルで合成3イベント → 蒸留1サイクルを規約完全準拠で実証。本物バンドルは無汚染(log.md に Ingest 0件のみ記録)。
- **K3**(Go 承認済み): 検索梯子 `tools/knowledge_search.py` + `embed_text` dummy(Protocol 拡張)。実バンドル5問で「開くファイル1個・正しい節に着地」。新規依存ゼロ。`314 passed`。

---

## ② 全テスト結果(V 最終実測、2026-07-10)

| 区分 | 実測値 |
|---|---|
| pytest tests/unit + tests/integration | **338 passed, 0 failed, 1 skipped**(6.4s) |
| pytest tools/tests | **8 passed**(0.1s) |
| vitest(apps/web) | **9 files / 51 tests passed**(0.9s) |
| npm run build | **I1 統合検証時点で成功(全44ルート)**。最終再実測は残存 node プロセス(PID 16912)の `.next/trace` ロックで EPERM — §6-12 の人間ゲート後に再実行 |
| Playwright e2e | **I1 修復後: ihl-login-flow / ihl-auth-home / ihl-smoke / ihl-observation-ver2 green**。`ihl-observation-ver1` のみ失敗(プロダクト判断待ち §6-8)。最終再実測は同上の理由で保留(EADDRINUSE :3000) |
| 参考: Stage P 開始時 | unit 299 passed(本実行で +39 テスト追加) |

---

## ③ 批評家パネル判定ログ(V2、3レンズ・severity 付き・フレッシュコンテキスト)

3レンズ全てで指摘あり。**must_fix 3件は全件適用済み(3/3、関連テスト green)**。

### レンズ1: 回帰 — pass: false(high 1 / medium 1 / low 2)

| severity | ファイル | 指摘要旨 | 対応 |
|---|---|---|---|
| **high** | `apps/web/src/middleware.ts` | 移動は「挙動保存」ではなく、**一度も実行されていなかった middleware を本番で初めて有効化する変更**。本番(`@cloudflare/next-on-pages`)でも旧配置は無効だったため、反映すると認証挙動が「全ルート無認証通過」→「whitelist 以外 /login リダイレクト」へ反転する。移動自体は正しい修正だが、公開必須ルートの whitelist 監査が本番反映前に必要 | 移動は維持。**人間ゲート §6 補足に明示** |
| medium | 同上 | 活性化した middleware が `/health` を 307→/login に落とす(matcher がドット無しパスに一致、BYPASS に /health が無い) | **適用済み**: BYPASS_PATH_PREFIXES に `/health` 追加(1行) |
| low | 同上 | `/board` や `/individuals/[id]/qr` が未ログインで保護される — 公開閲覧の意図なら誤保護 | Scope A の範囲確認(人間) |
| low | 同上 | ログイン済みで `/login?token=` を開くと token 消費前にリダイレクト(既存ロジックの初活性化) | 軽微・記録のみ |

### レンズ2: 設計整合 — pass: false(high 1)

| severity | ファイル | 指摘要旨 | 対応 |
|---|---|---|---|
| **high** | `libs/ihl/env/csv_import.py` | コミット済み `1de5935` の `_aggregate_buckets`(tumbling window + 衝突バンプ)が **ADR-H-35 §1(冪等再取り込み)** と **FR-ENV-11(自然キー `(device_id, bucket_start_unix)`・clock-aligned 5分バケット・最終行 wins)** に矛盾 — CSV 開始オフセットで自然キーが変わり冪等性が壊れる | **適用済み**: clock-aligned floor + 最終行 wins へ復帰、`tests/unit/test_csv_import.py` を clock 意味論へ修正。**指揮者(Fable 5)が FR-ENV-11 原文(01-要件/13-データ取得元管理.md:109)と突合し正当性を確認済み。ただしコミット済み挙動の変更のため人間レビュー必須(§6-13)** |

### レンズ3: 知識層規約準拠 — pass: false(medium 2 / low 1)

| severity | ファイル | 指摘要旨 | 対応 |
|---|---|---|---|
| medium | `tools/knowledge_ingest.py` | 「保存=index追記の不可分」がコード上未強制 — `_append_index_row` が新規作成ブランチ内のみで、中断時に本文だけの孤立ページが index に載らない | **適用済み**: index 突合をループ毎回実行(idempotent 追記)へ変更、DESIGN §8 不変条件を回復 |
| medium/low | docs/knowledge ほか | (Stage I2 advisory と同旨: shooting-chamber の絶対パス Citations、将来の research id サニタイズ等) | advisory として記録(§7-6) |

---

## ④ 知識層自己証明の比較表(V3)

決定論検索梯子(ladder) vs ベタ読み(base、フレッシュ探索)。同一5問・同一モデル(Sonnet)・審判 Opus。**ラウンド1で勝利したため最適化ラウンドは不要だった**(最大3ラウンド設計)。

| 指標 | 梯子 | ベタ読み | 差 |
|---|---|---|---|
| 正確性(10点満点) | **9** | 6 | +3 |
| 読解量(文字) | **9,350** | 63,200 | **約 1/6.8**(勝利条件は 1/2 以下) |
| 開いたファイル数(計) | **5** | 17 | 約 1/3.4 |

| # | 設問 | 梯子 | ベタ読み | 梯子文字 | ベタ文字 |
|---|---|---|---|---|---|
| 1 | 環境スナップショット保存値と light_level | 1 | 2 | 700 | 18,000 |
| 2 | 類似検索リランク重み(ADR-H-12) | 2 | 0 | 900 | 100 |
| 3 | 知の広場の3柱とステータス | 2 | 2 | 2,650 | 17,000 |
| 4 | PaperSectionsV1 の節構成とギャップ節の LLM 役割 | 2 | 2 | 2,700 | 28,000 |
| 5 | 標準撮影チャンバーの仕様 | 2 | 0 | 2,400 | 100 |

> 設問2・5 はベタ読みが該当文書に到達できず 0 点 = 梯子の最短到達が効いた問。設問1 のみ梯子が周辺情報を取りこぼした(唯一の逆転、index 改善候補)。**Second Brain 原則5 の自己検証に合格**(Stage R 補正済みの現実的閾値「2倍以上削減」を大きく超過)。

---

## ⑤ 環境監査(V4、ケース4形式)

過去監査は `D:\notes`・`docs/planning/audits` に存在せず、**本監査が初回=ベースライン**(before/after 表は次回から)。

### スキル分類: 5スキル全て **keep**(merge/delete 該当ゼロ)

### 6観点スコアカード(5点満点): **総合 26/30**

| # | 観点 | スコア | 主な所見 |
|---|---|---|---|
| 1 | 常時ロードメモリ | 5/5 | CLAUDE.md 4本 計225行、全て上限内・load-bearing |
| 2 | 古いポインタ | 5/5 | 全参照パス実在確認、stale pointer ゼロ |
| 3 | 重複と矛盾 | 4/5 | 矛盾ゼロ。Truth append-only 等の意図的ミラー重複のみ |
| 4 | スキル | 4/5 | git-wrapup / ui-mockup-to-screendef に repo 固有実例のハードコード |
| 5 | MCP/ツール | 4/5 | MCP 0件=税なし。obsidian バンドルの未使用スキル分が説明コンテキストを占有 |
| 6 | 安全性 | 4/5 | 平文シークレットゼロ。`.claude/verify.cmd` 未配置(グローバル規約の推奨未充足) |

**修正候補トップ3**: ① `.claude/verify.cmd` 新設 ② git-wrapup の repo 固有規約の外出し ③ 重複ルールの正本化。

---

## ⑥ 人間ゲート一覧

| # | ゲート | 状態 |
|---|---|---|
| 1 | K3 Go | **消化済(実行済)** |
| 2 | 知の広場ゲート | PROVISIONAL 継続(本実行は docs/tools 層のみで尊重) |
| 3 | W2 再開判断 | 未判断 |
| 4 | SMTP 本番鍵の投入と実送達確認 | 未判断(テストはモックで整備済み) |
| 5 | GMO 本番 | 未判断 |
| 6 | commit・push 判断 | **全変更が未コミット(git status 122行)** |
| 7 | PROPOSAL-docs-reorg-v1 の適用承認 | 未判断 |
| 8 | e2e `ihl-observation-ver1` の仕様判断(IoT 行デフォルトの UX 変更 vs 回帰) | 未判断 |
| 9 | w2 ゲート監査スクリプト2本(`ihl-quantum-w2-preflight.mjs` / `w2-gates-wave5-run.mjs`)の旧 lab 参照の扱い | 修正済みだが再利用方針は未判断 |
| 10 | PostHog・grill-me の trial 実施判断 | 未判断 |
| 11 | `claude -p` 課金仕様の一次情報確認(動画間で主張が矛盾、未確定事実として扱うこと) | 未判断 |
| 12 | **残存 node プロセス(PID 16912、apps/web の next server)の終了 → `npm run build` と全 e2e の最終再実測** | 未実施(自動終了は権限分類器が人間判断案件と判定) |
| 13 | **csv_import 差し戻しのレビュー** — コミット済み `1de5935` を FR-ENV-11/ADR-H-35 準拠へ戻した(§3 レンズ2)。要件原文との突合済みだが、PLAN-fix-csv-import の意図と要件の解釈が異なる場合は裁定を | 未判断 |
| 14 | middleware 有効化に伴う**本番認証反転**の whitelist 監査(公開必須ルート: observation Scope A、/login /register /terms /language、/board・QR の公開要否) | 未判断・**本番反映前に必須** |

---

## ⑦ 次の一手の推奨

1. **§6-12 → §6-14 → §6-6 の順で消化** — 残存プロセス終了 → build/e2e 最終確認 → 認証反転の whitelist 監査 → 認証反転を明示した記述で commit。
2. **§6-8 の仕様裁定** — `ihl-observation-ver1` の IoT 行デフォルトを裁定し spec を green 化。
3. **§6-13 の csv_import レビュー** — FR-ENV-11 原文どおりなら現状(clock-aligned)で確定。
4. **環境監査トップ3の消化** — 特に `.claude/verify.cmd` 新設(以後の Edit/Write で自動検証が発火)。
5. **K4 / W2 準備状況**: 知識層は自己証明合格・ingest/検索とも稼働状態。RTM(バックログ70件)と PROPOSAL-docs-reorg が次期計画の正本になる。W2 再開判断(§6-3)と知の広場ゲート(§6-2)が揃えば K4(知の広場 UI)起案可能。
6. **advisory の消化(任意)**: research id サニタイズ(research パイプライン実装時)、shooting-chamber Citations の相対化、viewpoint_vector への canonical_id 追加 ADR。

---

## 付録: harvest 記録

- 汎用知見 → `D:\notes\wiki\gated-workflow-operating-lessons.md`(批評家ゲート実測 / テスト汚染の教訓 / 「整地が暴く潜在バグ」/ モデル分業の実際)
- IHL ドメイン知見 → `docs/knowledge/topics/research-notes-model.md`(science-os 3成果物の位置づけ)+ `open-questions.md`(RTM ギャップ・運用の教訓)
- 実行統計: Workflow 5本(Stage R=32 / I1=14+2 / I2=8 / V=24 エージェント、計 **80 エージェント・エラー0**)、サブエージェント総トークン約 520万

*数値・判定はすべて各エージェントの実測報告に準拠。データに無い項目は記載していない。*
