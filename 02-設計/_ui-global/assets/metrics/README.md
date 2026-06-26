# assets/metrics — 指標・空状態

> **配置者**: ユーザー（空状態は将来 AI 生成可 — 一覧で license 更新）  
> **仕様**: [`../../00-世界観アセット一覧-v1.md`](../../00-世界観アセット一覧-v1.md) — `metric-*` · `empty-*` id

---

## ここに置くもの

### 指標（karma · contribution · market rating）

| 想定ファイル | id | 用途 |
|-------------|-----|------|
| `karma-badge.svg` | `metric-karma-badge` | プロフィール・サマリー |
| `karma-monthly.png` | `metric-karma-monthly` | 月次バッチ UI |
| `contribution.svg` | `metric-contribution` | 貢献度・研究内訳 |
| `market-rating.svg` | `metric-market-rating` | 出品者・取引評価 |

### 空状態（empty states）

| 想定ファイル | id | 用途 |
|-------------|-----|------|
| `empty-list.svg` | `empty-list` | 一覧 0 件 |
| `empty-search.svg` | `empty-search` | 検索 0 件 |
| `empty-permission.svg` | `empty-permission` | 権限不足 |

---

## 設計上の注意

- **指標の統合禁止**: カルマ / 貢献度 / 評価は別アイコン（[`ADR-H-08`](../../02-設計/_横断/adr/ADR-H-08-指標とドメイン仕分け.md)）  
- **空状態**: 必須画面では UI 設計に文言 + 本アセット参照をセットで記載

---

*ユーザー配置フォルダ · Batch 0*
