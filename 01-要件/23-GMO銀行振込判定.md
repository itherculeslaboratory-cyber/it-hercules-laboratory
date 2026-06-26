# 23 GMO 銀行振込判定 — 機能要件定義（たたき台 · 非正本）

> **完成度**: △ — 要件・算法（v1.5）は最も詳細だが、**正式 schema/API 契約・UI 設計は未**（設計ゲート 4 点未通過。本番署名・U-GMO-03 は人間ゲート）。次工程は [`00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md`](../05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md) · 採点は [`00-要件完成度監査`](./00-要件完成度監査-05-07-10-14-16-23.md)。

> **用途**: 人間レビュー・設計 AI 引き継ぎ用。  
> **非正本**: 採用・実装判断は IHL `docs/`（将来正本）を優先。legacy 実装参照: `docs/gmo-aozora-integration.md`・REQ-007  
> **作成日**: 2026-06-07  
> **版**: **たたき台 v1.5** — ユーザー確定 **2026-06-07**（**振込コード = userId から決定的生成** · legacy `U-XXXX` 整合 · GMO 名義欄 48 文字 · U-GMO-01 解決 · **U-GMO-06 解決（日時照合）**）  
> **設計ゲート**: **未通過**  
> **実装**: **禁止**（IHL rebuild 向け要件。legacy civ-os に REQ-007 実装あり — **salvage 参考**）

---

## ステータス

| 項目 | 値 |
|------|-----|
| 要件定義 | **たたき台 v1.5**（本ファイル · **§2.5 日時照合（U-GMO-06 解決）** · v1.4: 振込コード精緻化 · v1.3: 算法たたき台 · v1.2: 部分入金/過入金 · v1.1: 取引成立起算） |
| 詳細設計 | 未着手 |
| 遷移設計 | 未着手 |
| UI 設計 | 未着手 |
| legacy civ-os | **implemented**（REQ-007）— Webhook · 期待入金 · 照合 · 任意 `issueCoin` |
| 本番実入金 | **人間ゲート** — `P0-NEXT-GMO-LIVE-EXEC` |
| IHL 関係 | **IHL rebuild** — X（Connector）component · R2 append-only · C-Sync **不採用** |

---

## 1. 機能概要

**GMO あおぞらネット銀行** の振込入金（VA）を OS が検知し、**振込者名（名義）に含まれる振込コード** で **ユーザー／取引／支払種別** を照合する。主用途は次の 3 つ。

| 用途 | 説明 | 正本 |
|------|------|------|
| **8% 貢献費** | **取引成立後**（§06 §11.0.1 — 配送完了 + 評価）、売り手が売上 8% を振込。**マッチング確定だけでは発生しない** | [`06-マーケット.md`](./06-マーケット.md) §11.0.1 · §11.7 |
| **プラチナ発行** | 入金額から PT 換算・台帳計上（legacy） | §20 · `docs/gmo-platinum-issue-sequence.md` |
| **P2P 照合支援** | 当事者間振込でも **同一振込コードパターン** を推奨 | §06 §11.0 プライベートボード |

**哲学**: 銀行 API は **ユーザー ID を返さない** — 名義文字列 + 金額 + 日時のみ。だから **振込コードを振込者名に追記** してマッチングする（`rag/bbs_post.csv` 経済レイヤー議論 · legacy パターン `U-XXXX`）。

---

## 2. 振込コード（ユーザー確定 · たたき台 v1.5）

> **ユーザー確定（2026-06-07）**: 「**振込コード: ユーザー ID が一意だから、そこから作ればいい**」— legacy A3 議論（`bbs_post_02256`）と **同型**。IHL 正本入力は UUID ではなく **`user-{timestamp}-{random}`**（[`03-新規登録.md`](./03-新規登録.md) FR-REG-02）だが **算法は不変**。

### 2.1 判断・理由

