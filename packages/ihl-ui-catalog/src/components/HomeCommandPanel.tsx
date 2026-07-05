import type { W2ComponentProps } from "../types/w2";

import { PanelStateMessage, StandardShell, type NavItem } from "./shared/StandardShell";

import "./shared/standard-shell.css";



function hot(onAction: W2ComponentProps["onAction"], index: number) {

  onAction?.(`hotspot.${index}`);

}



/** walkthrough 01 — nav target → hotspot index */

const NAV_HOTSPOT: Record<string, number> = {

  "05ctx": 0,

  "05i": 1,

  "05a": 2,

  "05a-nav": 11,

  "09": 3,

  "16": 4,

  "06a": 5,

  "07a": 6,

  "10": 7,

  "14": 8,

  "12hub": 9,

  "20vote": 10,

  "07g": 12,

  "07b": 13,

};



const HOME_NAV: NavItem[] = [

  { id: "search", label: "検索", icon: "◎", target: "05a-nav", active: true },

  { id: "market", label: "マーケット", icon: "↗", target: "06a" },

  { id: "board", label: "掲示板", icon: "💬", target: "07a" },

  { id: "paper", label: "論文", icon: "📄", target: "09" },

  { id: "pref", label: "好み", icon: "♥", target: "10" },

  { id: "contrib", label: "貢献度", icon: "★", target: "14" },

  { id: "vote", label: "投票", icon: "✓", target: "20vote" },

];



const HEADER_ACTIONS = [

  { label: "観測対象ナビゲータ → 対象を選ぶ", target: "05ctx" },

  { label: "設定", target: "12hub" },

];



const FOOTER_BAR = [

  { label: "愚痴", target: "07g" },

  { label: "改善提案", target: "07b" },

  { label: "Builder", target: "16" },

];



/** catalog id: ihl-01-nav-home__HomeCommandPanel */

export function HomeCommandPanel({

  state = "ok",

  className,

  onAction,

  onNavigate,

}: W2ComponentProps) {

  const navGo = (target: string) => {

    const idx = NAV_HOTSPOT[target];

    if (idx !== undefined) hot(onAction, idx);

    else onNavigate?.(target);

  };

  const shellProps = {

    breadcrumb: "ホーム",

    nav: HOME_NAV,

    onNavigate: navGo,

    headerActions: HEADER_ACTIONS,

    footerBar: FOOTER_BAR,

  };



  if (state === "loading") {

    return (

      <StandardShell {...shellProps}>

        <PanelStateMessage state="loading" />

      </StandardShell>

    );

  }

  if (state === "empty") {

    return (

      <StandardShell {...shellProps}>

        <PanelStateMessage state="empty" emptyText="まだ観測がありません。観測登録を始めましょう。" />

      </StandardShell>

    );

  }

  if (state === "error") {

    return (

      <StandardShell {...shellProps}>

        <PanelStateMessage state="error" />

      </StandardShell>

    );

  }



  return (

    <StandardShell {...shellProps}>

      <div

        className={["ihl-panel", className].filter(Boolean).join(" ")}

        data-component-id="ihl-01-nav-home__HomeCommandPanel"

        data-state={state}

      >

        <div className="ihl-stat-grid">

          <div className="ihl-stat-card">

            <div className="ihl-stat-card__label">貢献度</div>

            <div className="ihl-stat-card__value">1240</div>

            <div className="ihl-stat-card__foot">↑ プラチナ 12枚</div>

          </div>

          <div className="ihl-stat-card">

            <div className="ihl-stat-card__label">観測セッション</div>

            <div className="ihl-stat-card__value">38</div>

          </div>

          <div className="ihl-stat-card">

            <div className="ihl-stat-card__label">進行中の取引</div>

            <div className="ihl-stat-card__value">2</div>

          </div>

          <div className="ihl-stat-card">

            <div className="ihl-stat-card__label">未読の指摘</div>

            <div className="ihl-stat-card__value">0</div>

          </div>

        </div>



        <div className="ihl-btn-row">

          <button type="button" className="ihl-btn-primary" onClick={() => hot(onAction, 1)}>

            ◎ 観測登録を始める

          </button>

          <button type="button" className="ihl-btn-outline" onClick={() => hot(onAction, 5)}>

            ↗ マーケットを見る

          </button>

        </div>



        <div className="ihl-btn-row">

          <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 2)}>

            検索グリッド

          </button>

        </div>



        <div className="ihl-btn-row" style={{ marginTop: 8 }}>

          <span style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", alignSelf: "center" }}>ショートカット</span>

          <button type="button" className="ihl-btn-ghost" onClick={() => onNavigate?.("13")}>

            機器管理

          </button>

          <button type="button" className="ihl-btn-ghost" onClick={() => onNavigate?.("18photo")}>

            写真解析

          </button>

          <button type="button" className="ihl-btn-ghost" onClick={() => onNavigate?.("23")}>

            GMO振込

          </button>

        </div>



        <section className="ihl-card">

          <h2 className="ihl-card__title">📅 今日の要約</h2>

          <p style={{ margin: "12px 0 0", fontSize: "0.88rem", lineHeight: 1.7 }}>

            観測セッション 38 件・未読の指摘はありません。

            <br />

            進行中の取引が 2 件あります。

            <br />

            まず観測登録から始めると、マーケットに反映されます。

          </p>

        </section>

      </div>

    </StandardShell>

  );

}

