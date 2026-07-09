# PLAN: test_csv_import.py の修復(5分バケット集約の実装)

## ゴール

`tests/unit/test_csv_import.py` の FAILED 2件を、**テストを変更せずに** `libs/ihl/env/csv_import.py` の実装修正で green にする。テストが仕様(STATUS.md 次タスク#2 と一致)。

失敗中のテスト:
- `test_switchbot_hub_export_fixture_parses` — `assert 21.0 == 20.3`
- `test_one_minute_rows_aggregate_to_five_minute_bucket` — `assert 2 == 1`

## 触るファイル

- `libs/ihl/env/csv_import.py`(唯一の実装変更対象)
- 読むだけ: `tests/unit/test_csv_import.py`、`tests/fixtures/switchbot_hub_export_sample.csv`

## 手順

1. `tests/unit/test_csv_import.py` を精読し、期待仕様を確定する。特に:
   - 5分バケットの丸め方向(floor か。例 12:03 → 12:00)
   - 同一バケット内に複数行があるときの解決規則(テスト名と assert から判断。「最終行 wins」が有力だが、fixture の失敗値 21.0 vs 20.3 がどの行に対応するかで first/last/mean を判別すること)
2. `libs/ihl/env/csv_import.py` の現在のパース経路を読み、集約が行われていない箇所を特定
3. バケット集約を実装(bucket キー = timestamp を5分に floor したもの)。既存の戻り値の型・呼び出し側(`grep -r "csv_import" libs apps tests`)を壊さないこと
4. `python -m pytest tests/unit/test_csv_import.py -v` で 6/6 passed を確認
5. `python -m pytest tests/unit -q` でリグレッションなしを確認

## エッジケース(弱いモデルが見落とす点)

- 入力 CSV が時刻順ソート済みとは限らない — 「最終行 wins」は**タイムスタンプ順の最終**か**ファイル出現順の最終**かをテストから判別する(assert が区別できない場合はタイムスタンプ順を採用し、コメントで明示)
- バケット境界ちょうど(12:05:00)の行は次バケットの先頭(floor なら 12:05 バケット)
- 同一タイムスタンプの重複行
- 温度以外の列(湿度等)も同じ規則で集約されるか、テストが温度のみ検証していても他列の整合を保つ
- 呼び出し側が「集約前の行数」に依存していないか(integration テスト `tests/integration` も走らせて確認)

## 受け入れ条件

- [ ] `python -m pytest tests/unit/test_csv_import.py -v` が全件 passed
- [ ] `python -m pytest tests/unit -q` が全件 passed(既存 green を壊さない)
- [ ] `tests/` 配下の変更が 0 行(git diff で確認)
- [ ] 集約規則(丸め方向・同一バケット解決)が csv_import.py 内の docstring に1〜2行で明記されている
