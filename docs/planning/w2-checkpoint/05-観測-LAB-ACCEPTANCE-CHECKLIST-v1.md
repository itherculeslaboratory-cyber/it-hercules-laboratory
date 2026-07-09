# 05 観測登録 — LAB 受入チェックリスト v1

> **日付**: 2026-07-05  
> **スコープ**: `apps/ui-parts-lab-w2`（port **3101**）— 観測登録 **3 画面**（Context · Input · Confirm）  
> **用途**: 3101 lab の設計準拠を **チェックリストのみ** で定義する。実装は本書作成時点では **未着手**（後続 HOME 再構築 + 採点フィードバックループの oracle）。  
> **3101 現状参照（FAIL メモのみ）**: `ObsRegistrationW2.tsx` · `screens.json` — **コード変更禁止**（本書執筆時）  
> **設計完成度**: [`05-観測-DESIGN-READINESS-v1.md`](./05-観測-DESIGN-READINESS-v1.md) — 遷移・UI・色は設計済み。新規 UI 設計フェーズ不要。

---

## 0. ヘッダ — 目的・正本・非 parity 宣言

### 0.1 目的

3101 lab が **IHL #05 観測登録**の設計意図（対象選択 → 計測入力 → 確認 → commit 相当）を、walkId ナビと UI コピーで **設計 doc に照らして** 受け入れ可能かを判定する。

### 0.2 スコープ（3101 lab）

| 含む | 含まない |
|------|----------|
| walkId `05ctx` · `05i` · **`05confirm`（新規想定）** | `apps/web` の改変 |
| W2 override コンポーネント（`ObsRegistrationW2.tsx` 等） | 本番 API 実呼び出し（lab では mock / toast 可） |
| sessionStorage / lab 内 draft シミュレーション | `it-hercules.uk` との **pixel parity** |
| 左ナビ・ホーム `01` からの 3-click 導線 | confirm 後 `done` walkId（別チェックリスト） |

### 0.3 設計 oracle 階層（矛盾時）

```text
REQ（01-要件/05-観測.md）
  → DET（02-設計/features/05-観測/詳細設計-v3.md）
    → UI（ui/観測入力-v2.md · ui/コンテキスト.md · slices/screens/observation-confirm.md）
      → TRN（遷移設計-v2.md · 05-観測-入力-遷移設計-v1.md §0）
        → 副次: docs/planning/w2-checkpoint/ui-copy-spec/05-観測-v1.md
```

- **`apps/web` は READ ONLY 参照**（実装存在のヒント）。合格基準に **しない**。
- **`入力UI設計-v1.md`** は雌雄・4 コントロール行の salvage。**フロー・主 CTA は `ui/観測入力-v2.md` + `遷移設計-v2.md` が正本**（入力終端「保存」は v1 限定 · lab では **不可**）。
- **`ui-copy-spec/05-観測-v1.md`** は Tier D pilot 副次 oracle。**TRN v2 と矛盾する「05i 主 CTA=保存（完了）」は lab 受入 FAIL** とする（§7 ギャップ参照）。

### 0.4 明示 — NOT production parity

本チェックリストは **「本番 URL / apps/web と同じ DOM・同じ API」** を要求しない。  
要求するのは **設計 doc が定義する画面責務・3 画面フロー・コピー oracle・状態** の lab 再現のみ。

---

## 1. Context — 対象を選ぶ（walkId: `05ctx`）

