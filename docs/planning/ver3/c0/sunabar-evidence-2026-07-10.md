---
id: sunabar-evidence-c0
date: 2026-07-10
status: done
related: [V3-MKT-14, CL-11]
---

# sunabar sandbox 疎通実証（Phase C0-③）

目的: GMO あおぞらネット銀行の無料 sandbox「sunabar」への疎通を実証し、①残高照会 ②入出金明細照会 ③振込入金明細照会 の3 API が実キーで 200 応答することを確認する。トークン値は本ファイル・保存 JSON のいずれにも含めない（実施後に grep 照合済み）。

## 結論

疎通成功。3 API とも HTTP 200。振込入金明細は 0 件（sandbox に入金履歴が無いため正常）。

## ホスト・パス形式（実証で確定）

- 実ホスト: `https://api.sunabar.gmo-aozora.com`（開発者ポータルのモック `api.gmo-aozora.com/ganb/api/simulator` とは別物。公式テックブログ「sunabar 入門編」の記載どおり）。
- ベースパス: 本番の `https://api.gmo-aozora.com/ganb/api/corporation/v1` に対し、sunabar では `/ganb/api` を持たない `https://api.sunabar.gmo-aozora.com/corporation/v1` 形式。`personal/v1` も同様に存在。
- 認証: `x-access-token` ヘッダ。
- **ハマった点**: `GET /accounts/transactions` と `GET /accounts/deposit-transactions` は `accountId` のみのクエリだと `405` + `{"errorCode":"WG_ERR_019","errorMessage":"Operation is not found during transformation"}` を返す。`dateFrom`/`dateTo` を両方付与すると 200 になる（公式仕様書では両パラメータは任意扱いだが、sunabar のゲートウェイ実装ではルーティング上必須と判断できる）。`GET /accounts/balances` は `accountId` のみで問題なし。

## トークン判別結果

`/personal/v1/accounts` と `/corporation/v1/accounts` はどちらのパスでも同一トークンに紐づく口座情報を返す（パスは疎通に影響せず、口座種別はトークンに紐づく `accountName` で判別）。

| トークン | accountName（口座名義） | 種別 | accountId |
|---|---|---|---|
| TOKEN1 | 砂場　保生（個人名） | 個人 | 302010013543 |
| TOKEN2 | 砂場心乃葉株式会社（株式会社） | **法人** | 102010015431 |
| TOKEN3 | 砂場　由起夫（個人名） | 個人 | 301010013550 |

→ ③振込入金明細照会は法人口座前提のため、**TOKEN2（法人）** の `corporation/v1`・`accountId=102010015431` を本実証の主軸に採用。

## 実施ログ

| # | エンドポイント | HTTP status | 使用トークン / 口座種別 | accountId | 主なクエリ | 所要 |
|---|---|---|---|---|---|---|
| 0 | `GET /personal/v1/accounts`（判別用） | 200 | TOKEN1 / 個人 | 302010013543 | なし | - |
| 0 | `GET /corporation/v1/accounts`（判別用） | 200 | TOKEN2 / 法人 | 102010015431 | なし | - |
| 0 | `GET /personal/v1/accounts`（判別用） | 200 | TOKEN3 / 個人 | 301010013550 | なし | - |
| ① | `GET /corporation/v1/accounts/balances` | 200 | TOKEN2 / 法人 | 102010015431 | accountId | 417ms |
| ② | `GET /corporation/v1/accounts/transactions` | 405→200 | TOKEN2 / 法人 | 102010015431 | accountId + dateFrom + dateTo（405 のため dateFrom/dateTo を追加補正） | 269ms |
| ③ | `GET /corporation/v1/accounts/deposit-transactions` | 200 | TOKEN2 / 法人 | 102010015431 | accountId + dateFrom=2026-01-01 + dateTo=2026-07-10 | 149ms |

②・③とも 429 は発生せず、再試行は不要だった。

## 応答概要

- ① 残高照会: `balance: "0"`（sandbox 口座残高0円、正常値）。
- ② 入出金明細照会: `count: "0"`, `transactions: []`（sandbox に取引履歴なし、正常値）。
- ③ 振込入金明細照会: `count: "0"`, `paymentArrivals: []`（sandbox に入金履歴なし、正常値。**C0 完了条件はこの 200 応答をもって達成**）。

保存した実レスポンス JSON:
- `sunabar-balances-2026-07-10.json`
- `sunabar-transactions-2026-07-10.json`
- `sunabar-deposit-transactions-2026-07-10.json`

## トークン非流出チェック

保存後、3 トークン値（各32桁）が上記3 JSON ファイルのいずれにも含まれないことを PowerShell で文字列照合済み（`-like "*<token>*"` で全ファイル・全トークンを走査、一致なし）。マスク処理は不要だった。

## 次フェーズへの注記

C4 で擬似入金→照合 E2E を実施予定（sunabar の更新系 API で振込を実行し、本実証の ③ 振込入金明細照会で検知できるかを確認する）。個人事業主口座での直接契約可否など、`research-gmo-aozora-api-v1.md` §5-6 に記載の未解決の問い・再検証条項は本実証の対象外のまま残る。
