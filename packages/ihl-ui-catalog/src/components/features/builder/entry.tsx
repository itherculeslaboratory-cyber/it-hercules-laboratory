import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { SettingsCrumb, SettingsNullStatePanel, SettingsShell, hot } from "../settings/shared";

const ID = "ihl-16-edit-this-screen-entry";

export function BuilderEntryContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <SettingsShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <SettingsCrumb parts={[{ label: "Builder 入口" }]} />
      <h2 className="ihl-set__title">この画面を編集</h2>
      <p className="ihl-set__lead">右下の「この画面を編集」から Builder に入ります。</p>
      <div className="ihl-set-card" style={{ cursor: "default", maxWidth: 420 }}>
        <span className="ihl-set-card__icon">✎</span>
        <span className="ihl-set-card__title">編集対象</span>
        <span className="ihl-set-card__desc">現在の walkthrough 画面を Builder で開く</span>
      </div>
    </SettingsShell>
  );
}

export function BuilderEntryPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        Builder を開く
      </PrimaryButton>
    </div>
  );
}

export { SettingsNullStatePanel as BuilderEntryStatePanel };