| ID | 区分 | 要件（lab が示す/行うこと） | 設計出典 | 検証方法 | walkId |
|----|------|----------------------------|----------|----------|--------|
| LAB-05-CTX-01 | MUST | walkId `05ctx` が `/s/05ctx` で直接ロード可能 | `screens.json` · `ui/コンテキスト.md` §1 | HTTP 200 · 手動 | 05ctx |
| LAB-05-CTX-02 | MUST | 見出し **「何を観測しますか？」** を表示 | `ui/コンテキスト.md` §2 ステップ① | grep / Playwright `getByRole('heading')` | 05ctx |
| LAB-05-CTX-03 | MUST | **5 ドメイン**チップ（生物 · 器物・無機物 · デジタル · 環境 · カスタム） | `01-要件/05-観測.md` §4.11 OBS-TGT-01 · `ui/コンテキスト.md` §2 | 手動 · DOM 5 件 | 05ctx |
| LAB-05-CTX-04 | MUST | 候補・ツリー・タグは **文字のみ**（サムネ・標本画像なし） | OBS-TGT-02 · `ui/コンテキスト.md` §3 禁止 | 手動 · img 不在 | 05ctx |
| LAB-05-CTX-05 | MUST | ステッパ **①対象 ②絞り込み ③確認** を表示 | `ui/コンテキスト.md` §2 · §3 mock 表 | 手動 · 3 ラベル | 05ctx |
| LAB-05-CTX-06 | MUST | ステップ②に **3 タブ**（学名検索 · 質問で絞る · 分類ツリー） | `ui/コンテキスト.md` §2 · ADR-H-16 §4 | 手動 | 05ctx |
| LAB-05-CTX-07 | MUST | 生物で **亜種ステータス**トグル（亜種まで確定 / 亜種未区別（種まで）） | OBS-TGT-04 · `ui/コンテキスト.md` §2 ステップ③ | 手動 · 2 ボタン | 05ctx |
| LAB-05-CTX-08 | MUST | 亜種未到達かつ「未区別」未選択時 **〔適用〕無効** + 理由 1 行 | OBS-TGT-04 · `ui/コンテキスト.md` §4 | state check · disabled | 05ctx |
| LAB-05-CTX-09 | MUST | **主 CTA は 1 つ「適用」**（副次は outline · トグル） | OBS-CTX-03 · `ui/コンテキスト.md` §2 ステップ③ | grep「適用」· 主ボタン 1 | 05ctx |
| LAB-05-CTX-10 | MUST | 〔適用〕で **WorkflowContext**（target + stage）を lab draft / query に書き **`05i` へ遷移** | OBS-CTX-01 · `ui/コンテキスト.md` §5 · `詳細設計-v3.md` §10 | 手動: 適用→05i · draft 存在 | 05ctx → 05i |
| LAB-05-CTX-11 | MUST | 候補は **確定しない**（プリフィルのみ · 05i でユーザー確定） | OBS-CTX-02 · OBS-SOL-04 · `01-要件/05-観測.md` §4.10 | 設計レビュー + 05i 編集可 | 05ctx |
| LAB-05-CTX-12 | MUST | **empty / loading / error**（候補なし · 取得失敗 · スケルトン） | `ui/コンテキスト.md` §4 · OBS-NF-04 | state check · StatePanel | 05ctx |
| LAB-05-CTX-13 | SHOULD | 生物のみ **段階セグメント**（卵/幼虫/蛹/成虫/不明）· 令は **05i 側** | ADR-H-16 §6 · `ui/コンテキスト.md` §2 | 手動 | 05ctx |
| LAB-05-CTX-14 | SHOULD | タグプレビュー（`domain:` `order:` … 構造化チップ） | OBS-TGT-06 · `ui/コンテキスト.md` §2 | DOM `.obs-tag` 等 | 05ctx |
| LAB-05-CTX-15 | MUST | 禁止語なし（昆虫専用 · 昆虫観察記録 · 固体観測 · 未実装/WIP） | OBS-TGT-01 · `ui-copy-spec/05-観測-v1.md` §5 | grep 0 件 | 05ctx |

**3101 現状 FAIL（参照のみ）**: 適用は `hot(onAction)` のみで **draft/query 未書き込み** · ステッパ③未 active · 全画面固定 TREE（ボトムシート doc との差は SHOULD 扱い可）。

---

## 2. Input — 計測入力（walkId: `05i`）

