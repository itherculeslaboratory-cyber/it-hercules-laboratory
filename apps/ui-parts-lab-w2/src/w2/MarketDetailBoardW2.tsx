import { useState, type ReactNode } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  GmoTransferCodeDisplay,
  GmoTransferFeeBreakdown,
  GmoTransferStatusChip,
} from "@ihl/ui-catalog/components/features/market/gmo-transfer";
import {
  hot,
  MarketBody,
  MarketCrumb,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  SpecimenPlaceholder,
  TradeStepper,
} from "@ihl/ui-catalog/components/features/market/shared";
import { W2ShellOnly } from "./withW2Shell";

const ID = "ihl-06-market-detail-board";

function PrivateBoard() {
  return (
    <div className="ihl-mkt-board">
      <p className="ihl-mkt-panel__lead">🔒 当事者2人のみ · 第三者非公開</p>
      <div className="ihl-mkt-board__msgs">
        <div className="ihl-mkt-msg ihl-mkt-msg--buyer">
          よろしくお願いします。
          <span className="ihl-mkt-msg__time">今日 10:15 · 既読 10:16</span>
        </div>
        <div className="ihl-mkt-msg ihl-mkt-msg--seller">
          振込先は設定済みです。期限内にお願いします。
          <span className="ihl-mkt-msg__time">今日 10:20</span>
        </div>
      </div>
      <div className="ihl-mkt-board__compose">
        <input className="ihl-form-control" placeholder="メッセージを入力…" aria-label="メッセージ" />
        <MarketPrimary onClick={() => {}}>送信</MarketPrimary>
      </div>
    </div>
  );
}

