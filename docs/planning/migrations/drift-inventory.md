# Nest vs Clean — ドリフト棚卸し

> **更新**: 2026-07-03  
> **正本**: `it-hercules-laboratory-clean`（GitHub `main`）  
> **参照のみ**: `civilization-os/指示/it-hercules-laboratory/`（ミラー · 双方向同期しない）

---

## サマリー

| 観点 | civ-os nest | clean（正本） |
|------|-------------|---------------|
| ルート | `civilization-os/指示/it-hercules-laboratory/` | repo ルート |
| 計画ハブ | 未整備（個別 md 散在） | `docs/planning/`（`44304f3`） |
| Cursor rules | civ-os `.cursor/rules/ihl-*.mdc`（nest パス） | `.cursor/rules/ihl-*.mdc`（ルート相対 · 本バッチ同期） |
| parity script | nest 親 `scripts/ihl-path-resolve.mjs` 依存 | `scripts/ihl-path-resolve.mjs` 同梱 |
| `design-impl-claims.json` | nest パス表記 | **本バッチでルート相対に修正** |

**方針**: 実装・デプロイ・コミットは **clean のみ**。nest は必要時に **clean → nest 一方向コピー**（本セッション末尾で実施）。

---

## キーファイル差分（2026-07-03 時点）

| パス | nest（civ-os 指示） | clean | 備考 |
|------|---------------------|-------|------|
| `docs/planning/` | なし | **あり** | STATUS · backlog · versions 索引 |
| `CLAUDE.md` | なし | **あり** | Claude Code ブートストラップ |
| `docs/DESIGN-IMPL-AUDIT.md` | なし | **あり** | 設計↔実装監査 |
| `docs/OSS-READINESS.md` | なし | **あり** | OSS 公開チェックリスト |
| `apps/web/src/hooks/useAuthSession.ts` | なし | **あり** | シェル認証 · actor_id |
| `apps/web/src/components/layout/app-shell.tsx` | ログイン導線なし | **ログイン/登録/ログアウト** | P1 実装 |
| `scripts/ihl-path-resolve.mjs` | civ-os 親のみ | **同梱** | standalone parity 用 |
| ver3/ver4 デプロイ doc | 同期済み相当 | 同期済み | API 直叩き · CORS · wrangler |
| `02-設計/` `01-要件/` | 同一ツリー | 同一ツリー | 設計正本は両方に存在（clean が OSS 正本） |

---

## parity チェック

```bash
node scripts/ihl-design-impl-parity-check.mjs
```

- **2026-07-03**: `design-impl-claims.json` パス修正後 **PASS（24 features · 0 FAIL）**。詳細は [`docs/DESIGN-IMPL-AUDIT.md`](../../DESIGN-IMPL-AUDIT.md)。

---

## ミラー手順（任意）

clean でコミット後、変更ファイルを `d:\Programs\civilization-os\指示\it-hercules-laboratory\` にコピー。civ-os 側は **コミットしない**（ユーザー方針）。

---

*clean = 製品正本 · nest = 設計アーカイブ兼参照*
