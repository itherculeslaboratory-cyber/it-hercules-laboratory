import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PrimaryButton } from "@ihl/ui-catalog/components/PrimaryButton";
import {
  ProfileCrumb,
  ProfileNullStatePanel,
  ProfileShell,
  hot,
} from "@ihl/ui-catalog/components/features/profile/shared";
import { W2ShellOnly } from "./withW2Shell";

const ID = "ihl-08-karma-summary";

/** P0 — カルマ概要 · 免罪符ショップ誤表記を #22 PT ショップへ修正（設計 §1.2） */
export function KarmaSummaryContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", onAction, onNavigate, className } = props;
  return (
    <W2ShellOnly feature="karma">
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
            <h3>プラチナコインショップ</h3>
            <p className="ihl-prof-metric__desc">PT（プラチナコイン）で経済アイテムを購入できます。</p>
            <button
              type="button"
              className="ihl-prof__crumb"
              style={{ marginTop: 12 }}
              onClick={() => onNavigate?.("22")}
            >
              プラチナコインショップへ →
            </button>
          </div>
        </div>
      </ProfileShell>
      <nav className="w2-hand-shell__footer w2-hand-shell__footer--karma" aria-label="カルマ導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("PR")}>
          プロフィール
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("22")}>
          プラチナコインショップ
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("01")}>
          ホーム
        </button>
      </nav>
    </W2ShellOnly>
  );
}

export function KarmaSummaryPrimaryActionW2(props: W2ComponentProps) {
  const { onNavigate, className } = props;
  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true" className={className}>
      <PrimaryButton type="button" onClick={() => onNavigate?.("22")}>
        プラチナコインショップ
      </PrimaryButton>
    </div>
  );
}

export function KarmaSummaryStatePanelW2(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true">
      <ProfileNullStatePanel {...props} />
    </div>
  );
}
