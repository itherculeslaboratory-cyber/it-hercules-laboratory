# W2 LAB — スコアキャリブレーションログ

> **正本**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **更新規則**: **append-only** — 行の削除・改ざん禁止。訂正は新行で上書き理由を記載。

---

## 使い方

1. ユーザーが [`sessions/*-score-session-vN.md`](./sessions/) §4 に採点を記入したら、**1 feedback ラウンド = 1 行** を本表末尾に追加する。
2. **delta** = ユーザー TOTAL − エージェント TOTAL（各軸も同様: user − agent）。
3. \|TOTAL delta\| ≥ 10 のとき **lesson learned** と **rule added** を必須（CAL-03）。
4. 次セッションのエージェントは直近 **3 行** を自己採点前に引用（CAL-02）。

### TOTAL 算出（v1 正）

```text
TOTAL = 0.25 × STRUCTURAL + 0.50 × DESIGN-FULFILLMENT + 0.25 × UX
```

---

## ledger

| date | feature / walkId | session# | agent S/D/U/T | user S/D/U/T | delta S/D/U/T | feedback summary | lesson learned | rule added |
|------|------------------|----------|---------------|--------------|---------------|------------------|----------------|------------|
| 2026-07-05 | 01 HOME | v1 | 95 / 85 / 88 / **88**† | TBD / TBD / TBD / **TBD** | TBD | 初回セッション — ユーザー採点待ち。6 問: 密度·副CTA·要約4枚·空文案·mock vs Charter·採点 | — | — |
| 2026-07-05 | 01 HOME | v1-completed | 95 / 85 / 88 / **88** | 15 / 5 / 10 / **10** | -80 / -80 / -78 / **-78** | 10/100「ゴミ」— マイページ×3 · 好み学習折りたたみ隠蔽 · ふざけてる | duplicate profile nav · missing preference learning · over-scored DESIGN-FULFILLMENT | ホーム左ナビ oracle = `ナビ・ホーム.md` §3 · 好み学習常時 · マイページ1箇所のみ |
| 2026-07-05 | 01 HOME | v2-completed | 75 / 45 / 50 / **52** | 25 / 15 / 20 / **30** | -50 / -30 / -30 / **-22** | 30/100 — 貢献度要る？ · 設計書読め · 検索だけボタン | 貢献度を折りたたみに押し込み（§3 #1 左ナビ常時）· 検索を outline 孤立（§3 #3 同等CTA+左ナビ） | 貢献度=§3 #1左ナビ+#2要約カード · 検索=左ナビ+同等CTAペア · mock hotspot 参照 |
| 2026-07-05 | 01 HOME | v3-v4-feedback | 70 / 35 / 40 / **42** | TBD / TBD / TBD / **TBD** | TBD | v3c stat/PT修正後 — 「ホームに貢献度意味わからん」· 設計処理化弱い | draft §3 #1 nav≠user gate · agent design note≠oracle · PT invent | **左ナビ貢献度削除** · マイページ(P)のみ · [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md) · [`ihl-w2-design-doc-oracle.mdc`](../../.cursor/rules/ihl-w2-design-doc-oracle.mdc) |
| 2026-07-05 | 01 HOME | v4-completed | 80 / 72 / 74 / **74** | 65 / 55 / 62 / **60** | -15 / -17 / -12 / **-14** | 60/100 — 「その他の機能」削除 · フッター4（愚痴/改善提案/投票/Builder）· 80点目標 | §3 #3b を fold に押し込み誤り · 文脈バー=フッター固定（ADR-H-14） | **fold 完全削除** · **footerBar 4 リンク** · §3 #3b citation 必須 · user gate: 投票≠画面テンプレ |
| 2026-07-05 | 06 マーケット / 06a | v2-completed | 78 / 62 / 58 / **64** | 25 / 30 / 35 / **30** | -53 / -32 / -23 / **-34** | 30/100 — 5タブ過密 · 検索なし · 好み新着順なし | agent ~64 過大 · 草案三柱≠user browse tabs · filters≠search | **06a browse = 3タブ**（オークション統合/抽選/PT優先）· **検索input必須** · **好み新着順既定** · design note v3 user gate |
| 2026-07-06 | 10 好み学習 / 10 | v1-completed | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **90** | TBD | ユーザー 90/100 — pairwise · profile · 検索に反映 Go | preference-first フロー検証可 · 05a IMPL ゲート解除 | [`05-検索-PREFERENCE-FIRST-v1`](./05-検索-PREFERENCE-FIRST-v1.md) · mock profile → 05a sort |
| 2026-07-06 | 05a 観測検索 / 05a | v2-filter-ux-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **~90→回帰** | TBD | **FAIL（新規採点なし・#10=90 から回帰）** — notes verbatim:「ふざけだ実装をするな」·「統一と、使いまわしをしろ」— カルマ/評価だけ別UI · 説明常時表示 · mount自動プロフィル · 「金額条件を追加」 | 統一=NumericFilterRow 1本 · details折りたたみ · 好み学習を読み込む明示 · 空欄=未適用 · UIbuilder再利用 | **CAL-05-SRCH-02** · [`W2-UI-BUILDER-COMPONENT-RULES-v1`](./W2-UI-BUILDER-COMPONENT-RULES-v1.md) · フィードバックループ必須 |
| 2026-07-06 | 05a 観測検索 / 05a | v2-filter-direction-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **~90→回帰** | TBD | **FAIL** — 「なんで以上以下を選べるように統一していないの？」— カルマ/評価だけ方向 `<select>` 欠落 · `以上` 固定 span | trust を「min gate のみ」と誤分離 · `showDirection` で karma/rating 除外 · CAL-05-SRCH-02 / U2 違反 | **全 NumericFilterRow キーに方向セレクタ** — 例外なし · `passesTrustFilters` は gte/lte/near 対応 |
| 2026-07-06 | 05a 観測検索 / 05a | v3-direction-ux-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **~90→回帰** | TBD | **FAIL** — 方向 `<select>` で現在値が見えない · 「以上/以下/付近」が dropdown 内に隠れる | native select は状態不可視 · chip+menu で現値常時表示 | **CAL-05-SRCH-04** · `DirectionControl` chip · REQ/DET 前に invent 禁止 |
| 2026-07-06 | 05a 観測検索 / 05a | v3-rating-scale-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **~90→回帰** | TBD | **FAIL** — 「評価（1–10）じゃないだろ？」— 1–10 を REQ/DET 未参照で invent | 正本=★1–5 平均（ADR-H-08 · 06 §11 Y08 · MarketDetailBoardW2 · profile metrics） | **CAL-05-SRCH-03** · `SELLER_RATING_SCALE_MAX=5` · mock sellerRating 1–5 · §12 #8 |
| 2026-07-06 | 05a 観測検索 / 05a | v1-impl | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **TBD** | TBD | ObsSearchW2 新規 · 好み近い順 · profile 帯 · フィルタ配線 | 10=90 後 user Go · catalog scaffold 20pt → W2 override | [`05-検索-LAB-DESIGN-NOTE-v1`](./05-検索-LAB-DESIGN-NOTE-v1.md) §5 gap 更新 |
| 2026-07-06 | 05a 観測検索 / 05a | v4-rating-domain-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **0** | TBD | **FAIL** — 「マーケット評価（取引評価平均 ★1–5）未入力 / — / ▾」ゴミ UI · 星フィルタ invent · 未入力+—+孤立▾ | ADR-H-08=良い/普通/悪いドメイン · 短ラベル+details · 良い率% · 空欄=体長行と同型 · DirectionControl常時可視 | **CAL-05-SRCH-06** · 良い率=good/(g+n+b) · 悪い除外=bad≥1∧良い率≤50% |
| 2026-07-06 | 05a 観測検索 / 05a | v5-count-karma-layout-FAIL | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **TBD** | TBD | **FAIL** — カルマ0–200 invent · マーケット評価%1行はADR-H-08違反 · 数値入力幅で方向chip切れ | カルマ=−100〜+100（ADR-H-08）· 良い/悪い=件数2行（以上/以下/付近）· 入力5rem+chip min-width · 悪い除外=bad≥1 | **CAL-05-SRCH-07** · `market_good_count`/`market_bad_count` · `passesTrustFilters` 件数ベース |
| 2026-07-06 | 05a 観測検索 / 05a | v6-exclude-threshold | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **TBD** | TBD | 悪い評価のある出品者を除外 — しきい値 bad≥1→**bad≥5∨karma≤0** | `EXCLUDE_LOW_RATED_BAD_MIN=5` · `passesTrustFilters` · checkbox hint 同期 | **CAL-05-SRCH-08** |
| 2026-07-06 | 05ctx 観測コンテキスト / 05ctx·05a | user-gate-recorded | — / — / — / **—** | — / — / — / **—** | — | **user gate 記録のみ（未採点）** — 購読モデル（亜種/種・複数）· 05a=購読リストのみ·last_picked·3タブ全実装·横断（05tl/UI tmpl/タグ） | WorkflowContext≠検索のみ · 05ctx/05a 責務分離 | [`05-観測コンテキスト-USER-GATE-v1`](./05-観測コンテキスト-USER-GATE-v1.md) · §0.1/§13 05-検索 note |
| 2026-07-06 | 05ctx 観測コンテキスト / 05ctx·05a | v1-impl-go | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **TBD** | TBD | **IMPL Go 実装完了** — ObsContextPickerW2 新規 · 購読 localStorage · 3タブ · 05a 購読select · last_target 記憶 · build PASS | 05ctx/05a registry 分離 · context v1 → localStorage · 購読パーティション外は非表示 | **CAL-05-CTX-01** · `ihl.observation.subscriptions.v1` · `ihl.observation.last_target.v1` |
| 2026-07-06 | 05ctx 観測コンテキスト / 05ctx | v3-user-0-fix | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **0** | TBD | **0/100** — 段階（卵/幼虫/蛹/成虫/不明）要らない · YouTube/チャンネル登録は比喩のみでUI禁止 · 学名検索~60点OK · 質問で絞る=Akinator未実装 · 分類ツリー=フラットで使いにくい | YouTube比喩を製品UIに露出 · 段階は05ctx不要（05iで）· QA=決定木+残りN候補 · ツリー=展開/パンくず/検索 | **CAL-05-CTX-03** · [`05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1`](./05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1.md) · 観測対象の登録/登録済み対象 |
| 2026-07-06 | 05ctx 観測コンテキスト / 05ctx | v3-post-Akinator-tree | TBD / TBD / TBD / **TBD** | TBD / TBD / TBD / **100** | TBD | **100/100** — ユーザー確定「いつもこれくらい」· 段階 UI 削除 · IHL 用語（YouTube 比喩 UI 禁止）· 質問で絞る=Akinator 逐次 Q&A + 残り N 候補 · 分類ツリー=展開/折りたたみ/パンくず/検索 · chrome 修正 | 0pt verbatim → research doc → 実装の順が有効 · 比喩≠製品コピー · スコープ外 UI は削除 · 既存パターン（05a NumericFilterRow）と同型の統一 | **CAL-05-CTX-04** · [`W2-SUCCESS-PATTERNS-v1.md`](./W2-SUCCESS-PATTERNS-v1.md) §1 · arc: **CAL-05-CTX-01**（impl）→ **CAL-05-CTX-03**（0pt）→ 本行 |
| 2026-07-06 | 07 掲示板 / 07a | v1-impl-go | 95 / 92 / 88 / **~91** | TBD / TBD / TBD / **TBD** | TBD | **IMPL Go** — BoardHubW2 専用実装 · catalog scaffold 廃止 · mock 4 カード/4 タブ · 状態 4 種 · W2GlobalChrome 単一フッター · 愚痴 primary CTA | ハブに active タブなし · BoardHubShortcuts/争い部屋/二重 HOME 削除 · board shared コンポーネント再利用 | **CAL-07-HUB-01** · [`07-掲示板-LAB-DESIGN-NOTE-v1`](./07-掲示板-LAB-DESIGN-NOTE-v1.md) · target user **100** |
| 2026-07-06 | 07 掲示板 / 07a | v2-user-3-research | TBD / TBD / TBD / **~91** | TBD / TBD / TBD / **3** | TBD / TBD / TBD / **~-88** | **3/100** — 愚痴/改善/論文/その他が重複して見える · 5ch 型 BBS の要件調査を要望 | 設計 doc がタブ+カード同時 MUST · mock も同型 · 5ch=階層ごと1ナビ層 · タブは板内(07g)の責務 | **CAL-07-HUB-02** · [`07-掲示板-BBS-PRIOR-ART-v1`](./07-掲示板-BBS-PRIOR-ART-v1.md) · ハブ=カードのみ案 · user gate Q1–Q6 |
| 2026-07-06 | 07 掲示板 / 07a | v3-bbs-fix-go | TBD / TBD / TBD / **~92** | TBD / TBD / TBD / **TBD** | TBD | **user Go** — `BoardTabs` 削除 · `BoardCrumb` 削除 · カード2×2単一ナビ · 論文→`09` · build PASS | 5ch 板リスト型 · パンくず chrome 1 行 · 愚痴=カード+主CTA+フッター（ADR-H-14）· P3 research→fix | **CAL-07-HUB-03** · [`07-掲示板-LAB-DESIGN-NOTE-v1`](./07-掲示板-LAB-DESIGN-NOTE-v1.md) §8 |
| 2026-07-06 | 07 掲示板 / 07g·07b·07o·09 | v4-boards-impl-go | TBD / TBD / TBD / **~95** | TBD / TBD / TBD / **TBD** | TBD | **user Go「全部やって」** — `BoardThreadListW2` 共有 · 4 タブ+左ナビ+スレ一覧 · 09 case チップ · 状態 4 種 · registry 専用上書き · build PASS | 5ch 板内画面型 · ハブと役割分離 · `board-config` mock · 09=論文板一覧（09t 二次導線）· P5 統一コンポーネント | **CAL-07-BOARDS-01** · [`07-掲示板-LAB-DESIGN-NOTE-v1`](./07-掲示板-LAB-DESIGN-NOTE-v1.md) §9 |

**脚注**

- † エージェント TOTAL **88** = v1 式 `0.25×95 + 0.50×85 + 0.25×88` ≈ 88.3。旧 interim 式（45/30）では ≈ **87** — 参照: [`01-ホーム-LAB-REVIEW-v1.md`](./01-ホーム-LAB-REVIEW-v1.md) §3。
- **session ファイル**: [`sessions/01-ホーム-score-session-v1.md`](./sessions/01-ホーム-score-session-v1.md)
- user 採点記入後: 上記行を **訂正せず** 新行を追加するか、TBD セルを埋めた更新行を末尾に追加（推奨: 新行で v1-completed として追記）。

---

## 集計メモ（任意 · 手動更新）

| 指標 | 値 |
|------|-----|
| 完了セッション数 | 3（user 採点済: v1 · v2 · **v4** · delta -14） |
| 平均 \|TOTAL delta\| | — |
| 最多 taxonomy | — |

---

*append-only · v1 開始 2026-07-05*
