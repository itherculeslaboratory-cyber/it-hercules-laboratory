import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { SettingsCrumb, SettingsNullStatePanel, SettingsShell, hot } from "./shared";

const ID = "ihl-17-world-template-picker";

const TEMPLATES = ["血統 OS", "観測ラボ", "マーケット標準", "掲示板ミニマル"];

export function TemplatePickerContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <SettingsShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <SettingsCrumb parts={[{ label: "設定", action: () => hot(onAction, 4) }, { label: "UI テンプレ選択" }]} />
      <h2 className="ihl-set__title">UI テンプレ選択</h2>
      <div className="ihl-set-tabs">
        <button type="button" className="ihl-set-tabs__active" onClick={() => hot(onAction, 0)}>
          おすすめ
        </button>
        <button type="button" onClick={() => hot(onAction, 0)}>
          すべて
        </button>
      </div>
      <div className="ihl-set-template-grid">
        {TEMPLATES.map((name, i) => (
          <button key={name} type="button" className="ihl-set-template" onClick={() => hot(onAction, 1)}>
            <strong>{name}</strong>
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--civ-fg-muted)", marginTop: 6 }}>
              {i === 0 ? "選択中" : "テンプレート"}
            </span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" className="ihl-set__crumb" onClick={() => hot(onAction, 3)}>
          Builder
        </button>
      </div>
    </SettingsShell>
  );
}

export function TemplatePickerPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 2)}>
        適用する
      </PrimaryButton>
    </div>
  );
}

export { SettingsNullStatePanel as TemplatePickerStatePanel };