| ID | 区分 | 要件（lab が示す/行うこと） | 設計出典 | 検証方法 | walkId |
|----|------|----------------------------|----------|----------|--------|
| LAB-05-IN-01 | MUST | walkId `05i` が `/s/05i` で直接ロード可能 | `screens.json` · `詳細設計-v3.md` §10 | HTTP 200 | 05i |
| LAB-05-IN-02 | MUST | **主 CTA =「確認へ」**（terminal「保存」禁止） | `遷移設計-v2.md` §1–§2 · `ui/観測入力-v2.md` §3.4 · OBS-RX-UX-03 | grep「確認へ」· **「保存」が forward 唯一なら FAIL** | 05i |
| LAB-05-IN-03 | MUST | 計測行 **4 コントロール**（項目 · 数値 · 単位 · 計測方法） | OBS-INPUT-01 · `入力UI設計-v1.md` §3 · `ui/観測入力-v2.md` §3.4 | 手動 · 4 フィールド | 05i |
| LAB-05-IN-04 | MUST | **性別トグル**で表示分岐（雄=角長表示 · 雌=角長淡色/非表示 · 値保持） | `入力UI設計-v1.md` §4 · ADR-H-13 §D6 | 手動 `05i-m`/`05i-f` 連携 | 05i |
| LAB-05-IN-05 | MUST | ヘッダ **対象チップ**に 05ctx の WorkflowContext を **プリフィル** | OBS-CTX-01 · `ui/観測入力-v2.md` §3.1 · `入力UI設計-v1.md` §2.1 | 05ctx→05i 後チップ文字一致 | 05i |
| LAB-05-IN-06 | MUST | 対象チップタップで **05ctx を開き入力途中 draft を破棄しない** | `05-観測-入力-遷移設計-v1.md` §0 · `ui/コンテキスト.md` §1 | 手動: 値入力→ctx→戻る | 05i ↔ 05ctx |
| LAB-05-IN-07 | MUST | **令（L1–L3）· 性別 · 採卵日**は 05i の属性（05ctx に置かない） | ADR-H-16 §6 · `入力UI設計-v1.md` §2.1 | 設計レビュー | 05i |
| LAB-05-IN-08 | MUST | 〔確認へ〕押下で **draft を lab 永続化**し **`05confirm` へ遷移**（同一画面で commit 完了扱い禁止） | `遷移設計-v2.md` §2 · `詳細設計-v3.md` §10 `observation-draft` | 手動: 05i→05confirm · sessionStorage | 05i → 05confirm |
| LAB-05-IN-09 | MUST | 入力 **3〜5 認知チャンク**（対象/命名 · 環境設置 · 次回観測 · 計測 · 写真） | OBS-RX-UX-01 · `ui/観測入力-v2.md` §2 | 手動 Card 数 3–6 | 05i |
| LAB-05-IN-10 | MUST | **環境・設置**チャンク（placement · devices[] · snapshot checkbox） | OBS-RX-UX-04 · `ui/観測入力-v2.md` §3.2 | DOM `obs-env-placement-chunk` 相当 | 05i |
| LAB-05-IN-11 | MUST | **次回観測**チャンク（date picker · テンプレ理由 · skip checkbox） | OBS-RX-UX-10 · `ui/観測入力-v2.md` §3.3 | 手動 | 05i |
| LAB-05-IN-12 | MUST | 副次 **〔行を追加〕** · テンプレ導線（主 CTA を奪わない） | `入力UI設計-v1.md` §2 · OBS-TPL-03 | 手動 · outline のみ | 05i |
| LAB-05-IN-13 | MUST | **empty / loading / error**（テンプレ未選択 · 保存検証失敗 · raw 非表示） | `入力UI設計-v1.md` §7 · OBS-RX-UX-09 · OBS-NF-04 | state check | 05i |
| LAB-05-IN-14 | SHOULD | 計測行 IoT 選択時の機器未登録は **環境チャンク/settings 導線**（計測行必須バナーは ver2 OUT） | `遷移設計-v2.md` §7 · `ui/観測入力-v2.md` §7 OBS-INPUT-06/07 | 設計レビュー | 05i / 05iot |
| LAB-05-IN-15 | MUST | 禁止語なし · パンくず **「観測 › 計測入力」** | `ui-copy-spec/05-観測-v1.md` §2 | grep | 05i |

**3101 現状 FAIL（参照のみ）**: 主 CTA **「保存」** + 同一画面 toast 完了 · **confirm 遷移なし** · 5 チャンク未実装 · 環境/次回なし · `useState` のみで **draft 非共有**。

---

## 3. Confirm — 確認（walkId: `05confirm` ※新規）

