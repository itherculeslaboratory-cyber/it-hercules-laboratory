# PLAN: magic link 経路のテスト整備(本番通電の前提固め)

## ゴール

テストが1本も無い `libs/ihl/identity/magic_link_mail.py`(本番ログインのクリティカルパス)にユニットテストを整備し、SMTP 本番鍵投入(人間ゲート)後に安心して通電できる状態にする。**実装の挙動変更はバグ発見時のみ**。

## 触るファイル

- 新規: `tests/unit/test_magic_link_mail.py`
- 読むだけ: `libs/ihl/identity/magic_link_mail.py`、`libs/ihl/identity/auth_session.py`、`apps/api/routes/auth.py`(呼び出し側)、既存の identity 系テストの書き方
- バグ発見時のみ: `libs/ihl/identity/magic_link_mail.py` を最小修正

## 手順

1. `magic_link_mail.py` を精読: SMTP 接続方法(smtplib? TLS?)、env 変数の一覧(`SMTP_HOST` 等)、リンク URL の組み立て、`SMTP_HOST` 未設定時の `RuntimeError` 経路
2. 既存 unit テストのモック流儀(pytest fixture、monkeypatch、unittest.mock のどれが主流か)を確認し、それに合わせる
3. テストを作成(SMTP は必ずモック。実送信・実接続はしない):
   - `SMTP_HOST` 未設定 → `RuntimeError`(現仕様の固定)
   - 正常系: 宛先・件名・本文にトークン入りリンクが含まれる/SMTP へ渡る引数が正しい
   - TLS/認証情報が設定どおり `smtplib` に渡る
   - 本文のリンクがトークンを URL エンコードしている(トークンに `+` や `/` が入るケース)
   - 宛先メールアドレスのヘッダインジェクション(改行入りアドレス)を拒否するか — **拒否しない実装ならバグとして最小修正**(smtplib は素通しし得る)
4. `python -m pytest tests/unit/test_magic_link_mail.py -v` → `tests/unit` 全体 green

## エッジケース(弱いモデルが見落とす点)

- テスト内に実在しそうな SMTP ホスト名・実鍵っぽい文字列を書かない(ダミーは `smtp.example.com` 等)。**鍵・秘密は commit 禁止**(ADR-H-30 と同思想)
- 日本語件名の MIME エンコード(UTF-8 ヘッダ)が正しく行われるか
- env 読み取りが import 時か呼び出し時か — import 時キャッシュだと monkeypatch が効かないので、その場合はテスト側で reload するか、実装の遅延読み取り化を最小修正として提案
- `RuntimeError` メッセージに secrets(部分的にも)が含まれないこと

## 人間ゲート(この PLAN ではやらない)

- 本番 SMTP 鍵の発行・VPS への投入・実メール送達確認 → 完了報告に「人間の残作業」として明記すること

## 受け入れ条件

- [ ] `tests/unit/test_magic_link_mail.py` が 6 ケース以上で green
- [ ] `python -m pytest tests/unit -q` 全体 green
- [ ] テストコードに実鍵・実ホスト名なし
- [ ] 発見したバグ(あれば)は最小修正+テストで固定し、報告に列挙
