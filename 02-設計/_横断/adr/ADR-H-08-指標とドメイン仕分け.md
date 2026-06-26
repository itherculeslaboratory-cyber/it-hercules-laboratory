# ADR-H-08: 指標とドメイン仕分け（カルマ / 貢献度＋研究スコア内訳 / マーケット評価）

> **ステータス**: 採用（人間確定）  
> **決定日**: 2026-06-07  
> **判断 ID**: H-08-metrics-domain  
> **出典**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア` §5–6（Contribution / Coin / PT / Research Score 分離）+ ユーザー確定（2026-06-07）  
> **正本**: 本 ADR · [`08-カルマシステム.md`](./08-カルマシステム.md) · [`14-貢献度.md`](./14-貢献度.md) · [`06-マーケット.md`](./06-マーケット.md) §11（評価 Y08） · [`ADR-H-06-IHL経済-独立schema.md`](./ADR-H-06-IHL経済-独立schema.md)

---

## 文脈

プロフィール（マイページ）に何を出すかが未整理だった。`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア` §5–6 は **Contribution（活動量）/ Coin（功績）/ Research Score（信用）/ PT（影響力）/ Supporter（支援）** の 5 分離を提示する。一方、本システムには既に **カルマ（信用・BAN）**（[`08`](./08-カルマシステム.md)）と **マーケット評価（良い/悪い・ヤフオク型）**（[`06`](./06-マーケット.md) §11 Y08）が存在する。

> ユーザー確定（2026-06-07）:
> - プロフィールには **カルマ・貢献度・マーケット評価** の **3 ドメイン**を出す。
> - **研究スコア（Research Score）は貢献度の「内訳」** — 貢献がどう積まれたかを示すだけ。**4 つ目の独立ドメインにはしない**。
> - **3 つは統合しない**（混ぜると意味が壊れる）。

---

## 決定

### 1. プロフィール 3 ドメイン（統合禁止）

| ドメイン | 意味（一言） | 性質 | Truth の出所 | 正本 |
|----------|--------------|------|--------------|------|
| **カルマ** | **信用**（善良・取引・BAN リスク） | 値 −100〜+100 ＋ 違反 count | `KarmaEvent`（[`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md)） | [`08`](./08-カルマシステム.md) |
| **貢献度** | **活動量**（累積・減らない・上限なし） | 累積スコア ＋ **研究スコア内訳** | `ContributionEvent` | [`14`](./14-貢献度.md) · [`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md) |
| **マーケット評価** | **取引相手の声**（良い/普通/悪い・ヤフオク型） | 件数 ＋ タグ ＋ 版管理 | 取引評価イベント（Y08） | [`06`](./06-マーケット.md) §11 |

**統合禁止の理由**:

- **カルマ＝信用**: 下げる方向に動き、−100 で永久 BAN。**減る指標**。
- **貢献度＝活動量**: 累積・減らない。**多いほど偉いわけではない**（活動の総量）。
- **マーケット評価＝第三者の声**: 本人の行動量ではなく **取引相手の主観**。報復評価対策（タグ＋理由必須・版管理）あり。

→ 3 つを 1 つの「総合スコア」に混ぜると、**信用と活動量と他者評価**が区別できなくなる。ゲーム化・Pay To Win の温床。**意味の異なる軸は分けたまま並べる**（[`08`](./08-カルマシステム.md) §12.3 と同思想）。

### 2. 研究スコア = 貢献度の内訳（⊆ ContributionEvent）

> **核心**: Research Score は **どう貢献したか**を示す **貢献度のブレークダウン**。独立の Truth イベントは持たない（[`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) §5・[`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md) と整合 — **Research Score Summary は Snapshot・再計算可能**）。

`ContributionEvent.event_type`（研究系の内訳に使う enum 案・テンプレ拡張可）:

| event_type（案） | 内訳カテゴリ | 研究スコア寄与 |
|------------------|--------------|:--------------:|
| `paper_published` | 論文 | ◎ |
| `review_done` | 査読 | ◎ |
| `replication_done` | 追試（成功/失敗とも） | ◎ |
| `citation_received` | 被引用 | ◎ |
| `research_gap_closed` | Research Gap 解消 | ○ |
| `observation_logged` | 観測登録 | ○ |
| `measurement_logged` | 計測登録 | ○ |
| `capture_registered` | Capture 登録 | ○ |
| `tag_curated` | タグ整理 | ○ |
| `cross_registered` | Cross 登録 | ○ |
| `template_authored` | テンプレート作成 | ○ |
| `community_activity` | コミュニティ活動 | △ |

- **研究スコア**は上記のうち **研究寄与カテゴリ**を入力に **Snapshot で再計算**（称号中心運用推奨 — `Research Fellow` / `Senior Researcher` / `Principal Breeder` / `Master Breeder` / `Community Reviewer`、アイディア §5）。
- プロフィール UI では **貢献度の数字の下に「内訳（研究スコア含む）」** を展開（論文 N・査読 N・追試 N・観測日数 N・タグ整理 N…）。
- **継続観測は貢献度を増やすが Coin を直接付与しない**（アイディア §5 維持）。

### 3. Coin / PT / Supporter の置き場（プロフィール外 or 補助）

| 指標 | プロフィール掲出 | 理由 |
|------|------------------|------|
| **Platinum Coin（功績章）** | **掲出可**（累計取得枚数のみ — 権威） | アイディア §5「Coin は公開」 |
| **PT（影響力・消費型）** | **本人のみ**（非公開） | アイディア §5「PT は非公開」。残高は [`22`](./22-プラチナコインマーケット.md) |
| **Supporter（金銭支援）** | **研究評価と完全分離**（バッジのみ可・スコア化しない） | Pay To Win 禁止（アイディア §5） |

→ Coin はプロフィールに出してよいが、**3 ドメインとは別枠**（功績章）。PT・Supporter は **評価軸に混ぜない**。

---

## プロフィール UI チャンク（3〜5 チャンク・`preferences.md` 準拠）

```text
[ヘッダ] マイページ › プロフィール（avatar + username）
─────────────────────────────────────────────
[カルマ]            [貢献度]                 [マーケット評価]
 値 +42/+100         12,840（累積・減らない）   良い38 / 普通4 / 悪い1
 違反count 0         └ 内訳（研究スコア含む）    └ タグ: 梱包丁寧 等
 「良好」chip           論文/査読/追試/観測日数/タグ整理
─────────────────────────────────────────────
注記: 3つの指標は統合しません（カルマ=信用 / 貢献度=活動量 / 評価=取引相手の声）
```

**モックアップ**: [`../02-設計/_ui-global/mockups/mockups/mockups/ihl-profile-three-metrics.png`](../02-設計/_ui-global/mockups/mockups/mockups/ihl-profile-three-metrics.png)

![プロフィール 3 指標](../02-設計/_ui-global/mockups/mockups/mockups/ihl-profile-three-metrics.png)

**UX 原則**（[`preferences.md`](../../../../ui-reference/preferences.md) / [`02-設計/_ui-global/00-画面一覧-全体像.md`](../02-設計/_ui-global/00-画面一覧-全体像.md)）:

- **3 カードは視覚的に独立**（枠線で分離・統合バー禁止）。
- **色は意味のみ**: 良い=`#5CD68D` · 悪い=`#FF6B6B` · BAN リスク注意=`#FFD66B`。装飾多色化しない。
- 永久 BAN ユーザーのプロフィールは **第三者から「永久 BAN」表示**（[`08`](./08-カルマシステム.md) §2.1）。
- 空状態（新規ユーザー: 貢献度 0・評価 0 件・カルマ 0）を必ず用意。

---

## R2 パス（IHL · [`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md) 整合）

```text
ihl/economy/events/
├── contribution_event.jsonl   # 活動量 Truth（研究スコア内訳もここから再計算）
├── coin_event.jsonl           # 功績章（付与のみ）
├── pt_event.jsonl             # 影響力（本人のみ）
├── karma_event.jsonl          # カルマ二層（08）
└── supporter_event.jsonl      # 金銭支援（評価と分離）

ihl/market/events/
└── trade_evaluation_event.jsonl   # マーケット評価（良い/普通/悪い + タグ + 版）※06 §11 Y08 正本

ihl/economy/snapshots/
├── contribution_summary/      # 貢献度合計
├── research_score_summary/    # 研究スコア（内訳・称号）= Snapshot
├── coin_summary/
├── karma_summary/             # 値 + count 表示用
└── title_summary/             # 称号

ihl/market/snapshots/
└── reputation_summary/        # 評価件数・タグ集計（版管理は trade_evaluation_event が真）
```

- **マーケット評価イベント列**は **invent しない**: [`06`](./06-マーケット.md) §11 Y08（タグ+理由必須・版管理）を Truth 化する際に列を確定。本 ADR は **境界（評価は経済 Truth とは別ツリー `ihl/market/`）** のみ固定。

---

## 影響

- **14 貢献度**: §② に「研究スコア内訳」表示を追記する（詳細設計で `ContributionEvent.event_type` enum を確定）。
- **08 カルマ**: プロフィール掲出はカルマ値 + count + BAN 状態（既存 §6/§10 と整合）。
- **06 マーケット**: §11 Y08 評価を **マーケット評価ドメイン**としてプロフィール掲出（版管理・タグは既存）。
- **20 / 22**: Coin 公開・PT 非公開の掲出ルールを反映。
- **実装 Go 不可** — 設計ゲート 4 点（要件・詳細・遷移・UI）は別途人間確定（[`design-before-implementation-gate.mdc`](../../../../.cursor/rules/design-before-implementation-gate.mdc)）。

---

## 参照

- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) — PT / Research Score = Snapshot（再計算）
- [`ADR-H-06-IHL経済-独立schema.md`](./ADR-H-06-IHL経済-独立schema.md) — 経済イベント列・Research Score 専用 Truth なし
- [`08-カルマシステム.md`](./08-カルマシステム.md) · [`14-貢献度.md`](./14-貢献度.md) · [`06-マーケット.md`](./06-マーケット.md) §11
- [`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア`](../../../2026.06.08/アイディア) §5–6
