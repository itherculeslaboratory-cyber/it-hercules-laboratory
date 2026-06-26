# ユーザー意図サマリー（高性能 AI 向け・1 ページ）

> 非正本。詳細は `00-AI-HANDOFF-BRIEF.md` を参照。

---

## やりたいこと

1. **IT Hercules Laboratory** という名前で、個体画像検索・解析基盤を **新 GitHub リポジトリ**に作り直す
2. 設計（要件・詳細・UI・テスト・CI・OSS）を **実装前に全部詰める**
3. **R2 に実データを登録できること**まで設計に含め、Phase 0 で検証する
4. 既存 `civilization-os` は汚いので **OSS 前提でクリーンに再構築**。使える知見・資料だけ活用

## やらないこと

- civilization-os の monorepo 構成をそのまま持ち込む
- 文明 OS 固有機能（Twin, Builder, 経済, A* API 120 画面）を混ぜる
- DB を永続の真実にする / ファイル上書き・削除

## 確定済み

| 項目 | 値 |
|------|-----|
| プロジェクト名 | IT Hercules Laboratory |
| GitHub remote（確定） | `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git` |
| 永続保存 | Cloudflare R2 のみ |
| データモデル | append-only + snapshot + Parquet manifest |
| Phase 1 UI | Streamlit（たたき台） |
| Phase 1 類似検索 | FAISS なし、subset cosine |

## 高性能 AI に任せること

- 上記を踏まえた **正式設計書一式**の作成
- 未決事項（latest 方式、スコア重み、公開範囲等）の確定
- 新 repo  scaffold + Phase 0 R2 検証 + Phase 1 実装

## 高性能 AI が最初に読むファイル

1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md`（本フォルダ）
2. `指示/it-hercules-laboratory/01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md`（20機能横断マップ）
3. `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/` 配下 4 ファイル

## コスト方針（ユーザー希望）

- **設計の本番は高性能 AI**に任せる
- 事前整理（本フォルダ）は「仕事しやすくする」ための下準備のみ
- 1 チャット = 1 成果物、設計フェーズと実装フェーズを分ける
