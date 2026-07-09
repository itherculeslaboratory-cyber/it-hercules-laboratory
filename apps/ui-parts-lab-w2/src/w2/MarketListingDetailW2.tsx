import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  MarketBody,
  MarketCrumb,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  SpecimenPlaceholder,
} from "@ihl/ui-catalog/components/features/market/shared";
import { resolveMarketListingMode } from "./market-listing-mode";
import { W2ShellOnly } from "./withW2Shell";
import {
  endAuctionDemo,
  formatYen,
  loadAuctionBidState,
  simulateOutbid,
} from "./auction-bid-mock";
import {
  MarketEntityDetailShell,
  MOCK_LISTING_CONTEXT,
  MOCK_LISTING_SPEC,
  MOCK_LOTTERY_CONTEXT,
  MOCK_LOTTERY_SPEC,
  MOCK_PRIORITY_CONTEXT,
  MOCK_PRIORITY_SPEC,
} from "./MarketEntityDetailShellW2";

const ID = "ihl-06-market-listing-detail";

function GuestGate({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {
  return (
    <div className="ihl-mkt-panel" data-state="guest">
      <p className="ihl-mkt-panel__head">ログインが必要です</p>
      <p className="ihl-mkt-panel__lead">取引の申込 · 質問の投稿にはログインしてください。</p>
      <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
        <MarketPrimary onClick={() => onNavigate?.("O1")} testId="listing-login-gate">
          ログインへ
        </MarketPrimary>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
          一覧へ
        </button>
      </div>
    </div>
  );
}

/** Stage 0 — 出品詳細（05b ベース統一シェル + Q&A · 称賛）· REQ §11.0 */
export function MarketListingDetailContentAreaW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const guest = screenParams?.guest === "1";
  const listingMode = resolveMarketListingMode(screenParams);
  const isLottery = listingMode === "lottery";
  const isPriority = listingMode === "priority";
  const isAuction = listingMode === "auction";
  const [retryKey, setRetryKey] = useState(0);
  const [bidMock, setBidMock] = useState(() => loadAuctionBidState());

  useEffect(() => {
    setBidMock(loadAuctionBidState());
  }, [screenParams?.bid]);

  const listingContext = useMemo(() => {
    if (!isAuction) {
      return { ...MOCK_LISTING_CONTEXT, listingKind: "fixed" as const, fixedPriceLabel: "即決価格" };
    }
    const base = screenParams?.auction === "1"
      ? {
          ...MOCK_LISTING_CONTEXT,
          currentPrice: "¥18,500",
          bidCount: 5,
          bidHistory: [
            { amount: "¥18,500", bidder: "@beetle_fan", at: "2026-07-05 21:45" },
            { amount: "¥17,000", bidder: "@kabukuwa_lover", at: "2026-07-04 09:10" },
            { amount: "¥16,500", bidder: "@hercules_collector", at: "2026-07-03 16:22" },
            { amount: "¥15,000", bidder: "@beetle_fan", at: "2026-07-02 11:08" },
            { amount: "¥12,000", bidder: "@kabukuwa_lover", at: "2026-07-01 08:00" },
          ],
          endsAtLabel: "7月8日（火）18時30分 終了予定",
        }
      : MOCK_LISTING_CONTEXT;

    return {
      ...base,
      listingKind: "auction" as const,
      currentPrice: formatYen(bidMock.currentPrice),
      bidCount: bidMock.bidCount,
    };
  }, [bidMock.bidCount, bidMock.currentPrice, isAuction, screenParams?.auction]);

  const bidStatusBanner = isAuction && bidMock.status !== "none" && (
    <div
      className={`ihl-mkt-banner ${bidMock.status === "highest" ? "ihl-mkt-banner--success" : "ihl-mkt-banner--warn"}`}
      data-testid={`listing-bid-${bidMock.status}`}
    >
      {bidMock.status === "highest"
        ? `あなたが最高入札者 · ${formatYen(bidMock.currentPrice)}`
        : `他者に上回られました · 現在 ${formatYen(bidMock.currentPrice)}`}
    </div>
  );

  const auctionDemoActions = isAuction && bidMock.status === "highest" && !bidMock.auctionEnded && (
    <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
      <button
        type="button"
        className="ihl-mkt-tabs__tab"
        onClick={() => setBidMock(simulateOutbid())}
        data-testid="auction-demo-outbid"
      >
        デモ: 他者が上回る
      </button>
      <MarketPrimary
        onClick={() => {
          const ended = endAuctionDemo();
          setBidMock(ended);
          onNavigate?.("06b", { matched: "1", stage: "2", source: "auction" });
        }}
        testId="auction-end-demo"
      >
        オークション終了（デモ）
      </MarketPrimary>
    </div>
  );

  const shell = (variant: string, children: ReactNode) => (
    <W2ShellOnly feature="market">
      <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className} data-w2-variant={variant}>
        {children}
      </MarketShell>
    </W2ShellOnly>
  );

  if (state === "loading") {
    return shell("loading", (
      <MarketBody state="loading">
        <div className="obs-detail-layout" aria-busy="true">
          <SpecimenPlaceholder />
          <p className="ihl-mkt-loading">出品情報を読み込み中…</p>
        </div>
      </MarketBody>
    ));
  }

  if (state === "empty") {
    return shell("empty", (
      <>
        <MarketBody state="empty" emptyText="出品が見つかりませんでした。" />
        <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
          <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
            一覧へ
          </button>
        </div>
      </>
    ));
  }

  if (state === "error") {
    return shell("error", (
      <>
        <MarketBody state="error" errorText="出品情報を取得できませんでした。" />
        <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
          <button type="button" className="ihl-mkt-tabs__tab" onClick={() => setRetryKey((k) => k + 1)}>
            再試行
          </button>
        </div>
      </>
    ));
  }

  if (guest) {
    return shell("guest", (
      <>
        <MarketCrumb
          parts={[
            { label: "マーケット" },
            { label: isLottery ? "抽選詳細" : isPriority ? "プラチナコイン優先" : "出品詳細" },
          ]}
        />
        <GuestGate onNavigate={onNavigate} />
      </>
    ));
  }

  if (isLottery) {
    return shell("detail-lottery", (
      <>
        <MarketCrumb
          parts={[
            { label: "マーケット", action: () => onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" }) },
            { label: "抽選詳細" },
          ]}
        />
        <MarketBody state="ok" key={retryKey}>
          <MarketEntityDetailShell
            spec={MOCK_LOTTERY_SPEC}
            context={MOCK_LOTTERY_CONTEXT}
            testIdPrefix="lottery-detail"
            actions={
              <MarketPrimary
                onClick={() => onNavigate?.("06lot-apply", { mode: "lottery" })}
                testId="lottery-detail-apply-btn"
              >
                応募する
              </MarketPrimary>
            }
          />
        </MarketBody>
      </>
    ));
  }

  if (isPriority) {
    return shell("detail-priority", (
      <>
        <MarketCrumb
          parts={[
            { label: "マーケット", action: () => onNavigate?.("06a", { tab: "priority", priorityStep: "list" }) },
            { label: "プラチナコイン優先" },
          ]}
        />
        <MarketBody state="ok" key={retryKey}>
          <MarketEntityDetailShell
            spec={MOCK_PRIORITY_SPEC}
            context={MOCK_PRIORITY_CONTEXT}
            testIdPrefix="priority-detail"
            actions={
              <MarketPrimary
                onClick={() => onNavigate?.("06priority-apply", { mode: "priority" })}
                testId="priority-apply-btn"
              >
                申し込む
              </MarketPrimary>
            }
          />
        </MarketBody>
      </>
    ));
  }

  return shell("detail-stage0", (
    <>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => onNavigate?.("06a") },
          { label: "出品詳細" },
        ]}
      />
      <MarketBody state="ok" key={retryKey}>
        {bidStatusBanner}
        <MarketEntityDetailShell
          spec={MOCK_LISTING_SPEC}
          context={listingContext}
          showEngagement
          testIdPrefix="listing"
        />
        {auctionDemoActions}
      </MarketBody>
    </>
  ));
}

export function MarketListingDetailPrimaryActionW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const guest = screenParams?.guest === "1";
  const listingMode = resolveMarketListingMode(screenParams);

  if (state !== "ok" || guest) return null;

  // CTA は ContentArea 内 actions に配置（priority / lottery）— 06bid 同型
  if (listingMode === "priority" || listingMode === "lottery") return null;

  const isAuction = listingMode === "auction";

  return (
    <div
      data-component-id={`${ID}__PrimaryAction`}
      className={className}
      data-market-mode={listingMode}
    >
      <MarketPrimary
        onClick={() => {
          if (isAuction) {
            onNavigate?.("06bid", { mode: "auction" });
            return;
          }
          onNavigate?.("06b", { matched: "1" });
        }}
        testId={isAuction ? "listing-bid-btn" : "listing-apply-btn"}
      >
        {isAuction ? "入札する" : "この個体に申し込む"}
      </MarketPrimary>
    </div>
  );
}

export function MarketListingDetailStatePanelW2({ state = "ok", className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state}>
      <MarketStatePanel state={state} />
    </div>
  );
}