| ID | 区分 | 要件（lab が示す/行うこと） | 設計出典 | 検証方法 | walkId |
|----|------|----------------------------|----------|----------|--------|
| LAB-05-CFM-01 | MUST | walkId **`05confirm`** が lab index に存在し `/s/05confirm` ロード可 | `遷移設計-v2.md` §0 · `screens.json` **（未登録 · §7）** | HTTP 200 · screens.json | **05confirm** |
| LAB-05-CFM-02 | MUST | 見出し **「登録前の確認」**（または「観測内容の確認」）+ 1 行説明 | `slices/screens/observation-confirm.md` · `ui/観測入力-v2.md` §3.5 | grep / heading | 05confirm |
| LAB-05-CFM-03 | MUST | **主 CTA 1 つのみ「登録する」**（設計別名「観測を確定」可 · 同義） | OBS-RX-UX-03 · `遷移設計-v2.md` §4 · `observation-confirm.md` CTA 表 | grep · 主ボタン 1 | 05confirm |
| LAB-05-CFM-04 | MUST | **観測個体データ**サマリー（計測行一覧 · フェーズ/性別 · 編集リンク） | `observation-confirm.md` 表示要素 · `詳細設計-v3.md` §10 | 手動 · `obs-chunk-individual-data` 相当 | 05confirm |
| LAB-05-CFM-05 | MUST | **写真**サマリー（preview or「写真は未登録です」· 編集リンク） | 同上 · `ui/観測入力-v2.md` §3.4 | 手動 | 05confirm |
| LAB-05-CFM-06 | MUST | **環境・設置**サマリー（placement · 設置開始 · 機器 role:id） | OBS-RX-UX-04 · `observation-confirm.md` · DET §10 G5 | 手動 · `obs-chunk-periodic` 相当 | 05confirm |
| LAB-05-CFM-07 | MUST | **次回観測**サマリー（予定日 / skip / 由来） | OBS-RX-UX-10 · `observation-confirm.md` | 手動 | 05confirm |
| LAB-05-CFM-08 | MUST | 副次 **「この設定をテンプレートとして保存」**（secondary · commit 前後可） | OBS-TPL-18 · `遷移設計-v2.md` §4 | outline ボタン | 05confirm |
| LAB-05-CFM-09 | MUST | 各チャンク **「編集」→ 05i**（`?edit=measurement` 等 · lab では section スクロール可） | `遷移設計-v2.md` §4 · `observation-confirm.md` | 手動 05confirm→05i | 05confirm → 05i |
| LAB-05-CFM-10 | MUST | **draft なし**で来訪 → empty「確認データが見つかりません」+ **入力へ戻る** | `observation-confirm.md` 状態 empty · OBS-NF-04 | sessionStorage クリア | 05confirm |
| LAB-05-CFM-11 | MUST | commit 失敗時 **error**（理由 1 行 · raw 非表示 · 再試行） | OBS-RX-UX-09 · `遷移設計-v2.md` §6 | mock 409/400 | 05confirm |
| LAB-05-CFM-12 | MUST | commit 中 **loading**（「登録中...」· 二重送信 disabled） | `observation-confirm.md` loading 行 | state check | 05confirm |
| LAB-05-CFM-13 | SHOULD | binding **差分**サマリー（device A→B） | OBS-RX-UX-08 · DET §10 G8 **ver2 defer** | 静的設置のみで PASS | 05confirm |
| LAB-05-CFM-14 | SHOULD | 〔登録する〕成功後 **done 相当**へ（walkId `05done` または toast + ホーム） | `遷移設計-v2.md` §4 · `/observation/done` | 手動 | 05confirm → (05done/01) |

**3101 現状 FAIL（参照のみ）**: **`05confirm` walkId 不存在** · confirm コンポーネント未実装 · `screens.json` にエントリなし。

---

## 4. 横断要件（Cross-cutting）

