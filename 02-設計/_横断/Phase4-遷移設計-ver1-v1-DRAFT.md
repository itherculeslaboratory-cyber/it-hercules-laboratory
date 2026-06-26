# Phase 4 — 遷移設計 ver1 v1（W0-W3 / 観測重点）

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1（W0〜W3）  
> **重点**: 観測 5 ステップ + 親個体 + QR再開  
> **参照**: `05-観測-E2E-v1-DRAFT.md` · `05-観測.md` · `Phase4-ルートマスター-ver1-v1-DRAFT.md` · `Phase5-人間判断記録-v1.md`

---

## 1. 遷移全体（ver1）

```text
/login -> /register -> /terms -> /language -> /
                                     |
                                     v
                               /observation/context
                                     |
                                     v
                               /observation/input
                            /      |         \
                    bulk fetch   photo        template
                        |         |             |
                        v         v             v
                 /observation/input/confirm <- /observation/templates/:id
                        |
                        v
                 /observation/done -> /observation or /
```

---

## 2. 画面別状態遷移

### 2.1 O1〜O4（認証導線）

| from | event | to | 失敗時 |
|------|-------|----|-------|
| `O1` | login_link_sent | `O2` | トースト + `O1` 維持 |
| `O2` | terms_required | `O3` | エラー表示 |
| `O3` | agreed | `O4` | 同意未チェックなら遷移禁止 |
| `O4` | language_selected | `01` | fallback localeで `01` |

### 2.2 01（ホーム）

| from | event | to |
|------|-------|----|
| `01` | start_observation | `05ctx` |
| `01` | resume_by_qr | `QR-SCAN` |
| `01` | open_recent_observation | `05b` |

### 2.3 観測（05ctx / 05i / 05confirm / 05done）

| from | event | to | 補足 |
|------|-------|----|------|
| `05ctx` | context_confirmed | `05i` | `species/stage` をクエリ伝播 |
| `05ctx` | context_missing | `05ctx` | `obs-empty-state` |
| `05i` | bulk_fetch_ok | `05i` | 状態のみ更新（画面遷移なし） |
| `05i` | photo_capture_ok | `05i` | 状態のみ更新（画面遷移なし） |
| `05i` | click_confirm | `05confirm` | 必須項目不足なら遷移拒否 |
| `05confirm` | click_edit | `05i` | 入力値維持 |
| `05confirm` | click_register_ok | `05done` | R2 INSERT |
| `05confirm` | click_register_ng | `05confirm` | ErrorBoundary |
| `05done` | goto_grid | `05a` | |
| `05done` | goto_home | `01` | |

### 2.4 テンプレ（05tl / 05td / 05t）

| from | event | to | 補足 |
|------|-------|----|------|
| `05tl` | select_template | `05td` | 詳細参照 |
| `05td` | use_template | `05i` | フォーム展開 |
| `05td` | fork_template | `05t` | Fork編集 |
| `05t` | save_fork | `05td` | TemplateForkEvent |

### 2.5 親個体/QR（IND / IND-QR / QR-SCAN）

| from | event | to | 補足 |
|------|-------|----|------|
| `IND` | open_qr | `IND-QR` | QR生成表示 |
| `IND-QR` | scan_start | `QR-SCAN` | カメラ遷移 |
| `QR-SCAN` | scan_success | `05i` | `individual_id` プリフィル |
| `QR-SCAN` | scan_fail | `QR-SCAN` | 再試行導線 |

---

## 3. 観測 5 ステップの分岐設計

### 3.1 dual primary（Step ④）

| ボタン | 主遷移 | エラー分岐 |
|--------|--------|-----------|
| `obs-bulk-fetch` | `05i` 内で `fetching -> fetched` | `fetch_error -> manual_fallback` |
| `obs-photo-capture` | `05i` 内で `captured -> fetched` | `capture_error -> retry` |

> どちらも primary 扱い。`obs-confirm` に進む前に最低1経路の完了を要求。

### 3.2 確認画面（Step ⑤）

`05confirm` は以下 3 チャンク固定:

1. 写真チャンク  
2. 計測データチャンク  
3. 定期取得項目チャンク

`click_register` の主ボタンは 1 つのみ。編集導線は副ボタン。

---

## 4. 画面状態（loading/empty/error/success）

| screen_id | loading | empty | error | success |
|-----------|---------|-------|-------|---------|
| `05ctx` | 候補読込中 | 候補0件 | API失敗 | context適用 |
| `05i` | fetch中 | context未設定 | fetch/validation失敗 | bulk/photo完了 |
| `05confirm` | 初期描画 | チャンク未充足 | register失敗 | register実行前確認完了 |
| `05done` | N/A | N/A | N/A | 登録完了表示 |

---

## 5. post-ver1 遷移との関係

`/knowledge` 系（知の広場）の遷移設計は post-ver1 として別管理する。  
参照: `features/_横断/知の広場-遷移設計-v1-DRAFT.md`。  
本書の ver1 遷移確定をブロックしない。

---

## 6. E2E マッピング

| 遷移 | シナリオ |
|------|---------|
| `05ctx -> 05i` | `SC-05-CTX-01` |
| `05i (bulk)` | `SC-05-BULK-01` |
| `05i (photo)` | `SC-05-PHOTO-01` |
| `05i -> 05confirm -> 05done` | `SC-05-SOL-01`, `SC-05-REG-01` |
| `05tl -> 05td -> 05i` | `SC-05-TPL-01` |
| `QR-SCAN -> 05i` | post-step in `SC-05-SOL-*` 拡張予定 |

---

## 7. 人間ゲート（Phase 4）承認記録

2026-06-07 承認で以下を確定:

1. 観測 5 ステップ分岐（bulk/photo）: **承認**  
2. `05confirm` 3チャンク固定と `register` 単一主ボタン: **承認**  
3. QR 再開フローの導線（`IND-QR -> QR-SCAN -> 05i`）: **承認**

---

## 8. 関連文書

- `02-設計/features/05-観測/sub/WaveB-context-遷移設計-v1-DRAFT.md`（PW-2 差分）
- `02-設計/features/05-観測/sub/WaveC-input-遷移設計-v1-DRAFT.md`（PW-2 差分）
- `02-設計/features/05-観測/sub/WaveD-photo-遷移設計-v1-DRAFT.md`（PW-2 差分）
- `02-設計/features/05-観測/sub/WaveE-devR2-遷移設計-v1-DRAFT.md`（PW-2 差分）
- `02-設計/features/28-個体命名/遷移設計-v1-DRAFT.md`（PW-2 差分）
- `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`
- `02-設計/E2E/05-観測-E2E-v1-DRAFT.md`
- `02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md`（post-ver1）
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 4 設計正本 / 2026-06-07 人間承認*
