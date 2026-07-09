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
import { MOCK_PRIORITY_CONTEXT, MOCK_PRIORITY_SPEC } from "./MarketEntityDetailShellW2";
import {
  PRIORITY_INCREMENT,
  formatPt,
  getMinPriorityBid,
  getMinWinPt,
  loadPriorityApplyState,
  placePriorityAutoBid,
  validatePriorityBidAmount,
} from "./priority-apply-mock";

const ID = "ihl-06-market-priority-queue";

const PRIORITY_AUTO_HELP_SHORT =
  "最高累計 PT を設定すると、他者が上回っても予算の範囲で +1 PT ずつ自動的に再申込します。表示はキュー最高累計 PT です。";

const PRIORITY_AUTO_HELP_FULL = `自動申込（PT 自動入札）とは、あなたが設定した「最高累計 PT」まで、システムが +1 PT 単位で代わりに申込を行う機能です。

・申込時は「最高累計 PT」を入力します（現在のあなたの累計ではありません）
・最低累計 PT はキュー最高値以上です（競合と同数では早い順のため先頭取得には +1 PT 必要）
・他の利用者が上回っても、最高累計 PT の範囲内で自動的に +1 PT 再申込されます
・最高累計 PT を超える申込があった場合、あなたは先頭から外れます
・申込単位は常に 1 PT 固定です

※ 本 lab では sessionStorage で申込状態を mock します。`;

function PriorityQueuePanel({
  ctx,
  yourCumulativePt,
}: {
  ctx: typeof MOCK_PRIORITY_CONTEXT;
  yourCumulativePt: number;
}) {
  return (
    <div className="ihl-mkt-panel ihl-mkt-priority-panel" data-mkt-context="priority">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 className="ihl-mkt-panel__head">キューの状況</h2>
        <StatusChip kind="priority">{ctx.yourRank}位</StatusChip>
      </div>
      <p className="ihl-mkt-panel__lead" style={{ color: "var(--civ-success)" }}>
        定員 {ctx.capacity}名
        {ctx.applicants != null && <> · 応募 {ctx.applicants}名</>}
      </p>
      {ctx.deadline && <p className="ihl-mkt__crumb">締切: {ctx.deadline}</p>}
      <p className="ihl-mkt__crumb">上位3名とあなた（累計 PT 枚数）</p>
      {ctx.queueRows.map((row) => (
        <div
          key={`${row.rank}-${row.label}`}
          className={`ihl-mkt-queue-row${row.isYou ? " ihl-mkt-queue-row--you" : ""}`}
        >
          <span>{row.isYou ? `あなた: ${row.rank}位` : `${row.rank}位 · ${row.label}`}</span>
          <span>
            累計 {row.isYou ? yourCumulativePt : row.coins} PT
          </span>
        </div>
      ))}
    </div>
  );
}

