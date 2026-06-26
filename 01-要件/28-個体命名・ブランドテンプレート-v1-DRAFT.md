# 28-個体命名・ブランドテンプレート — 要件定義（v1-DRAFT）

> **ステータス**: DRAFT（Q1–Q7 確定 2026-06-07 / v1.0確定候補）  
> **作成日**: 2026-06-21  
> **用途**: 観測登録時の個体命名（ブランド/シリーズ）・血統表示・改名履歴の append-only 契約を定義する。  
> **非正本**: 採用判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/ProjectRules.md` を優先。

---

## 1. 目的・スコープ（ver1 / ver2）

### 1.1 目的

観測登録時に「個体IDだけでなく人間が呼べる名前」を扱い、血統表示・観測継続・シリーズ運用（例: 「王」-2026-1）を一貫化する。  
同時に `R2 INSERT ONLY` 原則に従い、改名・昇格は更新ではなくイベント追記で管理する。

### 1.2 ver1 スコープ（推奨）

- 観測入力で `individual_id + display_name` を表示・編集できる
- ブランドテンプレートをユーザーごとに作成・選択できる（`{series}-{year}-{seq}`）
- 個体への命名/改名を append-only イベントで記録できる
- 血統表示で parent/child の表示名を出せる（ID 併記）

### 1.3 ver2 スコープ（推奨）

- 「玉世代の最良個体のみ王へ昇格」などの評価ロジック自動化
- 自動昇格ワークフロー（ルールエンジン、通知、取り消しポリシー）
- 複合ブランド運用（複数 series 同時運用時の衝突解決）
- 観測テンプレートの community fork 共有（`OBS-TPL-20` 連携）
- テンプレ/タグの投票・自然淘汰（`OBS-TPL-21`・`OBS-TAG-01` 連携）

### 1.4 境界

- 本書は **命名と表示契約** を定義する。血統グラフ描画そのもの（詳細可視化）は既存方針どおり Phase 2 で扱う。
- 個体 truth は既存どおり `individual_id` を正本キーとし、`display_name` は可変ラベルとして append-only で履歴管理する。

---

## 2. 用語

| 用語 | 定義 |
|------|------|
| `individual_id` | 個体の不変ID。既存規約では `ind_{ulid}` |
| `display_name` | ユーザー表示用の可変名（例: `「王」-2026-1`） |
| `brand_template` | 命名テンプレート定義（ユーザー作成） |
| `series` | ブランド系列名（例: `王` / `彩` / `G-FOX`） |
| `promotion` | 世代・評価により表示名を格上げする操作（例: 玉→王） |
| `name_event` | 命名/改名/昇格を表す append-only イベント |

---

## 3. 機能要件（FR）

### 3.1 命名・表示

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| IND-NAME-01 | 観測登録時に対象個体を `individual_id + display_name` で表示する | 入力画面・確認画面・履歴一覧でID併記 |
| IND-NAME-02 | `display_name` 未設定時は ID ベースの既定表示（例: `ind_xxx`）にフォールバックする | 空状態でも識別不能にならない |
| IND-NAME-03 | 観測保存時に命名操作があれば `name_event` を追記し、観測セッションから参照できる | セッションと命名イベントの参照IDが残る |
| IND-NAME-04 | 後から改名可能とするが、過去表示は履歴として再現可能にする | 時点指定で「当時名」を引ける |

### 3.2 テンプレート（ユーザー定義）

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| IND-NAME-05 | ユーザーは `brand_template` を作成できる（例: `G-FOX-{year}-{seq}`） | 新規テンプレ保存できる |
| IND-NAME-06 | テンプレートを選択して命名候補を自動生成できる | 観測入力でドロップダウン適用 |
| IND-NAME-07 | ユーザーはテンプレートを更新/無効化できる（履歴は保持） | 旧テンプレ参照履歴が残る |
| IND-NAME-08 | テンプレート削除は論理削除（active=false）とし、実体削除しない | 過去生成名の再現性を維持 |

### 3.3 血統・昇格

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| IND-NAME-09 | 親子表示で `♂/♀ + display_name + individual_id` を併記できる | 個体詳細・血統導線で親名表示 |
| IND-NAME-10 | 子世代にシリーズ命名（例: `玉-2027-1`）を適用できる | 世代切替時もID連続 |
| IND-NAME-11 | 昇格（例: 玉→王）は改名イベントとして記録し、旧名を保持する | 1 個体で複数名履歴が時系列で残る |
| IND-NAME-12 | 昇格操作の主体（手動/半自動/自動）をイベント属性で記録する | `actor_type` と `promotion_reason` を保持 |

---

## 4. テンプレート構文

### 4.1 最小構文（v1）

`{series}-{year}-{seq}`

例:
- `王-2026-1`
- `彩-2026-1`
- `G-FOX-2026-12`

### 4.2 プレースホルダ（v1）

| key | 意味 |
|-----|------|
| `{series}` | 系列名（ユーザー定義文字列） |
| `{year}` | 命名時の年（YYYY） |
| `{seq}` | シリーズ内連番（1..n） |

### 4.3 バリデーション（v1）

- 禁止: 空 series、禁止文字のみ、長さ上限超過
- `seq` は系列×年単位で重複不可（同一ユーザー内）
- 生成後でも手修正可（保存時は **同一ユーザー × 同一 series** 内の現行名重複のみチェック — Q3 **B**）

---

## 5. ユーザー定義テンプレート CRUD（append-only 前提）

### 5.1 `brand_template` イベント

- `template_created`
- `template_updated`
- `template_deactivated`

> いずれも append-only。最新採用状態は projection で計算する。

### 5.2 改名履歴

- 直接 `display_name` を UPDATE しない
- `name_event` を追加し、最新表示名は projection で算出
- 履歴には `old_name` / `new_name` / `reason` / `template_id`（任意）を保持

---

## 6. 観測登録フローへの組み込み

### 6.1 組み込みタイミング

- 観測入力開始時: 対象個体ロード時に現行 `display_name` を表示
- 命名未設定時: テンプレート選択または手入力を促す
- 保存前確認: `individual_id + display_name` を明示

### 6.2 画面導線（要件レベル）

- `/observation/...` 入力UIに命名セクションを追加
- テンプレート: 観測入力で簡易選択、本管理は設定配下（Q6 **C** — 詳細設計で導線確定）
- 主要導線 3 クリック以内を維持（既存 NFR 準拠）

---

## 7. 血統表示との連携

- parent 表示: `♂ 王-2026-1 (ind_xxx)` / `♀ 彩-2026-1 (ind_yyy)`
- child 表示: `玉-2027-1 (ind_zzz)`
- 血統上の真実関係（親子関係）は既存どおり `cross` / `cross_parent` / `offspring_assignment` 系を優先し、命名は表示レイヤと履歴イベントで扱う

---

## 8. 「玉→王」昇格ルール

### 8.1 ルール定義枠

- 昇格対象系列（例: `玉`）
- 昇格先系列（例: `王`）
- 判定単位（世代内）
- 判定責任（人間手動 / 半自動候補提示 / 自動）

### 8.2 v1 推奨

- **手動昇格**のみ（判定責任はユーザー）
- システムは昇格前後の履歴整合と重複防止を担保

### 8.3 v2 推奨

- 「最良個体」の判定アルゴリズム（計測値・QC・評価イベント）を定義し、自動候補提示を導入

---

## 9. R2 / event_store データ契約（INSERT ONLY）

### 9.1 主要イベント（案）

| event_type | 必須項目（抜粋） |
|------------|------------------|
| `name_assigned` | `event_id, individual_id, new_name, assigned_at, actor_id` |
| `name_renamed` | `event_id, individual_id, old_name, new_name, reason, renamed_at` |
| `name_promoted` | `event_id, individual_id, old_name, new_name, promotion_rule_id, promoted_at` |
| `template_created` | `template_id, owner_user_id, pattern, series, created_at` |
| `template_updated` | `template_id, changed_fields, updated_at` |
| `template_deactivated` | `template_id, deactivated_at, reason` |

### 9.2 投影（read model）

- `individual_current_name`（最新名）
- `individual_name_history`（時系列履歴）
- `template_latest_state`（利用可能テンプレ一覧）

> 書き込みは常にイベント追記、表示は projection で計算する。

---

## 10. 非機能・境界

| ID | 要件 |
|----|------|
| IND-NFR-01 | `R2 INSERT ONLY` を厳守（命名・改名・昇格・テンプレ更新すべて追記） |
| IND-NFR-02 | 同一ユーザー × 同一 series 内で現行 `display_name` の重複を防止（系列が異なれば同名文字列可・履歴重複は許容 — Q3 **B**） |
| IND-NFR-03 | 観測入力の追加操作は最小化（3クリック導線維持） |
| IND-NFR-04 | 命名未設定でも観測フロー継続可（入力阻害禁止） |
| IND-NFR-05 | 表示名は UX 用ラベルであり、識別子の正は `individual_id` とする |

---

## 11. 既存要件との整合・ギャップ

### 11.1 整合

- `FR-MVP-04`（親個体連携）と整合: 命名は個体連携の可読性を強化する拡張
- `05-観測` の `individual_id` 中心設計と整合: ID を不変キーとして維持
- `ADR-H-11` の truth/snapshot 分離と整合: 命名は truth 関係を改変しない

### 11.2 ギャップ/競合（要解消）

1. `FR-MVP-04` ではセッションに `sire_id/dam_id` を載せる記述がある一方、`05-観測` では個体 master 側保持が主で記述が揺れている。  
2. 現行 schema は `local_label_text` 中心 — **Q1 A** で `display_name` 統一方向は確定、schema 詳細設計で正本契約を反映する。  
3. ~~「最良個体」判定~~ → **Q4 A / Q5 A**（v1 手動昇格・手動評価のみ）で確定。  
4. ~~テンプレート連番の採番粒度~~ → **Q2 C**（`owner_user_id + series + year`）で確定。

---

## 12. 人間判断・決定事項

### 12.1 確定（2026-06-07 — ユーザー承認）

| # | 決定 | 内容 |
|---|------|------|
| Q1 | **A** | `display_name` に統一（`local_label_text` は互換・段階移行） |
| Q2 | **C** | `{seq}` 採番 = `owner_user_id × series × year` |
| Q3 | **B** | 現行名の重複: **シリーズが違えば許可**（同一ユーザー × 同一 series 内のみ禁止） |
| Q4 | **A** | 玉→王昇格は v1 **完全手動** |
| Q5 | **A** | 「最良個体」判定は v1 **手動評価のみ** |
| Q6 | **C** | テンプレ: **観測で簡易選択**、**設定で本管理** |
| Q7 | **C** | 親表示は **ハイブリッド**（truth は `parent_role`、表示は `sire→♂` / `dam→♀` マッピング、`surrogate` 等は役割名表示） |

> Q1〜Q7 が確定したため、本書の未確定論点は解消済み。質問票の AI 推奨は Q3 が **B**（同一ユーザー全面禁止の A ではない）であり、IND-NFR-02・§4.3 は Q3 **B** に整合済み。

### 12.2 §AI仮定（運用上の残置）

- A-04: 現行ID規約 `ind_{ulid}` を維持
- A-05: 命名未設定時のフォールバックは `individual_id` 表示

（Q1〜Q7 で確定した項目は §12.1 を正とし、旧 UQ-01〜05 / A-01〜03 は本表に吸収済み。）

### 12.3 決定記録 / ADR連携（Q7: C 採用）

Q7（親表示方式）は、血統 truth を固定しながら命名 UX を崩さないことが最重要であり、[`02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) の Cross/CrossParent/OffspringAssignment 分離を前提に比較した。特にユーザー目標の「王/彩/玉の命名運用」「血統証明の継続」「R2 INSERT ONLY」「研究・論文化時の再解析可能性」を同時に満たせるかで評価した。

