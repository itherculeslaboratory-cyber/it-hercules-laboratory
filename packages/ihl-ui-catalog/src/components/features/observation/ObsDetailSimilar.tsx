import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const MEASURES = [

  { label: "体長", value: "78.2mm", source: "直接観測" },

  { label: "角長", value: "41.0mm", source: "直接観測" },

  { label: "胸幅", value: "28.5mm", source: "画像由来" },

  { label: "体重", value: "12.3g", source: "直接観測" },

];



const SIMILAR = [

  { score: 0.92, label: "非常に類似", meta: "成虫 ♂ · 野外採集 · 2024/06/12 · ペルー・イキトス" },

  { score: 0.86, label: "非常に類似", meta: "成虫 ♂ · 飼育個体 · 2024/05/28 · グアドループ" },

  { score: 0.79, label: "類似", meta: "成虫 ♂ · 野外採集 · 2024/07/03 · エクアドル・ナポ" },

  { score: 0.72, label: "類似", meta: "成虫 ♂ · 飼育個体 · 2024/04/16 · コロンビア・カウカ" },

  { score: 0.65, label: "やや類似", meta: "成虫 ♂ · 野外採集 · 2024/06/01 · ブラジル・アマゾナス" },

];



/** catalog id: ihl-05-obs-detail-similar__ContentArea */

export function ObsDetailSimilarContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-detail-similar__ContentArea">

      <div className="obs-page-header">

        <ObsBreadcrumb segments={["観測", "検索", "個体詳細"]} />

        <button type="button" className="obs-btn-link" onClick={() => hot(onAction, 1)}>

          ← 戻る › 検索

        </button>

      </div>



      <div className="obs-detail-layout">

        <div>

          <div className="obs-detail-photo" aria-label="標本写真">

            🪲

          </div>

          <div className="obs-card">

            <strong style={{ fontSize: "0.8125rem" }}>撮影条件</strong>

            <div className="obs-shooting-meta">

              <span>光源: LED 5000K</span>

              <span>機種: Sony A7</span>

              <span>距離: 40cm</span>

              <span>背景: 白</span>

            </div>

            <span className="obs-measure-badge">色補正なし</span>

          </div>

          <div className="obs-card" style={{ marginTop: 16 }}>

            {MEASURES.map((m) => (

              <div key={m.label} className="obs-measure-row">

                <span>{m.label}</span>

                <span>{m.value}</span>

                <span className="obs-measure-badge">{m.source}</span>

              </div>

            ))}

          </div>

        </div>



        <aside>

          <h2 style={{ fontSize: "0.9375rem", marginBottom: 12 }}>類似する個体</h2>

          <div className="obs-similar-list">

            {SIMILAR.map((s) => (

              <button key={s.meta} type="button" className="obs-similar-card">

                <div className="obs-similar-card__thumb">🪲</div>

                <div>

                  <div className="obs-similar-card__score">

                    {s.score} · {s.label}

                  </div>

                  <div className="obs-similar-card__meta">{s.meta}</div>

                </div>

              </button>

            ))}

          </div>

          <div className="obs-actions-row">

            <button type="button" className="obs-btn-primary" onClick={() => hot(onAction, 0)}>

              計測入力

            </button>

            <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 2)}>

              この個体の血統を見る

            </button>

          </div>

        </aside>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "← 検索グリッド", hotspot: 1 }, { label: "計測入力", hotspot: 0 }, { label: "血統を見る", hotspot: 2 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsDetailSimilarPrimaryAction };

export { ObsNullPart as ObsDetailSimilarStatePanel };

