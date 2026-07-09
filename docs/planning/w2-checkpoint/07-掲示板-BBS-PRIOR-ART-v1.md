# 07 掲示板 — BBS 先行研究 & 07a 重複調査 v1

> **日付**: 2026-07-06  
> **トリガー**: ユーザー採点 **3/100** · CAL-07-HUB-02  
> **スコープ**: **調査のみ** — 実装禁止（ユーザー明示 Go まで）  
> **walkId**: `07a`（ハブ）· 関連 `07b` `07g` `07o` `09`  
> **参照**: [`07-掲示板-LAB-DESIGN-NOTE-v1.md`](./07-掲示板-LAB-DESIGN-NOTE-v1.md) · [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md)

---

## 0. エグゼクティブサマリ

| 論点 | 結論 |
|------|------|
| **重複の主因** | `BoardHubW2.tsx` が **同一 4 板をタブ行とカードグリッドの二重表示**している（設計 doc §5 #4+#5 と mock PNG に従った実装だが、BBS 慣習とユーザー期待に反する） |
| **catalog 二重描画？** | **否** — `registry.ts` が W2 専用コンポーネントを正しく上書き。catalog `hub.tsx` は 3101 では未使用 |
| **chrome 層の重複** | **あり（副次）** — `W2GlobalChrome` フッター（愚痴/改善提案）+ 主 CTA（愚痴）+ ハブ内 4 板 ×2 |
| **パンくず二重** | **あり（軽微）** — `StandardShell` breadcrumb「掲示板ハブ」+ `BoardCrumb`「掲示板 › ハブ」 |
| **07a の正体** | **板選びハブ**（5ch の「板一覧」相当）— スレッド一覧・投稿は `07g`/`07b`/`07o`/`09` |
| **設計 doc との齟齬** | IHL 草案が mock 準拠で **タブ+カード同時必須**としているが、5ch 型 BBS では **階層ごとに 1 ナビ層**が原則。タブは **板内スレッド画面**（`07g` mock）の責務 |

---

## 1. 07a 重複 — 根本原因

### 1.1 一次原因（ユーザーが見ている重複）

**同一画面内で 4 板が 2 回並ぶ：タブバー + カードグリッド**

| 層 | ファイル | 行 | 内容 |
|----|----------|-----|------|
| タブ行 | `apps/ui-parts-lab-w2/src/w2/BoardHubW2.tsx` | 63, 103–112 | `TAB_LABELS` ← `BOARDS` から生成 → `BoardTabs` で 愚痴/改善提案/論文/その他 |
| カード行 | 同上 | 24–61, 141–152 | 同一 `BOARDS` 配列 → `BoardCategoryCard` 2×2 グリッド |
| データ源 | 同上 | 24–61 | **単一 `BOARDS` 定数**が両方に供給 — 意図的な二重描画 |

```103:112:apps/ui-parts-lab-w2/src/w2/BoardHubW2.tsx
      <BoardTabs
        tabs={TAB_LABELS.map((t) => {
          const board = BOARDS.find((b) => b.id === t.id)!;
          return {
            id: t.id,
            label: t.label,
            onClick: () => openBoard(board, onAction, onNavigate),
          };
        })}
      />
```

```141:152:apps/ui-parts-lab-w2/src/w2/BoardHubW2.tsx
        <div className="ihl-board-grid" data-testid="board-hub-grid">
          {BOARDS.map((board) => (
            <BoardCategoryCard
              key={board.id}
              icon={board.icon}
              title={board.title}
              desc={board.desc}
              count={`${board.threadCount} スレッド`}
              onOpen={() => openBoard(board, onAction, onNavigate)}
            />
          ))}
        </div>
```

**mock PNG も同型** — `02-設計/_ui-global/mockups/ihl-07-board-hub.png` にタブ行とカード行の両方が描かれている。実装は mock 忠実だが、ユーザーは「同じものが 2 回」と感じるのが妥当。

### 1.2 設計 doc が二重を要求している経路

| 出典 | 箇所 | 記述 |
|------|------|------|
| `02-設計/features/07-掲示板/ui/遷移詳細.md` | §2 L35–36 | 「上部に **4 タブ**」+「本文は **4 カード**」 |
| `02-設計/features/07-掲示板/ui/掲示板.md` | §5 | mock 参照 · 板サブツリー |
| `docs/planning/w2-checkpoint/07-掲示板-LAB-DESIGN-NOTE-v1.md` | §1 #4–#5, §2 | 4 タブ MUST + 4 カード MUST |

