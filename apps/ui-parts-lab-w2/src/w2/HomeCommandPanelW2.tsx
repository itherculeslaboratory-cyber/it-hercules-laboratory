import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PanelStateMessage, StandardShell, type NavItem } from "@ihl/ui-catalog/components/shared/StandardShell";
import "@ihl/ui-catalog/components/shared/standard-shell.css";
import { W2_FOOTER_BAR, W2_HEADER_ACTIONS } from "./w2-global-chrome";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

/** ナビ・ホーム §3 #1 — 左ナビ常時 · 好み学習/検索は折りたたみ禁止 · 貢献度はマイページ(P)のみ · マイページはヘッダ1箇所のみ */
const PRIMARY_NAV: NavItem[] = [
  { id: "obs", label: "観測", icon: "◎", target: "05ctx" },
  { id: "search", label: "検索", icon: "🔍", target: "05a" },
  { id: "market", label: "マーケット", icon: "↗", target: "06a" },
  { id: "board", label: "掲示板", icon: "💬", target: "07a" },
  { id: "pref", label: "好み学習", icon: "◈", target: "10" },
  { id: "settings", label: "設定", icon: "⚙", target: "12hub" },
];

/** ナビ・ホーム §3 #3b · ADR-H-14 — フッター固定（screens.json walkId 01 hotspots） */
const FOOTER_BAR = W2_FOOTER_BAR;

const HEADER_ACTIONS = W2_HEADER_ACTIONS;

/** ナビ・ホーム §3 #4 例文が支持する3枚のみ（§3 #2 草案4枚目「貢献度」はユーザー gate 除外 · 差替禁止） */
const SUMMARY_CARDS = [
  { label: "観測セッション", key: "sessions" as const },
  { label: "進行中の取引", key: "trades" as const },
  { label: "未読の指摘", key: "unread" as const },
];

type SummaryValues = Record<(typeof SUMMARY_CARDS)[number]["key"], number | null>;

const MOCK_SUMMARY: SummaryValues = {
  sessions: 38,
  trades: 2,
  unread: 0,
};

const EMPTY_SUMMARY: SummaryValues = {
  sessions: 0,
  trades: 0,
  unread: 0,
};

function SummaryGrid({ values, skeleton }: { values: SummaryValues; skeleton?: boolean }) {
  return (
    <div className="ihl-stat-grid" aria-busy={skeleton || undefined}>
      {SUMMARY_CARDS.map((card) => (
        <div
          key={card.key}
          className="ihl-stat-card"
          style={skeleton ? { opacity: 0.45 } : undefined}
        >
          <div className="ihl-stat-card__label">{card.label}</div>
          <div className="ihl-stat-card__value">{skeleton ? "—" : values[card.key]}</div>
        </div>
      ))}
    </div>
  );
}

function PrimaryActions({
  onNavigate,
  onAction,
  emphasize,
}: {
  onNavigate?: (target: string) => void;
  onAction?: W2ComponentProps["onAction"];
  emphasize?: boolean;
}) {
  const startObs = () => {
    hot(onAction, 1);
    onNavigate?.("05ctx");
  };
  const goSearch = () => {
    hot(onAction, 2);
    onNavigate?.("05a");
  };

  return (
    <div
      className="ihl-btn-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: emphasize ? 12 : undefined,
      }}
    >
      <button type="button" className="ihl-btn-primary" style={{ justifyContent: "center" }} onClick={startObs}>
        ◎ 観測登録を始める
      </button>
      <button type="button" className="ihl-btn-primary" style={{ justifyContent: "center" }} onClick={goSearch}>
        🔍 検索
      </button>
    </div>
  );
}

/** 3101 専用 — ホーム密度削減（BLK-W2-002 · Charter Q7:A） */
export function HomeCommandPanelW2({
  state = "ok",
  className,
  onAction,
  onNavigate,
}: W2ComponentProps) {
  const navGo = (target: string, hotspot?: number) => {
    if (hotspot !== undefined) hot(onAction, hotspot);
    onNavigate?.(target);
  };

  const shellProps = {
    breadcrumb: "ホーム",
    nav: PRIMARY_NAV,
    onNavigate: (target: string) => {
      const item = PRIMARY_NAV.find((n) => n.target === target);
      const footer = FOOTER_BAR.find((f) => f.target === target);
      const headerAction = HEADER_ACTIONS.find((a) => a.target === target);
      const hotspotMap: Record<string, number> = {
        "05ctx": 0,
        "05a": 2,
        "06a": 5,
        "07a": 6,
        "10": 7,
        "12hub": 9,
      };
      if (item && hotspotMap[target] !== undefined) {
        navGo(target, hotspotMap[target]);
      } else if (footer) {
        navGo(target, footer.hotspot);
      } else if (headerAction?.hotspot !== undefined) {
        navGo(target, headerAction.hotspot);
      } else {
        onNavigate?.(target);
      }
    },
    headerActions: HEADER_ACTIONS.map((a) => ({
      label: a.label,
      target: a.target,
    })),
    footerBar: FOOTER_BAR.map(({ label, target }) => ({ label, target })),
  };

  if (state === "loading") {
    return (
      <StandardShell {...shellProps}>
        <div
          className={["ihl-panel", className].filter(Boolean).join(" ")}
          data-component-id="ihl-01-nav-home__HomeCommandPanel"
          data-state={state}
          data-w2-variant="density-reduced"
        >
          <SummaryGrid values={EMPTY_SUMMARY} skeleton />
          <PanelStateMessage state="loading" />
        </div>
      </StandardShell>
    );
  }

  if (state === "empty") {
    return (
      <StandardShell {...shellProps}>
        <div
          className={["ihl-panel", className].filter(Boolean).join(" ")}
          data-component-id="ihl-01-nav-home__HomeCommandPanel"
          data-state={state}
          data-w2-variant="density-reduced"
        >
          <SummaryGrid values={EMPTY_SUMMARY} />
          <PanelStateMessage
            state="empty"
            emptyText="まだ観測がありません。まず観測から始めましょう。"
          />
          <PrimaryActions onNavigate={onNavigate} onAction={onAction} emphasize />
        </div>
      </StandardShell>
    );
  }

  if (state === "error") {
    return (
      <StandardShell {...shellProps}>
        <div
          className={["ihl-panel", className].filter(Boolean).join(" ")}
          data-component-id="ihl-01-nav-home__HomeCommandPanel"
          data-state={state}
          data-w2-variant="density-reduced"
        >
          <SummaryGrid values={MOCK_SUMMARY} />
          <PanelStateMessage state="error" />
        </div>
      </StandardShell>
    );
  }

  return (
    <StandardShell {...shellProps}>
      <div
        className={["ihl-panel", className].filter(Boolean).join(" ")}
        data-component-id="ihl-01-nav-home__HomeCommandPanel"
        data-state={state}
        data-w2-variant="density-reduced"
      >
        <SummaryGrid values={MOCK_SUMMARY} />

        <PrimaryActions onNavigate={onNavigate} onAction={onAction} />

        <section className="ihl-card">
          <h2 className="ihl-card__title">今日の要約</h2>
          <p style={{ margin: "12px 0 0", fontSize: "0.88rem", lineHeight: 1.7 }}>
            観測セッション 38 件・未読の指摘はありません。
            <br />
            進行中の取引が 2 件あります。
            <br />
            まず観測から始めると、マーケットに反映されます。
          </p>
        </section>
      </div>
    </StandardShell>
  );
}
