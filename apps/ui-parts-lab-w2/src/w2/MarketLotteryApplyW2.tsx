import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  MarketBody,
  MarketCrumb,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  StatusChip,
} from "@ihl/ui-catalog/components/features/market/shared";
import { W2ShellOnly } from "./withW2Shell";
import {
  MarketEntityDetailShell,
  MOCK_LOTTERY_CONTEXT,
  MOCK_LOTTERY_SPEC,
} from "./MarketEntityDetailShellW2";

const ID = "ihl-06-market-lottery-apply";

export function MarketLotteryApplyContentAreaW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const applied = screenParams?.applied === "1";

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
      <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className} data-w2-variant="lottery-apply">
        <MarketCrumb
          parts={[
            { label: "マーケット", action: () => onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" }) },
            { label: "出品詳細", action: () => onNavigate?.("06detail", { mode: "lottery" }) },
            { label: applied ? "抽選待ち" : "応募" },
          ]}
        />
        <div className="ihl-mkt-bid-entry__head">
          <h1 className="ihl-mkt__title">{applied ? "抽選待ち" : "応募"} — {MOCK_LOTTERY_SPEC.title}</h1>
          <StatusChip kind="lottery">{applied ? "応募済み · 抽選待ち" : MOCK_LOTTERY_CONTEXT.statusLabel}</StatusChip>
        </div>
        {applied && (
          <div className="ihl-mkt-banner ihl-mkt-banner--info" data-testid="lottery-waiting-banner">
            応募を受け付けました · 締切 {MOCK_LOTTERY_CONTEXT.deadline} 後に均等乱数で当選者を決定します
          </div>
        )}
        <MarketBody state="ok">
          <MarketEntityDetailShell
            spec={MOCK_LOTTERY_SPEC}
            context={
              applied
                ? { ...MOCK_LOTTERY_CONTEXT, statusLabel: "抽選待ち（応募済み）" }
                : MOCK_LOTTERY_CONTEXT
            }
            testIdPrefix="lottery-apply"
          />
          {applied && (
            <div className="ihl-mkt-panel" style={{ marginTop: 16 }} data-testid="lottery-waiting-panel">
              <h2 className="ihl-mkt-panel__head">抽選待ち</h2>
              <p className="ihl-mkt-panel__lead">
                応募者 <strong>{MOCK_LOTTERY_CONTEXT.applicants + 1}</strong> 名 · 締切後に結果を通知します
              </p>
              <p className="ihl-mkt__crumb">ⓘ 1ユーザー1応募のみ · 取消不可</p>
            </div>
          )}
        </MarketBody>
      </MarketShell>
    </W2ShellOnly>
  );
}

export function MarketLotteryApplyPrimaryActionW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const applied = screenParams?.applied === "1";

  if (state !== "ok") return null;

  if (applied) {
    return (
      <div data-component-id={`${ID}__PrimaryAction`} className={className}>
        <MarketPrimary
          onClick={() => onNavigate?.("06a", { tab: "lottery", lotteryStep: "result" })}
          testId="lottery-waiting-result-demo"
        >
          抽選結果を見る（デモ）
        </MarketPrimary>
        <button
          type="button"
          className="ihl-mkt-tabs__tab"
          style={{ marginTop: 12 }}
          onClick={() => onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" })}
        >
          一覧へ
        </button>
      </div>
    );
  }

  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketPrimary
        onClick={() => onNavigate?.("06lot-apply", { mode: "lottery", applied: "1" })}
        testId="lottery-apply-submit"
      >
        応募する
      </MarketPrimary>
      <button
        type="button"
        className="ihl-mkt-tabs__tab"
        style={{ marginTop: 12 }}
        onClick={() => onNavigate?.("06detail", { mode: "lottery" })}
      >
        出品詳細へ戻る
      </button>
    </div>
  );
}

export function MarketLotteryApplyStatePanelW2({ state = "ok", className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state}>
      <MarketStatePanel state={state} />
    </div>
  );
}
