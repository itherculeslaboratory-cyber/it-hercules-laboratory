# PLAN: リポジトリ衛生(空ディレクトリ・deprecated shim import の解消)

## ゴール

紛らわしい重複・drift を解消して認知負荷を下げる。**コードの挙動は一切変えない**リファクタリングのみ。

## スコープ(3点のみ)

1. **空の `apps/ihl-ui-catalog/` の削除** — 実体は `packages/ihl-ui-catalog/`。`apps/` 側は `src/` だけで 0 バイト
2. **`apps/search/app.py` の deprecated shim import 修正** — `from libs.query import ...` → `from libs.ihl.observation.query import ...`
3. **shim 経由 import の全数調査と修正** — `apps/` と `tests/` 内で `libs.<name>`(`libs.ihl` 以外)を import している箇所を全て正パスに置換

## スコープ外(やらないこと)

- `apps/ui-parts-lab` / `apps/ui-parts-lab-w2` の削除(計600MB超)— **人間の判断ゲート**。W2 は進行中チェックポイントであり、旧 lab の削除可否は人間が決める。本 PLAN では手を付けず、PLAN-INDEX に判断待ちと記録するのみ
- `libs/*.py` の shim ファイル自体の削除 — 後方互換のため残す(外部スクリプトが依存している可能性)

## 手順

1. 削除前確認: `grep -r "apps/ihl-ui-catalog" .`(参照ゼロを確認。package.json の workspaces、tsconfig の paths、CI 設定も含む)→ 参照が無ければ `git rm -r apps/ihl-ui-catalog`
2. `grep -rn "from libs\." apps tests --include="*.py" | grep -v "from libs.ihl"` で shim import を全列挙
3. 各 shim(`libs/<name>.py`)の中身を開き、転送先の正パス(`libs.ihl.<sub>.<name>`)を確認して置換。**推測で書かず必ず shim ファイルの転送先を読むこと**
4. 検証: `python -m pytest tests/unit tests/integration -q`、`streamlit run apps/search/app.py` の起動確認(import エラーが出ないこと。UI 操作までは不要)

## エッジケース(弱いモデルが見落とす点)

- shim は `sys.modules[__name__] = ...` 形式なので、`import libs.query` 形式と `from libs.query import X` 形式の両方がヒットしうる — grep パターンは `import libs\.` と `from libs\.` の両方で
- `apps/search/app.py` は Streamlit アプリで pytest の対象外 — テスト green だけでは検証にならないため起動確認が必須
- `docs/` 内のコード例が旧 import を載せている場合はコードと一緒に直さない(ドキュメント修正は別作業。ただし発見したら報告に含める)
- git 履歴保全のため削除は `git rm`(エクスプローラ削除ではなく)

## 受け入れ条件

- [ ] `apps/ihl-ui-catalog/` が存在しない、かつ全ビルド・テストが green
- [ ] `grep -rn "from libs\.\|import libs\." apps tests --include="*.py" | grep -v "libs\.ihl"` の結果が 0 行
- [ ] `python -m pytest tests/unit tests/integration -q` green
- [ ] `apps/search/app.py` が import エラーなく起動
- [ ] ui-parts-lab 二重化の判断待ちが報告に明記されている
