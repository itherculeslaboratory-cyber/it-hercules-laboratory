import type { W2ComponentProps } from "../../../types/w2";
import {
  hot,
  MarketBody,
  MarketCrumb,
  MarketDeepNav,
  MarketFab,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  MarketTabs,
  SpecimenPlaceholder,
  StatusChip,
} from "./shared";

const TAB = "ihl-06-market-priority-tab";
const QUEUE = "ihl-06-market-priority-queue";
const LOSE = "ihl-06-market-priority-queue-lose";

export function MarketPriorityTabContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${TAB}__ContentArea`} state={state} className={className}>
      <MarketTabs
        tabs={[
          { id: "list", label: "出品", onClick: () => hot(onAction, 1) },
          { id: "auction", label: "オークション" },
          { id: "lottery", label: "抽選" },
          { id: "priority", label: "優先順", active: true },
          { id: "template", label: "テンプレ" },
        ]}
      />
      <div className="ihl-mkt-banner ihl-mkt-banner--info">
        定員超過時は累計プラチナコイン枚数の多い順に割当（PT消費不可）
      </div>
      <MarketBody state={state}>
        <div className="ihl-mkt-grid" style={{ gridTemplateColumns: "1fr" }}>
          {[
            { id: "HCL-25-0708-01", cap: "3", apps: "12" },
            { id: "HCL-25-0708-02", cap: "5", apps: "8" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className="ihl-mkt-panel"
              style={{ textAlign: "left", cursor: "pointer" }}
              onClick={() => hot(onAction, 0)}
            >
              <div style={{ display: "flex", gap: 16 }}>
                <div className="ihl-mkt-card__thumb" style={{ width: 120, aspectRatio: "4/3" }}>
                  🪲
                </div>
                <div style={{ flex: 1 }}>
                  <StatusChip kind="priority">優先順</StatusChip>
                  <h3 className="ihl-mkt-card__name">{item.id}</h3>
                  <p className="ihl-mkt__crumb">
                    定員 {item.cap}名 · 応募 {item.apps}名 · 残り 2日 14時間
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </MarketBody>
    </MarketShell>
  );
}

export function MarketPriorityTabPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${TAB}__PrimaryAction`} className={className}>
      <MarketFab onClick={() => hot(onAction, 0)}>出品する</MarketFab>
    </div>
  );
}

export function MarketPriorityTabStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${TAB}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

export function MarketPriorityQueueContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  const leaders = [
    { rank: 1, user: "user_alpha", coins: 42 },
    { rank: 2, user: "user_beta", coins: 38 },
    { rank: 3, user: "user_gamma", coins: 35 },
  ];

  return (
    <MarketShell componentId={`${QUEUE}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケットプレイス" }, { label: "出品詳細" }]} />
      <MarketBody state={state}>
        <div className="ihl-mkt-detail">
          <div>
            <SpecimenPlaceholder />
            <h1 className="ihl-mkt__title" style={{ fontSize: "1.125rem" }}>
              人気個体 #B-1092
            </h1>
            <div className="ihl-mkt-panel">
              <p className="ihl-mkt-panel__head" style={{ color: "var(--civ-success)" }}>
                優先順方式
              </p>
              <p className="ihl-mkt-panel__lead">Coin累計に基づき、上位の方から優先的にご案内します。</p>
              <p>
                定員 <strong style={{ color: "var(--civ-success)" }}>3名</strong>
              </p>
            </div>
          </div>
          <div className="ihl-mkt-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="ihl-mkt-panel__head">キューの状況</h2>
              <StatusChip kind="auction">順位帯: 4位</StatusChip>
            </div>
            <p className="ihl-mkt__crumb">現在の順位（上位3名とあなたの順位）</p>
            {leaders.map((r) => (
              <div key={r.rank} className="ihl-mkt-queue-row">
                <span>
                  {r.rank}. {r.user}
                </span>
                <span>累計Coin {r.coins}枚</span>
              </div>
            ))}
            <div className="ihl-mkt-queue-row ihl-mkt-queue-row--you">
              <span>あなた: 4位</span>
              <span>累計Coin 28枚</span>
            </div>
            <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
              ⓘ Coin累計のみ · Pay To Win禁止
            </p>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 2)}>
              一覧へ
            </button>
          </div>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketPriorityQueuePrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${QUEUE}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="priority-apply-btn">
        申し込む
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        落選確定例
      </button>
    </div>
  );
}

export function MarketPriorityQueueStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${QUEUE}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

export function MarketPriorityLoseContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${LOSE}__ContentArea`} state={state} className={className}>
      <MarketCrumb
        parts={[
          { label: "マーケット", action: () => hot(onAction, 0) },
          { label: "優先順申込" },
        ]}
      />
      <MarketBody state={state}>
        <div className="ihl-mkt-result ihl-mkt-result--lose">
          <h1 className="ihl-mkt-result__title">優先順 結果</h1>
          <StatusChip kind="sold">✕ 落選確定</StatusChip>
          <p className="ihl-mkt-panel__lead">優先順位が足りませんでした。</p>
          <p style={{ fontSize: "1.5rem", margin: "20px 0" }}>
            <span style={{ color: "#e88" }}>15位</span> / 定員3名
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 0)}>
              一覧へ戻る
            </button>
            <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 1)}>
              申込画面へ
            </button>
          </div>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketPriorityLosePrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${LOSE}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="priority-lose-back">
        一覧へ戻る
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        申込画面へ
      </button>
    </div>
  );
}

export function MarketPriorityLoseStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${LOSE}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