**検討案（A/B/C）**  
A は v1 を `♂/♀` 固定で見せる 2 親前提の方式、B は `parent_role` をそのまま UI に出す ADR 準拠方式、C は truth を B と同じ `parent_role` に置きつつ、投影層で `sire/dam` のみ `♂/♀` 表示にするハイブリッド方式である。

**評価軸（何を考えたか）**  
評価は、(1) 観測入力で迷わない UX（王/彩/玉の呼称を自然に扱えるか）、(2) ADR-H-11 整合（N 親・仮親を壊さないか）、(3) 研究・論文化向けの再現性（後から lineage を再構築できるか）、(4) 参考知見・既存論文運用との整合（表示と truth を分離し追跡可能にする設計か）、(5) v1 実装コスト（短期で導入可能か）で行った。

**なぜ C を採用したか**  
C は、画面では `♂ 王-2026-1` / `♀ 彩-2026-1` の直感的な表示を維持しつつ、内部は `CrossParent.parent_role` の append-only 事実を保持できる。これにより王/彩/玉のブランド命名と血統事実を同時に守れ、将来 `surrogate` や多親に拡張しても truth を作り直さずに済む。さらに、研究・公開時は role/event から lineage を再構築できるため、INSERT ONLY の履歴性と証跡性を落とさない。