function GuestGate({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {
  return (
    <div className="ihl-mkt-panel" data-state="guest">
      <p className="ihl-mkt-panel__head">ログインが必要です</p>
      <p className="ihl-mkt-panel__lead">取引の申込・プライベートボードの閲覧にはログインしてください。</p>
      <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
        <MarketPrimary onClick={() => onNavigate?.("O1")} testId="market-login-gate">
          ログインへ
        </MarketPrimary>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
          一覧へ
        </button>
      </div>
    </div>
  );
}

function parseStage(screenParams?: Record<string, string>): 1 | 2 | 3 {
  const s = screenParams?.stage;
  if (s === "2") return 2;
  if (s === "3") return 3;
  return 1;
}

function isAuctionTrade(screenParams?: Record<string, string>): boolean {
  return screenParams?.source === "auction";
}

function effectiveStage(screenParams?: Record<string, string>): 1 | 2 | 3 {
  const stage = parseStage(screenParams);
  if (isAuctionTrade(screenParams) && stage === 1) return 2;
  return stage;
}

function isGuest(screenParams?: Record<string, string>): boolean {
  return screenParams?.guest === "1";
}

function isMatched(screenParams?: Record<string, string>): boolean {
  return screenParams?.matched === "1";
}

function UnmatchedGate({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {
  return (
    <div className="ihl-mkt-panel" data-state="unmatched">
      <p className="ihl-mkt-panel__head">マッチング前です</p>
      <p className="ihl-mkt-panel__lead">
        プライベートボードはマッチング成立後（Stage 1）のみ利用できます。先に出品詳細で申し込んでください。
      </p>
      <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
        <MarketPrimary onClick={() => onNavigate?.("06detail")} testId="market-unmatched-detail">
          出品詳細へ
        </MarketPrimary>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
          一覧へ
        </button>
      </div>
    </div>
  );
}

/** Q3:C — 3101 専用 1画面 stepper（BLK-W2-003 · GMO インライン Q4:A） */
export function MarketDetailBoardContentAreaW2({
  state = "ok",
  onAction,
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const stage = effectiveStage(screenParams);
  const guest = isGuest(screenParams);
  const matched = isMatched(screenParams);
  const auctionTrade = isAuctionTrade(screenParams);
  const evalSubmitted = screenParams?.eval === "submitted" || screenParams?.eval === "done";
  const gmoDone = screenParams?.gmo === "done";
  const [modal, setModal] = useState<"pay" | "ship" | null>(null);
  const [rating, setRating] = useState(5);
  const [reason, setReason] = useState("梱包丁寧 · 個体状態良好");
  const [retryKey, setRetryKey] = useState(0);

  const goStage = (next: 1 | 2 | 3, extra?: Record<string, string>) => {
    const resolved = auctionTrade && next === 1 ? 2 : next;
    onNavigate?.("06b", {
      matched: "1",
      stage: String(resolved),
      ...(auctionTrade ? { source: "auction" } : {}),
      ...extra,
    });
  };

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
        <div className="ihl-mkt-detail" aria-busy="true">
          <SpecimenPlaceholder />
          <p className="ihl-mkt-loading">取引情報を読み込み中…</p>
        </div>
      </MarketBody>
    ));
  }

  if (state === "empty") {
    return shell("empty", (
      <>
        <MarketBody state="empty" emptyText="進行中の取引がありません。" />
        <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
          <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
            出品一覧へ
          </button>
        </div>
      </>
    ));
  }

  if (state === "error") {
    return shell("error", (
      <>
        <MarketBody state="error" errorText="取引情報を取得できませんでした。" />
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
        <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }]} />
        <GuestGate onNavigate={onNavigate} />
      </>
    ));
  }

  if (!matched) {
    return shell("unmatched", (
      <>
        <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }]} />
        <UnmatchedGate onNavigate={onNavigate} />
      </>
    ));
  }

  if (stage === 3) {
    return shell("stepper-stage3", (
      <>
        <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }, { label: "評価・振込" }]} />
        <h1 className="ihl-mkt__title">取引 — 評価・振込</h1>
        <MarketBody state="ok" key={retryKey}>
          <TradeStepper stage={4} />
          {!evalSubmitted ? (
            <div className="ihl-mkt-panel">
              <p className="ihl-mkt-panel__head">評価（星 + 理由必須）</p>
              <div className="ihl-mkt-actions-row" style={{ marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="ihl-mkt-tabs__tab"
                    aria-label={`${n}点`}
                    aria-pressed={n === rating}
                    onClick={() => setRating(n)}
                  >
                    {n <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                className="ihl-form-control"
                rows={2}
                placeholder="評価理由（必須）"
                aria-label="評価理由"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
                <MarketPrimary
                  onClick={() => {
                    if (reason.trim().length === 0) return;
                    goStage(3, { eval: "submitted" });
                  }}
                  testId="market-eval-submit"
                >
                  評価を確定
                </MarketPrimary>
              </div>
            </div>
          ) : (
            <>
              <div className="ihl-mkt-panel">
                <p className="ihl-mkt-panel__head">評価が完了しました</p>
                <p className="ihl-mkt-panel__lead">ご協力ありがとうございました。</p>
                <p>
                  あなたの評価:{" "}
                  <span style={{ color: "var(--civ-accent)" }}>
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)} {rating >= 4 ? "非常に良い" : "良い"}
                  </span>
                </p>
              </div>
              <div className="ihl-mkt-panel">
                <p className="ihl-mkt-panel__head">貢献費 8% が積み上がりました</p>
                <p style={{ fontSize: "1.5rem", color: "var(--civ-success)", margin: 0 }}>¥960</p>
                <p className="ihl-mkt__crumb">取引額 ¥12,000 × 8%</p>
              </div>
              {!gmoDone ? (
                <div className="ihl-mkt-panel" data-inline-gmo="true" id="gmo-inline-panel">
                  <h2 className="ihl-mkt-panel__head">GMO 振込（インライン）</h2>
                  <GmoTransferStatusChip />
                  <GmoTransferFeeBreakdown />
                  <GmoTransferCodeDisplay />
                  <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>
                    <MarketPrimary
                      onClick={() => goStage(3, { eval: "submitted", gmo: "done" })}
                      testId="gmo-inline-done"
                    >
                      振込を済ませた
                    </MarketPrimary>
                  </div>
                </div>
              ) : (
                <div className="ihl-mkt-banner ihl-mkt-banner--info">振込確認を受け付けました。ありがとうございました。</div>
              )}
            </>
          )}
          <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => goStage(2)}>
              振込・配送へ戻る
            </button>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
              一覧へ
            </button>
          </div>
        </MarketBody>
      </>
    ));
  }

  if (stage === 2) {
    return shell("stepper-stage2", (
      <>
        <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }, { label: "振込・配送" }]} />
        <h1 className="ihl-mkt__title">取引 — 振込・配送</h1>
        <MarketBody state="ok" key={retryKey}>
          <TradeStepper stage={2} />
          <div className="ihl-mkt-actions-row">
            <MarketPrimary onClick={() => setModal("pay")} testId="market-confirm-pay">
              振込確認しました
            </MarketPrimary>
            <MarketPrimary onClick={() => setModal("ship")} testId="market-confirm-ship">
              配達物が到着しました
            </MarketPrimary>
          </div>
          <div className="ihl-mkt-panel">
            <h2 className="ihl-mkt-panel__head">🔒 プライベート掲示板</h2>
            <PrivateBoard />
          </div>
          <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
            {!auctionTrade && (
              <button type="button" className="ihl-mkt-tabs__tab" onClick={() => goStage(1)}>
                マッチングへ
              </button>
            )}
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
              一覧へ
            </button>
          </div>
        </MarketBody>
        {modal && (
          <div className="ihl-mkt-modal-backdrop" role="dialog" aria-modal="true">
            <div className="ihl-mkt-modal">
              <p aria-hidden style={{ fontSize: "2rem" }}>
                ⚠
              </p>
              <h3>本当によろしいですか？</h3>
              <p>取り消しはできません</p>
              <div className="ihl-mkt-modal__actions">
                <button type="button" onClick={() => setModal(null)}>
                  キャンセル
                </button>
                <button
                  type="button"
                  className="ihl-mkt-modal__confirm"
                  onClick={() => {
                    setModal(null);
                    goStage(3);
                  }}
                >
                  確定する
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    ));
  }

  return shell("stepper-stage1", (
    <>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => onNavigate?.("06a") },
          { label: "取引" },
          { label: "マッチング" },
        ]}
      />
      <h1 className="ihl-mkt__title">取引 — マッチング（Stage 1）</h1>
      <p className="ihl-mkt__crumb">
        ヘラクレス ♂ 78mm · ¥12,000
        <button type="button" className="ihl-mkt-tabs__tab" style={{ marginLeft: 8 }} onClick={() => onNavigate?.("06detail")}>
          出品詳細
        </button>
      </p>
      <MarketBody state="ok" key={retryKey}>
        <TradeStepper stage={1} />
        <div className="ihl-mkt-banner ihl-mkt-banner--info">ⓘ 支払期限まで 残り 11日</div>
        <div className="ihl-mkt-panel">
          <h2 className="ihl-mkt-panel__head">🔒 プライベートボード</h2>
          <PrivateBoard />
        </div>
        <div className="ihl-mkt-actions-row" style={{ marginTop: 12 }}>
          <button type="button" className="ihl-mkt-tabs__tab" onClick={() => goStage(2)}>
            振込・配送へ
          </button>
          <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("06a")}>
            一覧へ
          </button>
        </div>
      </MarketBody>
    </>
  ));
}

