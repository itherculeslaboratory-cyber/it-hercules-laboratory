# ADR-H-15 — 観測コンテキスト（Observation Context）

> **ステータス**: **草案 v1.1 · 人間レビュー待ち**（2026-06-09 · 観測対象ナビゲータ [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md) と整合し `ObservationTarget` 参照へ更新）
> **背景**: ユーザー指摘 — 観測（検索 05a / 入力 05i / テンプレ一覧 05tl）を行き来するたびに「今どの対象・どの発育段階を扱っているか」を毎回選び直すのが面倒。観測対象・フェーズを **1 度決めたら全観測画面で引き継ぐ** 軽い仕組みが欲しい。
> **前提**: [ADR-H-14](./ADR-H-14-グローバル文脈バー.md)（グローバル文脈バー）を **拡張**する。混同禁止: taxonomy / 対象の確定は **常にユーザー**（[`05-観測.md`](./05-観測.md) OBS-SOL-04 · OBS-TAX-07）。
> **役割分担（混同禁止）**: 本 ADR-H-15 は **「決めた対象をどう伝播するか」（propagation）**。観測対象を **何から選ぶか**（多ドメイン・亜種必須・文字のみ・3 経路）は [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md)。`WorkflowContext` は H-16 の **`ObservationTarget` 参照**を保持する（種文字列ではない）。
> **実装禁止ゲート**: 設計 4 点未確定。本書はたたき台（`.cursor/rules/design-before-implementation-gate.mdc`）。

---

## 1. 決定（要約）

観測ドメインに **WorkflowContext（観測コンテキスト）** という軽量な「作業中の前提」を導入する。

- **内容**: `target`（観測対象 = [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md) の `ObservationTarget` 参照）+ `stage_name`（発育段階）+ 任意の `phase`（飼育フェーズ／作業局面）。
  - **後方互換**: 旧 `species`（種文字列）は `target.domain=biological` の `target.display_alias`/`path` 末尾に写像。新規は `target` を正とする。
- **設定 UI**: 全画面遷移ではなく、文脈バーから開く **ボトムシート ピッカー**（05ctx）で選ぶ。
- **伝播**: 観測の主要画面（**05i 入力 / 05a 検索 / 05tl テンプレ一覧**）へ **クエリパラメータ** `?species=&stage=&scope_route=` で引き継ぐ。
- **永続**: 既定は **localStorage**（端末ローカル）。任意で **プロフィール保存**（複数端末同期、12 設定）。
- **taxonomy の扱い**: コンテキストは **既定値（プリフィル）に過ぎない**。観測ごとにユーザーが確定する（コンテキストが観測の種を自動確定 **しない**）。

---

## 2. WorkflowContext データ契約（たたき台）

```jsonc
// localStorage key: "ihl.observation.context.v1"
{
  "target": {                       // ADR-H-16 ObservationTarget 参照（軽量サブセット）
    "target_id": "tgt_01J...",      // 確定済みなら ID（下書きは null 可）
    "domain": "biological",         // biological|artifact|digital|environment|custom
    "path": ["Coleoptera", "Scarabaeidae", "Dynastes",
             "Dynastes hercules", "Dynastes hercules hercules"],
    "rank": "subspecies",
    "display_ja": "ヘラクレスオオカブト（原名亜種）",
    "display_alias": "Heracules hercules",  // OBS-TAX-06（確定値ではない）
    "subspecies_status": "resolved"  // 生物のみ: resolved|undetermined_to_species
  },
  "stage_name": "larva",            // 辞書 enum: egg|larva|pupa|adult|unknown（05 §⑪.2）
  "stage_subtype": "L3",            // 任意 · larva_subtype: L1|L2|L3|unknown_instar
  "phase": "breeding",              // 任意 · 飼育フェーズ／作業局面（自由・非確定）
  "scope_route": "/observation",    // 文脈バーの基準ルート（ADR-H-14 と整合）
  "set_at": "2026-06-09T07:00:00Z", // 設定時刻（最新行採用の参考）
  "source": "local"                 // local | profile
}
```

