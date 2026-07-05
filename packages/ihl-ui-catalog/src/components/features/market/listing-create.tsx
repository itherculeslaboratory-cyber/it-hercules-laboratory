import type { W2ComponentProps } from "../../../types/w2";
import { hot, MarketBody, MarketCrumb, MarketDeepNav, MarketPrimary, MarketShell, MarketStatePanel } from "./shared";

const ID = "ihl-06-market-listing-create";

export function MarketListingCreateContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => hot(onAction, 3) },
          { label: "出品作成" },
        ]}
      />
      <h1 className="ihl-mkt__title">新規出品</h1>
      <MarketBody state={state}>
        <div className="ihl-mkt-panel">
          <h2 className="ihl-mkt-panel__head">
            <span className="ihl-mkt-chip ihl-mkt-chip--listed">1</span>
            観測中の個体を選択
          </h2>
          <p className="ihl-mkt-panel__lead">出品する個体を選択してください</p>
          <ul className="ihl-mkt-checklist">
            {["幼虫 A-001", "幼虫 A-002", "幼虫 A-003", "幼虫 A-004", "幼虫 A-005"].map((id) => (
              <li key={id}>
                <input type="checkbox" id={`larva-${id}`} onChange={() => hot(onAction, 0)} />
                <label htmlFor={`larva-${id}`}>{id}</label>
              </li>
            ))}
          </ul>
        </div>
        <div className="ihl-mkt-panel">
          <h2 className="ihl-mkt-panel__head">
            <span className="ihl-mkt-chip ihl-mkt-chip--listed">2</span>
            その場で写真を追加
          </h2>
          <p className="ihl-mkt-panel__lead">出品する個体の写真を追加してください</p>
          <button type="button" className="ihl-mkt-upload" onClick={() => hot(onAction, 1)}>
            写真を追加
            <br />
            <span style={{ fontSize: "0.8125rem" }}>カメラを使ってその場で撮影できます</span>
          </button>
        </div>
        <p className="ihl-mkt__crumb">ⓘ 複数匹まとめて出品可能</p>
        <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
      </MarketBody>
    </MarketShell>
  );
}

export function MarketListingCreatePrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 2)} testId="market-create-submit">
        出品する
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 3)}>
        一覧へ
      </button>
    </div>
  );
}

export function MarketListingCreateStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
