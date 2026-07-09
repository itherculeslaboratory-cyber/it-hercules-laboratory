# 07 掲示板 — LAB Design Note v1

> **日付**: 2026-07-06  
> **walkId**: `07a`（ハブ）· 関連 `07b` `07g` `07o` · port **3101**  
> **実装**: `apps/ui-parts-lab-w2/src/w2/BoardHubW2.tsx`  
> **oracle 正本**: `02-設計/features/07-掲示板/ui/掲示板.md` §2–§5 · `ui/遷移詳細.md` §2  
> **要件**: `01-要件/07-掲示板.md` FR-BBS-06/14/16 · ADR-H-07  
> **Charter**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) Q1–Q4  
> **設計 doc 処理**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)  
> **成功パターン**: [`W2-SUCCESS-PATTERNS-v1.md`](./W2-SUCCESS-PATTERNS-v1.md) §1 P1–P7

---

## 0. User gate（HOME 導線）

| 導線 | 出典 | 遷移先 | 優先度 |
|------|------|--------|--------|
| 左ナビ「掲示板」 | `ナビ・ホーム.md` §3 #1 · `HomeCommandPanelW2` | `07a` | MUST |
| フッター「愚痴」 | `w2-global-chrome.tsx` W2_FOOTER_BAR · ADR-H-14 | `07g` | MUST |
| フッター「改善提案」 | 同上 | `07b` | MUST |
| ハブ 4 板カード | mock `ihl-07-board-hub.png` | `07g`/`07b`/`09`/`07o` | MUST |
| コンポ掲示板 | `screens.json` hotspot.4 | `19board` | SHOULD |

> **07a スコープ**: 板選びハブのみ。スレッド投稿・指摘・case チップは `07b`/`07g`/`07o`/`09`（別 walkId · 本 IMPL では導線のみ配線）。

---

## 1. 設計 § 引用（verbatim）

> 出典: `02-設計/features/07-掲示板/ui/掲示板.md` §2 · §5 · `ui/遷移詳細.md` §2

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 1 | **主タスク** | 「スレッドを読み、投稿・引用・指摘する」 |
| 2 | **カテゴリ** | 愚痴 / 改善提案 / 論文 / 裁判 / 説明（`menuConfig` · FR-BBS-06） |
| 3 | **主 4 板** | 愚痴 · 改善提案 · 論文 · その他のみ（H-BBS · FR-BBS-14） |
| 4 | **4 板ナビ** | ハブは **2×2 カードのみ**（5ch 板リスト型 · 単一ナビ層）— タブは板内画面（`07g`/`07b`/`07o`/`09`）の責務 |
| 5 | **4 カード** | 板タイトル · 1 行説明 · スレッド数 · 〔開く →〕 |
| 6 | **二次導線** | 裁判 / 説明はハブ下部リンクまたはスレッド画面の左ナビ |
| 7 | **状態** | loading スケルトン · empty「まだ投稿がありません」+ 投稿誘導 · error「読み込めませんでした」+ 再試行 |
| 8 | **禁止** | ユーザー向け「未実装」文言（NFR-BBS-04）· 通報ボタン（11 §3.2） |

---

