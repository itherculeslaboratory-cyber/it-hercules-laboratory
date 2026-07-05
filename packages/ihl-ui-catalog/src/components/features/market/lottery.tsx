import type { W2ComponentProps } from "../../../types/w2";
import {
  hot,
  ListingCard,
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

const TAB = "ihl-06-market-lottery-tab";
const APPLY = "ihl-06-market-lottery-apply";
const RESULT = "ihl-06-market-lottery-result";
const LOSE = "ihl-06-market-lottery-result-lose";

export function MarketLotteryTabContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${TAB}__ContentArea`} state={state} className={className}>
      <MarketTabs
        tabs={[
          { id: "list", label: "出品", onClick: () => hot(onAction, 1) },
          { id: "auction", label: "オークション" },
          { id: "lottery", label: "抽選", active: true },
          { id: "priority", label: "優先順" },
          { id: "template", label: "テンプレ" },
        ]}
      />
      <div className="ihl-mkt-banner ihl-mkt-banner--info">
        締切時点の応募者から均等乱数で 1 名を割当
      </div>
      <MarketBody state={state}>
        <div className="ihl-mkt-filters">
          <select className="ihl-form-control ihl-form-select" aria-label="種名">
            <option>すべての種</option>
          </select>
          <input className="ihl-form-control" placeholder="¥ 最低価格" aria-label="最低価格" />
          <input className="ihl-form-control" placeholder="¥ 最高価格" aria-label="最高価格" />
          <select className="ihl-form-control ihl-form-select" aria-label="並び替え">
            <option>新着順</option>
          </select>
        </div>
        <div className="ihl-mkt-grid">
          <ListingCard
            title="ギラファノコギリクワガタ"
            price="抽選"
            chip={<StatusChip kind="lottery">応募受付中</StatusChip>}
            seller="IT Hercules Laboratory"
            onClick={() => hot(onAction, 0)}
          />
          <ListingCard
            title="ヘラクレス ♂ 95mm"
            price="抽選"
            chip={<StatusChip kind="lottery">応募受付中</StatusChip>}
            seller="@beetle_lab"
            onClick={() => hot(onAction, 0)}
          />
        </div>
      </MarketBody>
    </MarketShell>
  );
}

export function MarketLotteryTabPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${TAB}__PrimaryAction`} className={className}>
      <MarketFab onClick={() => hot(onAction, 0)}>出品する</MarketFab>
    </div>
  );
}

export function MarketLotteryTabStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${TAB}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

export function MarketLotteryApplyContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${APPLY}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "出品詳細" }]} />
      <MarketBody state={state}>
        <div className="ihl-mkt-detail">
          <div>
            <SpecimenPlaceholder />
            <h1 className="ihl-mkt__title" style={{ fontSize: "1.125rem" }}>
              希少個体 #A-2847
            </h1>
            <p className="ihl-mkt__crumb">販売方式: 抽選方式 · 応募締切 2026-06-15 23:59</p>
          </div>
          <div className="ihl-mkt-panel">
            <h2 className="ihl-mkt-panel__head">🎲 抽選情報</h2>
            <p className="ihl-mkt-panel__lead">
              応募締切後に、応募者の中から<span style={{ color: "var(--civ-accent)" }}>均等乱数</span>で
              1名の当選者を決定します。
            </p>
            <p>
              応募者: <strong style={{ color: "var(--civ-accent)" }}>47</strong> 名
            </p>
            <StatusChip kind="lottery">● 応募受付中</StatusChip>
            <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
              ⓘ 1ユーザー1応募のみ
            </p>
          </div>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketLotteryApplyPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${APPLY}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="lottery-apply-btn">
        応募する
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        一覧へ
      </button>
    </div>
  );
}

export function MarketLotteryApplyStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${APPLY}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

export function MarketLotteryResultContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${RESULT}__ContentArea`} state={state} className={className}>
      <MarketBody state={state}>
        <div className="ihl-mkt-result ihl-mkt-result--win">
          <p className="ihl-mkt-result__icon" aria-hidden>
            ✓
          </p>
          <h1 className="ihl-mkt-result__title">抽選結果: 当選</h1>
          <p className="ihl-mkt-panel__lead">おめでとうございます。Stage 1 プライベートボードへ進みます。</p>
          <div className="ihl-mkt-panel" style={{ textAlign: "left", marginTop: 20 }}>
            <p>
              <strong>希少個体 #A-2847</strong>
            </p>
            <p className="ihl-mkt__crumb">当選日: 2026-06-16 · 次: マッチング（当事者2人のみ）</p>
          </div>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketLotteryResultPrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${RESULT}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="lottery-win-board">
        プライベートボードを開く
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        落選例を見る
      </button>
    </div>
  );
}

export function MarketLotteryResultStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${RESULT}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}

export function MarketLotteryLoseContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${LOSE}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "抽選結果" }]} />
      <MarketBody state={state}>
        <div className="ihl-mkt-result ihl-mkt-result--lose">
          <p className="ihl-mkt-result__icon" aria-hidden>
            ☹
          </p>
          <h1 className="ihl-mkt-result__title">落選しました</h1>
          <p className="ihl-mkt-panel__lead">今回は当選しませんでした。</p>
          <p className="ihl-mkt__crumb">次回の抽選日: 2026年6月15日 (日) 12:00</p>
        </div>
      </MarketBody>
      <MarketDeepNav onAction={onAction} onNavigate={onNavigate} links={[{ label: "ホーム", screenId: "01" }]} />
    </MarketShell>
  );
}

export function MarketLotteryLosePrimaryAction({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${LOSE}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="lottery-lose-back">
        他の出品を見る
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        当選例を見る
      </button>
    </div>
  );
}

export function MarketLotteryLoseStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${LOSE}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
