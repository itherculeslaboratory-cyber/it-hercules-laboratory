# 05 観測 — WEB↔LAB ギャップ分析 v1

> **日付**: 2026-07-05  
> **種別**: 分析のみ（実装・再構築禁止）  
> **執筆**: [観測3画面 再現不能原因分析](b935be90-147c-491f-8a3c-c6e6d4468f7a)  
> **本番参照（READ ONLY）**:
> - https://it-hercules.uk/observation/context
> - https://it-hercules.uk/observation/input?species=Dynastes+hercules+hercules&stage=&scope_route=biological&target_id=ot_biological_dynastes_hercules_hercules
> - https://it-hercules.uk/observation/input/confirm  
> **3101 実装**: `apps/ui-parts-lab-w2/src/w2/ObsRegistrationW2.tsx`（批評のみ）  
> **関連**: [`W2-QUALITY-ROOT-CAUSE-AND-FIX-v1.md`](./W2-QUALITY-ROOT-CAUSE-AND-FIX-v1.md) · [`00-W2-checkpoint-orchestration-v1.md`](../../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md)

---

## エグゼクティブサマリー

**「なぜできないか」** — 技術的に不可能ではない。**スコープ・成功基準・参照正本が本番 `apps/web` ではなく W2 checkpoint（55 walkId × mock PNG × 3-click charter）に固定されていた**ため、10+ エージェントは本番を読まず catalog スキャフォールドを作った。

| 軸 | 本番 `apps/web` | `ui-parts-lab-w2` (3101) |
|----|-----------------|--------------------------|
| 登録フロー | **3 ルート** + query + sessionStorage draft | **2 walkId**（05ctx→05i）、**confirm なし** |
| 状態 | `observation-draft.ts`（sessionStorage + 写真 in-memory） | コンポーネント内 `useState`、画面間非共有 |
| context UI | 簡易カタログ検索+一覧（ver1） | mock 準拠の分類ツリー全画面（05ctx） |
| 主 CTA | input: **確認へ** → confirm: **登録する** | 05i: **保存**（同一画面で完了扱い） |
| API | 10+ エンドポイント実呼び出し | なし（toast のみ） |

---

## §1 REQ agent — `01-要件/05-観測.md` は parity か lab か？

**判定: 本番 parity が正本。lab prototype は要件に無い。**

- 2026-06-26 **ver1 COMPLETE** — 実装正本は **IHL Web + API**（§v1 完成サマリー）。
- `/observation/input` · commit 契約 · WorkflowContext（§4.10 OBS-CTX）· 対象ナビゲータ（§4.11 OBS-TGT）は **本番向け**に書かれている。
- ただし冒頭 **「たたき台・非正本」** — 採用判断は `docs/REQUIREMENTS.md` 優先。エージェントが「草案だから lab でよい」と解釈しやすい構造。
- **3101 / W2 checkpoint への言及はゼロ**。要件は lab を定義していない。

**ギャップ**: ユーザー理想（本番フロー）と、エージェントが読んだ charter（55 walkId UX）は **別ドキュメント**。

---

## §2 DET agent — `詳細設計-v3.md` は context/input/confirm を別ルート+query で書いているか？

**判定: input/confirm は明記。context ルートは表に無い。実装正本は apps/web と明記。**

| 項目 | 詳細設計 v3 | 本番実装 |
|------|-------------|----------|
| `ObservationInputPage` | §10 · `input/page.tsx` | ✅ 1800+ 行 |
| `ObservationConfirmPage` | §10 · `input/confirm/page.tsx` | ✅ commit API |
| `observation-draft` | §10 · sessionStorage | ✅ |
| フロントルート表 §3.11 | `/observation` · `[id]` · `/input` のみ | ❌ **context/confirm 未記載** |
| query 伝播 | 入力UI設計-v1 参照（`?target_id=&species=&stage=`） | ✅ `resolveDraftForInput` |

§10 は **「ver1 実装済 · apps/web 正本」** と断言。DET は lab 向け alternate path を持たない。

