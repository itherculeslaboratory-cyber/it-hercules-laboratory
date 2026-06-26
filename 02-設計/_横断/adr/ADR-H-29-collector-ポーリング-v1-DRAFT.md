# ADR-H-29 collector ポーリング v1（DRAFT）

> **⚠️ 制約（2026-06-21）**: 本 ADR の **サーバ側 SwitchBot 資格情報** に関する決定（§決定 1–3）は、[`ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) により **却下 / SUPERSEDED**。  
> **有効な部分**: Ed25519 ingest 分離 · collector を **ユーザー所有ローカル** optional bridge として扱う思想（secret は IHL VPS に載せない）。

## ステータス

DRAFT（2026-06-21）— **サーバ poll 部分は ADR-H-30 により未採用**

## 背景

- 観測入力で温湿度を自動取得したい要件がある。
- SwitchBot Cloud は **連続テレメトリ履歴 API を提供せず**、Webhook は **状態変化イベント**が中心（設定にも token+secret が必要）。
- 利用者は **SwitchBot secret を IHL デプロイスタックに載せたくない**（攻撃耐性 STRONG）。

## 決定（2026-06-21 時点 — サーバ secret 部分は却下）

~~1. `collector` サービスは起動中のみ SwitchBot API をポーリングする（`docker compose --profile collector`）。~~  
~~2. Web の「今すぐ取得」は API コンテナ経由で `SWITCHBOT_TOKEN` / `SWITCHBOT_SECRET` を利用する。~~  
~~3. 秘密値は `.env.local`（Git 管理外）/ `env_file` 経由で注入し、`.env.platform` は管理者運用に限定する。~~

**ADR-H-30 以降の正**:

1. **IHL 本番 API / VPS** は SwitchBot API を **呼ばない**（資格情報を保持しない）。
2. **自動取得**が必要な場合は **ユーザー PC / LAN** 上の collector（参考: `collector/switchbot-local-collector.mjs`）が poll し、**Ed25519 署名 ingest** のみ IHL へ送る。
3. **v1 正本**は SwitchBot アプリ **Export → IHL import** + **観測時手入力**。
4. 受信経路の署名検証は既存の `ENV_COLLECTOR`（Ed25519）を維持し、SwitchBot API 資格情報とは **分離**（**継続有効**）。

## 影響

- IHL VPS のみ稼働時: **自動 SwitchBot 取得は動作しない**（意図どおり）。
- ローカル bridge + ingest 稼働時: Tier B 更新可能（secret はユーザーマシンのみ）。
- push ネイティブが無い前提は [`ADR-H-19`](./ADR-H-19-SwitchBot-取得戦略-差分ポーリング-v1.md) と整合。

## 未決事項

- ~~最適ポーリング間隔~~ → **ローカル bridge 任意時のみ**（ADR-H-19 の 300s 参考）
- import CSV スキーマ（ADR-H-30 §7）
- 本番 API から server-side SwitchBot 呼び出し除去（IMPL タスク）

## 参照

- [`ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md`](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)
- [`../../.cursor/rules/no-switchbot-secret-in-ihl.mdc`](../../.cursor/rules/no-switchbot-secret-in-ihl.mdc)