**なぜ A を不採用にしたか**  
A は v1 実装は速いが、2 親固定モデルに寄るため ADR-H-11 の N 親前提と衝突し、将来拡張時に schema か運用のどちらかへ負債を先送りする。王/彩/玉の表示には適しても、血統 truth と研究再解析の観点で長期コストが高く、不採用とした。

**なぜ B を不採用にしたか**  
B は理論的に最も正しいが、v1 の観測導線で role chip 主体の UI を直接導入すると命名体験が複雑化し、初回運用の負荷が上がる。王/彩/玉の直観的認知を重視する今回の目標に対し、v1 時点では過剰設計となるため不採用とした。将来は C の内部契約を維持したまま、必要に応じて B 寄りの可視化へ段階移行する。

---

## 付録 A. Q7 親表示方式の比較記録（2026-06-07 確定: C）

**前提**: 命名（王/彩/玉）は `display_name` レイヤ。親子の **truth** は ADR-H-11 の `Cross` + `CrossParent` + `OffspringAssignment`（`05-観測` の `sire_id`/`dam_id` は v1 MVP 向け別系統で §11.2 に揺れあり）。

**例（王/彩/玉）**

| 個体 | display_name | 役割 |
|------|--------------|------|
| `ind_aaa` | 王-2026-1 | 父親（♂系） |
| `ind_bbb` | 彩-2026-1 | 母親（♀系） |
| `ind_ccc` | 玉-2027-1 → 昇格後 王-2027-1 | 子（OffspringAssignment） |

