# リポジトリ戦略 — legacy civilization-os と IHL（たたき台・非正本）

> **用途**: 2026-06-07 ユーザー確定方針の短い正本たたき台。設計 AI · 人間レビュア向け。  
> **確定日**: 2026-06-07  
> **関連**: [`00-AI-HANDOFF-BRIEF.md`](./00-AI-HANDOFF-BRIEF.md) §2.1 · [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md)

---

## 1. 一文結論

**`it-hercules-laboratory` = 唯一の新システム（OSS public）。**  
**`civilization-os` = legacy / archive（参照 + salvage のみ）。**  
二製品並行 · consumer モデル · C-Sync 理想設計採用 — **すべて否**。

---

## 2. リポジトリ比較表

| 観点 | **it-hercules-laboratory**（正本） | **civilization-os**（legacy） |
|------|-----------------------------------|------------------------------|
| **位置づけ** | ゼロから設計する **唯一の製品** | 過去実装のアーカイブ |
| **GitHub** | `itherculeslaboratory-cyber/it-hercules-laboratory` | `itherculeslaboratory-cyber/civilization-os` |
| **ローカル例** | `D:\Programs\it-hercules-laboratory` | `D:\Programs\civilization-os` |
| **公開方針** | **OSS public**（MIT / Apache-2.0 等 · ADR 確定） | 存続 · **新機能開発しない** |
| **UI** | IHL repo `apps/`（Streamlit → Web） | React monolith — **参照のみ** |
| **component** | Python `components/` + Docker | Node/Express — **salvage 参考** |
| **永続データ** | **R2 append-only 必須** | 旧 R2 データ · 移行元 |
| **改善履歴** | **GitHub**（PR · BOARD · Discussions · ADR） | 旧 file-board · git — **参照のみ** |
| **統治** | **新 ADR-001**（設計中） | ProjectRules · **C-Sync = legacy 法律** |
| **開発** | **継続 · 唯一の実装先** | **凍結 · salvage のみ** |

---

## 3. salvage（回収）vs abandon（捨てる）

### 3.1 salvage — legacy から持ち込む価値があるもの

| 領域 | legacy 参照先 | IHL での扱い |
|------|---------------|--------------|
| R2 I/O | `backend/src/utils/r2.ts` | `libs/r2_io.py` に **思想移植**（no-overwrite） |
| 固体観測画像処理 | `solidObservationLogic.ts` | ingest / thumbnail component **参考** |
| 血統 UI 文化 | `ui-reference/lineage/notes.md` | IHL UI 要件（色補正なし等） |
| INSERT ONLY | `civilization/R2Engine.md` | R2 ランタイム層の **必須原則** |
| 要件文言 | `01-要件/` · REQ CSV | IHL 再設計の **入力** |
| schema 列案 | `2026.06,06/詳細設計書` | `02-設計/_横断/schema/` たたき台 |

### 3.2 abandon — IHL 理想設計で **採用しない** もの

| 項目 | 理由 |
|------|------|
| **C-Sync 4 媒体** | GitHub + R2 で代替。理想設計では全面不採用 |
| **Twin / Builder / 120 画面 Kernel** | 文明 OS monolith 構造 — IHL 再設計外 |
| **civ-os consumer 接続** | 二製品モデル廃止 |
| **civ-os monolith 継続開発** | archive 凍結 |
| **file-board を IHL 正本にする** | IHL = GitHub BOARD.md / Discussions |
| **ランタイムデータを GitHub に置く** | karma · platinum · 観測 JSON = **R2 のみ** |
| **Postgres / SQLite を SSOT にする** | 2026.06,06 原則と同型 — DB 禁止 |

---

## 4. C-Sync 決定

| 文脈 | 決定 |
|------|------|
| **IHL 理想設計** | **C-Sync 全面不採用** |
| **改善・議論・決定の歴史** | GitHub（PR · BOARD.md · Discussions · ADR） |
| **ランタイム監査・イベント** | R2 append-only（観測 · karma · platinum · tag · run_info） |
| **civilization-os repo 内** | `ProjectRules.md` · `CivilizationSyncEngine.md` は **legacy 法律として残存** — **新 IHL には適用しない** |
| **新 IHL 憲法** | `docs/adr/001-governance.md`（**ADR-001 · 未作成**）で GitHub + R2 統治を明文化 |

```text
旧 civ-os モデル（legacy）:
  spec ↔ post(file-board) ↔ commit ↔ R2意図メタ
  → civilization-os repo のみ。IHL では使わない

新 IHL モデル（理想）:
  ADR/docs ↔ BOARD/Discussions ↔ PR/commit ↔ R2ランタイムデータ
  → it-hercules-laboratory repo のみ
```

---

## 5. OSS public 計画（IHL）

| 段階 | 内容 | 備考 |
|------|------|------|
| **設計** | 本フォルダ `指示/it-hercules-laboratory/` → IHL `docs/` へ移行 | たたき台 · 人間レビュー後 |
| **Phase 0** | R2 spike · no-overwrite 証跡 | private repo 可（運用猶予） |
| **Phase 1** | component + Streamlit · CI 緑 | **public 公開を ADR で確定** |
| **ライセンス** | MIT or Apache-2.0（D-06 · 要 ADR） | 依存 OSS ライセンス整合 |
| **legacy civ-os** | public のままでも **archive 明示**（README に非正本注記） | 並行製品と誤解されないよう |

---

## 6. 設計 AI チェックリスト

- [ ] 文書内の「stays in civ-os」「consumer」「二系統」を **IHL rebuild / legacy 参照** に読み替えたか
- [ ] ランタイムデータが **R2 append-only** と書かれているか（GitHub 非保存）
- [ ] C-Sync を理想設計に **持ち込んでいない**か
- [ ] 新機能実装先が **IHL repo のみ** と明記されているか
- [ ] ADR-001（IHL 統治）の草案を起票したか

---

## 7. 関連ドキュメント

| パス | 用途 |
|------|------|
| [`00-AI-HANDOFF-BRIEF.md`](./00-AI-HANDOFF-BRIEF.md) §2.1 | 正式方針 6 項目 |
| [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md) | 単一 IHL アーキテクチャ図 |
| [`05-GitHub運用-コンポーネント掲示板.md`](./05-GitHub運用-コンポーネント掲示板.md) §6 | C-Sync 不採用詳細 |
| [`civilization/ProjectRules.md`](../../civilization/ProjectRules.md) | **legacy** 憲法（civ-os repo のみ） |

---

*たたき台・非正本 / 2026-06-07 ユーザー確定方針 / 設計 AI 引き継ぎ用*
