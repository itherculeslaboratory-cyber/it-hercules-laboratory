# ADR-Phase2-runtime-dispatch: WEB → ローカル Docker ジョブディスパッチ

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可（Phase2 移行 Go 前に人間確定必須）
> **作成日**: 2026-06-08
> **解消ギャップ**: B-05/B-06/B-07/B-08/B-09/B-10/B-22/B-23（専門班 B §2/§5）
> **正本前提**: [`00-設計網羅監査-専門班-B-ランタイム.md`](./00-設計網羅監査-専門班-B-ランタイム.md) §2/§7 · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) · [`ADR-Phase2-C-USB-component-契約.md`](./ADR-Phase2-C-USB-component-契約.md) · [`ADR-D01-latest-pointer-confirmed.md`](./ADR-D01-latest-pointer-confirmed.md)

---

## 文脈

Phase1 の実行は **CLI + Makefile**（`python run.py --input-manifest ...`）で HTTP を介さない。Phase2 で Web UI（Next.js）から component（ingest/embedding 等）を起動する **ジョブディスパッチ方式**が未定義（B-06）。状態管理（B-08）・認可（B-10）・catalog 選択からの実行導線（B-22）も未決。

---

## 検討した方式（専門班 B §2.3）

| 方式 | 概要 | append-only 整合 | レイテンシ | 運用負荷 |
|------|------|:---:|:---:|:---:|
| **A. Makefile-first** | Web は起動しない。手動 CLI のみ。Web は R2 latest を polling | ◎ | 高（手動）| 低 |
| **B. FastAPI ジョブキュー** | `POST /api/jobs` → run_id → subprocess/docker exec → `GET /api/jobs/{id}` | ○ | 中 | 中 |
| **C. R2 event-driven** | Web が `job_request.jsonl` を append → watcher が拾って起動 | ◎ | 高 | 中〜高 |

---

## 決定（IHL 向け）

### D-1. Phase1 = 方式 A（継続）

検索のみの Phase1 では Web から component を起動しない。pipeline 起動は **CLI/Makefile** のみ。Web は **D-01 pointer** で latest manifest を解決して表示する。

### D-2. Phase2 = 方式 B（FastAPI ジョブキュー）を採用、状態 SSoT は R2（方式 C の良所を取り込む）

```
Web UI → POST /api/jobs { component, params }      # 認可必須（D-4）
FastAPI → run_id 発行 → job_request を R2 append    # 状態の SSoT は R2（方式C思想）
         → docker run components/<name> (subprocess)
Web UI → GET /api/jobs/{run_id}                     # run_info.json を解決して返す
```

- **状態 SSoT = R2 の `run_info.json`**（インメモリは揮発キャッシュのみ）。再起動で状態を失わない・append-only と整合（B-08 解消）。
- 長時間ジョブは **非同期ポーリング**（WebSocket は任意・Phase2.1）。

### D-3. FastAPI ルート規約（B-07 解消）

| ルート | 用途 |
|--------|------|
| `POST /api/jobs` | ジョブ投入（body: component, params, input_pointer）|
| `GET /api/jobs/{run_id}` | 状態（queued/running/succeeded/failed）+ run_info |
| `GET /api/jobs?status=&component=` | 一覧 |
| `GET /api/components` | catalog（読取専用・REFRAME catalog と同一正本）|
| `POST /api/components/{name}/run` | 単発実行のショートカット（`POST /api/jobs` の糖衣）|

- **OpenAPI schema 正本**は IHL repo `apps/api/openapi.yaml`。CI で生成物と差分検証（B-15 と整合・[`ADR-Phase2-web-architecture.md`](./ADR-Phase2-web-architecture.md)）。

### D-4. 認可（B-10 解消）

- ingest / embedding など **書込/計算ジョブは認証必須**（ロール: `pipeline_run`）。匿名は不可。
- 実行可能な component とパラメータは **allowlist**（catalog の `runnable_by` で制御）。
- 鍵（R2/モデル）は **サーバ側 env のみ**。Web/クライアントに渡さない（[`secrets-rotation-playbook.md`](../../05-運用/runbooks/secrets-rotation-playbook.md)）。

### D-5. catalog 選択 → Docker 実行の導線（B-22/B-23 解消）

UIbuilder REFRAME は catalog を **読取専用**で参照（実装に関与しない・ADR-H-01）。実行は:

```
catalog 選択(UI) → component config(yaml) を /api/jobs の params として送信
→ FastAPI が docker run → R2 append（config は run_info に同梱して再現性確保）
```

config の編集・保存（B-23）は Web 側フォーム（schema 駆動）で行い、**実行時に params として渡す**（catalog 自体は書き換えない）。

### D-6. ローカル vs リモート Docker（B-09 解消）

- 環境差分は `R2_ENDPOINT` / `IHL_RUNTIME=local|remote` の env で切替。
- ローカル: 開発者 PC の Docker。リモート: サーバ Docker。**コードは同一**（env のみ差分）。

---

## 影響

- **schema**: `02-設計/_横断/schema/manifest/run_info.schema.yaml` に job 状態列（status / queued_at / started_at / finished_at / error_ref）を含める。
- **B-web-arch**: DuckDB 実行位置・OpenAPI は [`ADR-Phase2-web-architecture.md`](./ADR-Phase2-web-architecture.md)。
- **移行条件**: Phase2 着手トリガーは [`ADR-Phase2-migration-trigger.md`](./ADR-Phase2-migration-trigger.md)。
- 依存決定: H-09/D-03（embedding CI backend）· D-01（latest pointer）。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — Phase2 移行 Go 前に人間確定必須*
