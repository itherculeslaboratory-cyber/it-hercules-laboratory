import { useEffect, useMemo, useState } from "react";

import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";

import {

  hot,

  ListingCard,

  MarketBody,

  MarketCrumb,

  MarketFab,

  MarketPrimary,

  MarketShell,

  MarketStatePanel,

  MarketTabs,

  StatusChip,

} from "@ihl/ui-catalog/components/features/market/shared";

import { W2ShellOnly } from "./withW2Shell";
import {
  MarketEntityDetailShell,
  MOCK_LOTTERY_CONTEXT,
  MOCK_LOTTERY_SPEC,
  MOCK_PRIORITY_CONTEXT,
  MOCK_PRIORITY_SPEC,
} from "./MarketEntityDetailShellW2";
import {
  MOCK_PRIORITY_LISTINGS,
  priorityCardMeta,
  sortPriorityListings,
  type PrioritySortMode,
} from "./priority-mock";
import {
  MOCK_LOTTERY_LISTINGS,
  lotteryCardMeta,
  sortLotteryListings,
  type LotterySortMode,
} from "./lottery-mock";



const ID = "ihl-06-market-browse";



type LotteryStep = "list" | "apply" | "result" | "lose";

type PriorityStep = "list" | "queue" | "lose";

type SortMode = "preference-new" | "price-asc" | "new";



/** user gate v3 — 3 tabs only · 出品+オークション統合 · テンプレ削除 */

const TAB_ORDER = [

  { id: "auction", label: "オークション" },

  { id: "lottery", label: "抽選" },

  { id: "priority", label: "プラチナコイン優先" },

] as const;



type TabId = (typeof TAB_ORDER)[number]["id"];



/** mock: 好み学習（#10）でヘラクレス系を高評価 */

const USER_PREFERENCE_SPECIES = ["ヘラクレス", "hercules"];



type MockListing = {

  id: string;

  title: string;

  price: string;

  priceNum: number;

  kind: "listed" | "auction" | "sold";

  seller: string;

  listedAt: number;

  preferenceMatch: boolean;

  auctionRemain?: string;

};



const MOCK_LISTINGS: MockListing[] = [

  {

    id: "L4",

    title: "ギラファノコギリクワガタ ♂ 72mm",

    price: "¥ 9,800",

    priceNum: 9800,

    kind: "listed",

    seller: "@giraffe_fan · 貢献 L2",

    listedAt: 4,

    preferenceMatch: false,

  },

  {

    id: "L1",

    title: "ヘラクレス ♂ 78mm",

    price: "¥ 12,000",

    priceNum: 12000,

    kind: "listed",

    seller: "@kabukuwa_lover · 貢献 L3",

    listedAt: 2,

    preferenceMatch: true,

  },

  {

    id: "L2",

    title: "ヘラクレス ♂ 82mm",

    price: "¥ 18,500",

    priceNum: 18500,

    kind: "auction",

    seller: "@beetle_fan · 貢献 L2",

    listedAt: 1,

    preferenceMatch: true,

    auctionRemain: "残り2日",

  },

  {

    id: "L3",

    title: "幼虫 L3 ×12",

    price: "¥ 6,000",

    priceNum: 6000,

    kind: "sold",

    seller: "@larva_pro · 貢献 L1",

    listedAt: 3,

    preferenceMatch: false,

  },

];



function normalizeTab(raw?: string): TabId {

  if (raw === "lottery" || raw === "priority") return raw;

  return "auction";

}



function sortListings(items: MockListing[], sortMode: SortMode): MockListing[] {

  const copy = [...items];

  if (sortMode === "price-asc") {

    return copy.sort((a, b) => a.priceNum - b.priceNum);

  }

  if (sortMode === "new") {

    return copy.sort((a, b) => a.listedAt - b.listedAt);

  }

  return copy.sort((a, b) => {

    if (a.preferenceMatch !== b.preferenceMatch) return a.preferenceMatch ? -1 : 1;

    return a.listedAt - b.listedAt;

  });

}



function listingChip(item: MockListing) {

  if (item.kind === "auction") {

    return <StatusChip kind="auction">オークション · {item.auctionRemain ?? "入札中"}</StatusChip>;

  }

  if (item.kind === "sold") {

    return <StatusChip kind="sold">成約</StatusChip>;

  }

  return <StatusChip kind="listed">出品中</StatusChip>;

}



