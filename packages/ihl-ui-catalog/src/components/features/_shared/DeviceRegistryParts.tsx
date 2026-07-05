import type { W2ComponentProps } from "../../../types/w2";

import { PrimaryButton } from "../../PrimaryButton";

import { fireHotspot, SCREEN_CONFIGS } from "./configs";

import { FeaturePartShell } from "./FeaturePartShell";



type PartProps = W2ComponentProps & { componentId: string };



const config = SCREEN_CONFIGS["13"]!;



export function createDeviceRegistryPart(region: string, componentId: string) {

  return function DeviceRegistryPart({ state = "ok", className, onAction }: PartProps) {

    if (region === "CollectorSetupBanner") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className}>

          <p className="ihl-feature-shell__crumb">{config.breadcrumb}</p>

          <h2 className="ihl-feature-shell__title">{config.title}</h2>

          <p className="ihl-feature-shell__lead">Collector を LAN に配置し、観測データを自動取り込みします。</p>

          <PrimaryButton type="button" onClick={() => fireHotspot(onAction, "hotspot.0")}>

            観測入力へ

          </PrimaryButton>

          <button type="button" className="ihl-feature-nav__link" style={{ marginLeft: 12 }} onClick={() => fireHotspot(onAction, "hotspot.1")}>

            設定ハブ

          </button>

        </FeaturePartShell>

      );

    }



    if (region === "CsvImportBlock") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className}>

          <h3 className="ihl-feature-shell__title" style={{ fontSize: "1rem" }}>

            CSV インポート

          </h3>

          <p className="ihl-feature-shell__lead">SwitchBot Export 等の CSV を取り込みます。</p>

          <div className="ihl-feature-form-row">

            <input className="ihl-form-control" type="file" aria-label="CSV ファイル" />

            <PrimaryButton type="button">取り込む</PrimaryButton>

          </div>

        </FeaturePartShell>

      );

    }



    if (region === "DeviceListCard") {

      return (

        <FeaturePartShell componentId={componentId} state={state} className={className}>

          <h3 className="ihl-feature-shell__title" style={{ fontSize: "1rem" }}>

            登録済み機器

          </h3>

          <div className="ihl-feature-device-list">

            {[

              { name: "SwitchBot Hub · リビング", status: "online" },

              { name: "温湿度計 · 飼育ケース A", status: "online" },

              { name: "CO₂ センサ · 幼虫室", status: "offline" },

            ].map((d) => (

              <div key={d.name} className="ihl-feature-device-row">

                <span>{d.name}</span>

                <span className="ihl-feature-device-row__status" style={d.status === "offline" ? { color: "var(--civ-fg-muted)" } : undefined}>

                  {d.status}

                </span>

              </div>

            ))}

          </div>

        </FeaturePartShell>

      );

    }



    return (

      <FeaturePartShell componentId={componentId} state={state} className={className}>

        <h3 className="ihl-feature-shell__title" style={{ fontSize: "1rem" }}>

          手動登録

        </h3>

        <div className="ihl-feature-form-row">

          <input className="ihl-form-control" placeholder="機器名" aria-label="機器名" />

          <select className="ihl-form-control ihl-form-select" aria-label="種別">

            <option>SwitchBot</option>

            <option>手入力</option>

          </select>

          <PrimaryButton type="button">登録</PrimaryButton>

        </div>

        <button type="button" className="ihl-feature-nav__link" style={{ marginTop: 12 }} onClick={() => fireHotspot(onAction, "hotspot.1")}>

          設定ハブ

        </button>

      </FeaturePartShell>

    );

  };

}


