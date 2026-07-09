# CLAUDE.md — IT Hercules Laboratory

> **ワークスペース**: 本リポジトリ（`it-hercules-laboratory`）のみ。`civilization-os` の `frontend/` 等は編集禁止。

## 読む順

1. [`docs/planning/README.md`](docs/planning/README.md) — 計画ハブ入口
2. [`docs/planning/STATUS.md`](docs/planning/STATUS.md) — 本番状態・直近タスク・人間ゲート
3. 作業対象の [`01-要件/`](01-要件/)（例: `#05` 観測 → `01-要件/05-観測.md`）
4. 厚い引き継ぎ: [`00-AI-HANDOFF-BRIEF.md`](00-AI-HANDOFF-BRIEF.md)
5. ドメイン知識 Wiki（サブブレイン）: [`docs/knowledge/index.md`](docs/knowledge/index.md) — 蒸留済みトピックの 1 行カタログ

## 禁止事項

- **civilization-os** の `frontend/` · `backend/` への変更
- civ-os との **双方向ミラー同期を前提にした編集**（本 repo が正本）
- ユーザー向け UI に「未実装」「WIP（未完）」の表記
- R2 / Truth の UPDATE・DELETE

## テスト

```bash
# API / libs（repo ルート）
pytest -q

# Web（apps/web）
cd apps/web && npm test && npm run build
```

## ver3 本番メモ

| 役割 | URL |
|------|-----|
| Web（Cloudflare Pages） | https://it-hercules.uk |
| API（Sakura VPS · nginx） | https://api.it-hercules.uk |

- 本番 API は **Pages 経由の rewrite ではなく `api.it-hercules.uk` 直叩き**を正とする（`NEXT_PUBLIC_IHL_API_URL` / `IHL_API_URL`）。
- nginx + **certbot** 更新時は `deploy/nginx/ihl-api.conf` が上書きされないか手動確認（[`docs/vps-api-deploy.md`](docs/vps-api-deploy.md)）。
- 観測画像は `IHL_AUTH_REQUIRED=1` 時 **blob 認証付き fetch**（`AuthenticatedImage.tsx`）。

## 設計ゲート

V-model 5 点ゲート・POST-OSS キューは [`.cursor/rules/ihl-waterfall-v-model-gate.mdc`](.cursor/rules/ihl-waterfall-v-model-gate.mdc) を参照。既存実装への **retrofit テスト追加**はゲート後に可。

## トーン

ユーザー向け文言は **日本語** で簡潔に。技術 doc は日英混在可。

---

*正本: [itherculeslaboratory-cyber/it-hercules-laboratory](https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory)*
