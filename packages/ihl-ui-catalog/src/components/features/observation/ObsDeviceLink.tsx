import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsDeepNav, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



/** catalog id: ihl-05-obs-device-link__ContentArea */

export function ObsDeviceLinkContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-device-link__ContentArea">

      <header style={{ marginBottom: 24 }}>

        <h1 className="obs-page-title">昆虫観察記録</h1>

        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>計測情報の入力</p>

      </header>



      <div className="obs-card">

        <div className="obs-page-header" style={{ marginBottom: 12 }}>

          <strong>計測項目</strong>

          <button type="button" className="obs-btn-outline">

            + 項目を追加

          </button>

        </div>



        <div className="obs-input-row-fields">

          <div className="obs-field">

            <label htmlFor="iot-item">項目</label>

            <select id="iot-item" defaultValue="temp">

              <option value="temp">温度</option>

            </select>

          </div>

          <div className="obs-field">

            <label htmlFor="iot-value">数値</label>

            <input id="iot-value" type="text" defaultValue="--" readOnly />

          </div>

          <div className="obs-field">

            <label htmlFor="iot-unit">単位</label>

            <select id="iot-unit" defaultValue="c">

              <option value="c">℃</option>

            </select>

          </div>

          <div className="obs-field">

            <label htmlFor="iot-method">計測方法</label>

            <select id="iot-method" defaultValue="iot">

              <option value="iot">IoT取得</option>

            </select>

          </div>

        </div>



        <div className="obs-iot-banner">

          <span className="obs-iot-banner__icon" aria-hidden>

            ⚠

          </span>

          <div className="obs-iot-banner__text">

            <strong>機器が未登録です</strong>

            <p>IoTで計測するには機器の登録が必要です</p>

          </div>

          <button type="button" className="obs-btn-primary" onClick={() => hot(onAction, 0)}>

            機器管理へ

          </button>

        </div>

      </div>



      <ObsDeepNav onAction={onAction} links={[{ label: "機器管理", hotspot: 0 }]} />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsDeviceLinkPrimaryAction };

export { ObsNullPart as ObsDeviceLinkStatePanel };

