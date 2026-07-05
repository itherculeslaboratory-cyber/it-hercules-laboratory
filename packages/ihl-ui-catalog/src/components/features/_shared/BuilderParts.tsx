import type { W2ComponentProps } from "../../../types/w2";

import { PrimaryButton } from "../../PrimaryButton";

import { fireHotspot, SCREEN_CONFIGS } from "./configs";

import { FeaturePartShell } from "./FeaturePartShell";



type PartProps = W2ComponentProps & { componentId: string };



const config = SCREEN_CONFIGS["16"]!;



export function createBuilderPart(region: string, componentId: string) {

  return function BuilderPart({ state = "ok", className, onAction }: PartProps) {

    if (region === "BuilderShell") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className}>

          <p className="ihl-feature-shell__crumb">{config.breadcrumb}</p>

          <h2 className="ihl-feature-shell__title">{config.title}</h2>

          <p className="ihl-feature-shell__lead">編集中: 観測 › 検索グリッド · 層 L3</p>

          <div className="ihl-feature-actions">

            {config.items.map((item) => (

              <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>

                {item.label}

              </button>

            ))}

          </div>

        </FeaturePartShell>

      );

    }



    if (region === "PartsPalette") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>

          <div className="ihl-feature-builder__panel">

            <strong>部品パレット</strong>

            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>

              <li>obs_search_grid · stable · L3</li>

              <li>obs_filter_panel · stable · L3</li>

              <li>similar_score_bar · stable · L3</li>

              <li>FormField · PrimaryButton</li>

            </ul>

          </div>

        </FeaturePartShell>

      );

    }



    if (region === "CanvasDropZone") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>

          <div className="ihl-feature-builder">

            <div className="ihl-feature-builder__panel">

              <strong>Lint</strong>

              <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "var(--civ-success)" }}>OK · 0 警告</p>

            </div>

            <div className="ihl-feature-builder__canvas">

              <div style={{ width: "100%", padding: 12 }}>

                <div className="ihl-feature-post" style={{ marginBottom: 8 }}>

                  セクションヘッダー · obs_search_header

                </div>

                <div className="ihl-feature-post" style={{ marginBottom: 8 }}>

                  フィルターパネル · obs_filter_panel

                </div>

                <div className="ihl-feature-post" style={{ borderColor: "var(--civ-accent)" }}>

                  検索グリッド · obs_search_grid（選択中）

                </div>

                <button type="button" className="ihl-feature-nav__link" style={{ marginTop: 12 }} onClick={() => fireHotspot(onAction, "hotspot.0")}>

                  + ブロック追加

                </button>

              </div>

            </div>

            <div className="ihl-feature-builder__panel">

              <strong>プロパティ</strong>

              <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>

                列: 2 · 余白: 中 (16px) · トークン: obs-surface

              </p>

            </div>

          </div>

        </FeaturePartShell>

      );

    }



    if (region === "LintPanel") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>

          <div className="ihl-feature-state">

            <span className="ihl-feature-state__pill ihl-feature-state__pill--active">Lint OK</span>

            <span className="ihl-feature-state__pill">0 警告</span>

          </div>

        </FeaturePartShell>

      );

    }



    return (

      <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>

        <PrimaryButton type="button" onClick={() => fireHotspot(onAction, "hotspot.0")}>

          保存

        </PrimaryButton>

      </FeaturePartShell>

    );

  };

}