**ギャップ**: §3.11 ルート表が本番より古い → エージェントが `/observation/context` の存在を設計から学べない。

---

## §3 UI design agent — `入力UI設計-v1.md` / `コンテキスト.md` vs 本番ページ

**判定: 設計 doc は mock/理想。本番は ver1 簡略化。lab は mock に寄せ、本番とは三方向に乖離。**

| 画面 | 設計 doc | 本番 it-hercules.uk | 3101 ObsRegistrationW2 |
|------|----------|---------------------|------------------------|
| Context | ボトムシート 05ctx · 分類ツリー · 3タブ | **独立ページ** · フラット catalog 検索+一覧 · 「質問で絞るは ver2」 | **全画面 05ctx** · 固定 TREE · mock 準拠 |
| Input | StructuredRow · 雌雄 · テンプレ · 1主ボタン=保存 | 10+ Card · 写真 · env · placement · **確認へ** | 1行 mock · 保存 toast · confirm なし |
| Confirm | （入力遷移設計で confirm 経路） | 3チャンク確認 · **登録する** · API commit | **walkId 不存在** |

`入力UI設計-v1.md` ステータス: **草案 · 実装 Go 不可** — それでも `ui-copy-spec/05-観測-v1.md` が oracle 化。

**3101** の「適用」は `hot(onAction, 11)` のみ — **draft 書き込み・query 付き遷移なし**。

---

## §4 apps/web reader — 本番観測の構成

### ルート（登録フロー関連）

| path | ファイル | 役割 |
|------|----------|------|
| `/observation/context` | `context/page.tsx` | catalog API · draft 初期化 · query 付き input へ |
| `/observation/input` | `input/page.tsx` | 巨大入力 · draft 永続化 · **確認へ** |
| `/observation/input/confirm` | `input/confirm/page.tsx` | サマリー · **`POST /api/solid-observation/commit`** |
| `/observation/done` | `done/page.tsx` | 完了 |

### 主要コンポーネント / モジュール

- `StructuredRow` — 計測 / photo_conditions / env_snapshot 統一行
- `observation-draft.ts` — `readDraft` / `writeDraft` / `resolveDraftForInput` / `buildEnvironmentSnapshotCommitBody`
- `device-reading-resolve.ts` — IoT 行・照度規則
- `AuthenticatedImage.tsx` — 観測画像 blob 認証

### 状態機械（本番）

```text
context → writeDraft + ?species&scope_route&target_id
  → input（hydrate from draft + query）
  → writeDraft（300ms debounce）
  → confirm（readDraft）
  → commit API
  → done
```

---

## §5 ui-parts-lab architect — ScreenDef + catalog override の構造限界

| 機構 | 本番 Next.js | 3101 lab |
|------|--------------|----------|
| ナビ | URL path + `useSearchParams` | walkId `/s/{id}` · **query パラメータ薄い** |
| 画面定義 | `app/observation/**/page.tsx` | `screens.json` hotspot → `onNavigate(target)` |
| コンポーネント | ページ直結 | `ScreenDef` → `W2ScreenRenderer` → `registry.ts` override |
| 状態 | sessionStorage 横断 | **walkId ごと独立 React state** |
| 編集禁止 | — | **`apps/web/**` 全チーム禁止**（orchestration §5） |

観測 walkId（3101）: `05ctx` `05a` `05b` `05i` `05i-m` `05i-f` `05tl` `05td` `05fork` `05iot` = **10**

**本番登録フロー 3 ルートに対し lab は 2 walkId + confirm ゼロ。**

---

## §6 W2 checkpoint scope agent — 目標は「55 click nav」であって apps/web clone ではない

**判定: 明示的に本番統合はスコープ外。**

`team2-user-ideal-charter.md` §4.2:

> **含めない（今回 checkpoint 外）**: **`apps/web` 統合**

`ui-copy-spec/05-観測-v1.md` の 3-click パス:

```text
01 → 05ctx → 05i → 保存（完了）
```

本番パス:

```text
context → input?query → confirm → commit → done
```