エージェント自己採点 ~91 は「設計 MUST 充足」を重視したが、**BBS 先行研究・ユーザー gate を満たしていない**（CAL-07-HUB-02 で顕在化）。

### 1.3 二次原因（グローバル chrome との重複）

| 層 | ファイル | 行 | 重複内容 |
|----|----------|-----|----------|
| フッター | `apps/ui-parts-lab-w2/src/w2/w2-global-chrome.tsx` | 7–8 | `愚痴` → `07g` · `改善提案` → `07b` |
| 主 CTA | `BoardHubW2.tsx` | 177–190 | `愚痴板を開く` → `07g` |
| 左ナビ（HOME 経由） | `HomeCommandPanelW2.tsx` | 15 | `掲示板` → `07a`（ハブ経由の 3 クリック導線） |

07a 画面上だけで **愚痴への入口が最大 4 箇所**（タブ・カード・主 CTA・フッター）。論文/その他はタブ+カードの 2 箇所。

`W2ScreenRenderer.tsx` L169–174 で 07a は `shouldUseW2GlobalChrome` = true → フッターは常時表示。

### 1.4 三次原因（パンくず）

| 層 | ファイル | 表示 |
|----|----------|------|
| Shell | `W2ScreenRenderer.tsx` L171 · `StandardShell.tsx` L61 | `def.title` = 「掲示板ハブ」 |
| 本文 | `BoardHubW2.tsx` L99 · `BoardCrumb` | 「掲示板 › ハブ」 |

意味は近いが **2 行のパンくず**が縦に並ぶ。

### 1.5 除外された仮説

| 仮説 | 判定 | 根拠 |
|------|------|------|
| catalog + W2 二重レンダリング | **否定** | `registry.ts` L124–126 が `BoardHubContentAreaW2` を解決。`screen-defs/07a.json` は ContentArea ノード 1 つのみ |
| `ihl-brand-chrome` + `W2GlobalChrome` 二重 | **否定（07a）** | `deep-chrome-screens` 外 · `showChrome` = false |
| catalog `hub.tsx` 同時表示 | **否定** | `packages/ihl-ui-catalog/.../hub.tsx` は override 経由で W2 に置換。旧版は `BoardHubShortcuts` まで含み **さらに重かった** |

---

## 2. 5ch / 有名 BBS — 要件テーブル（先行研究）

