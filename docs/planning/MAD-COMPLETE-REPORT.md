# MAD-COMPLETE — 狂気モード全機能 GOLDEN 完結レポート

> **日付**: 2026-07-03  
> **合図**: `IHL-DOC-REMED MAD`  
> **queue_head**: `MAD-COMPLETE`  
> **正本 repo**: `it-hercules-laboratory-clean`

---

## サマリ

| 指標 | 値 |
|------|-----|
| **GOLDEN 機能数** | **24 / 24** |
| **累計 MICRO slices** | **816** |
| **契約レジスタ** | 11 機能 · **57 API routes**（[`AUTH-MATRIX-v1.csv`](../registry/AUTH-MATRIX-v1.csv)） |
| **Web ROUTE-INDEX** | **49 routes**（[`ROUTE-INDEX-v1.csv`](../registry/ROUTE-INDEX-v1.csv)） |
| **ENV-MATRIX** | 7 vars · 機能列付き（[`ENV-MATRIX-v1.csv`](../registry/ENV-MATRIX-v1.csv)） |
| **Wave 完走** | Wave1 5 · Wave2 5 · Wave4 12 · **Wave5 2** |

> **⚠️ 未コミット注意**: 本レポート時点の GOLDEN · スライス · レジストリ · キュー更新は **ワーキングツリーに存在**。**git commit / push は未実施** — レビュー後にまとめてコミットすること。

---

## 全 24 機能 GOLDEN 表

| # | 機能 | Wave | slices | 逆RTM | GATE | Oracle | MANIFEST |
|---|------|------|--------|-------|------|--------|----------|
| 00 | 土台 | W4 | 35 | 42 TC | 5/5 | route 無 PASS | [GOLDEN-00](./golden/GOLDEN-00-MANIFEST.md) |
| 01 | ログイン | W1 | 32 | — | 5/5 | 4 routes PASS | [GOLDEN-01](./golden/GOLDEN-01-MANIFEST.md) |
| 02 | 利用規約 | **W5** | 50 | 27 TC | 5/5 | route 無 PASS · **HUMAN-02-LEGAL** | [GOLDEN-02](./golden/GOLDEN-02-MANIFEST.md) |
| 03 | 新規登録 | W1 | 52 | — | 5/5 | 6 routes PASS | [GOLDEN-03](./golden/GOLDEN-03-MANIFEST.md) |
| 04 | ホーム | W1 | 45 | — | 5/5 | 1 route PASS | [GOLDEN-04](./golden/GOLDEN-04-MANIFEST.md) |
| 05 | 観測 | W1 | 150 | — | 5/5 | 15 routes PASS | [GOLDEN-05](./golden/GOLDEN-05-MANIFEST.md) |
| 06 | マーケット | W2 | 34 | 16 TC | 5/5 | 5 routes PASS | [GOLDEN-06](./golden/GOLDEN-06-MANIFEST.md) |
| 07 | 掲示板 | W2 | 32 | 11 TC | 5/5 | 5 routes PASS | [GOLDEN-07](./golden/GOLDEN-07-MANIFEST.md) |
| 08 | カルマ | W4 | 20 | 23 TC | 5/5 | route 無 PASS | [GOLDEN-08](./golden/GOLDEN-08-MANIFEST.md) |
| 09 | 論文 | W4 | 30 | 19 TC | 5/5 | route 無 PASS | [GOLDEN-09](./golden/GOLDEN-09-MANIFEST.md) |
| 10 | マチアプ | W4 | 26 | 16 TC | 5/5 | route 無 PASS | [GOLDEN-10](./golden/GOLDEN-10-MANIFEST.md) |
| 11 | 裁判 | **W5** | 30 | 20 TC | 5/5 | **3 routes PASS** | [GOLDEN-11](./golden/GOLDEN-11-MANIFEST.md) |
| 12 | 設定 | W1 | 35 | — | 5/5 | 5 routes PASS | [GOLDEN-12](./golden/GOLDEN-12-MANIFEST.md) |
| 13 | データ取得元 | W4 | 23 | 20 TC | 5/5 | route 無 PASS | [GOLDEN-13](./golden/GOLDEN-13-MANIFEST.md) |
| 14 | 貢献度 | W4 | 19 | 19 TC | 5/5 | route 無 PASS | [GOLDEN-14](./golden/GOLDEN-14-MANIFEST.md) |
| 15 | データ設計 | W4 | 24 | 20 TC | 5/5 | route 無 PASS | [GOLDEN-15](./golden/GOLDEN-15-MANIFEST.md) |
| 16 | UIbuilder | W2 | 29 | 15 TC | 5/5 | 4 routes PASS | [GOLDEN-16](./golden/GOLDEN-16-MANIFEST.md) |
| 17 | UI選択画面改善 | W2 | 19 | 11 TC | 5/5 | 2 routes PASS | [GOLDEN-17](./golden/GOLDEN-17-MANIFEST.md) |
| 18 | 写真解析 | W4 | 22 | 21 TC | 5/5 | route 無 PASS | [GOLDEN-18](./golden/GOLDEN-18-MANIFEST.md) |
| 19 | コンポ掲示板 | W4 | 17 | 17 TC | 5/5 | route 無 PASS | [GOLDEN-19](./golden/GOLDEN-19-MANIFEST.md) |
| 20 | 投票 | W4 | 20 | 19 TC | 5/5 | route 無 PASS | [GOLDEN-20](./golden/GOLDEN-20-MANIFEST.md) |
| 21 | 翻訳 | W4 | 27 | 17 TC | 5/5 | route 無 PASS | [GOLDEN-21](./golden/GOLDEN-21-MANIFEST.md) |
| 22 | PT ショップ | W4 | 16 | 15 TC | 5/5 | route 無 PASS | [GOLDEN-22](./golden/GOLDEN-22-MANIFEST.md) |
| 23 | GMO銀行振込 | W2 | 29 | 13 TC | 5/5 | 6 routes PASS | [GOLDEN-23](./golden/GOLDEN-23-MANIFEST.md) |