| フィールド | 必須 | enum / 正本 | 備考 |
|------------|:----:|-------------|------|
| `target` | 任意 | [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md) `ObservationTarget` 参照 | 未設定可（「対象を選ぶ」空状態）。生物は亜種必須（H-16 §4.1） |
| `target.domain` | target あれば ○ | `observation_target_domain.yaml` | ドメインで文脈バーのチップ表示が変わる |
| `target.display_ja` | target あれば ○ | 表示名 | UI 表示の主 |
| `target.display_alias` | 任意 | 表示 alias | UI 表示のみ・確定値ではない（OBS-TAX-06） |
| `stage_name` | 任意 | `egg/larva/pupa/adult/unknown`（05 §⑪.2） | 生物以外は省略可 |
| `stage_subtype` | 任意 | `L1/L2/L3/unknown_instar` | `stage_name=larva` 時のみ。**入力 05i で確定**（H-16 §6） |
| `phase` | 任意 | 自由（非辞書・非確定メタ） | 例: 採卵・幼虫管理・羽化待ち |
| `scope_route` | 任意 | ルート文字列（ADR-H-14） | 文脈バー絞り込みの基準 |

> **重要（混同禁止）**: WorkflowContext は **観測の前提（UI 状態）** であって、capture/observation の **確定対象 / taxonomy ではない**。保存される観測レコードの対象・段階は **入力画面でユーザーが確定した値** を正とする（OBS-SOL-04）。コンテキストは初期表示を埋めるだけ。対象を **何から選ぶか**（多ドメイン・亜種必須・文字のみ・3 経路）は [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md)。

---

## 3. 文脈バー統合（ADR-H-14 拡張）

[ADR-H-14](./ADR-H-14-グローバル文脈バー.md) の文脈バーに、観測ドメインでのみ **種族チップ** を追加する。

| 要素 | 内容 | 動作 |
|------|------|------|
| **対象チップ** | 例: 〔ヘラクレス（原名亜種）· L3 幼虫〕/ 〔皿〕/ 〔RPG 作品名〕（**文字のみ**） | タップ → 05ctx ボトムシートを開く |
| 未設定時 | 〔＋ 対象を選ぶ〕（淡色・注意色なし） | タップ → 05ctx（ドメイン選択から · ADR-H-16） |
| 既存 4 入口（愚痴/改善/テンプレ/編集） | ADR-H-14 のまま | 不変 |

- 対象チップは **観測ドメイン（05*）でのみ表示**。他ドメイン（06/07 等）の文脈バーには出さない。
- チップは **副次・等サイズ**（1 画面 1 主ボタン原則を侵さない · ADR-H-14 §原則）。**画像/絵文字アイコンに依存しない文字表示**（ADR-H-16 §1 文字のみ）。
- 段階（L3 幼虫等）の表示は **生物ドメイン**のみ。器物・デジタルはドメインに応じた補足（カテゴリ等）。

---

## 4. ボトムシート ピッカー（05ctx · 全画面遷移にしない理由）

| 観点 | 判断 |
|------|------|
| なぜシート | 種・段階を選ぶのは **軽い割込みタスク**。全画面遷移だと現在の作業（入力途中等）を失う恐れ。シートなら **その場で選んで閉じれば作業継続**。 |
| クリック深度 | 文脈バー チップ → シートで `種選択 → 段階選択 → 適用` = **3 タップ以内**（OBS-NF-03）。 |
| 構成（3 チャンク） | ① 種族（候補リスト + 検索 + 最近使った種）② 発育段階（egg/larva/pupa/adult、larva は L1〜L3）③ 適用ボタン（任意で「プロフィールにも保存」トグル） |
| 状態 | loading（種候補取得）/ empty（候補なし → 自由入力）/ error（再試行） |

> 詳細レイアウト・モック仕様は [`../../02-設計/features/05-観測/ui/コンテキスト.md`](../../02-設計/features/05-観測/ui/コンテキスト.md)。

---

## 5. 伝播（クエリパラメータ）

コンテキストは **URL クエリ** で各観測画面へ引き継ぐ（ブックマーク・共有・リロードに強い）。

| 遷移先 | ルート例 | プリフィル動作 |
|--------|----------|----------------|
| **05i 入力** | `/observation/input?species=Dynastes%20hercules&stage=larva&scope_route=/observation` | ヘッダの種族 DD・フェーズ DD・段階を初期選択（[`05-観測-入力UI設計-v1.md`](./05-観測-入力UI設計-v1.md) §2 チャンク1）。**ユーザーは確定前に変更可**。 |
| **05a 検索** | `/observation?species=…&stage=larva` | 左フィルタの「種」「ステージ」を初期チェック（[`../../02-設計/features/05-観測/ui/Streamlit.md`](../../02-設計/features/05-観測/ui/Streamlit.md) §2.1）。 |
| **05tl テンプレ一覧** | `/observation/templates?species=…&stage=larva&scope_route=/observation` | 性別/段階チップと「種向け」バナーをプリフィル（[`05-観測-計測テンプレ-UI設計-v1.md`](./05-観測-計測テンプレ-UI設計-v1.md) §2）。 |

