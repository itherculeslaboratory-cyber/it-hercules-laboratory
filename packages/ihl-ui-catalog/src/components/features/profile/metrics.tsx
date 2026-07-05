import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { MetricCard, ProfileCrumb, ProfileNullStatePanel, ProfileShell, hot } from "./shared";

const ID = "ihl-profile-three-metrics";

export function ProfileMetricsContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <ProfileShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <ProfileCrumb parts={[{ label: "マイページ" }, { label: "プロフィール" }]} />
        <button type="button" className="ihl-prof__crumb" onClick={() => hot(onAction, 0)}>
          🔔 通知
        </button>
      </div>
      <div className="ihl-prof-grid">
        <MetricCard
          title="カルマ"
          value={
            <>
              +42 / +100
              <div className="ihl-prof-bar">
                <div className="ihl-prof-bar__fill" style={{ width: "42%" }} />
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>違反カウント 0</span>
            </>
          }
          badge="良好"
          desc="取引やコミュニティでの信用状態やBANリスクを示します。"
          onClick={() => hot(onAction, 1)}
        />
        <MetricCard
          title="貢献度"
          value="12,840"
          sub={<span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>累積（減らない）</span>}
          desc="論文 8 · 査読 21 · 観測日数 240"
          onClick={() => hot(onAction, 2)}
        />
        <MetricCard
          title="マーケット評価"
          value={
            <div className="ihl-prof-ratings">
              <div>
                良い<strong>38</strong>
              </div>
              <div>
                普通<strong>4</strong>
              </div>
              <div style={{ color: "#e88" }}>
                悪い<strong>1</strong>
              </div>
            </div>
          }
          sub={
            <div className="ihl-prof-tags">
              <span>梱包丁寧</span>
              <span>連絡丁寧</span>
              <span>発送迅速</span>
            </div>
          }
          desc="過去の取引における相手からの評価の内訳です。"
        />
      </div>
      <p className="ihl-prof-footnote">3つの指標は統合しません（カルマ＝信用 / 貢献度＝活動量 / 評価＝取引相手の声）</p>
    </ProfileShell>
  );
}

export function ProfileMetricsPrimaryAction({ className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" disabled>
        プロフィール編集
      </PrimaryButton>
    </div>
  );
}

export { ProfileNullStatePanel as ProfileMetricsStatePanel };