**参照**: [5ch wiki スレッドフロート式](https://info.5ch.net/index.php/%E3%82%B9%E3%83%AC%E3%83%83%E3%83%89%E3%83%95%E3%83%AD%E3%83%BC%E3%83%88%E5%BC%8F%E6%8E%B2%E7%A4%BA%E6%9D%BF) · [TheMoeWay 5ch ガイド](https://learnjapanese.moe/2ch/) · [Wikipedia 5channel](https://en.wikipedia.org/wiki/5channel)

### 2.1 階層モデル（5ch 型テキスト板）

```text
サイト
 └─ カテゴリ（大使館・趣味など）     ← 板のグルーピング（別ページ）
     └─ 板（例: ニュー速VIP）        ← 「板一覧」から選ぶ
         └─ 板トップ                  ← ルール + 直近スレプレビュー
         └─ スレッド全一覧            ← subback.html · ソート/検索
             └─ スレッド本文          ← 1 レス目 + 最新 N レス（既定 50）
```

**原則**: 各階層で **その階層の仕事だけ**をする。板一覧ページに「スレッド本文」は載せない。板トップに「全板タブ」は載せない（板は既に 1 つに決まっている）。

### 2.2 画面種別ごとの必須要素

| 画面種別 | 5ch での例 | 必須 UI 要素 | 任意 / 発展 |
|----------|------------|--------------|-------------|
| **板リスト（サイト）** | 掲示板リスト | 板名 · カテゴリ分類 · 検索/フィルタ | お気に入り · カテゴリツリー |
| **板トップ** | `/board/` index | 板タイトル · 板ルール · **スレ一覧（抜粋）** · 新規スレ立て | 勢い(CP) · 最新スレ OP+レス抜粋 |
| **スレッド全一覧** | `subback.html` | スレタイトル · **レス数** · **最終投稿時刻** · ソート（勢い/レス数/日付） | dat 番号 · NG ワード · 未読 |
| **スレッド本文** | `read.cgi` | レス番号 · 投稿者(ID) · 日時 · 本文 · **アンカー `>>N`** | sage/age · 画像 · 全部読む |
| **新規スレ** | スレ立てフォーム | タイトル · 本文 · 投稿 | — |

**5ch にないもの（ハブでやらない）**:

- 同じ板名を **タブとカードの両方**に並べる
- 板トップと板一覧を **同じビューポートに二重配置**

### 2.3 IHL への写像（walkId）

| 5ch 概念 | IHL walkId | ルート（設計案） | 備考 |
|----------|------------|------------------|------|
| サイト板リスト | **`07a` ハブ** | `/board` | 主 4 板を選ぶ **1 層だけ** |
| 板トップ + スレ一覧 | **`07g` `07b` `07o` `09`** | `/board/complaint` 等 | タブ active · 左ナビ板切替は **ここ** |
| スレッド本文 | `07b` thread-post mock 系 | `/board/:category/:thread` | 投稿 · 引用 · 指摘 |
| 裁判 / 説明 | `11` · `/manual` | 二次導線 | ハブ下部リンク（FR-BBS-06） |
| コンポ掲示板 | `19board` | 別 feature | ハブ二次導線 |

**ADR-H-07 / FR-BBS-14**: 主入口は愚痴・改善・論文・その他の **4 つのみ**。Research Board 独立ルート禁止。

**FR-BBS-16**: case チップは **論文板（09）のみ** — 07a には置かない。

---

## 3. IHL 設計 vs 5ch vs 現行 lab

| 観点 | IHL 設計（oracle） | 5ch 型 | 現行 07a lab | 判定 |
|------|-------------------|--------|--------------|------|
| ハブの役割 | 板選び（遷移詳細 §2） | 板リスト | 板選び意図は一致 | ○ 意図 |
| ハブのナビ層数 | **2 層**（タブ+カード）mock 準拠 | **1 層**（リスト or カード） | タブ+カード同時 | **✗ UX** |
| 板切替タブ | ハブ §2「4 タブ常時」 | 板内では不要（板確定済み） | ハブにタブ | **△ 位置誤り** — `07g` mock が正しい配置 |
| スレッド数表示 | カードにスレッド数 | スレ一覧にレス数 | stub 128/64/37/52 | ○ stub 可 |
| 左ナビ板一覧 | スレッド画面（遷移詳細 §3） | 板間移動は別板へ遷移 | 07a 非掲載（正） | ○ |
| フッター愚痴/改善 | ADR-H-14 全画面 | 5ch には相当なし | ハブと重複 | **△ 要スコープ整理** |
| 主 CTA 1 つ | Charter Q1 | — | 愚痴板を開く | ○ ただしハブ内重複と合わせて過剰 |

### 3.1 mock 解釈の修正提案

`ihl-07-board-hub.png` のタブ行は、**ハブ用ではなく板内画面（`ihl-07-board-post-愚痴.png`）のパターンを誤ってハブ mock にコピーした**可能性が高い。

- **ハブ mock**: カード 4 枚 + 見出し + リード + 二次導線 で足りる
- **板内 mock** (`ihl-07-board-post-愚痴.png`): タブ active + 左ナビ + スレッド一覧 — ここが「4 タブ」の本丸

---

## 4. 07a ハブが持つべきもの（単一ナビ層案）

### 4.1 MUST（ハブ `07a`）

| # | 要素 | 理由 |
|---|------|------|
| 1 | 見出し「掲示板」+ 1 行リード | 画面目的の明示 |
| 2 | **4 板への入口を 1 種類のみ**（カード 2×2 **または** コンパクトリスト — **タブと併用しない**） | 5ch 板リスト原則 · 重複排除 |
| 3 | 各入口: 板名 · 1 行説明 · スレッド数（stub 可）· 開く | FR-BBS-14 · mock カード情報 |
| 4 | 二次導線: 裁判 · コンポ掲示板（SHOULD） | 遷移詳細 §2 |
| 5 | loading / empty / error | NFR-BBS-04 |
| 6 | 主 CTA 1 つ | Charter Q1 — **ハブ内の他導線と役割分担** |

### 4.2 MUST NOT（ハブ `07a`）

| # | 禁止 | 理由 |
|---|------|------|
| 1 | タブ + カードの二重ナビ | CAL-07-HUB-02 主訴 |
| 2 | スレッド一覧・投稿欄 | `07g`/`07b` スコープ |
| 3 | case チップ | FR-BBS-16 · `09` のみ |
| 4 | 本文内パンくず + Shell パンくずの二重 | どちらか 1 つに統一 |

### 4.3 07g / 07b が持つべきもの（ハブではない）

| 要素 | 07g 愚痴 | 07b 改善 | 07o その他 | 09 論文 |
|------|----------|----------|------------|---------|
| 板タブ（4 板切替） | active=愚痴 | active=改善 | active=その他 | active=論文 |
| 左ナビ板一覧 | ○ | ○ | ○ | ○ |
| スレッド一覧 | ○ | ○ | ○ | ○ + **case チップ** |
| パンくず「掲示板 › {板名}」 | ○ | ○ | ○ | ○ |
| 新規スレ / 投稿 | ○ | ○ | ○ | ○ + paper_case 必須 |

---

## 5. 修正方向（コードなし · 提案のみ）

### 5.1 推奨（優先度順）

1. **ハブから `BoardTabs` を削除**（またはカードを削除してリスト 1 種に統一）— `BoardHubW2.tsx` L103–112 **または** L141–152 のどちらか一方  
2. **設計 doc 改訂**: `遷移詳細.md` §2 · `掲示板.md` §5 · `07-掲示板-LAB-DESIGN-NOTE-v1.md` §1 #4 — 「ハブ = カードのみ」「タブ = 板内画面」に分離  
3. **パンくず統一**: `BoardCrumb` をハブで外す **または** `W2GlobalChrome` breadcrumb を `screens.json` の `breadcrumb` フィールドに合わせる（二重解消）  
4. **フッターと主 CTA の役割整理**: ハブでは主 CTA = よく使う 1 板 · フッター = 全画面ショートカット（ADR-H-14）— **ハブ内に同板を 3 回出さない**  
5. **mock 改訂**: `ihl-07-board-hub.png` からタブ行を削除（または板内 mock との差分を注釈）

### 5.2 非推奨

- タブとカードを「見た目だけ変える」微修正 — 情報の二重は残る  
- 5ch 型スレ一覧を 07a に押し込む — 階層混在

---

## 6. User gate 質問（実装前に人間確定）

| # | 質問 | 選択肢 |
|---|------|--------|
| Q1 | 07a ハブの **唯一の** 4 板ナビは？ | A) 2×2 カード（mock 下半分） / B) コンパクト 4 行リスト / C) その他 |
| Q2 | 4 タブ（愚痴/改善/論文/その他）はどこに置く？ | A) **07g/07b/07o/09 の板内のみ**（推奨） / B) ハブにも残す（現状） |
| Q3 | ハブの主 CTA は？ | A) 愚痴板を開く（現状） / B) 前回開いた板 / C) ハブに主 CTA なし |
| Q4 | 全画面フッター「愚痴」「改善提案」はハブでも表示？ | A) 表示（ADR-H-14 維持 · ハブ内重複は許容） / B) ハブのみ非表示 / C) フッターから掲示板系を外し左ナビに集約 |
| Q5 | 設計正本の改訂 | mock 優先 vs 5ch 単一ナビ層 — **どちらを oracle とするか** |
| Q6 | 07a 次ターゲット採点 | 修正後の期待点（例: 70+ はカード単一ナビ + パンくず統一） |

---

## 7. 関連ファイル索引

| 種別 | パス |
|------|------|
| W2 実装 | `apps/ui-parts-lab-w2/src/w2/BoardHubW2.tsx` |
| registry | `apps/ui-parts-lab-w2/src/w2/registry.ts` |
| screen-def | `screen-defs/07a.json` |
| chrome | `apps/ui-parts-lab-w2/src/w2/w2-global-chrome.tsx` |
| catalog（旧・参考） | `packages/ihl-ui-catalog/src/components/features/board/hub.tsx` |
| 設計 UI | `02-設計/features/07-掲示板/ui/掲示板.md` · `ui/遷移詳細.md` |
| 要件 | `01-要件/07-掲示板.md` |
| mock | `02-設計/_ui-global/mockups/ihl-07-board-hub.png` |
| CAL | `docs/planning/w2-checkpoint/W2-SCORE-CALIBRATION-LOG.md` — **CAL-07-HUB-02** |

---

*v1 · 2026-07-06 · RESEARCH ONLY · ユーザー 3/100 · CAL-07-HUB-02*
