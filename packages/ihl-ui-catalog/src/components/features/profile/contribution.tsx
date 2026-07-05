import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { MetricCard, ProfileCrumb, ProfileNullStatePanel, ProfileShell, hot } from "./shared";

const ID = "ihl-14-contribution-badge";

export function ContributionContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <ProfileShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <ProfileCrumb parts={[{ label: "貢献度" }]} />
      <h2 className="ihl-prof__title">貢献度</h2>
      <div className="ihl-prof-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <MetricCard
          title="累積スコア"
          value="12,840"
          sub={<span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>Gold バッジ</span>}
          desc="論文 · 査読 · 追試 · 観測日数 · タグ整理"
        />
        <div className="ihl-prof-metric">
          <h3 className="ihl-prof-metric__title">ショートカット</h3>
          <button type="button" className="ihl-prof-notif-item" style={{ marginBottom: 8 }} onClick={() => hot(onAction, 0)}>
            PT ショップへ
          </button>
          <button type="button" className="ihl-prof-notif-item" style={{ marginBottom: 8 }} onClick={() => hot(onAction, 1)}>
            一般投票へ
          </button>
          <button type="button" className="ihl-prof-notif-item" onClick={() => hot(onAction, 2)}>
            プロフィールへ
          </button>
        </div>
      </div>
    </ProfileShell>
  );
}

export function ContributionPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        PT ショップ
      </PrimaryButton>
    </div>
  );
}

export { ProfileNullStatePanel as ContributionStatePanel };
