# ADR-H-10: BBS データ契約（製品掲示板の裏側 Truth 層）

> **ステータス**: 採用（人間確定 — データ契約）／詳細は設計ゲート継続  
> **決定日**: 2026-06-07  
> **判断 ID**: H-10-bbs-contract  
> **出典**: [`ADR-H-07-掲示板-入口4つ-論文内研究.md`](./ADR-H-07-掲示板-入口4つ-論文内研究.md)（H-BBS · 入口 4 つ）＋ ユーザー確定（2026-06-07）「**裏もきれいに** — schema を手抜きせず、ユーザーを混乱させず一度きれいに設計しろ」  
> **正本**: 本 ADR · [`07-掲示板.md`](./07-掲示板.md) · [`02-設計/features/07-掲示板/ui/遷移詳細.md`](../../02-設計/features/07-掲示板/ui/遷移詳細.md) · [`ADR-H-06-IHL経済-独立schema.md`](./ADR-H-06-IHL経済-独立schema.md)

---

## 文脈

[ADR-H-07](./ADR-H-07-掲示板-入口4つ-論文内研究.md) で **製品 BBS は入口 4 つ（愚痴 / 改善 / 論文 / その他）**、Research Board は不採用と確定。表（UI）は決まったが **裏（Truth 層 schema）**が未確定だった。

> ユーザー確定（2026-06-07）: 「**BBS は 4 入口だけ。裏もきれいに。** schema を手で振らずに、投稿の Truth 層を一度きれいに設計しろ。**心配いらない、ちゃんと一度設計すれば済む。**」

→ append-only・イベントソーシング（[`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) / [`ADR-H-05`](./ADR-H-05-ガバナンス-v1.3.md)）と整合する **BBS Truth 契約**を確定する。

---

## 決定

### 1. board_kind — enum 4 値（固定・ユーザー向けはこれだけ）

```text
board_kind ∈ { complaint, improvement, paper, general }
```

| board_kind | 表示 | ルート | 役割 |
|------------|------|--------|------|
| `complaint` | 愚痴 | `/board/complaint` | 感情整理 |
| `improvement` | 改善 | `/board/improvement` | 機能改善提案 |
| `paper` | 論文 | `/board/paper` | 研究・観察の唯一の長文入口（**case 分けは内側**） |
| `general` | その他 | `/board/general` | 上記外 |

- **裁判 / 説明は board_kind に入れない**（二次導線。[ADR-H-07](./ADR-H-07-掲示板-入口4つ-論文内研究.md) FR-BBS-06 併設）。
- **Research Board は作らない**（独立 board_kind なし）。

### 2. paper_case — 論文板内のみの enum（他 3 板では null）

```text
paper_case ∈ { paper, observation, breeding_log, analysis, review, replication, hypothesis, other }
```

- `board_kind=paper` の **スレッドのみ** `paper_case` 必須。他 3 板は `paper_case=null`。
- UI: 論文板のみ **case チップ行**（フィルタ）＋ 投稿時 case 選択必須（[ADR-H-07](./ADR-H-07-掲示板-入口4つ-論文内研究.md) §2）。
- 詳細設計で **単一 enum 推奨**（タグ配列ではなく 1 スレッド 1 case）。

### 3. Truth 層 — append-only イベント 2 系列 ＋ スナップショット

> **原則**: スレッド・投稿は **削除・上書きしない**。編集・クローズ・指摘は **新イベント**。現在状態は Snapshot で表現（[`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) R2 Only）。

**ThreadEvent**（スレッドのライフサイクル）

```text
thread_event_id, thread_id, board_kind, paper_case(nullable),
event_type, actor_id, title(nullable), content_ref(nullable),
created_at
```

`ThreadEvent.event_type ∈ { thread_created, thread_edited, thread_closed, thread_reopened, thread_moved }`

- `thread_moved`: 投稿先取り違えの是正（board_kind / paper_case 変更）も **新イベント**で表現（元は消えない）。
- `content_ref`: 論文板スレッドが Content 実体を持つ場合のポインタ（§4）。

**PostEvent**（投稿・返信・指摘）

```text
post_event_id, thread_id, post_id, parent_post_id(nullable),
event_type, actor_id, body_ref, citation_refs[](nullable),
moderation_tag(nullable), reason(nullable), created_at
```

`PostEvent.event_type ∈ { post_created, post_edited, post_cited, post_flagged }`

- `post_flagged` = **指摘**（タグ＋理由必須・通報ボタンではない／[`07`](./07-掲示板.md) §「引用 / 指摘」）。`moderation_tag` ＋ `reason` を持つ。**版管理**（編集は新 PostEvent）。
- `post_edited` は **新イベント**（旧 body は R2 に残る）。

**Snapshot（再生成可能・Truth ではない）**

