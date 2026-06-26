# Phase 4 — ルートマスター ver1 v1（W0-W3）

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1（W0 Shell + W1 auth + W2 home + W3 observation）  
> **参照**: `ADR-UI-Rebuild-Waterfall-Plan-DRAFT.md` §Phase 4 · `Phase1-RTM-v1-観測-ver1-DRAFT.md` · `Phase5-人間判断記録-v1.md`

---

## 1. 目的

ver1 スコープの route を固定し、画面遷移・E2E・ScreenDef を同じ route_id で参照できるようにする。

---

## 2. ver1 ルートマスター

| wave | route_id | path | screen_id | 認証 | クリック目安 | 備考 |
|------|----------|------|-----------|------|--------------|------|
| W0 | `shell.root` | `/*` | `shell.global` | 任意 | 0 | AppShell 共通 |
| W1 | `auth.login` | `/login` | `O1` | 不要 | 0 | マジックリンク入口 |
| W1 | `auth.register` | `/register` | `O2` | 不要 | 1 | 初回登録 |
| W1 | `auth.terms` | `/terms` | `O3` | 不要 | 1 | 利用規約 |
| W1 | `auth.language` | `/language` | `O4` | 不要 | 1 | 言語選択 |
| W2 | `home.main` | `/` | `01` | 必須 | 0 | 司令塔 |
| W3 | `obs.context` | `/observation/context` | `05ctx` | 必須 | 1 | 文脈設定 |
| W3 | `obs.input` | `/observation/input` | `05i` | 必須 | 2 | 入力本体 |
| W3 | `obs.confirm` | `/observation/input/confirm` | `05confirm` | 必須 | 3 | 確認 |
| W3 | `obs.done` | `/observation/done` | `05done` | 必須 | 3 | 完了表示 |
| W3 | `obs.grid` | `/observation` | `05a` | 必須 | 1 | 一覧 |
| W3 | `obs.detail` | `/observation/:id` | `05b` | 必須 | 2 | 詳細 |
| W3 | `obs.template.list` | `/observation/templates` | `05tl` | 必須 | 2 | テンプレ一覧 |
| W3 | `obs.template.detail` | `/observation/templates/:id` | `05td` | 必須 | 3 | テンプレ詳細 |
| W3 | `obs.template.fork` | `/observation/templates/:id/fork` | `05t` | 必須 | 3 | Fork導線 |
| W3 | `individual.detail` | `/individuals/:id` | `IND` | 必須 | 2 | 親個体連携 |
| W3 | `individual.qr` | `/individuals/:id/qr` | `IND-QR` | 必須 | 3 | QR発行 |
| W3 | `obs.qr.scan` | `/scan` | `QR-SCAN` | 必須 | 2 | QR読取再開 |

---

## 3. post-ver1 参照ルート（非ブロッカー）

| route_id | path | 備考 |
|----------|------|------|
| `knowledge.hub` | `/knowledge` | post-ver1。遷移設計は `features/_横断/知の広場-遷移設計-v1-DRAFT.md` を参照 |
| `market.browse` | `/market` | #06 は ver1 OUT |
| `match.pairwise` | `/match` | #10 は ver1 OUT |
| `dispute.room` | `/board/.../dispute` | #11 は ver1 OUT |

---

## 4. route alias / 旧URL 方針

| 旧 route | 新 route | 扱い |
|----------|----------|------|
| `/home` | `/` | ver1 では alias 許容 |
| `/observation/solid` | `/observation/input` | 移行互換（短期） |
| `/research/content` | `/knowledge` | post-ver1 実装時に redirect |

---

## 5. 3クリック検証（ver1）

| 起点 | 目的 | 最短クリック |
|------|------|--------------|
| `/` | 観測入力開始（05i） | 2 |
| `/` | 観測登録完了（05done） | 3 |
| `/` | 個体QR表示（IND-QR） | 3 |
| `/` | QRスキャン再開（QR-SCAN） | 2 |

---

## 6. E2E 対応

| route_id | 主シナリオ |
|----------|------------|
| `obs.context` | `SC-05-CTX-01` |
| `obs.input` | `SC-05-BULK-01`, `SC-05-PHOTO-01`, `SC-05-SOL-01` |
| `obs.confirm` | `SC-05-CONFIRM-01` |
| `obs.done` | `SC-05-REG-01` |
| `obs.template.*` | `SC-05-TPL-01` |

---

## 7. 人間ゲート（Phase 4）承認記録

2026-06-07 承認で、次を確定済み:

1. ver1 route をこの表で凍結するか: **Yes（凍結）**  
2. alias をどこまで残すか（`/observation/solid` 等）: **推奨どおり採用**  
3. post-ver1 route をナビ上で露出するか（隠すか）: **推奨どおり採用**

---

## 8. 関連文書

- `02-設計/_横断/Phase4-遷移設計-ver1-v1-DRAFT.md`
- `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`
- `02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md`（post-ver1）
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 4 設計正本 / 2026-06-07 人間承認*