function BrowseSkeleton() {

  return (

    <div className="ihl-mkt-grid" aria-busy="true" aria-label="読み込み中">

      {[1, 2, 3].map((n) => (

        <div key={n} className="ihl-mkt-card" style={{ opacity: 0.45, pointerEvents: "none" }}>

          <div className="ihl-mkt-card__thumb" aria-hidden>

            🪲

          </div>

          <div className="ihl-mkt-card__body">

            <p className="ihl-mkt-card__name">—</p>

            <p className="ihl-mkt-card__price">—</p>

          </div>

        </div>

      ))}

    </div>

  );

}



function LotteryTabBody({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortMode, setSortMode] = useState<LotterySortMode>("preference-new");

  const visibleListings = useMemo(() => {
    let items = MOCK_LOTTERY_LISTINGS.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && !item.title.toLowerCase().includes(q) && !item.seller.toLowerCase().includes(q)) {
        return false;
      }
      if (speciesFilter === "hercules" && item.species !== "hercules") return false;
      return true;
    });
    items = sortLotteryListings(items, sortMode);
    return items;
  }, [searchQuery, speciesFilter, sortMode]);

  return (
    <>
      <div className="ihl-mkt-filters">
        <input
          type="search"
          className="ihl-form-control"
          placeholder="キーワードで検索"
          aria-label="検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: "1 1 200px", minWidth: 180 }}
        />
        <select
          className="ihl-form-control ihl-form-select"
          aria-label="種"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
        >
          <option value="all">すべて</option>
          <option value="hercules">ヘラクレス</option>
        </select>
        <select
          className="ihl-form-control ihl-form-select"
          aria-label="並び替え"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as LotterySortMode)}
        >
          <option value="preference-new">好み新着順</option>
          <option value="new">新着順</option>
          <option value="deadline">締切が近い順</option>
        </select>
      </div>
      <div className="ihl-mkt-banner ihl-mkt-banner--info" style={{ marginBottom: 12 }}>
        締切時点の応募者から<strong>均等乱数</strong>で 1 名を割当 · 1ユーザー1応募のみ
      </div>
      {sortMode === "preference-new" && (
        <div className="ihl-mkt-banner ihl-mkt-banner--info" style={{ marginBottom: 12 }}>
          並び: <strong>好み新着順</strong> — 好み学習を反映したうえで新着順
        </div>
      )}
      {visibleListings.length === 0 ? (
        <p className="ihl-mkt__crumb" role="status">
          検索条件に一致する抽選がありません。
        </p>
      ) : (
        <div className="ihl-mkt-grid">
          {visibleListings.map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              price={lotteryCardMeta(item)}
              chip={
                <>
                  {item.preferenceMatch && sortMode === "preference-new" && (
                    <StatusChip kind="listed">好み</StatusChip>
                  )}
                  <StatusChip kind="lottery">{item.statusLabel}</StatusChip>
                </>
              }
              seller={item.seller}
              onClick={() => onNavigate?.("06detail", { mode: "lottery" })}
            />
          ))}
        </div>
      )}
    </>
  );
}

function LotteryInline({

  step,

  onStep,

  onNavigate,

}: {

  step: LotteryStep;

  onStep: (s: LotteryStep) => void;

  onNavigate?: W2ComponentProps["onNavigate"];

}) {

  if (step === "apply") {

    return (

      <MarketEntityDetailShell

        spec={MOCK_LOTTERY_SPEC}

        context={MOCK_LOTTERY_CONTEXT}

        testIdPrefix="lottery"

        actions={

          <>

            <MarketPrimary

              onClick={() => {

                onStep("result");

                onNavigate?.("06a", { tab: "lottery", lotteryStep: "result" });

              }}

              testId="lottery-apply-inline"

            >

              応募する

            </MarketPrimary>

            <button
              type="button"
              className="ihl-mkt-tabs__tab"
              onClick={() => {
                onStep("list");
                onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" });
              }}
            >
              一覧へ戻る
            </button>

          </>

        }

      />

    );

  }



  if (step === "result") {

    return (

      <>

        <div className="ihl-mkt-result ihl-mkt-result--win">

          <p className="ihl-mkt-result__icon" aria-hidden>

            ✓

          </p>

          <h1 className="ihl-mkt-result__title">抽選結果: 当選</h1>

          <p className="ihl-mkt-panel__lead">おめでとうございます。Stage 1 プライベートボードへ進みます。</p>

          <div className="ihl-mkt-panel" style={{ textAlign: "left", marginTop: 16 }}>

            <p>

              <strong>希少個体 #A-2847</strong>

            </p>

            <p className="ihl-mkt__crumb">当選日: 2026-06-16 · 次: マッチング（当事者2人のみ）</p>

          </div>

        </div>

        <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>

          <MarketPrimary onClick={() => onNavigate?.("06b", { matched: "1" })} testId="lottery-win-board-inline">

            プライベートボードを開く

          </MarketPrimary>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("lose");
              onNavigate?.("06a", { tab: "lottery", lotteryStep: "lose" });
            }}
          >
            落選例を見る
          </button>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("list");
              onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" });
            }}
          >
            抽選一覧へ
          </button>

        </div>

      </>

    );

  }



  if (step === "lose") {

    return (

      <>

        <div className="ihl-mkt-result ihl-mkt-result--lose">

          <h1 className="ihl-mkt-result__title">抽選結果: 落選</h1>

          <StatusChip kind="sold">落選</StatusChip>

          <p className="ihl-mkt-panel__lead">今回は当選者に選ばれませんでした。</p>

        </div>

        <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("list");
              onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" });
            }}
          >
            抽選一覧へ
          </button>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("result");
              onNavigate?.("06a", { tab: "lottery", lotteryStep: "result" });
            }}
          >
            当選例を見る
          </button>

        </div>

      </>

    );

  }



  return <LotteryTabBody onNavigate={onNavigate} />;
}