export function MarketDetailBoardPrimaryActionW2({
  state = "ok",
  onAction,
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const stage = effectiveStage(screenParams);
  const guest = isGuest(screenParams);
  const matched = isMatched(screenParams);
  const auctionTrade = isAuctionTrade(screenParams);

  if (state !== "ok" || guest) return null;

  if (stage === 1 && matched && !auctionTrade) {
    return (
      <div data-component-id={`${ID}__PrimaryAction`} className={className}>
        <MarketPrimary
          onClick={() => {
            hot(onAction, 0);
            onNavigate?.("06b", { matched: "1", stage: "2" });
          }}
          testId="market-stage1-next"
        >
          振込・配送へ進む
        </MarketPrimary>
      </div>
    );
  }

  if (stage === 2) {
    return null;
  }

  if (stage === 3) {
    const evalDone = screenParams?.eval === "submitted" || screenParams?.eval === "done";
    const gmoComplete = screenParams?.gmo === "done";
    if (!evalDone || gmoComplete) return null;

    return (
      <div data-component-id={`${ID}__PrimaryAction`} className={className}>
        <MarketPrimary
          onClick={() => {
            const el = document.getElementById("gmo-inline-panel");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
            hot(onAction, 1);
          }}
          testId="market-gmo-inline-primary"
        >
          振込案内を確認
        </MarketPrimary>
      </div>
    );
  }

  return null;
}

export function MarketDetailBoardStatePanelW2({ state = "ok", className, screenParams }: W2ComponentProps) {
  const stage = effectiveStage(screenParams);
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state} data-w2-stage={stage}>
      <MarketStatePanel state={state} />
    </div>
  );
}
