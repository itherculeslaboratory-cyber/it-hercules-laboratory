import { useState } from "react";

import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const FORK_SOURCES = [

  { icon: "♂", title: "雄 標準計測", items: 4, desc: "成虫雄の標準計測項目" },

  { icon: "♀", title: "雌 標準計測", items: 4, desc: "成虫雌の標準計測項目" },

  { icon: "🐛", title: "幼虫 体重記録", items: 3, desc: "幼虫体重の記録項目" },

];



const EDIT_ROWS = [

  { item: "体長", unit: "mm", method: "上翅先端まで" },

  { item: "前胸幅", unit: "mm", method: "最も広い幅" },

  { item: "上翅長", unit: "mm", method: "肩部から先端まで" },

  { item: "体重", unit: "g", method: "電子天秤で計測" },

];



/** catalog id: ihl-05-obs-template-fork__ContentArea */

export function ObsTemplateForkContentArea({ onAction, className }: W2ComponentProps) {

  const [selected, setSelected] = useState(1);



  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-template-fork__ContentArea">

      <div className="obs-page-header">

        <ObsBreadcrumb segments={["観測", "Fork"]} />

        <button type="button" className="obs-btn-link" onClick={() => hot(onAction, 1)}>

          ← 詳細へ戻る

        </button>

      </div>



      <div className="obs-fork-steps">

        <div className="obs-fork-step">

          <p className="obs-fork-step__num">1 テンプレート一覧</p>

          <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", marginBottom: 12 }}>複製したいテンプレを選択</p>

          {FORK_SOURCES.map((s, i) => (

            <button

              key={s.title}

              type="button"

              className={i === selected ? "obs-fork-list-item obs-fork-list-item--selected" : "obs-fork-list-item"}

              onClick={() => setSelected(i)}

            >

              <span style={{ fontSize: "1.25rem" }}>{s.icon}</span>

              <div>

                <strong>{s.title}</strong>

                <span className="obs-badge" style={{ marginLeft: 8 }}>

                  項目 {s.items}

                </span>

                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>{s.desc}</p>

              </div>

            </button>

          ))}

        </div>



        <div className="obs-fork-step">

          <p className="obs-fork-step__num">2 複製 (Fork)</p>

          <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", marginBottom: 12 }}>選択したテンプレを複製</p>

          <div style={{ textAlign: "center", padding: "24px 0" }}>

            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>

            <strong>{FORK_SOURCES[selected]?.title}</strong>

            <p>

              <span className="obs-badge">項目 {FORK_SOURCES[selected]?.items}</span>

            </p>

          </div>

          <button type="button" className="obs-btn-primary" style={{ width: "100%" }}>

            このテンプレを複製して編集

          </button>

        </div>



        <div className="obs-fork-step">

          <p className="obs-fork-step__num">3 編集</p>

          <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", marginBottom: 12 }}>テンプレ名と計測項目を編集</p>

          <div className="obs-field" style={{ marginBottom: 12 }}>

            <label htmlFor="fork-name">テンプレート名</label>

            <input id="fork-name" type="text" defaultValue="雌 標準計測 (コピー)" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--civ-border-input)", background: "var(--civ-bg-input)", color: "var(--civ-fg)" }} />

          </div>

          <strong style={{ fontSize: "0.8125rem" }}>計測項目</strong>

          <table className="obs-input-grid" style={{ marginTop: 8 }}>

            <thead>

              <tr>

                <th>項目</th>

                <th>単位</th>

                <th>計測方法</th>

              </tr>

            </thead>

            <tbody>

              {EDIT_ROWS.map((row) => (

                <tr key={row.item}>

                  <td>{row.item}</td>

                  <td>{row.unit}</td>

                  <td>{row.method}</td>

                </tr>

              ))}

            </tbody>

          </table>

          <button type="button" className="obs-btn-outline" style={{ width: "100%", marginTop: 8 }}>

            + 項目を追加

          </button>

          <button type="button" className="obs-btn-primary" style={{ width: "100%", marginTop: 12 }}>

            保存

          </button>

        </div>

      </div>



      <button type="button" className="obs-iot-banner" style={{ width: "100%", cursor: "pointer", marginTop: 16 }} onClick={() => hot(onAction, 0)}>

        <span className="obs-iot-banner__icon" aria-hidden>

          ⚠

        </span>

        <div className="obs-iot-banner__text">

          <strong>IoT 機器未登録</strong>

          <p>IoT連携項目あり — 機器管理へ</p>

        </div>

      </button>



      <ObsDeepNav onAction={onAction} links={[{ label: "← テンプレ詳細", hotspot: 1 }, { label: "IoT 機器", hotspot: 0 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsTemplateForkPrimaryAction };

export { ObsNullPart as ObsTemplateForkStatePanel };

