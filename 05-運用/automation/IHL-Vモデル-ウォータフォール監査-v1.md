# IHL Vモデル・ウォーターフォール実態監査 v1（2026-06-10）

> **問い（ユーザー · 正直に）**: 「ウォータフォール型でちゃんとできた？」
> **対象**: `指示/it-hercules-laboratory/` 全 24 機能（#00–#23）· 168/168 wave `[x]`
> **方針**: 応援ではなく実態。機械ゲート + 構造 + retrofit の正直な位置づけ。
> **正本参照**: [`00-監査役-実装前ゲート-v1.md`](../queues/00-監査役-実装前ゲート-v1.md) · [`AUDIT-RETROACTIVE-GAPS-2026-06-10.md`](../../02-設計/_横断/AUDIT-RETROACTIVE-GAPS-2026-06-10.md) · `.cursor/rules/ihl-waterfall-v-model-gate.mdc`

---

## 判定

### **CONDITIONAL PASS（条件付き合格）**

構造（左腕 5 点 + 右腕テスト計画 + RTM + 3 段ゲートログ）は **本物で揃っており**、機械ゲートも緑。retrofit は **一貫して正直にラベル付け**されている（チェックボックス劇場ではない）。
ただし **「上流→下流の実時間ウォーターフォール」ではない**（実装先行 = `impl-ahead` の **遡及 V-model**）。さらに mechanical 範囲の過小主張・一部 parity の「安い通過」・薄い詳細設計が残る。**OSS 構造完成としては合格だが、production サインオフではない。**

---

## できていること（実態で確認）

| 項目 | 証跡 |
|------|------|
| 4 点設計（要件・詳細v2・遷移・UI） | `ihl-four-point-inventory.mjs --layout auto` → **20/20 PASS · 0 FAIL** |
| 詳細設計 v2 が全 24 機能に存在 | `02-設計/features/NN-*/詳細設計-v2.md` × 24（stub ではない · 117–264 行 · 見出し 11–31） |
| 4 層テスト計画が全機能に存在 | `03-テスト計画/features/*/` 全機能 **単体/結合/システム/受入 = 4/4** |
| RTM が req_id を写像 | サンプル #00=62行 / #05=60 / #11=26 / #18=18 / #23=14 — 全て `test_layers=4/4` PASS |
| 3 段ゲートチェーンが全機能でログ済 | `DELEGATED-DESIGN-GO → TEST-DESIGN-GO → IMPL-GO` を C1–C4 + parity 付きで監査ログに記録 |
| 設計↔実装 parity（厳格モード） | `ihl-design-impl-parity-check.mjs`（baseline 無視）→ **PASS 24 · 0 FAIL** |
| 遡及ギャップの実修復（一部は本物） | #19: `libs/github_component_board.py` + `test_component_board_github.py` 追加 · `main.py` route から `get_mock_store` **0 件**（実除去） |
| retrofit の正直な明示 | ほぼ全 IMPL-GO が `retrofit=impl-ahead` · 各機能に P1–P7 ギャップ表（`gap/partial/deferred/xref/human`） |

---

## できていない / 薄いこと（正直に）

1. **真の実時間ウォーターフォールではない**
   監査ログのタイムスタンプ（06-09T18:00〜06-11T05:45 の整然連番）は **物語的・再構成**であり、上流設計が実装に先行した実時間証跡ではない。実態は **POST-B8 / HUMAN-IMPL-SIGNOFF の既存コードに V-model 左腕を後付け**した `impl-ahead`。

2. **機械ゲートの範囲が過小主張**
   `ihl-four-point-inventory.mjs` は **01–20 ハードコード**。**#00 / #21 / #22 / #23 は四点チェック対象外**（parity / RTM のみ依存）。「20/20 PASS」は **全 24 機能を構造チェックした意味ではない**。

3. **一部 parity の「安い通過」**
   #06/#07/#16/#17 の `C2-stays-only` は、**stays-only テスト関数を削除**して解消（`test_market_stays` 等は全 tests で **0 ヒット**）。チェッカーは「stays が無いこと」しか見ず、**salvage-adapt の実カバレッジが入った保証はない**。#07/#16 の `C2-mock-store` は route から実除去で本物。

4. **詳細設計の先細り**
   #22（138 行）· **#23（117 行 · 見出し 11 · 「v2 確定ドラフト」）** は #00（264 行）比で薄い。#23 は本文で **日時 FIFO・部分/過入金・issueCoin 連動を gap** と自認。

5. **parity-baseline.json が陳腐化**
   厳格モードで PASS する 9 FAIL が baseline に残存（`--ci --update-baseline` 未実行）。CI は寛容側なので回帰は隠さないが、ドキュメント整合が崩れている。

6. **重複空ディレクトリ**
   `03-テスト計画` に `13-データ取得元管理`・`21-翻訳-言語` の **0/0 空ツリー**（正は `13-データ取得元`・`21-翻訳`）。

