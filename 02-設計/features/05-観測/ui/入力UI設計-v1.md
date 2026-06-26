# 05 観測 — 入力 UI 設計 v1（計測テンプレ・雌雄分岐・Fork）

> **ステータス**: **草案 · 人間目視レビュー待ち**（設計ゲート「UI 設計」 — 4 点未確定 · 実装 Go 不可）
> **作成日**: 2026-06-08
> **背景**: 監査班 D **FAIL**（計測「入力」UI モック 0 枚）への対応。検索 UI は [`05-観測-UI設計-v1.md`](./05-観測-UI設計-v1.md)、本書は **入力**（項目/数値/単位/計測方法/雌雄/Fork）。
> **前提**: [`05-観測.md`](./05-観測.md) OBS-TPL-01〜15 · OBS-CTX-01〜03 · OBS-TGT-01〜10 · [ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md)（bridge 契約）· [ADR-H-15](./ADR-H-15-観測コンテキスト.md)（伝播）· [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md)（対象ナビゲータ）· `ui-reference/preferences.md` §A/§B/§C
> **辞書正本**: [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml) · [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml)
> **イメージ画面正本**: [`../../02-設計/features/05-観測/ui/入力.md`](../../02-設計/features/05-観測/ui/入力.md)
> **遷移**: [`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md)

---

## 1. 主タスク（1 つ）

**「観測対象の計測値（項目・数値・単位・計測方法）を、性別に合ったテンプレで素早く記録する」**。

- 1 画面 1 主ボタン = **〔保存〕**。
- 主要導線 **3 クリック以内**（テンプレ選択 → 値入力 → 保存）。
- 色は意味のみ（#0D0D0D 背景・#1A1A1A カード・意味色のみ · §A/§B）。

---

## 2. チャンク構成（3〜5）

| # | チャンク | 内容 |
|---|----------|------|
| 1 | **ヘッダ / 現在地** | パンくず + **対象 DD（`ObservationTarget` · 文字）** + **フェーズ DD** + **段階（stage_name）** + **令（L1〜L3）** + **性別トグル〔雄〕〔雌〕** + **採卵日/誕生日** + **今日が N 日目** + 使用中テンプレ名 |

### 2.1 観測対象・コンテキストのプリフィル（OBS-CTX / OBS-TGT · [ADR-H-15](./ADR-H-15-観測コンテキスト.md) · [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md)）

ヘッダの **対象 DD / 段階 / フェーズ DD** は、文脈バーで設定した **WorkflowContext の対象（`ObservationTarget` 参照）** を初期値として埋める。

- 受け口: `/observation/input?target_id=<ULID>&domain=<...>&stage=<egg|larva|pupa|adult>&scope_route=/observation`（旧 `?species=` 後方互換）。
- 優先順: **URL クエリ > localStorage > profile**（無ければ空状態「対象を選ぶ」）。
- **コンテキストは既定値（プリフィル）のみ**。ここでユーザーが対象/段階を変更でき、保存される観測の確定値は **本画面の選択**（OBS-CTX-02 · OBS-SOL-04）。
- 対象チップ（文脈バー）から **ボトムシート 05ctx**（対象ナビゲータ）を開けば、入力途中の値を保持したままコンテキストだけ差し替えられる（[`../../02-設計/features/05-観測/ui/コンテキスト.md`](../../02-設計/features/05-観測/ui/コンテキスト.md)）。

> **令・性別・採卵日は入力 05i 側の属性**（ADR-H-16 §6）。**対象選択（05ctx）には令を持ち込まない**（対象スコープと観測ごとに変わる属性を混同しない）。生物以外（器物・デジタル）は段階/令/性別 DD を非表示にし、ドメインに応じた属性のみ表示する。
| 2 | **計測項目リスト** | 計測行（§3）の縦積み。性別で既定表示が切替（§4） |
| 3 | **行追加** | 〔行を追加〕（項目 DD / ＋自由入力） |
| 4 | **機器導線（条件表示）** | IoT 選択かつ機器未登録時のみ「機器管理へ」バナー（§5） |
| 5 | **保存** | 1 主ボタン〔保存〕（INSERT ONLY） |

---

## 3. 計測行（4 コントロール）— ユーザー要件の中核

![計測入力行（4 コントロール）](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-input-row.png)

1 行 = **項目・数値・単位・計測方法** の 4 コントロール（[ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md) §4）。

| コントロール | 仕様 | 辞書 / 写像 |
|--------------|------|-------------|
| **項目** | ドロップダウン（候補）＋ **「＋ 自由入力」** | `measurement_name.yaml` entries / 自由入力は ADR-H-13 §5 |
| **数値** | 空入力。`value_type` で種別変化（numeric=数値 / boolean=トグル / text=自由記述） | `value_type_to_input` |
| **単位** | ドロップダウン（候補）＋ **「＋ 追加」**。`unit_default` 初期表示 | `measurement_name.unit_default` |
| **計測方法** | ドロップダウン（**手入力 / IoT取得 …**）。IoT 選択で §5 へ | `measurement_method.yaml` / value_origin 既定写像 §3 |

> `value_type=text`（備考）は単位 DD を非表示。`boolean`（脱皮前）は数値入力をトグルに置換。

---

## 4. 性別トグルの挙動（雌雄テンプレ）

性別は **データ分岐ではなく表示分岐**（[ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md) §D6）。`measurement_name.applicable_sex` と `sex_visibility_rule` で既定表示を切替える。

### 雄（male）— 角長 表示

![計測入力 雄（角長 表示）](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-input-male.png)

`sex_visibility_rule.male = [both, male]` → **体重・体長・角長・胸幅** が既定表示。

### 雌（female）— 角長 非表示（淡色）

![計測入力 雌（角長 非表示）](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-input-female.png)

`sex_visibility_rule.female = [both, female]` → **角長（male 専用）を既定で非表示/淡色化**し「雌では既定で非表示」注記。代わりに `egg_count`（産卵数・female）を表示可能。

| sex 値 | 既定表示 | 備考 |
|--------|----------|------|
| `male` | both + male（角長 表示） | — |
| `female` | both + female（角長 非表示・産卵数 表示） | 角長は「任意で表示」リンクで復帰可 |
| `unknown` / `undetermined` | both のみ | male/female 項目は任意表示 |

> **重要**: 非表示はあくまで **既定**。ユーザーは任意で項目を追加でき、保存される measurement 行に性別差はない（sex は capture/observation 側）。

---

## 5. 機器導線（IoT 選択 × 機器未登録）

![IoT 選択・機器未登録バナー](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-device-link.png)

`measurement_method.requires_device=true`（`iot_switchbot` 等）を選び、**機器が未登録**のとき：

- 注意色（`#FFD66B`）の **バナー**「機器が未登録です / IoTで計測するには機器の登録が必要です」。
- 右に **大ボタン〔機器管理へ〕**（遷移先 `device_route` 暫定 `/settings/device`・班 C と同期）。
- バナーは **条件表示**（手入力選択時・機器登録済み時は出さない）。

---

## 6. テンプレ Fork（3 クリック）

![テンプレ Fork フロー](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-template-fork.png)

一覧 → 複製 → 編集・保存（[ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md) §6・OBS-TPL-10〜15）。保存時に `TemplateForkEvent` INSERT（ADR-H-04 §7）。**選択 → 複製 → 保存の 3 クリック以内**。

---

## 7. 状態（必須 · U-* DoD）

| 状態 | 表示 |
|------|------|
| **loading** | 行はスケルトン・テンプレ一覧はスピナ |
| **empty** | テンプレ未選択時「テンプレートを選ぶ or 空のまま項目を追加」/ 行 0 件は〔行を追加〕を強調 |
| **error** | 「保存できませんでした」+ 再試行（raw エラー非表示）。自由入力の単位欠落等は該当行をハイライト |
| **権限なし** | 他人のテンプレは閲覧のみ・複製は可（自分の child を作成） |

---

## 8. デザイン規範（§A/§B/§C 厳守）

- 背景 `#0D0D0D` · カード `#1A1A1A`/枠 `#2A2A2A`/角丸 12px/**影なし** · ボタン角丸 8px。
- **1 画面 1 主ボタン**（保存）· 大きいタップ標的 · 主要導線 3 クリック以内。
- **色は意味のみ**（注意=`#FFD66B`・成功=`#5CD68D`・情報=`#4DA3FF`）。装飾的多色化禁止。
- `value_origin` を **混同させない**（計測方法 → value_origin の既定写像を保存時確定 · §3）。
- 環境計測（温度・湿度）は SwitchBot/手入力を method で区別（OBS-ENV-06）。

---

## 9. 設計ゲート位置

要件 ☑（[`05-観測.md`](./05-観測.md) OBS-TPL-01〜15）· 詳細 ☑草案（[ADR-H-13](./ADR-H-13-観測計測テンプレ契約.md)）· 遷移 ☑草案（[`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md)）· **UI = 本 doc + モック 5 枚（草案 v1・人間確定待ち）**。

---

*草案 v1・非正本 / 人間目視レビュー待ち / 実装禁止ゲート有効 — 実装 Go 不可*