## 2. UI 要素 → 設計 § 対照表

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| パンくず（chrome 1 行） | §5 · 遷移詳細 §2 | MUST | `W2GlobalChrome` breadcrumb のみ · 本文 `BoardCrumb` **禁止**（CAL-07-HUB-03） |
| 見出し「掲示板」 | mock · §5 | MUST | — |
| リード文 | mock · §5 | MUST | 設計原文コピー |
| 4 カード 2×2 グリッド | §5 #5 · mock · BBS prior art §4.1 | MUST | **唯一の** 4 板ナビ · スレッド数 stub 可 |
| 4 タブ（愚痴/改善/論文/その他） | 旧 §5 #4 | — | **ハブでは削除** — 板内（`07g` 等）のみ（[`07-掲示板-BBS-PRIOR-ART-v1`](./07-掲示板-BBS-PRIOR-ART-v1.md) §4.2） |
| カード 〔開く →〕 | §5 #5 | MUST | `onNavigate` + hotspot 併用 |
| 二次リンク 裁判 | §5 #6 · FR-BBS-06 | SHOULD | → `11` |
| コンポーネント掲示板 | screens.json hotspot.4 | SHOULD | → `19board` |
| 主 CTA（PrimaryAction） | Charter Q1 1 主ボタン | MUST | **愚痴板を開く** → `07g`（カードと役割分担 · フッター ADR-H-14 と整合） |
| loading / empty / error | §3 · NFR-BBS-04 | MUST | StatePanel Q9:C トグル |
| W2GlobalChrome | HOME 教訓 · P7 | MUST | 二重 HOME / 二重フッター禁止 |
| 争い部屋・ホーム本文リンク | — | — | **削除**（W2GlobalChrome フッターが正本） |
| BoardHubShortcuts チップ | — | — | **削除**（mock 非掲載 · P4 スコープ外 UI 削除） |
| case チップ行 | FR-BBS-16 | — | **07a 非掲載**（論文板 `09` スコープ） |
| 左ナビ板一覧 | 遷移詳細 §3 | — | **07a 非掲載**（スレッド画面スコープ） |

---

## 3. walkId map

| walkId | 役割 | 3101 実体 |
|--------|------|-----------|
| `07a` | 掲示板ハブ | `BoardHubW2` |
| `07b` | 改善提案板（スレ一覧） | `BoardThreadListW2` |
| `07g` | 愚痴板（スレ一覧） | `BoardThreadListW2` |
| `07o` | その他板（スレ一覧） | `BoardThreadListW2` |
| `09` | 論文板（スレ一覧 + case チップ） | `BoardThreadListW2` / `PaperBoardW2` |
| `09t` | 論文テンプレ穴埋め | catalog（別 Wave） |
| `19board` | コンポーネント掲示板 | catalog |
| `11` | 争い二人部屋 | catalog |

---

## 4. Pre-implementation gate（10 項目）

| # | 項目 | 状態 |
|---|------|------|
| 1 | oracle § 引用完了 | ✅ §1 |
| 2 | § 対照表 MUST 行 citation 100% | ✅ §2 |
| 3 | mock 3 枚参照（hub/愚痴/thread） | ✅ |
| 4 | catalog scaffold 不使用（専用 W2） | ✅ `BoardHubW2` |
| 5 | W2GlobalChrome 二重禁止 | ✅ `deep-chrome` 外 · `W2ShellOnly` フッターなし |
| 6 | 1 主 CTA | ✅ 愚痴板を開く |
| 7 | 空/loading/error | ✅ ContentArea 分岐 |
| 8 | 未実装/WIP grep ゼロ | ✅ IMPL 後 grep |
| 9 | `npm run build` PASS | ✅ IMPL 後 |
| 10 | CAL ログ行 | ✅ IMPL 後 |

---

## 5. Open questions（設計サイレント · mock 準拠で実装）

| 項目 | 判断 |
|------|------|
| 説明板 `/manual` walkId | lab に未定義 — **07a からリンク省略**（裁判のみ二次導線） |
| スレッド数の正本 | API 未接続 — **lab stub 数値**（mock 一致: 128/64/37/52） |
| ハブ タブ | **削除**（CAL-07-HUB-03）— 板内画面のみ |
| ハブ 4 板遷移 | 愚痴→`07g` · 改善→`07b` · 論文→`09` · その他→`07o` |

---

## 6. 検証 URL

- http://localhost:3101/s/07a — ハブ 4 カード単一ナビ · 状態トグル
- http://localhost:3101/s/07g — 愚痴板 · 4 タブ · 左ナビ · スレ一覧 · 主 CTA スレ立て
- http://localhost:3101/s/07b — 改善提案板 · 同上
- http://localhost:3101/s/07o — その他板 · 同上
- http://localhost:3101/s/09 — 論文板 · case チップ · 09t 二次導線
- http://localhost:3001/s/07a — ユーザー指定 URL（3101 と同型 · dev 再起動後）

