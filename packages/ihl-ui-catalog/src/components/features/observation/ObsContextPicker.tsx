import { useState } from "react";

import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const DOMAINS = ["生物", "器物・無機物", "デジタル", "環境", "カスタム"] as const;

const METHODS = ["学名検索", "質問で絞る", "分類ツリー"] as const;



const TREE = [

  { label: "目 Coleoptera 甲虫目", level: 0 },

  { label: "科 Scarabaeidae コガネムシ科", level: 1 },

  { label: "属 Dynastes", level: 2 },

  { label: "種 Dynastes hercules ヘラクレスオオカブト", level: 3 },

  { label: "亜種 Dynastes hercules hercules 原名亜種", level: 4, selected: true },

];



/** catalog id: ihl-05-obs-context-picker__ContentArea */

export function ObsContextPickerContentArea({ onAction, className }: W2ComponentProps) {

  const [domain, setDomain] = useState(0);

  const [method, setMethod] = useState(2);

  const [subspecies, setSubspecies] = useState<"subspecies" | "species">("subspecies");



  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-context-picker__ContentArea">

      <ObsBreadcrumb segments={["観測", "対象ナビゲータ"]} />



      <div className="obs-step-indicator">

        <span className="obs-step-indicator__item obs-step-indicator__item--active">

          <span className="obs-step-indicator__num">①</span> 対象

        </span>

        <span>—</span>

        <span className="obs-step-indicator__item obs-step-indicator__item--active">

          <span className="obs-step-indicator__num">②</span> 絞り込み

        </span>

        <span>—</span>

        <span className="obs-step-indicator__item">

          <span className="obs-step-indicator__num">③</span> 確認

        </span>

      </div>



      <div className="obs-context-sheet obs-card">

        <div className="obs-context-section">

          <p className="obs-context-section__label">① 何を観測しますか？</p>

          <div className="obs-chip-row">

            {DOMAINS.map((d, i) => (

              <button

                key={d}

                type="button"

                className={i === domain ? "obs-chip obs-chip--active" : "obs-chip"}

                onClick={() => {

                  setDomain(i);

                  hot(onAction, i);

                }}

              >

                {d}

              </button>

            ))}

          </div>

        </div>



        <div className="obs-context-section">

          <p className="obs-context-section__label">② 絞り込み方法を選択</p>

          <div className="obs-tabs">

            {METHODS.map((m, i) => (

              <button

                key={m}

                type="button"

                className={i === method ? "obs-tab obs-tab--active" : "obs-tab"}

                onClick={() => {

                  setMethod(i);

                  hot(onAction, i + 5);

                }}

              >

                {m}

              </button>

            ))}

          </div>



          <ul className="obs-tree">

            {TREE.map((item) => (

              <li

                key={item.label}

                className={[

                  "obs-tree__item",

                  item.level > 0 ? "obs-tree__item--nested" : "",

                  item.selected ? "obs-tree__item--selected" : "",

                ]

                  .filter(Boolean)

                  .join(" ")}

                style={{ paddingLeft: `${12 + item.level * 16}px` }}

                onClick={() => hot(onAction, 8)}

                onKeyDown={(e) => e.key === "Enter" && hot(onAction, 8)}

                role="button"

                tabIndex={0}

              >

                {item.label}

              </li>

            ))}

          </ul>



          <div className="obs-subspecies-row">

            <button

              type="button"

              className={subspecies === "subspecies" ? "obs-chip obs-chip--active" : "obs-chip"}

              onClick={() => {

                setSubspecies("subspecies");

                hot(onAction, 8);

              }}

            >

              亜種まで確定

            </button>

            <button

              type="button"

              className={subspecies === "species" ? "obs-chip obs-chip--active" : "obs-chip"}

              onClick={() => {

                setSubspecies("species");

                hot(onAction, 9);

              }}

            >

              亜種未区別（種まで）

            </button>

          </div>

        </div>



        <div className="obs-tag-list">

          {["domain:biological", "order:Coleoptera", "family:Scarabaeidae", "genus:Dynastes", "species:Dynastes hercules", "subspecies:D. h. hercules"].map(

            (t) => (

              <span key={t} className="obs-tag">

                {t}

              </span>

            ),

          )}

        </div>



        <div className="obs-apply-bar">

          <button type="button" className="obs-btn-primary" style={{ width: "100%" }} onClick={() => hot(onAction, 10)}>

            適用 → 検索（対象プリフィル）

          </button>

          <div className="obs-apply-bar__actions">

            <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 11)}>

              計測入力（プリフィル）

            </button>

            <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 12)}>

              テンプレ一覧

            </button>

          </div>

          <div className="obs-toggle-row">

            <span>プロフィールにも保存</span>

            <input type="checkbox" aria-label="プロフィールにも保存" />

          </div>

        </div>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "検索グリッドへ", hotspot: 10 }, { label: "計測入力", hotspot: 11 }, { label: "テンプレ一覧", hotspot: 12 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsContextPickerPrimaryAction };

export { ObsNullPart as ObsContextPickerStatePanel };

