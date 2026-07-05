import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap, ObsTargetChip } from "./obs-shared";

import "./observation.css";



const TEMPLATES = [

  { title: "幼虫 体重管理", desc: "L3 幼虫の体重推移を記録するテンプレ", items: 3, date: "2026-06-01", public: true },

  { title: "幼虫 成長記録（詳細）", desc: "体長・体重・ステージを詳細に記録", items: 7, date: "2026-05-28", public: true },

  { title: "幼虫 健康チェック", desc: "フン状態・脱皮・食害の確認項目", items: 5, date: "2026-05-21", public: false },

  { title: "雄 標準計測", desc: "成虫雄の標準計測項目", items: 10, date: "2026-05-18", public: true, fork: true, parent: "雄 標準計測（公開）" },

  { title: "幼虫 簡易記録", desc: "最小限の体重・体長記録", items: 2, date: "2026-05-15", public: false },

  { title: "成長比較テンプレ（幼虫）", desc: "複数個体の成長比較用", items: 6, date: "2026-05-10", public: true },

  { title: "幼虫 飼育環境記録", desc: "温度・湿度・マット交換日", items: 4, date: "2026-05-08", public: false },

  { title: "幼虫 標準計測", desc: "幼虫の標準計測セット", items: 8, date: "2026-05-03", public: true, fork: true, parent: "幼虫 標準計測（公開）" },

];



/** catalog id: ihl-05-obs-template-list__ContentArea */

export function ObsTemplateListContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-template-list__ContentArea">

      <div className="obs-page-header">

        <div>

          <ObsBreadcrumb segments={["観測", "計測テンプレ"]} />

          <ObsTargetChip label="ヘラクレス · L3 幼虫" onClick={() => hot(onAction, 0)} />

        </div>

        <button type="button" className="obs-btn-primary" onClick={() => hot(onAction, 3)}>

          + 新規テンプレを作成

        </button>

      </div>



      <div className="obs-info-bar">

        <span>ℹ カブトムシ向けテンプレ（ヘラクレス · L3 幼虫） · 8 件</span>

        <button type="button" className="obs-btn-link" onClick={() => hot(onAction, 1)}>

          絞り込み解除

        </button>

      </div>



      <div className="obs-tabs">

        {["すべて", "自分", "公開", "フォーク済"].map((t, i) => (

          <button key={t} type="button" className={i === 0 ? "obs-tab obs-tab--active" : "obs-tab"}>

            {t}

          </button>

        ))}

      </div>



      <div className="obs-chip-row" style={{ marginBottom: 16 }}>

        {["雄", "雌", "幼虫", "共通"].map((s, i) => (

          <button key={s} type="button" className={i === 2 ? "obs-chip obs-chip--active" : "obs-chip"}>

            {s}

          </button>

        ))}

        <input type="search" placeholder="テンプレ名で検索" aria-label="テンプレ名で検索" style={{ marginLeft: "auto", flex: 1, maxWidth: 220, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--civ-border-input)", background: "var(--civ-bg-input)", color: "var(--civ-fg)" }} />

      </div>



      <div className="obs-template-grid">

        {TEMPLATES.map((t) => (

          <button key={t.title} type="button" className="obs-template-card" onClick={() => hot(onAction, 2)}>

            {t.fork && <span className="obs-badge obs-badge--fork">フォーク</span>}

            <h3 className="obs-template-card__title">{t.title}</h3>

            <p className="obs-template-card__desc">{t.desc}</p>

            <div className="obs-template-card__meta">

              <span>📋 {t.items} 項目</span>

              <span>📅 更新 {t.date}</span>

              {t.parent && <span>🔀 {t.parent}</span>}

              <span className={t.public ? "obs-badge obs-badge--public" : "obs-badge"}>{t.public ? "公開" : "自分のみ"}</span>

            </div>

          </button>

        ))}

      </div>

      <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 16 }}>8件中 1～8件を表示</p>



      <ObsDeepNav onAction={onAction} links={[{ label: "対象ナビゲータ", hotspot: 0 }, { label: "新規作成", hotspot: 3 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsTemplateListPrimaryAction };

export { ObsNullPart as ObsTemplateListStatePanel };

