# ver2 手動検証チェックリスト（観測 検索 + 表示）

> **正本**: [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §2.2  
> **環境**: `.dev` = ローカル hybrid（`dev-up` · API `:8000` · Next `:3000` · `.ihl-local-r2`）— 詳細は [`dev-runbook.md`](./dev-runbook.md)

---

## 0. 起動確認

| # | 手順 | 期待 |
|---|------|------|
| 0-1 | `dev-up`（または同等）で API + Web 起動 | `http://localhost:8000/health` が 200 |
| 0-2 | ブラウザで `http://localhost:3000` | ホームが表示される |

---

## 1. 検索（`/observation`）

| # | 手順 | 期待 |
|---|------|------|
| 1-1 | `/observation` を開く | ローディング後、結果グリッドまたは空状態 |
| 1-2 | 件数表示 | 例: 「23 件」（データ件数に応じる） |
| 1-3 | フィルタ（種・性別）→「絞り込む」 | 結果が絞られる / 該当なしなら空状態 |
| 1-4 | カードの「詳細を見る」 | `/observation/{capture_id}` へ遷移 |
| 1-5 | **写真あり** commit 後のカード | サムネイル画像が表示（404 ではない） |
| 1-6 | **写真なし**（旧 commit 等）のカード | 灰色の破損画像ではなく **「写真なし（commit時未保存）」** |

---

## 2. 詳細（`/observation/{capture_id}`）

### 2.1 共通（Q2 可変詳細）

| # | 手順 | 期待 |
|---|------|------|
| 2-1 | 詳細を開く | `GET /api/v1/observation/{id}` 由来のセクションが表示 |
| 2-2 | 計測テーブル | 行数 = Truth の `measurements[]` 件数（折りたたみ可） |
| 2-3 | 撮影条件 | `photo_conditions[]` があるときのみカード表示 |
| 2-4 | 環境 snapshot | `environment_snapshot` があるときのみ表表示（**時系列グラフは ver4+**） |
| 2-5 | デバイス | `devices[]` があるときのみカード表示 |
| 2-6 | 類似個体 | locator 有時はリンク一覧 / **dev 無 locator 時は「類似候補がありません」（正常）** |
| 2-7 | reanalysis-manifest | リンクを開くと JSON 200（新規タブ）· **digest 未導入の旧 capture は `clientContentDigest: null` 可** |
| 2-8 | 404 | 存在しない ID → 空状態 + 「検索に戻る」 |

### 2.2 画像

| # | 手順 | 期待 |
|---|------|------|
| 2-9 | 写真あり capture | 4:3 枠に **実画像**（`GET …/image` 200） |
| 2-10 | 写真なし capture | **「写真なし（commit時未保存）」**（破損プレースホルダーではない） |

---

## 3. 代表 capture: `cap_Dyn_4a1fe934`（手動）

| # | 確認項目 | 期待 |
|---|----------|------|
| 3-1 | URL | `http://localhost:3000/observation/cap_Dyn_4a1fe934` |
| 3-2 | 表示名 | `玉-2026-3`（naming イベント） |
| 3-3 | 計測行 | **1 行**（体重 16.02g）— commit 時に入力した 1 行のみ |
| 3-4 | 撮影条件 | 温度・照明・湿度（3 項目）— **照明 24.6°C は旧データ誤マッピング**（修正前 commit） |
| 3-5 | 写真 | **なし** — 2026-06-25 commit は `photo_data_url` 永続化前。`raw/cap_Dyn_4a1fe934.jpg` はスキーマ用パスのみで blob 未保存 |
| 3-6 | manifest | `clientContentDigest` 等が含まれる（digest 導入前の capture は null の可能性あり） |
| 3-7 | 写真ありで再検証したい場合 | ver1 入力で **新規 commit**（confirm で写真付き）→ 検索で **サムネ表示** を確認 |

---

## 4. ver2 に **含まれる**もの（DONE 判定）

- Next.js `/observation` 検索グリッド + 詳細（Streamlit は対象外）
- Truth 縦持ち詳細（計測・撮影条件・環境・デバイス・類似）
- commit 済み **blob の直接表示**（#18 thumbnail パイプラインは **ver3**）
- reanalysis-manifest 閲覧リンク
- `clientContentDigest`（新規 commit から）
- 類似検索導線（embedding 未本番 · locator 有時）

---

## 5. ver2 に **まだ含まれない**もの

| 項目 | 移先 |
|------|------|
| **詳細画面 visual polish**（mock ピクセル一致 · レスポンシブ · civ トークン全面適用 · U-* 高完成度） | **ver3**（§2.2.2） |
| confirm binding 差分サマリー | ver3 |
| 計測行 IoT 必須（OBS-INPUT-06/07） | ver4+ |
| 環境 **時系列グラフ** | ver4+ / ver6 |
| #18 ingest → thumbnail パイプライン本番 | ver3 |
| 本番ドメイン・認証・Tier D 全 path 手打鍵 | ver3 |
| 類似検索本番 rerank | ver5 |

---

## 6. 機械検証（開発者向け · Tier B）

起動手順: [`dev-runbook.md`](./dev-runbook.md)

```bash
cd 指示/it-hercules-laboratory && pytest tests/unit/test_observation_detail.py -q
```

20+ 行 seed（人手 UAT 用 · API 起動後）:

```bash
cd 指示/it-hercules-laboratory
python scripts/seed-ver2-many-measurements.py
python scripts/seed-ver2-many-measurements.py --with-photo   # C4 写真あり
```

Tier B E2E（検索 → 詳細セクション → manifest 200）:

```bash
cd 指示/it-hercules-laboratory
npm install && npx playwright install chromium
npm run test:e2e:ver2
```

写真あり commit の API 確認:

```bash
# 詳細の image_url が null でないこと
curl -s http://localhost:8000/api/v1/observation/{capture_id} | jq .capture.image_url
# blob 取得 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/observation/{capture_id}/image
```

---

## 7. ver2 COMPLETE 宣言（2026-06-26）

[`IHL-段階リリース計画-ver1-4+.md`](../02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §2.2 の **A〜E すべて** を満たし、**2026-06-26 ユーザー宣言**で ver2 COMPLETE。

- ~~**C4**~~: ✅ **2026-06-26** — 写真 commit サムネ・詳細目視
- ~~**C2**~~: ✅ **2026-06-26** — 20+ 行計測の折りたたみ含め全行表示（`cap_Dyn_45d54257`）
- ~~**reanalysis-manifest**~~: ✅ **2026-06-26** — `cap_Dyn_45d54257` · `measurement_count:22` · `clientContentDigest` あり
- ~~**残 UAT（A/D/F/G）**~~: ✅ **2026-06-26 一括承認** — 代表 capture · 検索→詳細キーボード path · 設計ゲート E
- **次**: **ver3**（リリース polish · レスポンシブ · binding 差分 · Tier D）— §2.2.2「詳細画面の完成度」参照

**人手承認の正本（1 ページ）**: [`ver2-human-signoff.md`](./ver2-human-signoff.md)

---

## 8. §人手確認・承認ゲート

> **AI は本節の `[ ]` を `[x]` にしない。** 実施者が日付付きで記入する。  
> **印刷・逐次確認用**: [`ver2-human-signoff.md`](./ver2-human-signoff.md)（同一内容の 1 ページ版）

### 8.0 テストデータ投入（C2 用 · 20+ 行）

**前提**: `dev-up` 済み（API `:8000` 応答）

```powershell
cd 指示\it-hercules-laboratory
python scripts/seed-ver2-many-measurements.py
```

| 項目 | 内容 |
|------|------|
| 種 | `Dynastes hercules hercules` |
| 表示名 | `ver2-UAT-20rows` |
| 計測行数 | **22 行**（体長・胸幅・体重・カスタム項目等） |
| 付帯データ | 撮影条件 4 項目 · 環境 snapshot · devices |
| 実行のたび | **新しい `capture_id`** が発行される（上書きなし） |
| 表示名の再実行 | 初回は `ver2-UAT-20rows` · 同名が既にあると **`-YYYYMMDD-HHMM` 付き**で自動リトライ |
| C4 写真あり | `python scripts/seed-ver2-many-measurements.py --with-photo` |

**例（2026-06-26 dev 投入済み · 環境により異なる）**:

| 用途 | capture_id | 表示名 |
|------|------------|--------|
| C2（20+ 行） | `cap_Dyn_45d54257` | `ver2-UAT-20rows` |
| C4（写真あり） | `cap_Dyn_53c6ac1a`（既存）または `--with-photo` で新規 | — |

**スクリプト出力をここに記録**（人手記入 · 上書き可）:

| 用途 | capture_id | 投入日 |
|------|------------|--------|
| C2（20+ 行） | `cap_Dyn_45d54257` | 2026-06-26 |
| C4（写真あり・任意） | （commit 済み写真あり capture） | 2026-06-26 |

出力 URL 例: `http://localhost:3000/observation/{capture_id}`

---

### 8.1 C2 — 20+ 行計測（折りたたみ / 展開）

| # | 何をするか | 開く URL | 期待する画面 | 承認 |
|---|------------|----------|--------------|------|
| 8.1-1 | seed 詳細を開く | `http://localhost:3000/observation/{seed capture_id}` | タイトル **ver2-UAT-20rows** · 計測 **22 行** | `[x] 確認済み — 2026-06-26`（22 行表示 OK） |
| 8.1-2 | 折りたたみ | 同上 | 先頭 10 行表示 · **「残り 12 行を表示」** あり | `[x] 確認済み — 2026-06-26`（折りたたみ OK） |
| 8.1-3 | 展開 | 同上 | サマリー展開後 **全 22 行** が表に見える | `[x] 確認済み — 2026-06-26`（展開・全行表示 OK） |
| 8.1-4 | 動的セクション | 同上 | 撮影条件 · 環境 snapshot · デバイス カード表示 | `[x] 確認済み — 2026-06-26` |

---

### 8.2 C4 — 写真あり blob

| # | 何をするか | 開く URL | 期待する画面 | 承認 |
|---|------------|----------|--------------|------|
| 8.2-1 | 写真詳細 | `http://localhost:3000/observation/{写真あり capture_id}` | 4:3 枠に **実画像** | `[x] 確認済み — 2026-06-26`（詳細 4:3 実画像 OK） |
| 8.2-2 | 検索サムネ | `http://localhost:3000/observation` | カードにサムネ（404 でない） | `[x] 確認済み — 2026-06-26`（検索サムネ OK） |
| 8.2-3 | blob API | `http://localhost:8000/api/v1/observation/{id}/image` | HTTP 200 | `[x] 確認済み — 2026-06-26` |

---

### 8.3 代表 capture `cap_Dyn_4a1fe934`

| # | 何をするか | 開く URL | 期待する画面 | 承認 |
|---|------------|----------|--------------|------|
| 8.3-1 | 詳細 | `http://localhost:3000/observation/cap_Dyn_4a1fe934` | 表示名 **玉-2026-3** | `[x] 確認済み — 2026-06-26` |
| 8.3-2 | 計測 | 同上 | **1 行**（体重 16.02g） | `[x] 確認済み — 2026-06-26` |
| 8.3-3 | 写真なし | 同上 | **「写真なし（commit時未保存）」** | `[x] 確認済み — 2026-06-26` |

---

### 8.4 reanalysis-manifest

| # | 何をするか | 開く URL | 期待する画面 | 承認 |
|---|------------|----------|--------------|------|
| 8.4-1 | リンク | 詳細の reanalysis-manifest | 新規タブ JSON 200 | `[x] 確認済み — 2026-06-26`（`cap_Dyn_45d54257` · `/api/v1/observation/.../reanalysis-manifest` JSON 200） |
| 8.4-2 | メタ | 表示 JSON | `capture_id` 一致 · 新規 seed は `clientContentDigest` 非 null | `[x] 確認済み — 2026-06-26`（`measurement_count:22` · `clientContentDigest` あり · `has_photo:false`） |

---

### 8.5 検索 → 詳細（キーボード代表 path）

| # | 何をするか | 開く URL | 期待する画面 | 承認 |
|---|------------|----------|--------------|------|
| 8.5-1 | 検索 | `http://localhost:3000/observation` | グリッド · 件数表示 | `[x] 確認済み — 2026-06-26` |
| 8.5-2 | フィルタ | 同上 | 種入力 → 絞り込む（**Tab / Enter**） | `[x] 確認済み — 2026-06-26` |
| 8.5-3 | 詳細遷移 | 同上 | **ver2-UAT-20rows** カード → 詳細を見る（**Enter**） | `[x] 確認済み — 2026-06-26` |
| 8.5-4 | 404 | `http://localhost:3000/observation/cap_missing_00000000` | 空状態 + 検索に戻る | `[x] 確認済み — 2026-06-26` |

---

### 8.6 設計ゲート E · 最終承認

| # | 何をするか | 参照 | 期待 | 承認 |
|---|------------|------|------|------|
| 8.6-1 | 設計ゲート E | [`観測v1完了-横展開と段階計画.md`](../02-設計/_横断/観測v1完了-横展開と段階計画.md) §4.5 | ver2 スコープの着手前チェックリストを人間が確認 | `[x] 確認済み — 2026-06-26` |
| 8.6-2 | Tier B | §6 コマンド | pytest · Playwright **緑** | `[x] 確認済み — 2026-06-26` |
| 8.6-3 | **ver2 COMPLETE** | §2.2 A〜E | 上記すべて充足 | `[x] 承認 — 2026-06-26` |
