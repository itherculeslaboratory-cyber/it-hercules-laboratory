import { useState } from "react";

import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const TAGS = [

  { label: "Dynastes hercules", conf: 0.92, checked: true },

  { label: "成虫", conf: 0.87, checked: true },

  { label: "標本ケース", conf: 0.64, checked: false },

  { label: "計測スケール", conf: 0.41, checked: false },

];



const PIPELINE = ["ingest", "thumbnail", "embedding", "tag_aggregate"];



/** catalog id: ihl-18-photo-analysis-result__ContentArea */

export function PhotoAnalysisResultContentArea({ onAction, className }: W2ComponentProps) {

  const [tags, setTags] = useState(TAGS);



  function toggleTag(index: number) {

    setTags((prev) => prev.map((t, i) => (i === index ? { ...t, checked: !t.checked } : t)));

  }



  return (

    <ObsScreenWrap className={className} componentId="ihl-18-photo-analysis-result__ContentArea">

      <div className="obs-page-header">

        <ObsBreadcrumb segments={["コンポーネント", "写真解析", "結果"]} />

        <button type="button" className="obs-btn-link" onClick={() => hot(onAction, 1)}>

          ← 計測入力へ

        </button>

      </div>



      <h1 className="obs-page-title">

        解析完了 — <span style={{ fontWeight: 400, color: "var(--civ-fg-muted)" }}>component_id: obs-thumbnail-pipeline-042</span>

      </h1>



      <div className="obs-photo-layout">

        <div className="obs-card obs-photo-panel">

          <h3>ソース</h3>

          <p style={{ fontSize: "0.8125rem", margin: "0 0 8px" }}>ingest → thumbnail → embedding</p>

          <span className="obs-measure-badge">色補正なし</span>

        </div>



        <div className="obs-card obs-photo-panel">

          <h3>タグ提案</h3>

          {tags.map((t, i) => (

            <label key={t.label} className="obs-tag-suggest">

              <input type="checkbox" checked={t.checked} onChange={() => toggleTag(i)} />

              <span>{t.label}</span>

              <span className="obs-tag-suggest__conf">（信頼度 {t.conf.toFixed(2)}）</span>

            </label>

          ))}

        </div>



        <div className="obs-card obs-photo-panel">

          <h3>パイプライン</h3>

          {PIPELINE.map((step) => (

            <div key={step} className="obs-pipeline-step">

              <span className="obs-pipeline-step__check" aria-hidden>

                ✓

              </span>

              {step}

            </div>

          ))}

        </div>

      </div>



      <div className="obs-photo-footer">

        <p className="obs-photo-footer__note">表示用の色補正は行いません（preferences §C）</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

          <button type="button" className="obs-btn-outline">

            却下

          </button>

          <button type="button" className="obs-btn-primary" onClick={() => hot(onAction, 0)}>

            タグを承認

          </button>

          <button type="button" className="obs-btn-ghost" onClick={() => hot(onAction, 2)}>

            Builder

          </button>

        </div>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "計測入力", hotspot: 1 }, { label: "Builder", hotspot: 2 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as PhotoAnalysisResultPrimaryAction };

export { ObsNullPart as PhotoAnalysisResultStatePanel };