function PriorityTabBody({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sortMode, setSortMode] = useState<PrioritySortMode>("preference-new");

  const visibleListings = useMemo(() => {
    let items = MOCK_PRIORITY_LISTINGS.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && !item.title.toLowerCase().includes(q) && !item.seller.toLowerCase().includes(q)) {
        return false;
      }
      if (speciesFilter === "hercules" && item.species !== "hercules") return false;
      return true;
    });
    items = sortPriorityListings(items, sortMode);
    return items;
  }, [searchQuery, speciesFilter, sortMode]);

  return (
    <>
      <div className="ihl-mkt-filters">
        <input
          type="search"
          className="ihl-form-control"
          placeholder="キーワードで検索"
          aria-label="検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: "1 1 200px", minWidth: 180 }}
        />
        <select
          className="ihl-form-control ihl-form-select"
          aria-label="種"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
        >
          <option value="all">すべて</option>
          <option value="hercules">ヘラクレス</option>
        </select>
        <select
          className="ihl-form-control ihl-form-select"
          aria-label="並び替え"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as PrioritySortMode)}
        >
          <option value="preference-new">好み新着順</option>
          <option value="new">新着順</option>
          <option value="deadline">締切が近い順</option>
        </select>
      </div>
      <div className="ihl-mkt-banner ihl-mkt-banner--info" style={{ marginBottom: 12 }}>
        定員超過時は<strong>累計 PT 枚数</strong>の多い順に割当 · PT 消費不可
      </div>
      {sortMode === "preference-new" && (
        <div className="ihl-mkt-banner ihl-mkt-banner--info" style={{ marginBottom: 12 }}>
          並び: <strong>好み新着順</strong> — 好み学習を反映したうえで新着順
        </div>
      )}
      {visibleListings.length === 0 ? (
        <p className="ihl-mkt__crumb" role="status">
          検索条件に一致する出品がありません。
        </p>
      ) : (
        <div className="ihl-mkt-grid">
          {visibleListings.map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              price={priorityCardMeta(item)}
              chip={
                <>
                  {item.preferenceMatch && sortMode === "preference-new" && (
                    <StatusChip kind="listed">好み</StatusChip>
                  )}
                  <StatusChip kind="priority">プラチナコイン優先</StatusChip>
                </>
              }
              seller={item.seller}
              onClick={() => onNavigate?.("06detail", { mode: "priority" })}
            />
          ))}
        </div>
      )}
    </>
  );
}

