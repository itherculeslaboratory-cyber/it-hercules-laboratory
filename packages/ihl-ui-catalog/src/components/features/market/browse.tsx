import type { W2ComponentProps } from "../../../types/w2";
import {
  hot,
  ListingCard,
  MarketBody,
  MarketCrumb,
  MarketDeepNav,
  MarketFab,
  MarketHubShortcuts,
  MarketPrimary,
  MarketShell,
  MarketStatePanel,
  MarketTabs,
  StatusChip,
} from "./shared";

const ID = "ihl-06-market-browse";

export function MarketBrowseContentArea({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "出品" }]} />
      <MarketHubShortcuts
        onAction={onAction}
        shortcuts={[
          { label: "出品詳細", hotspot: 1 },
          { label: "新規出品", hotspot: 0 },
        ]}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 5)} aria-label="通知">
          🔔 通知
        </button>
      </div>
      <MarketTabs
        tabs={[
          { id: "list", label: "出品", active: true },
          { id: "auction", label: "オークション", onClick: () => hot(onAction, 4) },
          { id: "lottery", label: "抽選", onClick: () => hot(onAction, 2) },
          { id: "priority", label: "優先順", onClick: () => hot(onAction, 3) },
          { id: "template", label: "テンプレ" },
        ]}
      />
      <MarketBody state={state}>
        <div className="ihl-mkt-filters">
          <select className="ihl-form-control ihl-form-select" aria-label="種">
            <option>すべて</option>
            <option>ヘラクレス</option>
          </select>
          <select className="ihl-form-control ihl-form-select" aria-label="価格帯">
            <option>指定なし</option>
          </select>
          <select className="ihl-form-control ihl-form-select" aria-label="並び替え">
            <option>新着</option>
          </select>
        </div>
        <div className="ihl-mkt-grid">
          <ListingCard
            title="ヘラクレス ♂ 78mm"
            price="¥ 12,000"
            chip={<StatusChip kind="listed">出品中</StatusChip>}
            seller="@kabukuwa_lover"
            onClick={() => hot(onAction, 1)}
          />
          <ListingCard
            title="ヘラクレス ♂ 82mm"
            price="¥ 18,500"
            chip={<StatusChip kind="auction">オークション · 残り2日</StatusChip>}
            seller="@beetle_fan"
            onClick={() => hot(onAction, 4)}
          />
          <ListingCard
            title="幼虫 L3 ×12"
            price="¥ 6,000"
            chip={<StatusChip kind="sold">成約</StatusChip>}
            seller="@larva_pro"
          />
        </div>
      </MarketBody>
      <div className="ihl-mkt-shortcuts" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }} aria-label="深い導線ショートカット">
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => hot(onAction, 0)}>
          出品する
        </button>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("23")}>
          GMO振込
        </button>
        <button type="button" className="ihl-mkt-tabs__tab" onClick={() => onNavigate?.("01")}>
          ホーム
        </button>
      </div>
    </MarketShell>
  );
}

export function MarketBrowsePrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketFab onClick={() => hot(onAction, 0)} testId="market-list-fab">
        出品する
      </MarketFab>
    </div>
  );
}

export function MarketBrowseStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
