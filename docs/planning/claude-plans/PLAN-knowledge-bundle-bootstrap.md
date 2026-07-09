# PLAN K1: knowledge バンドル骨格の新設(docs/knowledge)

前提設計: `DESIGN-subbrain-knowledge-layer.md`(必読)。スコープは **docs/ 配下のみ** — コード・API・UI に一切触れないため、知の広場の実装禁止ゲートに抵触しない。

## ゴール

`docs/knowledge/` に OKF v0.1 準拠のエージェント維持型 Wiki バンドルの骨格を作り、既存の知識(設計 doc・観測ドメイン辞書・board カテゴリ)から最初のトピックページ群を蒸留する。

## 触るファイル(すべて新規、docs/knowledge/ 配下)

```
docs/knowledge/
├── index.md          # 全ページ1行カタログ(name | link | 一文説明)
├── log.md            # ## YYYY-MM-DD 見出し + **Ingest**/**Lint**/**Creation** エントリ
├── CLAUDE.md         # バンドル規約(下記)
├── topics/           # 最初の5ページ(下記)
├── sources/          # 空(index.md のみ。K2 の ingest が書く場所)
└── open-questions.md # ギャップ・矛盾・次に調べること
```

## CLAUDE.md に書く規約

- OKF frontmatter 必須(type: Topic | Source | Question、title、description、tags、timestamp)。D:\notes と同じ規約(相互運用のため)
- リンクはバンドル相対(`/topics/xxx.md`)。壊れリンクは「未執筆の知識」として許容
- **保存とインデックスは不可分**: ページを作成/改名したら同じ変更で index.md に1行追加/修正(乖離禁止 — Second Brain 原則4)
- wiki ページは Truth イベントや doc への引用を `# Citations` 節に必ず持つ(出典なしの主張禁止)
- 更新は log.md に記録。月次 Lint(矛盾・孤立・古い記述チェック)も log に残す

## 最初の topics 5ページ(既存資産からの蒸留)

各ページは対象 doc を読んで要点を蒸留し、原典への相対リンクを Citations に:
1. `topics/breeding-environment.md` — 飼育環境の知識(`schemas/dictionaries/observation_target_domain.yaml`、env 系 doc から)
2. `topics/observation-pipeline.md` — 観測→検索の仕組み(capture/embedding/scoring の設計要点)
3. `topics/knowledge-plaza.md` — 知の広場3柱と汎用引用の設計要約(`docs/planning/w2-checkpoint/知の広場-仮採用-MASTER-v1.md` と `-04-汎用引用-v1.md` から。PROVISIONAL である旨を明記)
4. `topics/research-notes-model.md` — 論文6節スキーマと append-only 研究フロー(`知の広場-仮採用-02-論文-v1.md`、ADR-H-09)
5. `topics/shooting-chamber.md` — 標準撮影チャンバー仕様(D:\notes\projects\2026-07-shooting-chamber.md を出典に。D:\notes 側と相互リンク)

## エッジケース(弱いモデルが見落とす点)

- 知の広場 doc は **PROVISIONAL** — 「決定済み」と書かず「仮採用(ゲート中)」と正確に表現すること
- 日本語ファイル名は使わない(スラグは kebab-case 英語、title に日本語)
- 既存 `docs/` の他ディレクトリ(01-要件, 02-設計 等)は変更しない。knowledge から一方向リンクのみ
- repo の CLAUDE.md(ルート)には knowledge バンドルの存在を1〜2行追記してよい(読む順の末尾に)— それ以外は触らない

## 受け入れ条件

- [ ] 上記ファイルツリーが存在し、全コンセプトページに type frontmatter(OKF §9 conformance)
- [ ] index.md に全ページが1行ずつ載っている(実ファイルと突合して乖離ゼロ)
- [ ] 各 topics ページの Citations に実在する原典パス(リンク切れゼロ)
- [ ] log.md に Initialization エントリ
- [ ] git status で docs/knowledge/ とルート CLAUDE.md 以外に変更がない