**規約**

- パラメータが URL に無い場合は **localStorage → profile** の順でフォールバック。
- URL の値が localStorage と食い違う場合は **URL を優先**（明示遷移を尊重）。閉じた後、シートで「適用」したら localStorage を更新。
- `stage` は辞書 enum 値（`larva` 等）。`species` は正規名（URL エンコード）。
- 不明値（辞書外 stage 等）は **無視してフォールバック**（raw エラーを出さない · OBS-NF-04）。

---

## 6. 永続（localStorage + 任意プロフィール）

| 層 | 用途 | 正本 |
|----|------|------|
| **localStorage**（既定） | 端末内で観測画面を跨いで保持。ログイン不要でも機能 | key `ihl.observation.context.v1` |
| **プロフィール保存**（任意） | 複数端末で同じコンテキストを復元。シートのトグル / 12 設定 | 12 設定 FR（[`12-設定-詳細設計-v1.md`](./12-設定-詳細設計-v1.md) と同期） · 保存は append-only スナップショット |

- プロフィール保存は **明示オプトイン**（既定は端末ローカルのみ）。
- 「最新行採用」: プロフィール側が複数スナップショットを持つ場合、`set_at` が最新の行を正とする（`rag-csv-inquiry.mdc` の最新採用と整合）。

---

## 7. 機能要件（05 へ追加 — OBS-CTX-01〜03）

> 正本は [`05-観測.md`](./05-観測.md) §4.10。本 ADR は契約・根拠。

| ID | 要件 | 受入の目安 |
|----|------|------------|
| OBS-CTX-01 | 文脈バーから **WorkflowContext（種族 + 段階 + 任意フェーズ）** を設定でき、05i/05a/05tl に引き継がれる | 種を設定 → 入力/検索/テンプレでプリフィルされる |
| OBS-CTX-02 | コンテキストは **既定値（プリフィル）のみ**。観測ごとにユーザーが確定し、自動確定しない | 種を変えても保存レコードは入力画面の確定値 |
| OBS-CTX-03 | localStorage 永続（既定）+ 任意プロフィール保存。URL クエリ > localStorage > profile の優先順 | リロード/別画面でコンテキスト保持・URL 明示が勝つ |

---

## 8. スコープ外・非目標

- 種・段階の **自動推定でコンテキストを確定** すること（候補提示は可・確定はユーザー）。
- 観測以外のドメイン（マーケット・掲示板）への種族チップ表示。
- 環境 IoT のデバイス選択をコンテキストに含めること（機器導線は OBS-TPL-08 のまま）。
- サーバ側の重い state 管理（Phase 1 は URL + localStorage で十分 · OBS-NF-06）。

---

## 9. 未決（人間 Go）

- 種族チップに **直近 N 種の履歴** を出すか（草案: 出す・最大 5 件）。
- プロフィール保存を **12 設定のどのカテゴリ** に置くか（草案: 「観測の既定」）。
- `phase` を将来 **辞書化**するか（草案: 当面 自由テキスト・非確定メタ）。

---

## 10. 関連

- [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md) — 観測対象ナビゲータ（**対象選択**。本 ADR は **伝播**。WorkflowContext は H-16 `ObservationTarget` を参照）
- [ADR-H-14](./ADR-H-14-グローバル文脈バー.md) — グローバル文脈バー（本 ADR の土台）
- [ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md) — 計測テンプレ bridge（テンプレ一覧の種/段階フィルタ）
- [`05-観測.md`](./05-観測.md) §4.5 taxonomy · §4.9 OBS-TPL · §4.10 OBS-CTX · §⑪.2 stage enum
- UI: [`05-観測-入力UI設計-v1.md`](./05-観測-入力UI設計-v1.md) · [`05-観測-計測テンプレ-UI設計-v1.md`](./05-観測-計測テンプレ-UI設計-v1.md) · [`../../02-設計/features/05-観測/ui/コンテキスト.md`](../../02-設計/features/05-観測/ui/コンテキスト.md) · [`../../02-設計/features/05-観測/ui/Streamlit.md`](../../02-設計/features/05-観測/ui/Streamlit.md)
- 遷移: [`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md) · [`05-観測-計測テンプレ-遷移設計-v1.md`](./05-観測-計測テンプレ-遷移設計-v1.md)

---

*草案 v1 · 非正本 / 人間レビュー待ち / 実装禁止ゲート有効 — 実装 Go 不可*
