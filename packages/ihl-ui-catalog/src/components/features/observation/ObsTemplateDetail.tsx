import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const ITEMS = [

  { item: "体重", unit: "g", method: "手入力", gender: "雄" },

  { item: "全長", unit: "mm", method: "手入力", gender: "雄" },

  { item: "角長", unit: "mm", method: "手入力", gender: "雄" },

  { item: "ステージ", unit: "—", method: "手入力", gender: "雄" },

];



/** catalog id: ihl-05-obs-template-detail__ContentArea */

export function ObsTemplateDetailContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-template-detail__ContentArea">

      <div className="obs-page-header">

        <ObsBreadcrumb segments={["観測", "計測テンプレ", "詳細"]} />

        <button type="button" className="obs-btn-link" onClick={() => hot(onAction, 2)}>

          ← 一覧へ

        </button>

      </div>



      <div className="obs-template-header">

        <div className="obs-template-header__icon">📄</div>

        <div>

          <h1 className="obs-page-title" style={{ marginBottom: 4 }}>

            標準計測テンプレ（雄） <span className="obs-badge obs-badge--public">公開</span>

          </h1>

          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>

            更新: 2026-06-01 · 派生: <button type="button" className="obs-btn-link">基本テンプレ v2</button>

          </p>

        </div>

      </div>



      <div className="obs-card">

        <table className="obs-input-grid">

          <thead>

            <tr>

              <th>項目</th>

              <th>単位</th>

              <th>計測方法</th>

              <th>適用性別</th>

            </tr>

          </thead>

          <tbody>

            {ITEMS.map((row) => (

              <tr key={row.item}>

                <td>{row.item}</td>

                <td>{row.unit}</td>

                <td>{row.method}</td>

                <td>{row.gender}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      <div className="obs-actions-row">

        <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 1)}>

          複製して編集 (Fork)

        </button>

        <button type="button" className="obs-btn-success" onClick={() => hot(onAction, 0)}>

          このテンプレで記録

        </button>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "← テンプレ一覧", hotspot: 2 }, { label: "Fork", hotspot: 1 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsTemplateDetailPrimaryAction };

export { ObsNullPart as ObsTemplateDetailStatePanel };

