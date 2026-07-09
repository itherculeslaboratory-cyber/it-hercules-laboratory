import { useMemo, useState } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  MarketBody,
  MarketCrumb,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  SpecimenPlaceholder,
  StatusChip,
} from "@ihl/ui-catalog/components/features/market/shared";
import { W2ShellOnly } from "./withW2Shell";
import {
  formatYen,
  getBidIncrement,
  getMinBid,
  loadAuctionBidState,
  placeAutoBid,
  validateBidAmount,
} from "./auction-bid-mock";

const ID = "ihl-06-market-auction-bid";

const AUTO_BID_HELP_SHORT =
  "最高入札額を設定すると、他者が入札しても予算の範囲で自動的に再入札します。表示価格は現在の最高入札額です。";

const AUTO_BID_HELP_FULL = `自動入札（スナイプ入札）とは、あらかじめ設定した「最高入札額」まで、システムが代わりに入札を行う機能です。

・入札時は「最高入札額」を入力します（表示されている現在価格ではありません）
・他の利用者が入札しても、最高入札額の範囲内で自動的に再入札されます
・最高入札額を超える入札があった場合、あなたは最高入札者から外れます
・入札単位のルールは通常入札と同じです

※ 本 lab では sessionStorage で入札状態を mock します。`;

export function MarketBidEntryContentAreaW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const wrongMode = screenParams?.mode === "lottery" || screenParams?.mode === "priority";

  if (wrongMode) {
    const target = screenParams?.mode === "lottery" ? "06lot-apply" : "06priority-apply";
    return (
      <W2ShellOnly feature="market">
        <MarketShell componentId={`${ID}__ContentArea`} state="empty" className={className} data-w2-variant="bid-guard">
          <MarketBody state="empty" emptyText="この画面はオークション入札専用です。" />
          <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
            <MarketPrimary onClick={() => onNavigate?.(target, { mode: screenParams!.mode! })} testId="bid-guard-redirect">
              正しい申込画面へ
            </MarketPrimary>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
              一覧へ
            </button>
          </div>
        </MarketShell>
      </W2ShellOnly>
    );
  }

  const initial = loadAuctionBidState();
  const [mock, setMock] = useState(initial);
  const [maxBudget, setMaxBudget] = useState(
    mock.myMaxBid != null ? String(mock.myMaxBid) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const increment = getBidIncrement(mock.currentPrice);
  const minBid = getMinBid(mock.currentPrice, mock.hasBidders);

  const statusBanner = useMemo(() => {
    if (!submitted) return null;
    if (mock.status === "highest") {
      return (
        <div className="ihl-mkt-banner ihl-mkt-banner--success" data-testid="bid-status-highest">
          あなたが最高入札者です · 現在 {formatYen(mock.currentPrice)}
        </div>
      );
    }
    if (mock.status === "outbid") {
      return (
        <div className="ihl-mkt-banner ihl-mkt-banner--warn" data-testid="bid-status-outbid">
          他者に上回られました · 現在 {formatYen(mock.currentPrice)}
        </div>
      );
    }
    return null;
  }, [mock.currentPrice, mock.status, submitted]);

  const handleSubmit = () => {
    const amount = Number.parseInt(maxBudget.replace(/,/g, ""), 10);
    const validation = validateBidAmount(amount, mock.currentPrice, mock.hasBidders);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    const next = placeAutoBid(amount);
    setMock(next);
    setError(null);
    setSubmitted(true);
    onNavigate?.("06detail", { bid: "submitted" });
  };

  if (state !== "ok") {
    return (
      <W2ShellOnly feature="market">
        <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
          <MarketBody state={state} />
        </MarketShell>
      </W2ShellOnly>
    );
  }

  return (
    <W2ShellOnly feature="market">
      <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className} data-w2-variant="bid-entry">
        <MarketCrumb
          parts={[
            { label: "マーケット", action: () => onNavigate?.("06a") },
            { label: "出品詳細", action: () => onNavigate?.("06detail") },
            { label: "入札" },
          ]}
        />
        <div className="ihl-mkt-bid-entry__head">
          <h1 className="ihl-mkt__title">入札 — ヘラクレス ♂ 78mm</h1>
          <StatusChip kind="auction">🔨 オークション中</StatusChip>
        </div>
        <MarketBody state="ok">
          {statusBanner}
          <div className="ihl-mkt-bid-entry">
            <div className="ihl-mkt-bid-entry__spec">
              <SpecimenPlaceholder />
              <div className="ihl-mkt-panel ihl-mkt-price-block">
                <p className="ihl-mkt-price-block__label">現在の価格</p>
                <p className="ihl-mkt-price-block__amount">{formatYen(mock.currentPrice)}</p>
                <div className="ihl-mkt-price-block__meta">
                  <div className="ihl-mkt-price-block__meta-row">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      📊
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">入札件数</span>
                    <span className="ihl-mkt-price-block__meta-value">{mock.bidCount}件</span>
                  </div>
                  <div className="ihl-mkt-price-block__meta-row">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      ➕
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">入札単位</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatYen(increment)}</span>
                  </div>
                  <div className="ihl-mkt-price-block__meta-row ihl-mkt-price-block__meta-row--end">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      ✓
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">最低入札額</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatYen(minBid)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ihl-mkt-panel ihl-mkt-bid-entry__form">
              <h2 className="ihl-mkt-panel__head">予算の最高額で入札（自動入札）</h2>
              <p className="ihl-mkt-panel__lead">{AUTO_BID_HELP_SHORT}</p>

              <label className="ihl-form-field">
                <span className="ihl-form-field__label">最高入札額（円）</span>
                <input
                  className="ihl-form-control"
                  type="number"
                  inputMode="numeric"
                  min={minBid}
                  step={increment}
                  placeholder={`例） ${minBid + increment}`}
                  aria-describedby="bid-min-hint"
                  value={maxBudget}
                  onChange={(e) => {
                    setMaxBudget(e.target.value);
                    setError(null);
                  }}
                  data-testid="bid-max-input"
                />
              </label>
              <p id="bid-min-hint" className="ihl-mkt__crumb">
                最低 {formatYen(minBid)} · 単位 {formatYen(increment)}
              </p>
              {error && (
                <p className="ihl-mkt-bid-entry__error" role="alert">
                  {error}
                </p>
              )}

              <details className="ihl-mkt-bid-entry__help">
                <summary>自動入札の仕組み（詳細）</summary>
                <p>{AUTO_BID_HELP_FULL}</p>
              </details>

              <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>
                <MarketPrimary onClick={handleSubmit} testId="bid-submit-inline">
                  この金額で入札する
                </MarketPrimary>
                <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06detail")}>
                  出品詳細へ戻る
                </button>
              </div>
            </div>
          </div>
        </MarketBody>
      </MarketShell>
    </W2ShellOnly>
  );
}

export function MarketBidEntryPrimaryActionW2({ state = "ok" }: W2ComponentProps) {
  if (state !== "ok") return null;
  return null;
}

export function MarketBidEntryStatePanelW2({ state = "ok", className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state}>
      <MarketStatePanel state={state} />
    </div>
  );
}
