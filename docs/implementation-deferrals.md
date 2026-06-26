# IHL — 意図的延期（implementation deferrals）

> **用途**: IT Hercules Laboratory リポジトリ内の **意図的延期** 正本。CivilizationOS 全体キューは [`docs/CONTINUE_QUEUE.md`](../../../docs/CONTINUE_QUEUE.md) の `P2-NEXT-DEFER-*` と併記可。  
> **ルール**: エントリは **`- [ ]` を付けない**（`続けて` バッチが誤拾いしない）。着手時は該当 ver の設計ゲート通過後に通常タスク化する。

---

## `P2-NEXT-DEFER-IHL-BRAND-SHOP-UI`

| 項目 | 内容 |
|------|------|
| **記録日** | 2026-06-26 |
| **トリガー** | ユーザー feedback — PT ショップ UI 暫定 polish **不採用**（「全然だめ」）· fix は後日 |
| **問題** | ブランド PNG（`brand-logo-primary` / `brand-logo-mark` · `econ-pt-coin` · `econ-indulgence-token`）を **ライトテーマ**（`app-shell` · `/economy/shop`）に載せた結果: **黒背景ボックスのアーティファクト** · ヘッダロゴのサイズ・余白 · ショップヒーロー/カード内のアイコン配置とテキストバランス |
| **スコープ** | **route**: `/economy/shop` · **components**: `EconIcon` · `BrandLogo` · `app-shell` ヘッダ |
| **対象 ver** | **ver3 polish パス** — [`IHL-段階リリース計画-ver1-4+.md`](../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §3.1.1 **順 4**（**認証・本番デプロイ後**）。ver9 マーケット #06 本実装とは **別トラック** |
| **ブロッカー（アセット）** | [`00-世界観アセット一覧-v1.md`](../02-設計/_ui-global/00-世界観アセット一覧-v1.md) §3.1 — 黒背景付き PNG は **透過エクスポート** または **ダークサーフェス専用レイアウト spec** が先 |
| **完了判定（Acceptance）** | ユーザー **sign-off** — PT ショップ + ヘッダのスクリーンショットが mock 品質バー（レイアウト・チャンク・主操作の一体感 · ピクセル一致は要求外）を満たすこと |
| **ユーザー向け UI** | **「未実装」等の延期文言を UI に書かない** — 現行 API 導線・購入フローは維持 |
| **コード痕跡** | `apps/web/src/app/economy/shop/page.tsx` — `// DEFER: IHL-BRAND-SHOP-UI`（polish 着手まで） |

**関連**: [`02-設計/_ui-global/assets/economy/README.md`](../02-設計/_ui-global/assets/economy/README.md) · `brand-assets.ts` · `econ-icon.tsx` · `brand-logo.tsx`

---

*初版 2026-06-26*
