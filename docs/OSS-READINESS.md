# OSS 公開 readiness チェックリスト

> **更新**: 2026-07-03  
> **スコープ ADR**: [`02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md)

---

## リポジトリ基盤

| 項目 | 状態 | 備考 |
|------|------|------|
| **LICENSE** | ⚠️ placeholder | MIT 文案あり · org 方針確定前 |
| **CONTRIBUTING.md** | ✅ あり | nest パス表記残存 → 本バッチでルート相対化推奨 |
| **README.md** | ✅ あり | 計画ハブリンク追加（本バッチ） |
| **CLAUDE.md** | ✅ 本バッチ追加 | AI エージェント入口 |
| **`.gitignore`** | ✅ | `.env` · `.env.local` · `.env.platform` 除外 |
| **CI** | partial | ローカル pytest 緑（2 既知失敗除く）· GHA は別途 |

---

## シークレット監査（2026-07-03 grep）

| パターン | 結果 |
|----------|------|
| コミット済み `.env` | **なし**（`.gitignore` で除外） |
| ハードコード API 鍵 | **なし**（テストは `monkeypatch.setenv` のみ） |
| `.env.platform.example` / `.env.local.example` | ✅ プレースホルダのみ |
| ドキュメント内の鍵名 | `R2_*` · `SMTP_*` · `SWITCHBOT_*` · `GMO_*` — **変数名のみ** |
| `node_modules/` | git 未追跡（`??`）· **push 前に除外確認** |

**推奨**: 公開前に `git log -p` で `SECRET` · `sk-` · `AKIA` 最終スキャン · [`05-運用/runbooks/secrets-rotation-playbook.md`](05-運用/runbooks/secrets-rotation-playbook.md)。

---

## civilization-os 依存の内部化

| civ-os 参照 | IHL 内の正本 | 状態 |
|-------------|--------------|------|
| `civilization/ProjectRules.md` | IHL ADR · 01-要件 | legacy 参照のみ · ランタイム非依存 |
| `ui-reference/preferences.md` | `02-設計/_ui-global/` · Tailwind `civ-*` | 文化参照 · Web に移植済み |
| `docs/REQUIREMENTS.md` | `01-要件/` | IHL 完結 |
| nest `指示/it-hercules-laboratory/` | **本 repo** | ADR-H-21: IHL が OSS 正本 |

---

## 機能 OSS ギャップ

正本: [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](02-設計/_横断/00-OSS機能ギャップ表-v1.md)

- ver1–3 コア（観測 · 認証 · 設定）: **運用中**
- #06–#23: 部分実装 · POST-OSS / V-WAVE キューで追跡

---

## 公開前 TODO（優先順）

1. [ ] LICENSE を org 確定版に差し替え
2. [ ] `CONTRIBUTING.md` の clone パスを repo ルートに統一
3. [ ] parity 12 件解消（`design-impl-claims` C4 パス）
4. [ ] `test_csv_import.py` 2 件修復
5. [ ] GitHub Actions: pytest + `apps/web` test/build
6. [ ] magic link SMTP 本番配線（人間ゲート）

---

*30 分オンボーディング: [`docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](OSS-CONTRIBUTOR-ONBOARDING-v1.md)*