7. **機能ギャップの大量 deferred**
   各 retrofit 表のとおり、コアは緑だが周縁は未実装（例: #08 月次スケジューラ · #06 抽選/プラチナ優先=**草案** · #05 Driver runtime · #09/#10 多数 P 項目）。「機能完成」ではなく「コア + 追跡可能な gap」。

---

## retrofit の正直な位置づけ

- ルール上 **想定どおり**: `ihl-waterfall-v-model-gate.mdc` は既存コードを `retrofit: impl-ahead`（右腕は **テスト差分中心**、再実装は parity FAIL 時のみ）と定義。今回はこれに沿う。
- つまり本件は **「教科書的ウォーターフォールを実時間で完走した」のではなく、「実装先行物に V-model の証跡（設計v2・4層計画・RTM・ゲート）を遡及で被せ、機械ゲートで裏取りした」**。
- **正直さは高い**: gap を `[x]` で塗り潰さず、P1–P7 表 / RTM status / 人間ゲート分離で明示。これは false completion の対極。
- **過大主張の注意点**: 「ウォーターフォールでちゃんとできた」を **「上流から順に作った」と読むと誇張**。「V-model 成果物が遡及で揃い機械検証も緑」が正確な表現。

---

## 人手がまだ必要なこと（AI が `[x]` 不可）

| ID / 項目 | 内容 |
|-----------|------|
| `HUMAN-02-LEGAL` | #02 利用規約の法務 binding 条文確定 |
| `P0-NEXT-GMO-LIVE-EXEC` / `POST-B8-GMO-05` | #23 GMO **本番鍵投入 + 実入金照合証跡**（live） |
| mock 目視 | 01–20 の **0/20** がユーザー目視 pending（UI ゲート #4 の人間サインオフ） |
| `HUMAN-IMPL-BATCH8-GO` | ゲート doc に「待ち」表記が残存（SIGNOFF 済との整合確認が要る） |
| Tier D 手動打鍵 | 全 path キーボード打鍵の人手証跡（該当時） |

---

## 推奨次アクション

1. **baseline 更新**: `node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --ci --update-baseline` で陳腐化 9 FAIL を除去。
2. **four-point を全 24 化**: `ihl-four-point-inventory.mjs` の FEATURES に **#00/#21/#22/#23** を追加し「20/20」表記を是正。
3. **salvage-adapt の正カバレッジ化**: #06/#07/#16/#17 で stays 削除に加え、**振る舞いテストを追加**し、parity を「stays 不在」ではなく **正の主張 assert** に強化。
4. **薄い詳細設計の補強**: #22/#23 を厚くするか、未実装点を **実行キューの deferred ID** として明示リンク。
5. **空重複ディレクトリ削除**: `13-データ取得元管理`・`21-翻訳-言語`。
6. **人間ゲート束ねて実施**: mock 目視 + #02 法務 + #23 GMO live を 1 バッチで上申。

---

## 9. post-remediation（2026-06-10 · Tier B 完走）

> **トリガー**: 完成基準充足 · 監査 §推奨次アクション 1–5 実施

| # | 推奨 | 実施 | 証跡 |
|---|------|------|------|
| 1 | parity baseline 更新 | ✓ | `parity-baseline.json` failures **0 件**（`--ci --update-baseline`） |
| 2 | four-point 全 24 化 | ✓ | `ihl-four-point-inventory.mjs` **#00/#21/#22/#23 追加** → **24/24 PASS** |
| 3 | salvage-adapt 正カバレッジ | ✓ | `design-impl-claims.json` #06/#07/#16/#17 に `test_must_assert` + route テスト追加 |
| 4 | #22/#23 詳細設計厚み | ✓ | `詳細設計-v2.md` v2.1 — component ITO · v1→v2 差分 · deferred 表 |
| 5 | 空重複ディレクトリ削除 | ✓ | `03-テスト計画/features/13-データ取得元管理` · `21-翻訳-言語` 削除 |

### 再検証（post-remediation）

| 検査 | 結果 |
|------|------|
| `ihl-design-impl-parity-check.mjs`（厳格） | **PASS 24 · 0 FAIL** |
| `ihl-four-point-inventory.mjs --layout auto` | **24/24 PASS** |
| `docker compose --profile test run --rm test pytest -q` | **272 passed · 1 skipped** |
| `ihl-vmodel-preflight.mjs` | 実行ログ参照（WARN/HUMAN のみ残存可） |

### 判定更新

**CONDITIONAL PASS → CONDITIONAL PASS（機械ゲート強化済）**

- 構造・retrofit の正直さは維持
- 過小主張（20/20）· baseline 陳腐化 · stays-only 安易通過は **解消**
- **production サインオフ**は依然 **未了**（mock 目視 · GMO live · Tier D · 法務 binding）

---

*2026-06-10 · ウォーターフォール実態監査 v1.1 post-remediation*
