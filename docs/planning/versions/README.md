# バージョン計画索引（ver1〜4+）

> **設計正本**: [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](../../../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md)  
> **運用ステータス**: [`../STATUS.md`](../STATUS.md)

ユーザー向けマイルストーン語彙 **ver1 / ver2 / ver3 / ver4+** の索引です。本文は設計フォルダの正本を参照してください（削除・移動しません）。

---

## バージョン一覧

| ver | 定義 | 状態 |
|-----|------|------|
| **ver1** | 観測入力の完成（context → commit · binding · 3 チャンク） | ✅ COMPLETE（2026-06-26） |
| **ver2** | 検索 + 表示（`.dev` · 画像 · Q2 可変詳細） | ✅ COMPLETE（2026-06-26） |
| **ver3** | 初回 Web 本番リリース（コア機能揃い · インターネット公開） | 🟢 **本番稼働中** |
| **ver4+** | 段階的機能拡張（ver4, ver5, …） | バックログ整理済み |

---

## 関連ドキュメント

| ファイル | 用途 |
|----------|------|
| [`IHL-段階リリース計画-ver1-4+.md`](../../../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) | **正本** — §8.1 優先順 · IN/OUT · 旧 Phase マッピング（付録 A） |
| [`観測v1完了-横展開と段階計画.md`](../../../02-設計/_横断/観測v1完了-横展開と段階計画.md) | ver1 横展開パターン · 設計ゲート |
| [`docs/ver3-deploy-runbook.md`](../../ver3-deploy-runbook.md) | ver3 本番デプロイ技術正本 |
| [`docs/ver3-あなたがやること.md`](../../ver3-あなたがやること.md) | ver3 オーナー向け Phase 0〜6 |
| [`docs/ver4-infra-agreement.md`](../../ver4-infra-agreement.md) | ver4 Workers×VPS インフラ合意（**未着手**） |
| [`02-設計/_横断/adr/ADR-H-33-ver4-Workers-VPS-役割分離-v1.md`](../../../02-設計/_横断/adr/ADR-H-33-ver4-Workers-VPS-役割分離-v1.md) | ver4 ADR |
| [`docs/ver2-human-signoff.md`](../../ver2-human-signoff.md) | ver2 人手サインオフ記録 |
| [`docs/ver2-verification-checklist.md`](../../ver2-verification-checklist.md) | ver2 検証チェックリスト |
| [`docs/implementation-deferrals.md`](../../implementation-deferrals.md) | 意図的延期（PT ショップ UI 等） |

---

## ver3 本番クイック参照

| 役割 | URL |
|------|-----|
| Web | https://it-hercules.uk |
| API | https://api.it-hercules.uk |

ver3 は **暫定妥協**（FastAPI 全量 VPS）。ver4 完了まで有効。ver4 目標形は [`ver4-infra-agreement.md`](../../ver4-infra-agreement.md) §1。

---

*索引のみ。変更は `02-設計/_横断/IHL-段階リリース計画-ver1-4+.md` で行う。*