export function MarketPriorityApplyContentAreaW2({
  state = "ok",
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const wrongMode = screenParams?.mode === "auction" || screenParams?.mode === "lottery";

  if (wrongMode) {
    const target = screenParams?.mode === "lottery" ? "06lot-apply" : "06bid";
    return (
      <W2ShellOnly feature="market">
        <MarketShell componentId={`${ID}__ContentArea`} state="empty" className={className} data-w2-variant="priority-guard">
          <MarketBody state="empty" emptyText="この画面はプラチナコイン優先申込専用です。" />
          <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
            <MarketPrimary onClick={() => onNavigate?.(target, { mode: screenParams!.mode! })} testId="priority-guard-redirect">
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

  const ctx = MOCK_PRIORITY_CONTEXT;
  const initial = loadPriorityApplyState();
  const [mock, setMock] = useState(initial);
  const [maxPt, setMaxPt] = useState(mock.myMaxPt != null ? String(mock.myMaxPt) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(mock.applied);

  const minBid = getMinPriorityBid(mock.highestCumulativePt);
  const minWin = getMinWinPt(mock.highestCumulativePt);

  const statusBanner = useMemo(() => {
    if (!submitted) return null;
    if (mock.status === "leading") {
      return (
        <div className="ihl-mkt-banner ihl-mkt-banner--success" data-testid="priority-status-leading">
          あなたが先頭です · 累計 {formatPt(mock.yourCumulativePt)}
        </div>
      );
    }
    if (mock.status === "outbid") {
      return (
        <div className="ihl-mkt-banner ihl-mkt-banner--warn" data-testid="priority-status-outbid">
          他者に上回られました · キュー最高 {formatPt(mock.highestCumulativePt)}
        </div>
      );
    }
    if (mock.applied) {
      return (
        <div className="ihl-mkt-banner ihl-mkt-banner--success" data-testid="priority-apply-submitted">
          申込を受け付けました · 累計 {formatPt(mock.yourCumulativePt)} · 現在 {mock.yourRank}位
        </div>
      );
    }
    return null;
  }, [mock.applied, mock.highestCumulativePt, mock.status, mock.yourCumulativePt, mock.yourRank, submitted]);

  const handleSubmit = () => {
    const amount = Number.parseInt(maxPt.replace(/,/g, ""), 10);
    const validation = validatePriorityBidAmount(amount, mock.highestCumulativePt);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    const next = placePriorityAutoBid(amount);
    setMock(next);
    setError(null);
    setSubmitted(true);
    onNavigate?.("06detail", { mode: "priority", priorityStep: "queue", applied: "1" });
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
      <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className} data-w2-variant="priority-apply">
        <MarketCrumb
          parts={[
            { label: "マーケット", action: () => onNavigate?.("06a", { tab: "priority", priorityStep: "list" }) },
            { label: "出品詳細", action: () => onNavigate?.("06detail", { mode: "priority" }) },
            { label: "申込" },
          ]}
        />
        <div className="ihl-mkt-bid-entry__head">
          <h1 className="ihl-mkt__title">申込 — {MOCK_PRIORITY_SPEC.title}</h1>
          <StatusChip kind="priority">プラチナコイン優先</StatusChip>
        </div>
        <MarketBody state="ok">
          {statusBanner}
          <div className="ihl-mkt-bid-entry">
            <div className="ihl-mkt-bid-entry__spec">
              <SpecimenPlaceholder />
              <div className="ihl-mkt-panel ihl-mkt-price-block">
                <p className="ihl-mkt-price-block__label">キュー最高累計</p>
                <p className="ihl-mkt-price-block__amount">{formatPt(mock.highestCumulativePt)}</p>
                <div className="ihl-mkt-price-block__meta">
                  <div className="ihl-mkt-price-block__meta-row">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      📊
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">あなたの累計</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatPt(mock.yourCumulativePt)}</span>
                  </div>
                  <div className="ihl-mkt-price-block__meta-row">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      ➕
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">申込単位</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatPt(PRIORITY_INCREMENT)}</span>
                  </div>
                  <div className="ihl-mkt-price-block__meta-row">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      ✓
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">最低累計 PT</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatPt(minBid)}</span>
                  </div>
                  <div className="ihl-mkt-price-block__meta-row ihl-mkt-price-block__meta-row--end">
                    <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
                      🏆
                    </span>
                    <span className="ihl-mkt-price-block__meta-label">先頭取得目安</span>
                    <span className="ihl-mkt-price-block__meta-value">{formatPt(minWin)}</span>
                  </div>
                </div>
              </div>
              <PriorityQueuePanel ctx={{ ...ctx, yourRank: mock.yourRank }} yourCumulativePt={mock.yourCumulativePt} />
            </div>

            <div className="ihl-mkt-panel ihl-mkt-bid-entry__form">
              <h2 className="ihl-mkt-panel__head">累計 PT の上限で申込（自動入札）</h2>
              <p className="ihl-mkt-panel__lead">{PRIORITY_AUTO_HELP_SHORT}</p>

              <label className="ihl-form-field">
                <span className="ihl-form-field__label">最高累計 PT</span>
                <input
                  className="ihl-form-control"
                  type="number"
                  inputMode="numeric"
                  min={minBid}
                  step={PRIORITY_INCREMENT}
                  placeholder={`例） ${minWin}`}
                  aria-describedby="priority-min-hint"
                  value={maxPt}
                  onChange={(e) => {
                    setMaxPt(e.target.value);
                    setError(null);
                  }}
                  data-testid="priority-max-input"
                />
              </label>
              <p id="priority-min-hint" className="ihl-mkt__crumb">
                最低 {formatPt(minBid)}（キュー最高値以上）· 単位 {formatPt(PRIORITY_INCREMENT)}
                · 同数は早い順のため先頭取得は {formatPt(minWin)} 以上
              </p>
              {error && (
                <p className="ihl-mkt-bid-entry__error" role="alert">
                  {error}
                </p>
              )}

              <details className="ihl-mkt-bid-entry__help">
                <summary>自動申込の仕組み（詳細）</summary>
                <p>{PRIORITY_AUTO_HELP_FULL}</p>
              </details>

              <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>
                <MarketPrimary onClick={handleSubmit} testId="priority-apply-submit-inline">
                  申し込む
                </MarketPrimary>
                <button
                  type="button"
                  className="ihl-mkt-tabs__tab"
                  onClick={() => onNavigate?.("06detail", { mode: "priority" })}
                >
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

export function MarketPriorityApplyPrimaryActionW2({ state = "ok" }: W2ComponentProps) {
  if (state !== "ok") return null;
  return null;
}

export function MarketPriorityApplyStatePanelW2({ state = "ok", className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state}>
      <MarketStatePanel state={state} />
    </div>
  );
}
