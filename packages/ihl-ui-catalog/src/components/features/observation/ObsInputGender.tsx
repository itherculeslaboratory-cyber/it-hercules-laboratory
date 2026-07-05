import type { W2ComponentProps } from "../../../types/w2";

import { hot, ObsBreadcrumb, ObsGenderToggle, ObsNullPart, ObsScreenWrap } from "./obs-shared";

import "./observation.css";



const MALE_ROWS = [

  { item: "体重", unit: "g", method: "手入力" },

  { item: "体長", unit: "mm", method: "手入力" },

  { item: "角長", unit: "mm", method: "手入力" },

  { item: "胸幅", unit: "mm", method: "手入力" },

];



const FEMALE_ROWS = [

  { item: "体重", unit: "g", method: "手入力" },

  { item: "体長", unit: "mm", method: "手入力" },

  { item: "前胸幅", unit: "mm", method: "手入力" },

  { item: "上翅長", unit: "mm", method: "手入力" },

];



function ObsGenderInputScreen({

  gender,

  rows,

  componentId,

  onAction,

  className,

}: W2ComponentProps & {

  gender: "male" | "female";

  rows: typeof MALE_ROWS;

  componentId: string;

}) {

  return (

    <ObsScreenWrap className={className} componentId={componentId}>

      <ObsBreadcrumb segments={["観測", "計測入力", gender === "male" ? "雄" : "雌"]} />

      <ObsGenderToggle

        value={gender}

        onChange={(v) => {
          if (v !== gender) hot(onAction, 0);
        }}

      />

      <div className="obs-card">

        <table className="obs-input-grid">

          <thead>

            <tr>

              <th>項目</th>

              <th>数値</th>

              <th>単位</th>

              <th>計測方法</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row) => (

              <tr key={row.item}>

                <td>

                  <select defaultValue={row.item}>

                    <option>{row.item}</option>

                  </select>

                </td>

                <td>

                  <input type="text" placeholder="" aria-label={`${row.item}の数値`} />

                </td>

                <td>

                  <select defaultValue={row.unit}>

                    <option>{row.unit}</option>

                  </select>

                </td>

                <td>

                  <select defaultValue={row.method}>

                    <option>{row.method}</option>

                  </select>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <div className="obs-actions-row">

          <button type="button" className="obs-btn-success">

            保存

          </button>

        </div>

      </div>

    </ObsScreenWrap>

  );

}



/** catalog id: ihl-05-obs-input-male__ContentArea */

export function ObsInputMaleContentArea(props: W2ComponentProps) {

  return (

    <ObsGenderInputScreen

      {...props}

      gender="male"

      rows={MALE_ROWS}

      componentId="ihl-05-obs-input-male__ContentArea"

    />

  );

}



/** catalog id: ihl-05-obs-input-female__ContentArea */

export function ObsInputFemaleContentArea(props: W2ComponentProps) {

  return (

    <ObsGenderInputScreen

      {...props}

      gender="female"

      rows={FEMALE_ROWS}

      componentId="ihl-05-obs-input-female__ContentArea"

    />

  );

}



export { ObsNullPart as ObsInputMalePrimaryAction };

export { ObsNullPart as ObsInputMaleStatePanel };

export { ObsNullPart as ObsInputFemalePrimaryAction };

export { ObsNullPart as ObsInputFemaleStatePanel };