| 判断 | 理由 | legacy / 正本参照 |
|------|------|-------------------|
| **生成の正本は `userId`** | OS 内部 ID は **一意** · **決定的再計算可能**（ランダム都度発行は保存漏れリスク） | ユーザー確定 · `rag/bbs_post.csv` **`bbs_post_02256`** |
| **ユーザーごとに 1 つの安定コード** | 憲法「**ユーザーごとに一意**の振込名義コード」 | `civilization/ProjectRules.md` **§6.4 項 1** |
| **形式は legacy `U-XXXX`** | 名義抽出安定 · 偶然一致回避 · コピペ UX · 将来 `T-`/`S-` 拡張余地 | `rag/bbs_post.csv` **`bbs_post_02252`** · **`02254`** · **`02255`** · **`02040`**（Human 原文） |
| **期待入金はコード + 金額で照合** | 銀行 API は userId を返さない — **`remitter_name_kana` + `remarks` 連結への部分一致** + **`amount_yen` 完全一致** | `docs/gmo-aozora-integration.md` · `backend/src/logic/gmoAozoraReconciliationStore.ts` **`matchPendingExpectedFromVaTransaction`** · REQ-007 |
| **取引識別は原則 `trade_ref`** | コードは **ユーザー固定**（8% · PT 入金 · P2P 推奨で **同一**）。取引は期待入金レコードの **`trade_ref` / `note`** で追跡。**同一コード・同額の複数 pending 衝突**は **§2.5 日時照合**（サフィックス不要） | `docs/market-gmo-listing-bridge.md` · §2.5 |
| **legacy 実装は自動生成なし** | civ-os は **`remittance_reference` を API 呼び出し側が任意文字列で渡す** — IHL は **`obligor_user_id` → `transfer_code` 導出** を **ユーザー確定 override** | `backend/src/api/routes/market.ts` **`POST /gmo/expected-payment`** · `marketRoutes.test.ts`（例: `"REFABC"`） |

### 2.2 生成算法（IHL たたき台 · **U-GMO-01 解決**）

**関数（概念 · 実装コードは詳細設計）**: `transfer_code = deriveTransferCode(userId)`

**入力**: IHL 正本 `userId` 文字列（例: `user-20260414-abc12def`）。

| ステップ | 処理 | legacy 根拠 |
|----------|------|---------------|
| **S1** | `digest = SHA-256( UTF-8(userId) )` — 32 バイト | `bbs_post_02254` · `02252` JSON Schema description |
| **S2** | `n = uint24( digest[0..2] )` — 先頭 **3 バイト**を **ビッグエンディアン unsigned** 整数化（0 … 16,777,215） | `bbs_post_02256`「24bit」 |
| **S3** | `body = uppercase( Base36(n) )` — 英数字 **大文字** | `bbs_post_02254` ステップ 4〜5 |
| **S4** | **桁正規化**: `body` が **4 未満**なら先頭を **`0` で左 pad** して **4 文字**にする。`body` が **6 超**なら **右から 6 文字**に truncate（24bit では通常 1〜5 桁のため truncate は **予備**） | JSON Schema `^U-[A-Z0-9]{4,6}$` · `bbs_post_02252` `{4,6}` |
| **S5** | **`transfer_code = "U-" + body`** — 保存時ハイフンは **半角 `-` 固定** | `bbs_post_02255` UX 推奨 · `02253` 抽出安定性 |

**出力例（概念）**

| `userId`（例） | 備考 |
|----------------|------|
| `user-20260414-abc12def` | 決定的に **1 つの** `U-XXXX`（具体値は S1〜S5 の結果） |
| legacy 議論 UUID `550e8400-e29b-41d4-a716-446655440000` | **算法デモ用** — IHL 本番 ID 形式とは異なるが **同関数** |

**保存 · 登録時**

| 項目 | ルール |
|------|--------|
| **正本フィールド** | `users/{userId}.json` の **`transfer_code`**（legacy A3: `users.transfer_code TEXT NOT NULL` — `rag/bbs_post.csv` **`bbs_post_02035`** / **`02029`**) |
| **正規化** | 保存値 **`^U-[A-Z0-9]{4,6}$`**（半角ハイフン） |
| **再生成** | **禁止** — 同一 `userId` から **常に同一**（決定的関数） |
| **登録時衝突** | 新規 `transfer_code` が既存ユーザーと一致した場合: **S2 の読み取り開始オフセットを +3 バイト**（`digest[3..5]` → 同上 S3〜S5）。それでも衝突なら **+3 バイトずつ alternate slice**（最大 3 回 · 詳細設計で定数化 **TBD**）。legacy 議論に明示なし — **IHL たたき台追加** |