| ID | 区分 | 要件 | 設計出典 | 検証方法 | walkId |
|----|------|------|----------|----------|--------|
| LAB-05-X-01 | MUST | **3 画面フロー**: `05ctx` → `05i` → `05confirm`（input で terminal 保存しない） | `遷移設計-v2.md` §1 · REQ §4.16 OBS-RX-UX-02/03 | E2E 手動 3 画面 | 05ctx·05i·05confirm |
| LAB-05-X-02 | MUST | **Draft 引き継ぎ**: ctx 適用 → input hydrate → confirm read-only（WorkflowContext + ObservationDraft 语义） | `詳細設計-v3.md` §10 · ADR-H-15 §5 | sessionStorage キー確認 | 横断 |
| LAB-05-X-03 | MUST | **1 画面 1 主ボタン**（ctx=適用 · input=確認へ · confirm=登録する） | OBS-RX-UX-03 · `ui/観測入力-v2.md` §5 | 各画面 grep | 05ctx·05i·05confirm |
| LAB-05-X-04 | MUST | **3 クリック以内**で confirm 到達（例: ホーム→ctx 適用→input 確認へ） | OBS-RX-UX-02 · OBS-NF-03 · `遷移設計-v2.md` §1 | クリック数カウント | 01→05ctx→05i→05confirm |
| LAB-05-X-05 | MUST | **コピー oracle — 禁止 CTA**: 05i 終端「保存」· confirm 不在のまま「保存しました」完了 toast | TRN v2 > ui-copy-spec · §0.3 | grep FAIL 条件 | 05i |
| LAB-05-X-06 | MUST | taxonomy / target **確定は常にユーザー**（OS・Driver 自動確定 UI なし） | OBS-SOL-04 · OBS-TAX-07 | 設計レビュー | 横断 |
| LAB-05-X-07 | MUST | append-only（confirm 後の **編集 UI 禁止** · 追記導線のみ） | OBS-RX-UX-07 | 設計レビュー | 05confirm 以降 |
| LAB-05-X-08 | SHOULD | ホーム `01` 主 CTA **「観測登録を始める」→ 05ctx**（Tier D パス A） | `ui-copy-spec/05-観測-v1.md` §3 パス A | 手動 | 01→05ctx |
| LAB-05-X-09 | MUST | 全 3 画面で **empty / error / loading** のいずれか設計が要求する状態を実装 | OBS-NF-04 · OBS-RX-UX-09 | state checklist §1–§3 | 横断 |
| LAB-05-X-10 | MUST | **色は意味のみ** · 背景 `#0D0D0D` · カード `#1A1A1A`（preferences §A/B） | `ui/コンテキスト.md` デザイン規範 | 目視 | 横断 |

---

## 5. フロー受入（End-to-end · 5–10 行）

| ID | 区分 | シナリオ | 合格条件 | walkId 経路 |
|----|------|----------|----------|-------------|
| LAB-05-FLOW-01 | MUST | **パス A — 新規登録（推奨）** | 01 → 05ctx 適用 → 05i 確認へ → 05confirm 登録する | 01→05ctx→05i→05confirm |
| LAB-05-FLOW-02 | MUST | **パス B — 左ナビ** | 観測 → 05ctx → 05i → 05confirm（3 クリック以内で confirm 到達可） | 05ctx→05i→05confirm |
| LAB-05-FLOW-03 | MUST | **コンテキストスキップ** | 05i 初回 empty から ctx 省略でも 確認へ→confirm 可（対象空のまま） | 05i→05confirm |
| LAB-05-FLOW-04 | MUST | **ctx 再入** | 05i 入力中 → 05ctx 適用 → 05i 戻る · **計測値保持** + 対象更新 | 05i↔05ctx→05i |
| LAB-05-FLOW-05 | MUST | **confirm 戻り編集** | 05confirm「計測値を編集」→ 05i → 再 確認へ → サマリー更新 | 05confirm→05i→05confirm |
| LAB-05-FLOW-06 | MUST | **draft 欠落ガード** | 05confirm 直アクセス · draft なし → empty + 入力へ戻る | 05confirm |
| LAB-05-FLOW-07 | SHOULD | **性別分岐** | 05i 雄 → 05i-m 相当表示 → 05confirm に角長行 | 05i/05i-m→05confirm |
| LAB-05-FLOW-08 | SHOULD | **IoT 副経路** | 05i 環境/機器未登録 → 13 または 05iot → 05i 復帰 | 05i→05iot→05i |
| LAB-05-FLOW-09 | MUST | **コピー禁止違反なし** | フロー全体 grep: 昆虫観察記録 · 未実装 · WIP = 0 | 横断 |

---

## 6. 採点ルーブリック（HOME 再構築 · ユーザーフィードバック用）

### 6.1 軸定義

| 軸 | 重み（案） | 測定内容 | データソース |
|----|-----------|----------|--------------|
| **STRUCTURAL** | 25% | walkId 存在 · `/s/{id}` 200 · ホットスポット/nav 到達 | `screens.json` · HTTP · 手動 |
| **DESIGN-FULFILLMENT** | 45% | 本 checklist §1–§5 の **MUST PASS 率**（SHOULD は加点） | §1–§5 行 ID |
| **UX** | 30% | 3-click · チャンク数 3–5 · コピー oracle · 1 主ボタン | Charter Q1/Q2 · grep |