function PriorityInline({

  step,

  onStep,

  onNavigate,

}: {

  step: PriorityStep;

  onStep: (s: PriorityStep) => void;

  onNavigate?: W2ComponentProps["onNavigate"];

}) {

  if (step === "queue") {

    return (

      <MarketEntityDetailShell

        spec={MOCK_PRIORITY_SPEC}

        context={MOCK_PRIORITY_CONTEXT}

        testIdPrefix="priority"

        actions={

          <>

            <MarketPrimary onClick={() => onNavigate?.("06priority-apply", { mode: "priority" })} testId="priority-apply-inline">

              申し込む

            </MarketPrimary>

            <button
              type="button"
              className="ihl-mkt-tabs__tab"
              onClick={() => {
                onStep("list");
                onNavigate?.("06a", { tab: "priority", priorityStep: "list" });
              }}
            >
              一覧へ
            </button>

          </>

        }

      />

    );

  }



  if (step === "lose") {

    return (

      <>

        <div className="ihl-mkt-result ihl-mkt-result--lose">

          <h1 className="ihl-mkt-result__title">プラチナコイン優先 結果</h1>

          <StatusChip kind="sold">落選確定</StatusChip>

          <p className="ihl-mkt-panel__lead">優先順位が足りませんでした。</p>

          <p style={{ fontSize: "1.25rem", margin: "16px 0" }}>

            <span style={{ color: "#e88" }}>15位</span> / 定員3名

          </p>

        </div>

        <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("list");
              onNavigate?.("06a", { tab: "priority", priorityStep: "list" });
            }}
          >
            一覧へ
          </button>

          <button
            type="button"
            className="ihl-mkt-tabs__tab"
            onClick={() => {
              onStep("queue");
              onNavigate?.("06a", { tab: "priority", priorityStep: "queue" });
            }}
          >
            申込画面へ
          </button>

        </div>

      </>

    );

  }



  return <PriorityTabBody onNavigate={onNavigate} />;
}



function AuctionTabBody({ onNavigate }: { onNavigate?: W2ComponentProps["onNavigate"] }) {

  const [searchQuery, setSearchQuery] = useState("");

  const [speciesFilter, setSpeciesFilter] = useState("all");

  const [priceFilter, setPriceFilter] = useState("all");

  const [sortMode, setSortMode] = useState<SortMode>("preference-new");



  const visibleListings = useMemo(() => {

    let items = MOCK_LISTINGS.filter((item) => {

      const q = searchQuery.trim().toLowerCase();

      if (q && !item.title.toLowerCase().includes(q) && !item.seller.toLowerCase().includes(q)) {

        return false;

      }

      if (speciesFilter === "hercules" && !USER_PREFERENCE_SPECIES.some((s) => item.title.includes(s))) {

        return false;

      }

      if (priceFilter === "under5k" && item.priceNum >= 5000) return false;

      if (priceFilter === "5k-20k" && (item.priceNum < 5000 || item.priceNum > 20000)) return false;

      if (priceFilter === "over20k" && item.priceNum <= 20000) return false;

      return true;

    });

    items = sortListings(items, sortMode);

    return items;

  }, [searchQuery, speciesFilter, priceFilter, sortMode]);



  return (

    <>

      <div className="ihl-mkt-filters">

        <input

          type="search"

          className="ihl-form-control"

          placeholder="キーワードで検索"

          aria-label="検索"

          value={searchQuery}

          onChange={(e) => setSearchQuery(e.target.value)}

          style={{ flex: "1 1 200px", minWidth: 180 }}

        />

        <select

          className="ihl-form-control ihl-form-select"

          aria-label="種"

          value={speciesFilter}

          onChange={(e) => setSpeciesFilter(e.target.value)}

        >

          <option value="all">すべて</option>

          <option value="hercules">ヘラクレス</option>

        </select>

        <select

          className="ihl-form-control ihl-form-select"

          aria-label="価格帯"

          value={priceFilter}

          onChange={(e) => setPriceFilter(e.target.value)}

        >

          <option value="all">すべて</option>

          <option value="under5k">¥5,000未満</option>

          <option value="5k-20k">¥5,000–20,000</option>

          <option value="over20k">¥20,000以上</option>

        </select>

        <select

          className="ihl-form-control ihl-form-select"

          aria-label="並び替え"

          value={sortMode}

          onChange={(e) => setSortMode(e.target.value as SortMode)}

        >

          <option value="preference-new">好み新着順</option>

          <option value="new">新着順</option>

          <option value="price-asc">価格が安い順</option>

        </select>

      </div>

      {sortMode === "preference-new" && (

        <div className="ihl-mkt-banner ihl-mkt-banner--info" style={{ marginBottom: 12 }}>

          並び: <strong>好み新着順</strong> — 好み学習を反映したうえで新着順

        </div>

      )}

      {visibleListings.length === 0 ? (

        <p className="ihl-mkt__crumb" role="status">

          検索条件に一致する出品がありません。

        </p>

      ) : (

        <div className="ihl-mkt-grid">

          {visibleListings.map((item) => (

            <ListingCard

              key={item.id}

              title={item.title}

              price={item.price}

              chip={

                <>

                  {item.preferenceMatch && sortMode === "preference-new" && (

                    <StatusChip kind="listed">好み</StatusChip>

                  )}

                  {listingChip(item)}

                </>

              }

              seller={item.seller}

              onClick={item.kind === "sold" ? undefined : () => onNavigate?.("06detail")}

            />

          ))}

        </div>

      )}

    </>

  );

}