**legacy salvage 一覧**

| ソース | 内容 |
|--------|------|
| `rag/bbs_post.csv` **`bbs_post_02252`** | 抽出 regex · JSON Schema · payment_log 正規化 |
| **`bbs_post_02254`** | 生成 6 ステップ · `parseInt(hex,16).toString(36)` 概念 |
| **`bbs_post_02256`** | userId → hash → Base36 4〜6 文字 · **最適解** 議論 |
| **`bbs_post_02040`** | Human: ユーザーごと振込コード · 名義追記で相殺 |
| `civilization/ProjectRules.md` **§6.4** | ユーザーごと一意 · 名義推奨 · 個人情報と結合禁止 |
| civ-os **実装** | 生成ロジック **未実装** — 照合のみ（§4 salvage 表） |

### 2.3 形式 · 抽出 · 振込者名欄（GMO）

| 項目 | ルール | 参照 |
|------|--------|------|
| **保存形式** | `^U-[A-Z0-9]{4,6}$`（半角ハイフン固定） | `bbs_post_02252` JSON Schema |
| **名義からの抽出** | `U[\-\－][A-Z0-9]{4,6}` — 半角/全角ハイフン **ゆらぎ許容** · マッチ後 **半角 `-` + 大文字** に正規化 | `bbs_post_02252` · `02253` |
| **取引サフィックス付き**（§2.5 **フォールバックのみ** · 通常は使わない） | `U[\-\－][A-Z0-9]{4,6}[\-\－][A-Z0-9]{2,4}` — 日時照合でも一意に決まらない場合のみ UI 提示 **TBD** | salvage 例 `U-4F9A-T1` · **却下案**（§2.5） |
| **振込者名への追記** | 銀行アプリ **振込依頼人名** 欄 **末尾**にコード追記（例: `ﾔﾏﾀﾞ U-4F9A`）— **コピペ推奨** | `bbs_post_02255` · `02258` |
| **GMO 名義欄上限** | **最大 48 半角文字**（超過分は省略可）。インターネット振込 CSV でも **0〜48**（任意入力時は出金口座名義が既定） | [GMO FAQ 6686541](https://help.gmo-aozora.com/faqs/6686541cefe214ffd634291a/) · [payee.pdf J 列](https://gmo-aozora.com/support/guide/payee.pdf) |
| **使用可能文字** | 入力 UI は **全角カナ・全角英数字・指定全角記号** → 銀行側 **半角** として処理。**`-`（ハイフン）・スペース** は利用可。**中黒 `・` は不可** | [GMO FAQ 6686541c](https://help.gmo-aozora.com/faqs/6686541cefe214ffd634291c/) |
| **UI 設計指針** | `transfer_code`（6〜8 文字）+ スペース 1 + 氏名 ≒ **十分余裕**（48 以内）。**氏名を削ってコードを優先** — 照合失敗より名義省略の方がマシ | legacy 短コード前提 · §2.2 S5 |
| **Webhook 照合文字列** | legacy: **`remitter_name_kana` + `remarks`** を空白正規化連結 → **`remittance_reference` の部分一致**（`includes`） | `gmoAozoraReconciliationStore.ts` L79-91 · `docs/gmo-aozora-integration.md` |

### 2.4 用途別スコープ（per-user · 8% vs PT vs P2P）

| 用途 | `remittance_reference`（既定） | 取引の区別 | 備考 |
|------|-------------------------------|------------|------|
| **8% 貢献費** | 義務者（**売り手**）の **`transfer_code`** | 期待入金 **`trade_ref`** · **`note`**（`chunk_id` 等） | §06 §11.7 · `rag/market_governance.csv` **`mkg_karma_fee`**（`platform_fee_percent_bps=800`） |
| **プラチナ発行（GMO 入金）** | 入金者（`obligor_user_id`）の **同一 `transfer_code`** | **`trade_ref`** = 購入意図 ID 等 · 金額で PT 換算 | §22 §5.5 · `docs/gmo-platinum-issue-sequence.md` · **`GMO_YEN_PER_PLATINUM`** |
| **P2P 当事者間振込** | 振込側ユーザーの **`transfer_code` 追記推奨** | OS 照合 **対象外**（当事者間） | §06 §11.0 · **義務ではない** |

> **8% と PT でコードを分けない** — 同一ユーザーは **1 コード**（`ProjectRules` §6.4 · ユーザー確定）。支払種別は **`amount_yen` + 期待入金レコードの用途メタ** で区別。**同一ユーザー・同一金額**で pending が複数ある場合は **§2.5.3 日時 FIFO**（U-GMO-06 解決）。

> **legacy 実装との差**: civ-os `POST /api/market/gmo/expected-payment` は **`remittance_reference` 手入力**（テスト `"REFABC"`）。IHL たたき台は **`deriveTransferCode(obligor_user_id)` をサーバ側で填入** — **ユーザー確定 override**。

### 2.5 同一コード · 同一金額 · 複数 pending（U-GMO-06 · **解決**）

> **ユーザー確定（2026-06-07）**: 「**時間で判定余裕じゃない？日時とかで**」— 同一ユーザー・同額の pending が複数あっても、**振込コード + 金額 + 入金日時** で十分に一意化できる。**取引サフィックス `U-XXXX-T1` は通常不要**（UX 負荷・名義 48 字圧迫のため **却下** · §2.5.4）。

#### 2.5.1 判断・理由

| 判断 | 理由 |
|------|------|
| **第 1 段: `transfer_code` + `amount_yen` 完全一致** | 銀行 API は userId を返さない — 名義部分一致 + 金額は legacy 同型（§2.3 · REQ-007） |
| **第 2 段: 複数候補時は入金日時で絞り込み** | 同一ユーザーは **1 コード**（§2.4）— 取引ごとに名義を変えさせない。**義務発生（期待入金 `created_at`）以降の入金**を、**最も古い未払い pending** に紐づけると実務と整合 |
| **取引サフィックスは却下（フォールバックのみ）** | ユーザーは **1 コードだけ**コピペしたい · GMO 名義 **48 字** · `U-4F9A-T1` は覚え間違い・入力ミスの温床 |
| **legacy の先頭 pending マッチは IHL で廃止** | `matchPendingExpectedFromVaTransaction` は **日時を見ない FIFO（配列順）** — 誤マッチリスク。IHL は **日時付き決定論**に置換 |

#### 2.5.2 GMO Webhook から取れる日時（salvage · 公式仕様）

legacy `gmoAozoraReconciliationStore.ts` は **日時フィールド未使用**（`remitter_name_kana` + `remarks` + `deposit_amount` のみ）。IHL 照合では次を **優先順**で `remittance_datetime`（JST `Date`）に正規化する。

| 優先 | ソース（Webhook JSON） | 形式 · 備考 |
|------|------------------------|-------------|
| **P1** | エンベロープ **`timestamp`** | ISO 8601 · 例 `2018-11-09T17:59:59+09:00` — **時刻付き** · 通知全体の基準時刻 |
| **P2** | **`account.baseDate`** + **`account.baseTime`** | 日 `YYYY-MM-DD` + 時 `HH:MM:SS+09:00` — 口座基準日時 |
| **P3** | **`va_transaction.transactionDate`**（legacy キーは snake_case マッピング可） | `YYYY-MM-DD` **日付のみ** — 時刻は **当該日 JST 00:00:00** とする（粗いが許容） |
| **P4** | **`va_transaction.valueDate`** | 起算日 · 同上（`transactionDate` 欠落時） |
| **P5** | **`va_transaction.itemKey`** 先頭 14 桁 | `YYYYMMDDHHMMSS` 埋め込み（公式例 `20181109175959112541`）— パース可能なら P3 より優先 |
| **P6** | OS 受信 **`received_at`**（`appendWebhookEvent`） | 最終フォールバック — 銀行処理時刻とのズレあり |

**公式参照**: [GMO オープンAPI イベント通知編](https://gmo-aozora.com/business/service/pdf/api-spec-webhooks.pdf) — `va-deposit-transaction` · `vaTransaction.transactionDate` · `valueDate` · 例示 `timestamp`。

**期待入金側の日時**

| フィールド | 用途 |
|------------|------|
| **`ExpectedPaymentRecord.created_at`** | **義務発生日時**（期待入金 INSERT 時刻）— 照合の主アンカー |
| **`trade_ref` 紐づく取引成立日時**（任意 · 詳細設計） | 8% は §06 §11.0.1 の成立タイムスタンプと **`created_at` を揃える**運用を推奨 — ズレ時は **`created_at` 正** |

#### 2.5.3 照合アルゴリズム（たたき台 · `matchPendingExpectedFromVaTransaction` 置換）

**入力**: Webhook から抽出した `va_transaction` 相当 · 照合ストアの `expected[]`

**手順**

```
S0  候補集合 C を構築
    - status = pending
    - amount_yen === deposit_amount（カンマ除去後整数）
    - remittance_reference（= transfer_code）が
      normalize(remitter_name_kana + " " + remarks) に部分一致

S1  |C| = 0  → 照合失敗（理由: コード/金額不一致）
S2  |C| = 1  → その 1 件を matched（idempotency は §6 NFR-GMO-02）

S3  |C| ≥ 2  → 日時による一意化
    3a  remittance_datetime を §2.5.2 優先順で決定
    3b  C' = { row ∈ C | row.created_at ≤ remittance_datetime }
        （義務発生日 **以降**の入金のみ — 未来義務への先払い誤紐づけを防ぐ）
    3c  |C'| = 0  → 照合失敗（手動確認キュー · UI に「該当する未払いがありません」）
    3d  |C'| = 1  → その 1 件を matched
    3e  |C'| ≥ 2  → **FIFO by obligation**:
        matched = argmin_{row ∈ C'} ( row.created_at, row.id )
        （入金日時が義務発生日以降で **最も古い未払い pending**）
```

**自然言語要約**: 「**コード + 金額が合う pending が複数なら、入金日時が義務発生日以降にあるもののうち、義務が最も古い 1 件**」に消し込む。

**例**

| 状況 | 結果 |
|------|------|
| 8% 取引 A・B が同額 pending。A の `created_at` が 6/1、B が 6/10。6/15 入金 | **A** に matched（義務が古い） |
| 6/5 入金だが B だけ 6/10 義務 | **A のみ**が C' に残り **A** に matched |
| 6/3 入金だが最古義務 A が 6/5 | C' 空 → **自動照合しない**（早すぎる振込 · 手動） |

#### 2.5.4 却下した代替案（取引サフィックス）

| 案 | 却下理由 |
|----|----------|
| **`U-XXXX-SS`（`SS = f(trade_ref)`）を衝突時の既定** | ユーザーは **1 コード**運用を確定（§2.4）· 名義 48 字 · 入力・抽出 regex 複雑化 · **日時で足りる** |
| **legacy 先頭 pending 1 件マッチ** | 配列順依存 · **誤マッチ** — IHL 非採用 |

**フォールバック（詳細設計 TBD）**: §2.5.3 の 3c/3e でも決められない（同日同額・義務同時刻など）場合のみ、運用/UI が **`transfer_code + "-" + suffix`** を提示し、名義に **明示サフィックス**を要求する。`suffix = uppercase( Base36( uint24( SHA-256(trade_ref)[0..2] ) ) )` 左 pad 2 文字 — **例外経路**であり既定ではない。

#### 2.5.5 合算振込 · その他

| 項目 | 状態 |
|------|------|
| **合算振込**（1 入金で複数 `trade_ref`） | **未確定** — 部分入金 §3.1 は **1 期待入金内**残債。複数取引への按分は詳細設計 **TBD** |
| **8% + PT 同額同時 pending** | §2.5.3 と同型 — **`created_at` が古い義務**が優先（用途メタは `note` / `trade_ref` で追跡） |
| **legacy 差分** | civ-os `matchPendingExpectedFromVaTransaction`（L78-97）は **日時なし・複数 matched 可** — IHL は **単一 matched + 日時** |

### 2.6 期待入金レコード（legacy フィールド）

| フィールド | 用途 |
|------------|------|
| `obligor_user_id` | 義務者（8% は **売り手**） |
| `amount_yen` | 期待金額（8% 円建て） |
| `remittance_reference` | 振込コード（名義照合） |
| `trade_ref` | 取引参照（任意 · `trade-events` と揃える） |
| `note` | `chunk_id` 等メモ（任意） |

---

## 3. 8% 貢献費マッチングフロー（たたき台）

```
マッチング確定（§06 §11.0 Stage 1）— 8% はまだ発生しない
  → プライベートボード · 振込 · 発送
  → 配送完了確認（Stage 2）
  → 評価（手動 or 1 ヶ月後 自動「良い」）
  → 取引成立（§06 §11.0.1 · Stage 3）
  → 売り手 UI: 振込先 · 8% 金額 · 振込コード表示
  → 期待入金 INSERT（pending）
  → 売り手が銀行振込（名義にコード追記）
  → GMO Webhook 受信
  → 名義 + 金額照合 → matched
  → trade-event 更新 · 月次 fee_unpaid Δcount 停止（§08 §5.1）
  → （プラチナ発行は 8% 経路では通常なし — TBD 会計仕分）
```

**判断・理由**: 8% は **取引が実質完了した後**（問題なし＝評価 or 1 ヶ月無言）にのみ義務化する。成約直後の未配送・未評価段階で fee クロックを回さない。

**未払い**: 照合されない月は **月次 Fibonacci Δcount**（§08 §5.1）— **自動** · 裁判非経由（[`11-裁判.md`](./11-裁判.md) §2）。

---

## 3.1 部分入金・過入金・返金（ユーザー確定 · 2026-06-07）

> **U-GMO-02 解決**。正本の分担: 積算残高・クレジット表示は [`06-マーケット.md`](./06-マーケット.md) **§11.7.5**。

| 区分 | ルール |
|------|--------|
| **部分入金** | 入金額が期待額未満でも **照合成功** とし、**積み上がっている合計未払残**（当該取引の 8% 義務残）を **入金額分だけ減算**する。**義務は消えない** — 残額が 0 になるまで未払い継続（月次 Δcount も残額 > 0 の間は継続）。 |
| **過入金** | 期待額を超える分は **貢献費クレジット**（前払い残高 · マイナス表示可）として台帳に計上。**将来の 8% 貢献費** の支払い時に **自動相殺**（§06 §11.7.5）。 |
| **返金** | **不可** — 銀行振込の返金フローは **採用しない**（運用負荷回避 · ユーザー確定「めんどいから」）。 |
| **製品スタンス** | **推奨しない** — 部分入金・過入金は **しょうがなくそうしている** 回避機構。**UI で積極宣伝しない**（全額振込が正）。 |

**判断・理由**

| 判断 | 理由 |
|------|------|
| **部分入金 = 残債のみ減算** | 実務で端数・分割振込が起きうる。**義務消滅は全額消込のみ** — カルマ月次と整合。 |
| **過入金 = 貢献費クレジット** | 余剰を **次回 8% に充当** — 返金なしでも会計が閉じる。 |
| **返金不可** | 返金オペレーション・争い・監査が重い。**クレジット相殺** で足りる。 |
| **非推奨の明示** | ユーザー体験は **一括振込優先**。部分入金は **例外的救済** に留める。 |

---

## 4. legacy civ-os 実装参照（salvage）

| 要素 | legacy パス |
|------|-------------|
| Webhook クライアント | `backend/src/logic/gmoAozoraWebhookClient.ts` |
| 期待入金ストア | `backend/src/logic/gmoAozoraReconciliationStore.ts` |
| 署名検証 | `backend/src/logic/gmoAozoraWebhookSecurity.ts` |
| 照合後 issueCoin | `backend/src/logic/gmoAozoraLedgerSettlement.ts` |
| HTTP | `POST/GET /api/market/gmo/*` · `POST /api/market/gmo/webhook` |
| 運用 doc | `docs/gmo-aozora-integration.md` |
| listing 橋渡し | `docs/market-gmo-listing-bridge.md` |
| 本番ゲート | `docs/CONTINUE_QUEUE.md` **`P0-NEXT-GMO-LIVE-EXEC`** |
| 検証テンプレ | `docs/gmo-production-verification-template.md` |
| 採用 REQ | `rag/accepted_requirements.csv` **REQ-007** |

**IHL との差分**

| 項目 | legacy | IHL（本ファイル） |
|------|--------|-------------------|
| 同期 | C-Sync 経由あり | **R2 append-only のみ** · GitHub 改善履歴 |
| 8% カルマ | 直接 karma delta 等 | **月次 Fibonacci Δcount**（§08 §5.1） |
| 振込コード | `remittance_reference` 部分一致 · **呼び出し側任意文字列** | **userId 決定的生成 `transfer_code`** · 期待入金へ自動填入（§2） |
| 複数 pending 照合 | コード + 金額 · **配列先頭 1 件** · **日時未使用** | **§2.5.3 日時 FIFO**（`valueDate` / `timestamp` 等 · `created_at` 下限） |
| 実装先 | civ-os monolith | **IHL Connector component** |

---

## 5. 機能要件（たたき台 · IHL）

| ID | 要件 |
|----|------|
| **FR-GMO-01** | GMO あおぞら VA 入金 Webhook を受信し、署名検証（契約に従う）を行う。 |
| **FR-GMO-02** | **振込コード（名義部分一致）+ 金額** で期待入金 `pending` を `matched` に更新する。**同一コード・同額の pending が複数**のときは **入金日時 + 義務発生日（`created_at`）** で §2.5.3 のアルゴリズムにより **1 件**に決定する。 |
| **FR-GMO-03** | 8% 貢献費: **取引成立時**（§06 §11.0.1 — 配送完了 + 評価確定。マッチング確定ではない）に期待入金を登録し、照合成功で **fee_unpaid 月次カウントを停止**する。 |
| **FR-GMO-04** | 全照合イベントは **R2 INSERT ONLY**（payment_log 相当 · UPDATE/DELETE 禁止）。 |
| **FR-GMO-05** | 振込コードは **`userId` から決定的に生成**した **`transfer_code`** を正とし、期待入金 `remittance_reference` に填入 · UI で **コピー可能**表示（§2）。 |
| **FR-GMO-06** | 障害時 **unsent ポーリング**（legacy 同型 · API 詳細 TBD）。 |
| **FR-GMO-07** | 本番鍵・ポータル登録・実入金証跡は **`P0-NEXT-GMO-LIVE-EXEC` 人間ゲート** — AI は完了扱いにしない。 |
| **FR-GMO-08** | **部分入金**: 入金額分だけ **未払残を減算** · 残 > 0 なら未払い継続（§3.1）。 |
| **FR-GMO-09** | **過入金**: 超過分を **貢献費クレジット** に計上 · 将来 8% に相殺（§06 §11.7.5）。 |
| **FR-GMO-10** | **返金フローは提供しない** — 過入金はクレジットのみ（§3.1）。 |

---

## 6. 非機能要件

| ID | 要件 |
|----|------|
| **NFR-GMO-01** | Webhook 秘密・署名不一致は **401** · 秘密をログに出さない（legacy 整合）。 |
| **NFR-GMO-02** | 照合は **決定的** · 同一入金の二重 matched を防ぐ（idempotency · 詳細設計 TBD）。 |
| **NFR-GMO-03** | `market_governance.csv` `mkg_gmo_aozora_v1` 等は **timestamp 最新行**（rag-csv-inquiry）。 |
| **NFR-GMO-04** | エラー・照合失敗時はユーザーに **短い理由**（「名義にコードを含めてください」等）。 |

---

## 7. MiniKernel / C-USB 上の位置づけ

| 概念 | 位置づけ |
|------|----------|
| **Layer** | **X（Connector）** — 外部銀行 API |
| **FeatureNode** | `market` / `economy` 境界 |
| **Kernel** | 照合 · matched イベント発火 · 下流（カルマ月次バッチ）への信号 |
| **ITO** | IN = Webhook JSON → Transform = コード抽出 · 金額照合 → OUT = R2 payment イベント + 期待入金状態 |

---

## 8. 正本・クロスリファレンス

| 種別 | パス |
|------|------|
| 8% · 取引成立 | [`06-マーケット.md`](./06-マーケット.md) §11.0.1 · §11.7 |
| カルマ月次 | [`08-カルマシステム.md`](./08-カルマシステム.md) §5.1 |
| 司法境界 | [`11-裁判.md`](./11-裁判.md) §2 · §6.4 |
| プラチナ · 投票 | [`20-投票-プラチナコイン-自然淘汰.md`](./20-投票-プラチナコイン-自然淘汰.md) |
| ショップ | [`22-プラチナコインマーケット.md`](./22-プラチナコインマーケット.md) §5.5 |
| legacy 運用 | `docs/gmo-aozora-integration.md` |
| 人間ゲート | `docs/CONTINUE_QUEUE.md` `P0-NEXT-GMO-LIVE-EXEC` |
| 政策 CSV | `rag/market_governance.csv` |

---

## 9. 未決・TBD

| ID | 項目 | 状態 |
|----|------|------|
| U-GMO-01 | 振込コード **生成算法** | **解決（たたき台）** — §2.2 **`deriveTransferCode(userId)`** · SHA-256 → uint24 → Base36 pad/truncate → `U-` · 登録衝突 alternate slice **TBD 定数** |
| U-GMO-02 | **部分入金**・過入金の扱い | **解決** — §3.1 · §06 §11.7.5 · **返金不可** |
| U-GMO-03 | 8% matched 時の **issueCoin 要否** | **未確定**（会計） |
| U-GMO-04 | GMO API **本番署名形式**の契約合わせ | **人間ゲート** |
| U-GMO-05 | IHL Webhook 公開 URL · インフラ | **未着手** |
| U-GMO-06 | 複数取引未払い · 同一コード同一金額 **pending 衝突** · 合算振込 | **解決（たたき台）** — §2.5 · **コード + 金額 + 入金日時**（GMO `timestamp` 等）→ **義務発生日以降で最古 pending（FIFO）** · 取引サフィックス **却下（例外フォールバックのみ）** · 合算按分 **TBD** |
| — | **設計ゲート 4 点** | 人間レビュー待ち |

---

## 10. 設計 AI 参照順

1. 本ファイル §2〜§3（振込コード · 8% フロー）  
2. [`06-マーケット.md`](./06-マーケット.md) §11.7  
3. [`08-カルマシステム.md`](./08-カルマシステム.md) §5.1  
4. `docs/gmo-aozora-integration.md`（legacy 照合ロジック）  
5. `docs/market-gmo-listing-bridge.md`  
6. `docs/operations/unblock-playbook-gmo-and-q2.md`  
7. [`../../00-AI-HANDOFF-BRIEF.md`](../00-AI-HANDOFF-BRIEF.md)

---

## 11. 変更履歴

| 版 | 日付 | 内容 |
|----|------|------|
| **v1** | 2026-06-07 | 初版たたき台（振込コード · 8% フロー） |
| **v1.1** | 2026-06-07 | **取引成立起算** — §06 §11.0.1 クロスリファレンス |
| **v1.2** | 2026-06-07 | **§3.1 部分入金/過入金/返金** · FR-GMO-08〜10 · **U-GMO-02 解決** |
| **v1.3** | 2026-06-07 | **§2 振込コード userId ベース生成** — SHA-256→Base36 `U-XXXX` · per-user スコープ · **U-GMO-01 部分解決** · §06 §11.7.3 · §22 クロスリファレンス |
| **v1.4** | 2026-06-07 | **§2 精緻化** — `deriveTransferCode` 5 ステップ · GMO **48 半角文字** · legacy salvage 表 · **U-GMO-01 解決** · **U-GMO-06 部分解決**（`suffix=f(trade_ref)`）· 8% vs PT 同一コード明示 |
| **v1.5** | 2026-06-07 | **§2.5 全面改訂** — **U-GMO-06 解決**: 複数 pending は **入金日時 + `created_at` FIFO** · GMO Webhook 日時フィールド表 · legacy 日時未使用の差分 · **取引サフィックス却下**（例外フォールバックのみ）· FR-GMO-02 更新 |

---

*たたき台 · 非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止（設計ゲート未通過）*