### 6.2 算出（テンプレート）

```text
DESIGN-FULFILLMENT = MUST_pass / MUST_total × 100
  （SHOULD 每 PASS +0.5 点、上限 100）

UX = (3click_PASS ? 40 : 0) + (chunk_3-5 ? 30 : 0) + (copy_oracle_PASS ? 30 : 0)

TOTAL = 0.25 × STRUCTURAL + 0.45 × DESIGN-FULFILLMENT + 0.30 × UX
```

### 6.3 ユーザー採点シート（HOME `01` 再構築時 · 記入例）

| 項目 | 値 |
|------|-----|
| 日付 | |
| 実施者 | |
| STRUCTURAL（0–100） | walkId 3/3 存在? · nav 切替? |
| MUST PASS | __ / 38（v1 行数 · 実装後に再カウント可） |
| SHOULD PASS | __ / 8 |
| 3-click（01→confirm） | PASS / FAIL · 実測 __ クリック |
| コピー oracle | PASS / FAIL · 禁止 CTA 有無 |
| **TOTAL** | |
| メモ（FAIL ID 列挙） | 例: LAB-05-IN-02, LAB-05-CFM-01 |

### 6.4 ゲート判定（案）

| TOTAL | 判定 |
|-------|------|
| ≥ 85 | **PASS** — Tier D 昇格候補 |
| 70–84 | **CONDITIONAL** — MUST FAIL のみ次スプリント |
| < 70 | **FAIL** — 設計再読 + lab index 修正 |

---

## 7. lab index 明示ギャップ（実装前に修正すべき項目）

| # | ギャップ | 現状 | 必要アクション | 関連 ID |
|---|----------|------|----------------|---------|
| G1 | **`05confirm` walkId 未登録** | `screens.json` に `05ctx`/`05i` のみ | `05confirm` エントリ追加 · mock 任意 · registry override | LAB-05-CFM-01 |
| G2 | **05i hotspot が confirm へ向かない** | 05i hotspots: 05ctx/05i-m/05tl/05iot/18photo | 主 CTA hotspot → `05confirm` | LAB-05-IN-08 |
| G3 | **`ObsRegistrationW2` に confirm コンポーネントなし** | Input のみ · 保存 terminal | `ObsConfirm*W2` 追加（別 PR） | LAB-05-CFM-* |
| G4 | **ui-copy-spec が TRN v2 と矛盾** | §2–§3: 05i 主 CTA=**保存（完了）** | copy-spec v2 更新 · confirm 行追加 | LAB-05-X-05 |
| G5 | **draft 永続化未配線** | component `useState` のみ | lab `observation-draft` 相当（sessionStorage） | LAB-05-X-02 |
| G6 | **05ctx 適用 → query/draft 未反映** | `hot(onAction,11)` のみ | 適用時 target/stage 書込 + navigate 05i | LAB-05-CTX-10 |
| G7 | **入力 5 チャンク未スコープ化** | 1 行 mock のみ | `ui/観測入力-v2.md` §2 Card 分割 | LAB-05-IN-09–11 |
| G8 | **scorecard `05confirm.json` 不存在** | scorecards に 05ctx/05i のみ | 本 checklist 合格後に scorecard 追加 | §6 |

---

## 8. 行数サマリー（v1）

| セクション | MUST | SHOULD | 計 |
|------------|------|--------|-----|
| §1 Context | 13 | 2 | 15 |
| §2 Input | 13 | 1 | 14 |
| §3 Confirm | 12 | 2 | 14 |
| §4 Cross-cutting | 8 | 2 | 10 |
| §5 Flow | 6 | 2 | 8 |
| **合計** | **52** | **9** | **61** |

---

## 9. 改訂履歴

| 版 | 日付 | 内容 |
|----|------|------|
| v1 | 2026-07-05 | 初版 — 設計 oracle 準拠 · 3101 コード未変更 · confirm walkId ギャップ明示 |

---

*正本: 本書 · 設計 doc が上位 · apps/web / it-hercules.uk は parity 基準にしない*