**W2 は意図的に confirm を省略した別フロー。** 55/55 PASS は **この省略フローへの適合**であり本番 parity ではない。

---

## §7 Missing artifact agent — リポジトリに無いもの

| 欠落物 | 影響 |
|--------|------|
| **WEB→LAB parity 行列** | エージェントが何を合わせるか不明 |
| **confirm walkId** | 本番 3 ルート目が lab に存在しない |
| **WorkflowContext / ObservationDraft lab 層** | 05ctx→05i 間で species が引き継がれない |
| **本番 context 簡略版の ui-copy-spec** | lab が mock 理想に寄る |
| **C 軸の apps/web 照合** | scorecard C=「browser ロード」のみ |
| **hooks 配線仕様（lab 向け）** | confirm 無しと hook 設計が噛み合わない |

---

## §8 Agent failure agent — なぜ catalog スキャフォールドになったか

1. **参照順序**: mock PNG → ui-copy-spec → ObsRegistrationW2。**apps/web は編集禁止で読むインセンティブも低い**
2. **成功指標**: browser_verified — **DOM 文言・API・draft 一致は未検査**
3. **oracle ズレ**: 設計（保存=主 CTA）と本番（確認へ→登録する）が矛盾
4. **並列シャーディング**: 1 walkId = 1 agent → フロー全体ではなく単画面 UI
5. **PASS 後の再構築に見える**が、実際は **初回から別ゴール**

---

## §9 API/data agent — mock-only は blocker か言い訳か

**両方。** charter が API 統合を要求していない一方、本番 parity には **draft 形状・confirm・commit body** が必須。API 以前に **画面分割・状態・遷移**が本番と異なる。

---

## §10 Fix path agent — 再構築で実際に必要なもの（実装しない）

### Phase 0 — 人間ゲート（必須）

1. **3101 のゴール確定**: A) mock 3-click 維持 B) 本番 registration parity C) ハイブリッド
2. **context 正本選択**: 本番 catalog / 設計ボトムシート / mock 05ctx
3. **confirm 要否**: walkId 追加と charter 改訂

### Phase 1 — 文書（コード前）

- `05-観測-WEB-LAB-PARITY-MATRIX-v1.md`
- `ui-copy-spec/05-観測-v2.md`（本番 screenshot oracle）
- DET §3.11 追補 · `screen-defs/05confirm.json`（Go 時）

### Phase 2 — 技術方針（人間選択）

| 方針 | fidelity |
|------|----------|
| **A. apps/web から import**（packages 化） | 高 |
| **B. lab 専用 draft 層** | 中 |
| **C. iframe/embed 本番** | 最高 · charter 外 |

---

## ObsRegistrationW2.tsx 批評（変更禁止）

Tier D copy oracle には合格するが、**本番 observation flow の代替実装ではない**（confirm 無し · draft 非共有 · 保存 CTA）。

---

## ルート数比較

| 系統 | 登録フロー |
|------|------------|
| **本番 Web** | **3 routes** — context → input?… → confirm |
| **Lab walkId** | **2 walkIds** — 05ctx → 05i（confirm **0**） |

---

## ユーザー向け要約

### 核心的な答え

**できないのではなく、やると宣言されていなかった。** 再構築前に **3101 のゴール（mock 3-click vs 本番 parity）** を人間が決める必要がある。

### 欠けているもの Top 5

1. WEB↔LAB parity 行列  
2. confirm walkId / screen-def  
3. observation-draft 相当の lab 共有層  
4. context 正本の人間 Go  
5. 本番 URL 照合の監査 rubric  

### 正しい次手

**人間決定 → parity 行列 doc → 最小 diff 実装**（勝手な作り直し禁止）

---

## サブエージェント状態

| エージェント | 結果 |
|-------------|------|
| [本番観測3画面を3101に反映](0876e16a-a213-468f-b428-57a0d2b63a14) | **ユーザー abort** |
| [観測3画面 再現不能原因分析](b935be90-147c-491f-8a3c-c6e6d4468f7a) | 本 doc |

*分析のみ。コード変更なし。*