**導線チェック**:
- `01` 左ナビ 掲示板 → `07a`（1 click）
- `07a` 愚痴カード → `07g`
- `07g` タブ「改善提案」→ `07b`
- 任意画面フッター「愚痴」→ `07g`

---

## 7. 自己採点（IMPL 完了時 · ユーザー採点待ち）

| 軸 | 自己 | 根拠 |
|----|------|------|
| STRUCTURAL | 95 | screen-def · registry · build |
| DESIGN-FULFILLMENT | 90 | BBS prior art でタブ→板内に分離 · カード MUST 充足 |
| UX | 92 | 単一ナビ層 · パンくず1行 · 3-click · 日本語コピー |
| **TOTAL** | **~92** | CAL-07-HUB-03 · ユーザー oracle 待ち |

---

## 8. CAL-07-HUB-03 修正（2026-07-06 · user Go）

| 項目 | 修正前 | 修正後 |
|------|--------|--------|
| 4 板ナビ | タブ + カード二重 | **カード 2×2 のみ** |
| パンくず | Shell + `BoardCrumb` 二重 | **chrome 1 行**（本文 crumb 削除） |
| 愚痴入口（ハブ内） | タブ+カード+CTA（+フッター） | **カード+CTA**（フッターは ADR-H-14 全画面） |
| 論文カード | `09` | `09` 維持（#09 研究 UI · screen-def hotspot.2 一致） |

**参照**: [`07-掲示板-BBS-PRIOR-ART-v1`](./07-掲示板-BBS-PRIOR-ART-v1.md) · [`W2-SUCCESS-PATTERNS-v1`](./W2-SUCCESS-PATTERNS-v1.md) P3/P4

---

* v1 · 2026-07-06 · IMPL Go（ユーザー「掲示板やりましょうか。100点にして。」）  
* v1.1 · 2026-07-06 · CAL-07-HUB-03 — タブ削除 · 単一ナビ層 · user Go（3/100 修正）  
* v1.2 · 2026-07-06 · CAL-07-BOARDS-01 — 07g/07b/07o/09 板内スレ一覧 · `BoardThreadListW2` · user Go「全部やって」

---

## 9. 板内画面（07g/07b/07o/09）— CAL-07-BOARDS-01

| UI 要素 | 設計 § | MUST | 実装 |
|---------|--------|------|------|
| 4 タブ（愚痴/改善/論文/その他） | BBS prior art §4.2 · 遷移詳細 §3 | MUST | `BoardTabs` · active=現在板 |
| 左ナビ板一覧 | 遷移詳細 §3 | MUST | `ihl-board-side-nav` · 裁判/コンポ掲示板/ハブ |
| スレッド一覧 | 5ch subback · FR-BBS | MUST | タイトル · レス数 · 最終更新 |
| case チップ | FR-BBS-16 | MUST（09 のみ） | `PAPER_CASE_CHIPS` |
| 主 CTA | Charter Q1 | MUST | 愚痴=スレ立て · 他=新規スレッド |
| パンくず | CAL-07-HUB-03 | MUST | **chrome 1 行のみ**（本文 crumb なし） |
| loading/empty/error | NFR-BBS-04 | MUST | StatePanel トグル |
| 共有コンポーネント | W2-UI-BUILDER P5 | MUST | `BoardThreadListW2` + `board-config.ts` |
| 09 screen-def | catalog 生成と衝突 | MUST | `src/lib/screen-defs.ts` の `W2_SCREEN_DEF_PATCHES` |

**自己採点（板内 Wave）**: STRUCTURAL ~96 · DESIGN ~94 · UX ~95 · **TOTAL ~95**
