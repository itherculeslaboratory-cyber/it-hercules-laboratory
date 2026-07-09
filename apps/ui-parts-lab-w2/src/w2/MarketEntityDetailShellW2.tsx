import { useState, type ReactNode } from "react";
import { MarketPrimary, SpecimenPlaceholder, StatusChip } from "@ihl/ui-catalog/components/features/market/shared";

/** 05b（ihl-05-obs-detail-similar）レイアウトをマーケット文脈で再利用 — 入力データのみ差し替え */
export type MarketEntityContextMode = "listing" | "lottery" | "priority";

export type MarketEntitySpec = {
  title: string;
  priceLabel?: string;
  seller?: string;
  sellerBadge?: string;
  sellerMeta?: string;
  specRows: Array<{ label: string; value: string }>;
  shootingMeta?: Array<{ label: string; value: string }>;
};

export type MarketListingBid = {
  amount: string;
  bidder: string;
  at: string;
};

export type MarketListingContext = {
  mode: "listing";
  /** 表示用 — 例: ¥12,000 */
  currentPrice: string;
  /** 固定価格時の補助ラベル（例: 即決価格）— 主情報にはしない */
  fixedPriceLabel?: string;
  bidCount?: number;
  bidHistory?: MarketListingBid[];
  /** 表示用 — 例: 7月11日（土）2時19分 終了予定 */
  endsAtLabel?: string;
  listingKind?: "auction" | "fixed";
};

export type MarketLotteryContext = {
  mode: "lottery";
  deadline: string;
  applicants: number;
  statusLabel: string;
  note?: string;
};

export type MarketPriorityContext = {
  mode: "priority";
  capacity: number;
  yourRank: number;
  yourCoins: number;
  queueRows: Array<{ rank: number; label: string; coins: number; isYou?: boolean }>;
  deadline?: string;
  applicants?: number;
  note?: string;
};

export type MarketEntityContext = MarketListingContext | MarketLotteryContext | MarketPriorityContext;

type BoardTab = "qa" | "praise";

const QA_ITEMS = [
  { q: "幼虫の時期はいつ頃ですか？", a: "2025年8月孵化 · 現在 L3 です。", answered: true },
  { q: "配送方法を教えてください", a: null, answered: false },
];

const PRAISE_ITEMS = [
  { author: "@beetle_fan", text: "美しい個体ですね！系統がはっきりしていて素晴らしい。" },
  { author: "@hercules_collector", text: "出品者さんの丁寧な観測記録に感心しました。" },
];

/** 05b 左カラム — obs-detail-photo · obs-card · obs-measure-row パターン */
export function EntitySpecColumn({ spec }: { spec: MarketEntitySpec }) {
  return (
    <div>
      <div className="obs-detail-photo" aria-label="標本写真">
        🪲
      </div>
      {spec.shootingMeta && spec.shootingMeta.length > 0 && (
        <div className="obs-card">
          <strong style={{ fontSize: "0.8125rem" }}>撮影条件</strong>
          <div className="obs-shooting-meta">
            {spec.shootingMeta.map((m) => (
              <span key={m.label}>
                {m.label}: {m.value}
              </span>
            ))}
          </div>
          <span className="obs-measure-badge">色補正なし</span>
        </div>
      )}
      <h1 className="ihl-mkt__title" style={{ fontSize: "1.25rem", margin: "12px 0 4px" }}>
        {spec.title}
      </h1>
      {spec.priceLabel && <p className="ihl-mkt-card__price">{spec.priceLabel}</p>}
      <div className="obs-card" style={{ marginTop: 16 }}>
        {spec.specRows.map((row) => (
          <div key={row.label} className="obs-measure-row">
            <span>{row.label}</span>
            <span>{row.value}</span>
            <span className="obs-measure-badge">観測</span>
          </div>
        ))}
      </div>
      {spec.seller && (
        <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
          出品者: {spec.seller}{" "}
          {spec.sellerBadge && <span className="ihl-mkt-chip ihl-mkt-chip--listed">{spec.sellerBadge}</span>}
        </p>
      )}
      {spec.sellerMeta && <p className="ihl-mkt__crumb">{spec.sellerMeta}</p>}
    </div>
  );
}

