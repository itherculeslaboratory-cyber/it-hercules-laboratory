import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsDeepNav, ObsNullPart, ObsScreenWrap, ObsTargetChip } from "./obs-shared";

import "./observation.css";



/** catalog id: ihl-05-obs-input-row__ContentArea */

export function ObsInputRowContentArea({ onAction, className }: W2ComponentProps) {

  return (

    <ObsScreenWrap className={className} componentId="ihl-05-obs-input-row__ContentArea">

      <ObsBreadcrumb segments={["観測", "計測入力"]} />

      <div style={{ marginBottom: 16 }}>

        <ObsTargetChip label="Dynastes hercules · 成虫" onClick={() => hot(onAction, 0)} />

      </div>



      <div className="obs-card obs-input-row-card">

        <div className="obs-input-row-fields">

          <div className="obs-field">

            <label htmlFor="obs-item">項目</label>

            <select id="obs-item" defaultValue="weight">

              <option value="weight">体重</option>

              <option value="length">体長</option>

              <option value="horn">角長</option>

            </select>

            <span className="obs-field-hint">+ 自由入力</span>

          </div>

          <div className="obs-field">

            <label htmlFor="obs-value">数値</label>

            <input id="obs-value" type="text" placeholder="数値を入力してください" />

          </div>

          <div className="obs-field">

            <label htmlFor="obs-unit">単位</label>

            <select id="obs-unit" defaultValue="g">

              <option value="g">g</option>

              <option value="mm">mm</option>

            </select>

          </div>

          <div className="obs-field">

            <label htmlFor="obs-method">計測方法</label>

            <select id="obs-method" defaultValue="manual">

              <option value="manual">手入力</option>

              <option value="iot">IoT取得</option>

            </select>

            <span className="obs-field-hint">手入力 / IoT取得</span>

          </div>

        </div>



        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 1)}>

            性別 › 雄

          </button>

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 2)}>

            性別 › 雌

          </button>

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 3)}>

            テンプレから

          </button>

          <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 5)}>

            写真解析結果

          </button>

        </div>



        <button type="button" className="obs-iot-banner" style={{ width: "100%", cursor: "pointer" }} onClick={() => hot(onAction, 4)}>

          <span className="obs-iot-banner__icon" aria-hidden>

            ⚠

          </span>

          <div className="obs-iot-banner__text">

            <strong>IoT 機器未登録</strong>

            <p>IoTで計測するには機器の登録が必要です — タップで詳細</p>

          </div>

        </button>



        <div className="obs-actions-row">

          <button type="button" className="obs-btn-primary">

            行を追加

          </button>

        </div>

      </div>



      <ObsDeepNav

        onAction={onAction}

        links={[

          { label: "対象ナビゲータ", hotspot: 0 },

          { label: "テンプレ一覧", hotspot: 3 },

          { label: "写真解析", hotspot: 5 },

        ]}

      />

    </ObsScreenWrap>

  );

}



export { ObsNullPart as ObsInputRowPrimaryAction };

export { ObsNullPart as ObsInputRowStatePanel };

