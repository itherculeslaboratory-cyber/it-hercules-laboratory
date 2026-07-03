# IHL 契約オラクル仕様 v1（双方向）

> **合図**: `IHL-DOC-REMED MAD`  
> **スクリプト**: [`scripts/ihl-contract-oracle.mjs`](../../scripts/ihl-contract-oracle.mjs) · 抽出器 [`scripts/ihl-route-extract.mjs`](../../scripts/ihl-route-extract.mjs)  
> **黄金 YAML**: [`02-設計/features/05-観測/契約レジスタ-v1.yaml`](../../02-設計/features/05-観測/契約レジスタ-v1.yaml)

---

## 目的

**設計（DET §3.9 認証境界の path 表）** と **実装（`apps/api/routes/*.py`）** の API 契約を **DET(erministic) に双方向突き合わせ**、drift を GATE で検出する。粉飾（設計に書いたが実装に無い / 実装にあるが設計に無い）を機械で潰す。

**正本の向き**:

- **契約レジスタ YAML** = 実装 routes から自動生成する **機械正本**（手編集禁止）。
- **DET §3.9 表** = 人間が読む設計正本。オラクル check が両者の **path 集合**を突き合わせる。

---

## モード

| モード | コマンド | 動作 |
|--------|----------|------|
| **write** | `--feature NN --write` | routes を抽出し `02-設計/features/NN-*/契約レジスタ-v1.yaml` を生成 |
| **check** | `--feature NN --check` | code routes vs DET §3.9 表 を diff → PASS/WARN/FAIL |

---

## 抽出仕様（route-extract）

- `@router.<method>("<path>", status_code=...)` を regex 抽出（method / path / success_status）
- **auth 判定**: `APIRouter(dependencies=[Depends(enforce_auth...)])` = router 全体 session / それ以外は route 関数シグネチャに `RequiredWhenEnabledAuth` or `Depends(enforce_auth` があれば session · 無ければ **public**
- **errors**: ブロック内 `HTTPException(status_code=NNN)`（≥400）+ `status = A if ... else B` 分岐 + session なら 401
- **path 正規化**: `{capture_id}` `{id}` `{template_id}` → `{param}`（表記ゆれ吸収）

---

## DET diff（§3.9 表）

check は DET v3 の見出し **「認証境界」** 直後の markdown 表から `| method | path |` 行を抽出し、path を正規化して集合比較する。

| 差分 | 判定 | 意味 |
|------|------|------|
| 双方一致 | **PASS** | 設計 = 実装 |
| DET にあるがコードに無い | **WARN** | 設計先行 or 廃止漏れ（`extra_in_doc`） |
| コードにあるが DET に無い | **FAIL** | 実装 drift · 設計未反映（`missing_in_doc`） |

FAIL 時は exit code 2（GATE ブロック）。

### #05 現況（2026-07-03）

```
code routes: 16 · doc §3.9 rows: 16
matched: 16 · missing_in_doc: 0 · extra_in_doc: 0
VERDICT: PASS
```

---

## golden fixture

`fixtures/oracle/` にリクエスト/レスポンス例を JSON で置く（v0 はプレースホルダ）。将来 v1 では **request/response の shape** も DET と突き合わせる（payload オラクル）。

- `fixtures/oracle/observation-search.json`
- `fixtures/oracle/solid-observation-commit.json`

---

## GATE 組込み

MICRO Wave の api-1route スライス merge 後、必ず:

```bash
node scripts/ihl-contract-oracle.mjs --feature NN --write   # 実装から再生成
node scripts/ihl-contract-oracle.mjs --feature NN --check    # DET §3.9 と突き合わせ
```

WARN は DET §3.9 表への追記 or route 廃止で解消、FAIL は **必ず** DET §3.9 に route 行を追加してから再 check。

---

## ロードマップ

| バージョン | 追加 |
|-----------|------|
| **v0（現）** | path 集合 diff · auth/errors 抽出 · YAML 生成 |
| v1 | request/response shape の DET diff（golden fixture 実比較） |
| v2 | `--all` 全機能横断 · `AUTH-MATRIX-v1.csv` 自動同期 |
| v3 | OpenAPI 生成 → 契約テスト（schemathesis 等）連携 |