```text
ihl/board/snapshots/
├── thread_summary/      # スレッド現在状態（title, board_kind, paper_case, status, post_count, last_at）
├── board_index/         # 板別スレッド一覧・件数
└── citation_summary/    # 論文板スレッド ↔ Content の引用集計
```

### 4. 07 BBS ↔ Content / Citation の関係（論文板の二層）

> **混乱回避の肝**: 「BBS スレッド分類（paper_case）」と「研究 Content 実体（content_type）」は **別層**。ユーザーには **論文板の 1 画面**に見えるが、裏は **議論（PostEvent）と研究成果（Content）が Citation で結ばれる**。

| 層 | 実体 | 正本 |
|----|------|------|
| **議論層** | ThreadEvent / PostEvent（板スレッド・返信・指摘） | 本 ADR |
| **研究成果層** | `Content`（research_note / hypothesis / paper / replication_report …） | [`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) §3 · [`09`](./09-論文.md) |
| **結び** | `Citation`（source/target = thread/post ↔ content） | [`ADR-H-04`](./ADR-H-04-設計規約-v1.2.md) |

接続ルール:

- **論文板スレッド（board_kind=paper）は Content にリンクできる**（`ThreadEvent.content_ref` → Content）。論文本体は **Content が正本**、議論は PostEvent。
- 投稿から研究成果・観測・Cross を **引用**するときは `PostEvent.citation_refs[]` → `Citation` を生成（[`ADR-H-09`](./ADR-H-09-研究フロー-低コスト設計.md) の「引用ワンクリック」と同一経路）。
- **paper_case と content_type を混同しない**: `paper_case`＝**議論スレッドの分類**、`content_type`＝**研究成果の種別**。論文板の `paper_case=review` スレッドが `content_type=paper` の Content を査読する、という関係になりうる。

→ ユーザー UI は **論文板 1 つ**で済み（case チップで探す）、裏は **議論 ↔ 成果が Citation で疎結合**。**Research Board を別に作らずに研究議論が成立**する。

---

## 5. R2 パス（IHL · [`ADR-H-06`](./ADR-H-06-IHL経済-独立schema.md) と同ツリー思想）

```text
ihl/board/
├── events/                        # append-only JSONL（Truth）
│   ├── thread_event.jsonl
│   └── post_event.jsonl
├── bodies/                        # 本文実体（body_ref / content_ref が指す）
│   └── {thread_id}/{post_id}.md
└── snapshots/
    ├── thread_summary/
    ├── board_index/
    └── citation_summary/
```

- **本文（bodies）も上書きしない**: 編集は新ファイル＋新 PostEvent（body_ref 更新）。
- Citation 実体は研究側 `ihl/research/citation/`（[`09`](./09-論文.md)）と共有 — **BBS 専用 Citation を別途作らない**。

---

## 6. OSS ブリッジ（H-BBS OSS bridge = OK）

- 製品 BBS の **読み書き UI は OSS フォーラム部品を薄くラップ**してよい（[`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) の board は OSS 最大方針）。
- ただし **Truth は OSS の DB ではなく R2 の ThreadEvent/PostEvent**（OSS は表示・編集の体験のみ）。OSS 側 ID ↔ IHL `thread_id`/`post_id` のマッピングは詳細設計で確定。
- file-board（開発スレ索引・[`19`](./19-コンポーネント掲示板.md)）は **製品 BBS とは別系統**（混在禁止）。

---

## 影響

- **07 掲示板**: FR-BBS に **board_kind / paper_case enum・ThreadEvent/PostEvent 契約**を追記（本 ADR を schema 正本として参照）。
- **09 論文**: 論文板スレッド ↔ Content の `content_ref` / Citation 経路を [`ADR-H-09`](./ADR-H-09-研究フロー-低コスト設計.md) の引用導線と統一。
- **11 裁判**: 指摘（post_flagged）の `moderation_tag` は争い Δcount 入口（[`11`](./11-裁判.md) §4）と整合。BBS schema は争いを内包しない（指摘イベントのみ）。
- **実装 Go 不可** — 設計ゲート 4 点は別途人間確定。

---

## 参照

- [`ADR-H-07-掲示板-入口4つ-論文内研究.md`](./ADR-H-07-掲示板-入口4つ-論文内研究.md) — UI/IA（4 入口・case）
- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) — Content / Citation / append-only
- [`ADR-H-09-研究フロー-低コスト設計.md`](./ADR-H-09-研究フロー-低コスト設計.md) — 引用ワンクリック
- [`07-掲示板.md`](./07-掲示板.md) · [`02-設計/features/07-掲示板/ui/遷移詳細.md`](../../02-設計/features/07-掲示板/ui/遷移詳細.md)
- [`指示/it-hercules-laboratory/99-アーカイブ/2026.06-08-review/アイディア`](../../../2026.06.08/アイディア) §3–4（Research Board 分離は不採用）
