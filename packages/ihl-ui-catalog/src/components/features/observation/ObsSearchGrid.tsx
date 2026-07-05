import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap, ObsTargetChip } from "./obs-shared";

import "./observation.css";



const RESULTS = [

  { id: "1", length: 78, gender: "♂", qc: "usable" },

  { id: "2", length: 82, gender: "♂", qc: "usable" },

  { id: "3", length: 71, gender: "♀", qc: "warning" },

  { id: "4", length: 95, gender: "♂", qc: "usable" },

  { id: "5", length: 68, gender: "♂", qc: "usable" },

  { id: "6", length: 88, gender: "♂", qc: "usable" },

  { id: "7", length: 74, gender: "♀", qc: "usable" },

  { id: "8", length: 91, gender: "♂", qc: "usable" },

];



/** catalog id: ihl-05-obs-search-grid__ContentArea */

export function ObsSearchGridContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-search-grid__ContentArea">

      <div className="obs-page-header">

        <div>

          <ObsBreadcrumb segments={["観測", "検索"]} />

          <h1 className="obs-page-title">観測 — 個体画像検索</h1>

        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

          <ObsTargetChip label="Dynastes hercules · 成虫 ♂" onClick={() => hot(onAction, 0)} />

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 2)}>

            計測入力へ

          </button>

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 3)}>

            テンプレ一覧

          </button>

          <button type="button" className="obs-btn-ghost" onClick={() => hot(onAction, 4)}>

            ホーム

          </button>

        </div>

      </div>



      <div className="obs-search-layout">

        <aside className="obs-filter-panel obs-card">

          <strong style={{ fontSize: "0.875rem" }}>フィルタ</strong>

          <div className="obs-filter-group">

            <label htmlFor="obs-species">種</label>

            <select id="obs-species" defaultValue="hercules">

              <option value="hercules">Dynastes hercules</option>

            </select>

          </div>

          <div className="obs-filter-group">

            <label>性別</label>

            <div className="obs-segmented">

              <button type="button" className="obs-segmented__btn obs-segmented__btn--active">

                ♂ male

              </button>

              <button type="button" className="obs-segmented__btn">

                ♀ female

              </button>

              <button type="button" className="obs-segmented__btn">

                ? unknown

              </button>

            </div>

          </div>

          <div className="obs-filter-group">

            <label>ステージ</label>

            <div className="obs-segmented">

              {["egg", "larva", "pupa", "adult"].map((s) => (

                <button

                  key={s}

                  type="button"

                  className={s === "adult" ? "obs-segmented__btn obs-segmented__btn--active" : "obs-segmented__btn"}

                >

                  {s}

                </button>

              ))}

            </div>

          </div>

          <div className="obs-filter-group">

            <label>QC</label>

            <div className="obs-segmented">

              <button type="button" className="obs-segmented__btn obs-segmented__btn--active">

                usable

              </button>

              <button type="button" className="obs-segmented__btn">

                warning

              </button>

            </div>

          </div>

        </aside>



        <div>

          <div className="obs-search-toolbar">

            <input type="search" placeholder="ID、タグ、備考を検索…" aria-label="検索" />

            <span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>126 件</span>

            <button type="button" className="obs-btn-primary">

              類似を検索

            </button>

          </div>

          <div className="obs-result-grid">

            {RESULTS.map((r) => (

              <button key={r.id} type="button" className="obs-result-card" onClick={() => hot(onAction, 1)}>

                <div className="obs-result-card__thumb" aria-hidden>

                  🪲

                </div>

                <div className="obs-result-card__meta">

                  体長 {r.length}mm · {r.gender} · QC:{r.qc}

                </div>

              </button>

            ))}

          </div>

        </div>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "対象ナビゲータ", hotspot: 0 }, { label: "計測入力", hotspot: 2 }, { label: "ホーム", hotspot: 4 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsSearchGridEmptyState };

export { ObsNullPart as ObsSearchGridPagination };

export { ObsNullPart as ObsSearchGridResultGridCard };

export { ObsNullPart as ObsSearchGridSearchFilterBar };

