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
  TradeStepper,
} from "./shared";

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

export function MarketDetailBoardContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => hot(onAction, 1) },
          { label: "出品" },
          { label: "詳細" },
        ]}
      />
      <MarketBody state={state}>
        <div className="ihl-mkt-detail">
          <div>
            <SpecimenPlaceholder />
            <h1 className="ihl-mkt__title" style={{ fontSize: "1.25rem" }}>
              ヘラクレス ♂ 78mm
            </h1>
            <p className="ihl-mkt-card__price">¥12,000</p>
            <table className="ihl-mkt-spec-table">
              <tbody>
                <tr>
                  <th>体長</th>
                  <td>78mm</td>
                </tr>
                <tr>
                  <th>角長</th>
                  <td>37mm</td>
                </tr>
                <tr>
                  <th>系統</th>
                  <td>ヘラクレス・ヘラクレス（グアドループ産 CB）</td>
                </tr>
              </tbody>
            </table>
            <p className="ihl-mkt__crumb">kabuto_master · 正規出品者（取引実績 128件）</p>
          </div>
          <div>
            <h2 className="ihl-mkt-panel__head">🔒 プライベートボード</h2>
            <TradeStepper stage={2} />
            <div className="ihl-mkt-banner ihl-mkt-banner--info">ⓘ 支払期限まで 残り 11日</div>
            <div className="ihl-mkt-panel">
              <PrivateBoard />
            </div>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 0)}>
              ステッパ › 配送（Stage 2）
            </button>
            <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
          </div>
        </div>
      </MarketBody>
    </MarketShell>
  );
}

export function MarketDetailBoardPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="market-apply-btn">
        この個体に申し込む
      </MarketPrimary>
    </div>
  );
}

export function MarketDetailBoardStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

/* ── Stage 2 ── */
const ID2 = "ihl-06-market-detail-board-stage2";

export function MarketDetailStage2ContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  const [modal, setModal] = useState<"pay" | "ship" | null>(null);

  return (
    <MarketShell componentId={`${ID2}__ContentArea`} state={state} className={className}>
      <h1 className="ihl-mkt__title">取引 Stage 2</h1>
      <MarketBody state={state}>
        <TradeStepper stage={2} />
        <div className="ihl-mkt-actions-row">
          <MarketPrimary
            onClick={() => setModal("pay")}
            testId="market-confirm-pay"
          >
            ⚠ 振込確認しました
          </MarketPrimary>
          <MarketPrimary
            onClick={() => setModal("ship")}
            testId="market-confirm-ship"
          >
            📦 配達物が到着しました
          </MarketPrimary>
        </div>
        <div className="ihl-mkt-panel">
          <h2 className="ihl-mkt-panel__head">🔒 プライベート掲示板</h2>
          <PrivateBoard />
        </div>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 2)}>
          Stage 1へ
        </button>
        <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
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
                  hot(onAction, modal === "pay" ? 0 : 1);
                }}
              >
                確定する
              </button>
            </div>
          </div>
        </div>
      )}
    </MarketShell>
  );
}

export function MarketDetailStage2PrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID2}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 1)} testId="market-stage2-next">
        配達到着確認へ
      </MarketPrimary>
    </div>
  );
}

export function MarketDetailStage2StatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID2}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

/* ── Stage 3 ── */
const ID3 = "ihl-06-market-detail-board-stage3";

export function MarketDetailStage3ContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${ID3}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "取引" }, { label: "Stage 3" }]} />
      <h1 className="ihl-mkt__title">取引 Stage 3 評価完了</h1>
      <MarketBody state={state}>
        <TradeStepper stage={4} />
        <div className="ihl-mkt-panel">
          <p className="ihl-mkt-panel__head">✓ 評価が完了しました</p>
          <p className="ihl-mkt-panel__lead">購入者からの評価を完了しました。ご協力ありがとうございました。</p>
          <p>
            あなたの評価: <span style={{ color: "var(--civ-accent)" }}>★★★★★ 非常に良い</span>
          </p>
          <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 0)}>
            評価を確定
          </button>
        </div>
        <div className="ihl-mkt-panel">
          <p className="ihl-mkt-panel__head">貢献費 8% が積み上がりました</p>
          <p style={{ fontSize: "1.5rem", color: "var(--civ-success)", margin: 0 }}>¥1,240</p>
        </div>
        <div className="ihl-mkt-panel">
          <p className="ihl-mkt-panel__head">取引情報</p>
          <table className="ihl-mkt-spec-table">
            <tbody>
              <tr>
                <th>取引ID</th>
                <td>TX1234567890</td>
              </tr>
              <tr>
                <th>商品名</th>
                <td>ヘラクレス ♂ 78mm</td>
              </tr>
              <tr>
                <th>取引完了日</th>
                <td>2026年6月16日 14:32</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 2)}>
          Stage 2へ
        </button>
        <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
      </MarketBody>
    </MarketShell>
  );
}

export function MarketDetailStage3PrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID3}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 1)} testId="market-gmo-link">
        振込案内へ
      </MarketPrimary>
    </div>
  );
}

export function MarketDetailStage3StatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID3}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
