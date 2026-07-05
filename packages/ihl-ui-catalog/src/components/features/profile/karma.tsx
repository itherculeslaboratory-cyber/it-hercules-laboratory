import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { ProfileCrumb, ProfileNullStatePanel, ProfileShell, hot } from "./shared";

const ID = "ihl-08-karma-summary";

export function KarmaSummaryContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <ProfileShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <ProfileCrumb parts={[{ label: "プロフィール", action: () => hot(onAction, 1) }, { label: "カルマ" }]} />
      <h2 className="ihl-prof__title">カルマ</h2>
      <div className="ihl-prof-karma-grid">
        <div className="ihl-prof-karma-card">
          <h3>カルマ値</h3>
          <div className="ihl-prof-karma-score">+42</div>
          <div className="ihl-prof-bar">
            <div className="ihl-prof-bar__fill" style={{ width: "71%" }} />
          </div>
          <p className="ihl-prof-karma-warn">警告: カルマ値が -80 以下になると BAN の可能性。閾値まであと 122 pt。</p>
        </div>
        <div className="ihl-prof-karma-card">
          <h3>カルマカウント</h3>
          <div className="ihl-prof-karma-score" style={{ color: "var(--civ-accent)" }}>
            2
          </div>
          <p className="ihl-prof-metric__desc">ルール違反で減少した月数</p>
        </div>
        <div className="ihl-prof-karma-card ihl-prof-karma-card--wide">
          <h3>最近の変動</h3>
          <table className="ihl-prof-history">
            <thead>
              <tr>
                <th>日付</th>
                <th>イベント</th>
                <th>変動</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025/05/25</td>
                <td>ルール違反: 暴言</td>
                <td style={{ color: "#e88" }}>-15</td>
              </tr>
              <tr>
                <td>2025/05/10</td>
                <td>月次ボーナス</td>
                <td style={{ color: "var(--civ-success)" }}>+10</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ihl-prof-karma-card">
          <h3>免罪符ショップ</h3>
          <p className="ihl-prof-metric__desc">免罪符でカルマ減少を防げます。</p>
          <button type="button" className="ihl-prof__crumb" style={{ marginTop: 12 }} onClick={() => hot(onAction, 0)}>
            免罪符ショップへ →
          </button>
        </div>
      </div>
    </ProfileShell>
  );
}

export function KarmaSummaryPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        免罪符ショップ
      </PrimaryButton>
    </div>
  );
}

export { ProfileNullStatePanel as KarmaSummaryStatePanel };