function ListingContextPanel({ ctx }: { ctx: MarketListingContext }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const bidCount = ctx.bidCount ?? ctx.bidHistory?.length ?? 0;
  const hasHistory = bidCount > 0 && (ctx.bidHistory?.length ?? 0) > 0;

  return (
    <div className="ihl-mkt-panel ihl-mkt-price-block" data-listing-kind={ctx.listingKind ?? "auction"}>
      <p className="ihl-mkt-price-block__label">現在の価格</p>
      <p className="ihl-mkt-price-block__amount">{ctx.currentPrice}</p>
      {ctx.fixedPriceLabel && (
        <p className="ihl-mkt-price-block__fixed-label">{ctx.fixedPriceLabel}</p>
      )}

      <div className="ihl-mkt-price-block__meta">
        <div className="ihl-mkt-price-block__meta-row">
          <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
            🔨
          </span>
          <span className="ihl-mkt-price-block__meta-label">入札履歴</span>
          {hasHistory ? (
            <button
              type="button"
              className="ihl-mkt-price-block__meta-link"
              aria-expanded={historyOpen}
              onClick={() => setHistoryOpen((open) => !open)}
            >
              {bidCount}件{historyOpen ? " ▴" : " ▾"}
            </button>
          ) : (
            <span className="ihl-mkt-price-block__meta-value">{bidCount}件</span>
          )}
        </div>
        {historyOpen && hasHistory && (
          <ul className="ihl-mkt-bid-history" aria-label="入札履歴一覧">
            {ctx.bidHistory!.map((bid) => (
              <li key={`${bid.at}-${bid.bidder}`} className="ihl-mkt-bid-history__row">
                <span className="ihl-mkt-bid-history__amount">{bid.amount}</span>
                <span className="ihl-mkt-bid-history__bidder">{bid.bidder}</span>
                <span className="ihl-mkt-bid-history__at">{bid.at}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ctx.endsAtLabel && (
        <div className="ihl-mkt-price-block__meta-row ihl-mkt-price-block__meta-row--end">
          <span className="ihl-mkt-price-block__meta-icon" aria-hidden>
            🕐
          </span>
          <span className="ihl-mkt-price-block__meta-label">終了予定</span>
          <span className="ihl-mkt-price-block__meta-value">{ctx.endsAtLabel}</span>
        </div>
      )}
    </div>
  );
}

function LotteryContextPanel({ ctx }: { ctx: MarketLotteryContext }) {
  return (
    <div className="ihl-mkt-panel">
      <h2 className="ihl-mkt-panel__head">抽選状況</h2>
      <p className="ihl-mkt-panel__lead">
        応募締切後、応募者 <strong>{ctx.applicants}</strong> 名から均等乱数で 1 名を割当
      </p>
      <StatusChip kind="lottery">{ctx.statusLabel}</StatusChip>
      <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
        締切: {ctx.deadline}
      </p>
      {ctx.note && <p className="ihl-mkt__crumb">{ctx.note}</p>}
    </div>
  );
}

function PriorityContextPanel({
  ctx,
  showApplyControls = false,
}: {
  ctx: MarketPriorityContext;
  /** true on 06priority-apply — PT 枚数入力 */
  showApplyControls?: boolean;
}) {
  const [pendingCoins, setPendingCoins] = useState(0);

  return (
    <div className="ihl-mkt-panel" data-mkt-context="priority">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 className="ihl-mkt-panel__head">キューの状況</h2>
        <StatusChip kind="priority">{ctx.yourRank}位</StatusChip>
      </div>
      <p className="ihl-mkt-panel__lead" style={{ color: "var(--civ-success)" }}>
        プラチナコイン優先 · 定員 {ctx.capacity}名
        {ctx.applicants != null && <> · 応募 {ctx.applicants}名</>}
      </p>
      {ctx.deadline && (
        <p className="ihl-mkt__crumb">締切: {ctx.deadline}</p>
      )}
      <p className="ihl-mkt__crumb">上位3名とあなた（累計 PT 枚数）</p>
      {ctx.queueRows.map((row) => (
        <div
          key={`${row.rank}-${row.label}`}
          className={`ihl-mkt-queue-row${row.isYou ? " ihl-mkt-queue-row--you" : ""}`}
        >
          <span>
            {row.isYou ? `あなた: ${row.rank}位` : `${row.rank}位 · ${row.label}`}
          </span>
          <span>累計 {row.coins} PT</span>
        </div>
      ))}

      {showApplyControls && (
        <div className="ihl-mkt-priority-apply" style={{ marginTop: 16 }}>
          <p className="ihl-mkt-panel__head" style={{ fontSize: "0.9375rem" }}>
            申込枚数（最低1枚ずつ）
          </p>
          <p className="ihl-mkt__crumb">
            現在の累計: <strong>{ctx.yourCoins + pendingCoins} PT</strong>
            {pendingCoins > 0 && <>（+{pendingCoins} 枚を追加予定）</>}
          </p>
          <div className="ihl-mkt-actions-row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="ihl-mkt-tabs__tab"
              aria-label="1枚追加"
              onClick={() => setPendingCoins((n) => n + 1)}
              data-testid="priority-pt-increment"
            >
              +1 PT
            </button>
            {pendingCoins > 0 && (
              <button
                type="button"
                className="ihl-mkt-tabs__tab"
                aria-label="追加を取り消し"
                onClick={() => setPendingCoins(0)}
              >
                取り消し
              </button>
            )}
          </div>
        </div>
      )}

      <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
        ⓘ 同数入札の場合、申込が早い順に優先（FR-MKT-15 · 取引方式 §8）
      </p>
      <p className="ihl-mkt__crumb">
        ⓘ 累計 PT 枚数のみ · PT 消費・購入による順位操作は不可
      </p>
      {ctx.note && <p className="ihl-mkt__crumb">{ctx.note}</p>}
    </div>
  );
}

function EntityContextPanel({
  context,
  priorityApplyControls,
}: {
  context: MarketEntityContext;
  priorityApplyControls?: boolean;
}) {
  if (context.mode === "listing") return <ListingContextPanel ctx={context} />;
  if (context.mode === "lottery") return <LotteryContextPanel ctx={context} />;
  return <PriorityContextPanel ctx={context} showApplyControls={priorityApplyControls} />;
}

function EngagementTabs({ tab, onTab }: { tab: BoardTab; onTab: (t: BoardTab) => void }) {
  return (
    <div className="ihl-mkt-tabs" role="tablist" aria-label="公開掲示板">
      <button
        type="button"
        role="tab"
        aria-selected={tab === "qa"}
        className={`ihl-mkt-tabs__tab${tab === "qa" ? " ihl-mkt-tabs__tab--active" : ""}`}
        onClick={() => onTab("qa")}
      >
        公開 Q&A
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "praise"}
        className={`ihl-mkt-tabs__tab${tab === "praise" ? " ihl-mkt-tabs__tab--active" : ""}`}
        onClick={() => onTab("praise")}
      >
        ほめボード
      </button>
    </div>
  );
}

function PublicQaBoard({ testIdPrefix }: { testIdPrefix?: string }) {
  const [question, setQuestion] = useState("");
  return (
    <div className="ihl-mkt-panel" role="tabpanel">
      <p className="ihl-mkt-panel__lead">質問は即公開されます（FR-MKT-05 · Stage 0）</p>
      <div className="ihl-mkt-board__msgs">
        {QA_ITEMS.map((item) => (
          <div key={item.q} className="ihl-mkt-msg ihl-mkt-msg--buyer">
            <strong>Q:</strong> {item.q}
            {item.answered ? (
              <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
                <strong>A:</strong> {item.a}
              </p>
            ) : (
              <p className="ihl-mkt__crumb" style={{ margin: "4px 0 0" }}>
                回答待ち
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="ihl-mkt-board__compose">
        <input
          className="ihl-form-control"
          placeholder="質問を入力（公開）…"
          aria-label="公開質問"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <MarketPrimary onClick={() => setQuestion("")} testId={testIdPrefix ? `${testIdPrefix}-qa-submit` : "listing-qa-submit"}>
          質問する
        </MarketPrimary>
      </div>
    </div>
  );
}

function PraiseBoard({ testIdPrefix }: { testIdPrefix?: string }) {
  const [praise, setPraise] = useState("");
  return (
    <div className="ihl-mkt-panel" role="tabpanel">
      <p className="ihl-mkt-panel__lead">称賛のみ · 批判・指摘は掲示板指摘導線へ（FR-MKT-05）</p>
      <div className="ihl-mkt-board__msgs">
        {PRAISE_ITEMS.map((item) => (
          <div key={item.text} className="ihl-mkt-msg ihl-mkt-msg--seller">
            <span className="ihl-mkt__crumb">{item.author}</span>
            <p style={{ margin: "4px 0 0" }}>{item.text}</p>
          </div>
        ))}
      </div>
      <div className="ihl-mkt-board__compose">
        <input
          className="ihl-form-control"
          placeholder="ほめるコメント（公開）…"
          aria-label="称賛コメント"
          value={praise}
          onChange={(e) => setPraise(e.target.value)}
        />
        <MarketPrimary
          onClick={() => setPraise("")}
          testId={testIdPrefix ? `${testIdPrefix}-praise-submit` : "listing-praise-submit"}
        >
          ほめる
        </MarketPrimary>
      </div>
    </div>
  );
}

export type MarketEntityDetailShellProps = {
  spec: MarketEntitySpec;
  context: MarketEntityContext;
  /** 06detail のみ — 公開 Q&A · ほめボード */
  showEngagement?: boolean;
  /** 06priority-apply — PT +1 入力 UI */
  priorityApplyControls?: boolean;
  actions?: ReactNode;
  testIdPrefix?: string;
};

/** 統一エンティティ詳細シェル — 05b obs-detail-layout + 文脈パネル */
export function MarketEntityDetailShell({
  spec,
  context,
  showEngagement = false,
  priorityApplyControls = false,
  actions,
  testIdPrefix,
}: MarketEntityDetailShellProps) {
  const [boardTab, setBoardTab] = useState<BoardTab>("qa");

  return (
    <>
      <div className="obs-detail-layout" data-mkt-entity-mode={context.mode}>
        <EntitySpecColumn spec={spec} />
        <aside>
          <EntityContextPanel context={context} priorityApplyControls={priorityApplyControls} />
          {showEngagement && (
            <>
              <h2 className="ihl-mkt-panel__head" style={{ marginTop: 20 }}>
                公開掲示板（マッチング前）
              </h2>
              <EngagementTabs tab={boardTab} onTab={setBoardTab} />
              {boardTab === "qa" ? (
                <PublicQaBoard testIdPrefix={testIdPrefix} />
              ) : (
                <PraiseBoard testIdPrefix={testIdPrefix} />
              )}
              <p className="ihl-mkt__crumb" style={{ marginTop: 12 }}>
                ⓘ マッチング後は当事者2人のみのプライベートボードへ移ります（§11.0 Stage 1）
              </p>
            </>
          )}
        </aside>
      </div>
      {actions && <div className="ihl-mkt-actions-row" style={{ marginTop: 16 }}>{actions}</div>}
    </>
  );
}

/** mock presets — lab 各画面で共有 */
export const MOCK_LISTING_SPEC: MarketEntitySpec = {
  title: "ヘラクレス ♂ 78mm",
  priceLabel: "¥12,000",
  seller: "@kabukuwa_lover",
  sellerBadge: "貢献 L3",
  sellerMeta: "正規出品者 · 取引実績 128件",
  specRows: [
    { label: "体長", value: "78mm" },
    { label: "角長", value: "37mm" },
    { label: "系統", value: "ヘラクレス・ヘラクレス（グアドループ産 CB）" },
  ],
  shootingMeta: [
    { label: "光源", value: "LED 5000K" },
    { label: "機種", value: "Sony A7" },
    { label: "距離", value: "40cm" },
    { label: "背景", value: "白" },
  ],
};

export const MOCK_LISTING_CONTEXT: MarketListingContext = {
  mode: "listing",
  listingKind: "auction",
  currentPrice: "¥12,000",
  bidCount: 3,
  bidHistory: [
    { amount: "¥12,000", bidder: "@beetle_fan", at: "2026-07-05 14:22" },
    { amount: "¥11,500", bidder: "@hercules_collector", at: "2026-07-04 18:40" },
    { amount: "¥11,000", bidder: "@kabukuwa_lover", at: "2026-07-03 09:15" },
  ],
  endsAtLabel: "7月11日（土）2時19分 終了予定",
};

export const MOCK_LOTTERY_SPEC: MarketEntitySpec = {
  title: "希少個体 #A-2847",
  seller: "IT Hercules Laboratory",
  sellerBadge: "公式",
  sellerMeta: "正規出品者 · 抽選販売",
  specRows: [
    { label: "販売方式", value: "抽選" },
    { label: "種", value: "ギラファノコギリクワガタ" },
    { label: "体長", value: "72mm" },
  ],
  shootingMeta: [
    { label: "光源", value: "LED 5000K" },
    { label: "機種", value: "Sony A7" },
    { label: "距離", value: "40cm" },
    { label: "背景", value: "白" },
  ],
};

export const MOCK_LOTTERY_CONTEXT: MarketLotteryContext = {
  mode: "lottery",
  deadline: "2026-06-15 23:59",
  applicants: 47,
  statusLabel: "応募受付中",
  note: "1ユーザー1応募のみ",
};

export const MOCK_PRIORITY_SPEC: MarketEntitySpec = {
  title: "ヘラクレス ♂ 95mm",
  seller: "@beetle_lab",
  sellerBadge: "貢献 L3",
  sellerMeta: "正規出品者 · 取引実績 86件",
  specRows: [
    { label: "販売方式", value: "プラチナコイン優先" },
    { label: "体長", value: "95mm" },
    { label: "系統", value: "ヘラクレス・ヘラクレス（グアドループ産 CB）" },
  ],
  shootingMeta: [
    { label: "光源", value: "LED 5000K" },
    { label: "機種", value: "Sony A7" },
    { label: "距離", value: "40cm" },
    { label: "背景", value: "白" },
  ],
};

export const MOCK_PRIORITY_CONTEXT: MarketPriorityContext = {
  mode: "priority",
  capacity: 3,
  yourRank: 4,
  yourCoins: 28,
  applicants: 12,
  deadline: "2026-07-08 23:59",
  queueRows: [
    { rank: 1, label: "user_alpha", coins: 42 },
    { rank: 2, label: "user_beta", coins: 38 },
    { rank: 3, label: "user_gamma", coins: 35 },
    { rank: 4, label: "あなた", coins: 28, isYou: true },
  ],
};