---

## Wave 別 slices 累計

| Wave | 機能 | slices 小計 |
|------|------|-------------|
| Wave1 | #01 #03 #04 #05 #12 | 314 |
| Wave2 | #06 #07 #16 #17 #23 | 143 |
| Wave4 P1 | #00 #08–#10 #13–#15 #18–#22 | 279 |
| **Wave5** | **#11 #02** | **80** |
| **合計** | **24 機能** | **816** |

---

## MAD-WAVE-5 成果（本セッション）

### #11 裁判 — フル手順

- route 調査: `apps/api/main.py` dispute 3 本 → [`契約レジスタ-v1.yaml`](../../02-設計/features/11-裁判/契約レジスタ-v1.yaml)
- bootstrap: 30 slices（fr26 · revrtm4）
- GATE **5/5 PASS** · [`DOC-SPOT-MAD-11.md`](./audits/DOC-SPOT-MAD-11.md)
- 新設: 詳細設計-v3 · 遷移辞書-v1.json · エラーカタログ-v1.md

### #02 利用規約 — HUMAN-02-LEGAL 境界

- **法務条文不変更** — `ui/利用規約.md` · binding 本文は未編集
- fr+revrtm+MANIFEST のみ（50 slices）
- oracle **route 無 PASS**（契約レジスタ未生成 · DET §3.9 空）
- GATE **5/5 PASS** · [`DOC-SPOT-MAD-02.md`](./audits/DOC-SPOT-MAD-02.md)

### 横断レジストリ（stub → 実データ）

| ファイル | 生成スクリプト | 行数 |
|----------|----------------|------|
| [`AUTH-MATRIX-v1.csv`](../registry/AUTH-MATRIX-v1.csv) | `ihl-registry-auth-matrix.mjs` | 57 routes |
| [`ENV-MATRIX-v1.csv`](../registry/ENV-MATRIX-v1.csv) | `ihl-registry-env-matrix.mjs` | 7 vars |
| [`ROUTE-INDEX-v1.csv`](../registry/ROUTE-INDEX-v1.csv) | `ihl-registry-route-index.mjs` | 49 web routes |

---

## 人間ゲート（MAD 完走後も残る）

| ゲート | 機能 | 内容 |
|--------|------|------|
| **HUMAN-02-LEGAL** | #02 | binding 条文 · 運営者 · 準拠法 · 管轄 |
| **HUMAN / Tier D** | #11 | FR-DSP-20 行政 · 判例 binding 文 |
| **GMO 本番** | #23 | 実入金証跡（civ-os 連携） |

---

## 再生成コマンド

```bash
node scripts/ihl-mad-wave5-batch.mjs
node scripts/ihl-registry-auth-matrix.mjs
node scripts/ihl-registry-route-index.mjs
node scripts/ihl-registry-env-matrix.mjs
```

---

*MAD-COMPLETE · 2026-07-03 · A90 文書リメディエーション*