/** BLK-W2-001 — 06a 上で抽選・優先順タブ統合（Charter Q2:A · 3-click 導線） */

export function MarketBrowseContentAreaW2({

  state = "ok",

  onAction,

  onNavigate,

  screenParams,

  className,

}: W2ComponentProps) {

  const tab = normalizeTab(screenParams?.tab);

  const lotteryStepParam = screenParams?.lotteryStep as LotteryStep | undefined;

  const priorityStepParam = screenParams?.priorityStep as PriorityStep | undefined;

  const [lotteryStep, setLotteryStep] = useState<LotteryStep>("list");

  const [priorityStep, setPriorityStep] = useState<PriorityStep>("list");

  const [retryKey, setRetryKey] = useState(0);



  useEffect(() => {

    if (tab !== "lottery") return;

    if (lotteryStepParam && ["list", "apply", "result", "lose"].includes(lotteryStepParam)) {

      setLotteryStep(lotteryStepParam);

    }

  }, [tab, lotteryStepParam]);



  useEffect(() => {

    if (tab !== "priority") return;

    if (priorityStepParam && ["list", "queue", "lose"].includes(priorityStepParam)) {

      setPriorityStep(priorityStepParam);

    }

  }, [tab, priorityStepParam]);



  const setTab = (next: TabId) => {
    onNavigate?.("06a", { tab: next });
  };



  const handleLotteryTab = () => {

    setLotteryStep("list");

    onNavigate?.("06a", { tab: "lottery", lotteryStep: "list" });

  };



  const handlePriorityTab = () => {

    setPriorityStep("list");

    onNavigate?.("06a", { tab: "priority", priorityStep: "list" });

  };



  const tabLabel = TAB_ORDER.find((t) => t.id === tab)?.label ?? "オークション";



  const renderTabBody = () => {

    if (tab === "lottery") {

      return <LotteryInline step={lotteryStep} onStep={setLotteryStep} onNavigate={onNavigate} />;

    }

    if (tab === "priority") {

      return <PriorityInline step={priorityStep} onStep={setPriorityStep} onNavigate={onNavigate} />;

    }

    return <AuctionTabBody onNavigate={onNavigate} />;

  };



  return (

    <W2ShellOnly feature="market">

      <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className} data-w2-variant="tab-integrated">

        <MarketCrumb parts={[{ label: "マーケット" }, { label: tabLabel }]} />

        <MarketTabs

          tabs={TAB_ORDER.map((t) => ({

            id: t.id,

            label: t.label,

            active: tab === t.id,

            onClick:

              t.id === "lottery"

                ? handleLotteryTab

                : t.id === "priority"

                  ? handlePriorityTab

                  : () => setTab(t.id),

          }))}

        />

        {state === "loading" ? (

          <MarketBody state="loading">

            <BrowseSkeleton />

          </MarketBody>

        ) : state === "empty" ? (

          <>

            <MarketBody state="empty" emptyText="出品がありません。新規出品から始めましょう。" />

            <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>

              <MarketPrimary

                onClick={() => {

                  hot(onAction, 0);

                  onNavigate?.("06list");

                }}

                testId="market-empty-list"

              >

                出品する

              </MarketPrimary>

            </div>

          </>

        ) : state === "error" ? (

          <>

            <MarketBody state="error" errorText="マーケット情報を取得できませんでした。" />

            <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>

              <button type="button" className="ihl-mkt-tabs__tab" onClick={() => setRetryKey((k) => k + 1)}>

                再試行

              </button>

            </div>

          </>

        ) : (

          <MarketBody state="ok" key={retryKey}>

            {renderTabBody()}

          </MarketBody>

        )}

      </MarketShell>

    </W2ShellOnly>

  );

}



export function MarketBrowsePrimaryActionW2({ state = "ok", onAction, onNavigate, className }: W2ComponentProps) {

  if (state !== "ok") return null;

  return (

    <div data-component-id={`${ID}__PrimaryAction`} className={className}>

      <MarketFab

        onClick={() => {

          hot(onAction, 0);

          onNavigate?.("06list");

        }}

        testId="market-list-fab"

      >

        出品する

      </MarketFab>

    </div>

  );

}



export function MarketBrowseStatePanelW2({ state = "ok", className }: W2ComponentProps) {

  return (

    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state}>

      <MarketStatePanel state={state} />

    </div>

  );

}

