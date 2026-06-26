# ADR-H-33 — ver4 Workers × VPS 役割分離 v1

> **ステータス**: **ACCEPTED（ver4 ゲート）** — 2026-06-26 ユーザー会話合意  
> **決定日**: 2026-06-26  
> **性質**: **ver4 必須** — インフラ移行は **未完了**（決定のみ確定）  
> **詳細**: [`docs/ver4-infra-agreement.md`](../../../docs/ver4-infra-agreement.md)  
> **暫定 runbook**: [`docs/ver3-deploy-runbook.md`](../../../docs/ver3-deploy-runbook.md)  
> **legacy 参照**: [`docs/runbooks/production-deploy.md`](../../../../docs/runbooks/production-deploy.md)

> **注**: 別件の [`ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md`](./ADR-H-33-観測追記-デバイス紐づけ-v1-DRAFT.md) とは **ID 接頭辞のみ共通**。本 ADR は **インフラ役割分離**専用。

---

## コンテキスト

- ver3 は **CF Pages + Sakura VPS 512MB 上の FastAPI 全量**（[`ver3-deploy-runbook.md`](../../../docs/ver3-deploy-runbook.md)）— **暫定妥協**。
- 512MB に API 全集約は **スケール・メモリのボトルネック**になりうる。
- Workers のみに SMTP + 全 API を集約すると **magic link 実送信**と **運用秘密の分離**が難しい。
- 重い ML・SwitchBot server poll は **いずれのホストにも載せない**方針が既存 ADR と一致（H-30 等）。

---

## 決定

### D1 — 負荷偏在の禁止

| 禁止 | 理由 |
|------|------|
| **VPS 512MB のみ**に主 API + 永続化 + 認証 + バッチ | メモリ・単一障害点 |
| **Workers のみ**に主 API + SMTP + 常駐 kick | メール経路・秘密管理の分離不能 |

### D2 — ver4 役割分担（目標）

| コンポーネント | 役割 |
|----------------|------|
| **Cloudflare Workers** | **主 API** · 水平スケール · **R2 バインディング** · セッション検証 |
| **Sakura VPS（薄常駐）** | **SMTP** · **magic-link 送信 kick** · 最小常駐のみ |
| **CF Pages** | Next.js Web · `/api/*` → **Workers**（ver4 後） |
| **Cloudflare R2** | Truth events · INSERT ONLY |

### D3 — どちらにも載せない

- **重い ML 推論**（本番 API プロセス外）
- **SwitchBot server-side poll**（token+secret 保持）

### D4 — ver3 例外

ver4 出荷まで **FastAPI 全量 on VPS** を許容。ver3 を最終形とみなさない。

---

## 状態

| 項目 | 値 |
|------|-----|
| **決定** | ACCEPTED |
| **実装** | **未着手** |
| **ver4 インフラ完了** | **false** |

必須チェックリスト: [`ver4-infra-agreement.md` §6](../../../docs/ver4-infra-agreement.md)

---

## 却下した代替案

| 案 | 却下理由 |
|----|----------|
| ver3 のまま VPS API-only を恒久化 | 512MB 偏在 · スケール上限 |
| Workers-only（VPS 廃止） | SMTP magic link 実経路の欠落 |
| ver3 期間中に Workers へ全面即時移植 | ver3 リリース遅延 · 暫定妥協の意図に反する |

---

## 影響

- **Pages rewrite** — ver4 で VPS → Workers へ切替
- **`.env` / secrets** — SMTP は VPS · API 鍵は Workers secrets
- **エージェントルール** — [`.cursor/rules/ihl-ver4-hybrid-infra.mdc`](../../../../.cursor/rules/ihl-ver4-hybrid-infra.mdc)

---

## 関連 ADR

| ADR | 関係 |
|-----|------|
| ADR-H-30 | SwitchBot secret 非保持 |
| ADR-H-03 | R2 専用バケット |
| ADR-H-21 | IHL OSS 正本 |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-26 | v1 ACCEPTED（ver4 ゲート）· 会話合意の決定記録化 |
