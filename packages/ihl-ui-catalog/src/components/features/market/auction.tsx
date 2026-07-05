import { useState } from "react";
import type { W2ComponentProps } from "../../../types/w2";
import {
  hot,
  MarketBody,
  MarketCrumb,
  MarketDeepNav,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  SpecimenPlaceholder,
  StatusChip,
} from "./shared";

const ID = "ihl-06-market-auction-bid";

export function MarketAuctionBidContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  const [bid, setBid] = useState("");

  return (
    <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => hot(onAction, 1) },
          { label: "オークション" },
        ]}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="ihl-mkt__title">オークション出品 #C-5521</h1>
        <StatusChip kind="auction">🔨 オークション中</StatusChip>
      </div>
      <MarketBody state={state}>
        <div className="ihl-mkt-detail">
          <div>
            <SpecimenPlaceholder />
            <div className="ihl-mkt-panel" style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p className="ihl-mkt__crumb">現在価格</p>
                <p className="ihl-mkt-card__price">¥12,500</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="ihl-mkt__crumb">残り時間</p>
                <p style={{ color: "#e88" }}>残り 2時間 14分</p>
              </div>
            </div>
          </div>
          <div className="ihl-mkt-panel">
            <h2 className="ihl-mkt-panel__head">入札する</h2>
            <label className="ihl-form-field">
              <span className="ihl-form-field__label">入札額（円）</span>
              <input
                className="ihl-form-control"
                type="number"
                placeholder="例) 13000"
                value={bid}
                onChange={(e) => setBid(e.target.value)}
              />
            </label>
            <p className="ihl-mkt__crumb">最低入札: ¥13,000</p>
            <h3 className="ihl-mkt-panel__head" style={{ marginTop: 16 }}>
              入札履歴
            </h3>
            {[
              { n: "👑", amount: "¥12,500", time: "21:45:32" },
              { n: "2", amount: "¥12,000", time: "21:30:10" },
              { n: "3", amount: "¥11,000", time: "21:15:47" },
            ].map((row) => (
              <div key={row.time} className="ihl-mkt-queue-row">
                <span>
                  {row.n} {row.amount}
                </span>
                <span className="ihl-mkt__crumb">{row.time}</span>
              </div>
            ))}
          </div>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketAuctionBidPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="auction-bid-btn">
        🔨 入札する
      </MarketPrimary>
      <p className="ihl-mkt__crumb" style={{ marginTop: 8 }}>
        入札すると、利用規約に同意したものとみなされます。
      </p>
    </div>
  );
}

export function MarketAuctionBidStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
