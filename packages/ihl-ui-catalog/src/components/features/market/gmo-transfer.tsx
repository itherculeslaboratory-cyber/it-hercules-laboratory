import type { W2ComponentProps } from "../../../types/w2";
import { hot, MarketCrumb, MarketPrimary } from "./shared";

export function GmoTransferStatusChip({ state = "ok", className }: W2ComponentProps) {
  return (
    <div
      className={["ihl-mkt-banner ihl-mkt-banner--info", className].filter(Boolean).join(" ")}
      data-component-id="ihl-23-gmo-transfer__StatusChip"
      data-state={state}
    >
      ⓘ 取引成立しました。下記の内容でお振込ください
    </div>
  );
}

export function GmoTransferFeeBreakdown({ state = "ok", className }: W2ComponentProps) {
  return (
    <section
      className={["ihl-mkt-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-23-gmo-transfer__FeeBreakdown"
      data-state={state}
    >
      <h1 className="ihl-mkt__title" style={{ textAlign: "center" }}>
        8% 貢献費のお振込
      </h1>
      <div className="ihl-mkt-gmo-row">
        <span className="ihl-mkt-gmo-row__label">振込先銀行</span>
        <span className="ihl-mkt-gmo-row__value">GMOあおぞらネット銀行</span>
        <button type="button" className="ihl-mkt-tabs__tab">
          コピー
        </button>
      </div>
      <div className="ihl-mkt-gmo-row">
        <span className="ihl-mkt-gmo-row__label">支店 / 口座</span>
        <span className="ihl-mkt-gmo-row__value">XXX支店 普通 1234567</span>
        <button type="button" className="ihl-mkt-tabs__tab">
          コピー
        </button>
      </div>
      <div className="ihl-mkt-gmo-row">
        <span className="ihl-mkt-gmo-row__label">金額</span>
        <span className="ihl-mkt-gmo-row__value" style={{ fontSize: "1.25rem" }}>
          ¥ 960
        </span>
        <button type="button" className="ihl-mkt-tabs__tab">
          コピー
        </button>
      </div>
    </section>
  );
}

export function GmoTransferCodeDisplay({ state = "ok", className }: W2ComponentProps) {
  return (
    <section
      className={["ihl-mkt-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-23-gmo-transfer__TransferCodeDisplay"
      data-state={state}
      style={{ borderColor: "var(--civ-link)" }}
    >
      <div className="ihl-mkt-gmo-row" style={{ border: "none" }}>
        <span className="ihl-mkt-gmo-row__label" style={{ color: "var(--civ-link)" }}>
          振込コード
        </span>
        <span className="ihl-mkt-gmo-code">U - 4 F 9 A</span>
        <button type="button" className="ihl-mkt-tabs__tab">
          コピー
        </button>
      </div>
      <div className="ihl-mkt-banner ihl-mkt-banner--warn" style={{ marginTop: 12, marginBottom: 0 }}>
        ⚠ 振込依頼人名の末尾にコードを追記してください
        <br />
        例: ヤマダ U-4F9A
      </div>
      <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
        ⓘ 銀行はユーザーIDを返さないため、名義で照合します
      </p>
    </section>
  );
}

export function GmoTransferPanel({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <section
      className={["ihl-mkt", className].filter(Boolean).join(" ")}
      data-component-id="ihl-23-gmo-transfer__GmoTransferPanel"
      data-state={state}
    >
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }, { label: "振込案内" }]} />
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="gmo-transfer-done">
        振込を済ませた
      </MarketPrimary>
    </section>
  );
}