### 比較表

| | **A) v1 ♂/♀ 固定** | **B) parent_role 可変** | **C) ハイブリッド（採用）** |
|---|---|---|---|
| **UI** | 常に `♂ 王-2026-1` / `♀ 彩-2026-1` | 役割 chip（Template 由来）＋名前 | ユーザーには **♂/♀**、内部は `parent_role` |
| **データ** | `sire_id`/`dam_id` 固定枠中心 | `CrossParent.parent_role` = `sire`/`dam`/`surrogate`… | `parent_role` 保存、**表示マッピング**で ♂/♀ |
| **ADR-H-11 整合** | △（2親固定・N親非対応） | ◎（正本どおり） | ◎（正本＋表示分離） |
| **v1 実装コスト** | 低 | 高 | 中 |
| **将来拡張** | 仮親・多親に弱い | 強い | 強い |

### A) v1 ♂/♀ 固定

血統 UI は「父＝♂」「母＝♀」の 2 枠。データは `individual.sire_id` / `dam_id` か、CrossParent を内部的に sire/dam 2 件固定で扱う。

**メリット**: ユーザー像（♂王・♀彩）と一致、観測 v1 の親リンクが単純。**デメリット**: ADR-H-11 の N 親・Template 可変と衝突、仮親・多親を後から載せにくい。

### B) parent_role 可変（ADR-H-11 寄せ）

親は `CrossParent.parent_role`（`dictionaries/parent_role.yaml`）で記録。UI は ♂/♀ 固定ではなく **Template 由来 chip**。

**メリット**: schema 正本一致、多親・仮親に対応。**デメリット**: v1 で Template・辞書・chip UI が要る、OBS-IND-02 との橋渡し設計が別途必要。

### C) ハイブリッド（表示 ♂/♀、内部 parent_role）

Truth は B と同じ。投影層で `sire→♂`, `dam→♀` にマップ。`surrogate` 等は ♂/♀ ではなく「仮親」等。

**メリット**: 見た目は A・データは B、IND-NAME-09（♂/♀+名前）と両立しやすい。**デメリット**: 表示マッピング規則の設計が要る。

**採用結果（2026-06-07）**: Q7 は **C（ハイブリッド）** を採用。以後の詳細設計・UI 設計・テスト設計は本決定を前提にする。

---

## 13. 関連 REQ / ドキュメント cross-links

- `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`（FR-MVP-04 / FR-MVP-05）
- `01-要件/05-観測.md`（OBS-IND / OBS-QR / OBS-R2）
- `02-設計/Phase6-打鍵フィードバック-v1.md`（2026-06-21 追加打鍵FB対応）
- `02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`
- `02-設計/_横断/schema/schemas/capture/individual.schema.yaml`
- `docs/REQUIREMENTS.md`
- `rag/accepted_requirements.csv`

---

*DRAFT・非正本 / Q1〜Q7 確定済み（v1.0 確定候補）*
