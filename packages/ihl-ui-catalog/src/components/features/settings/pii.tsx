import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { SettingsCrumb, SettingsNullStatePanel, SettingsShell, hot } from "./shared";

const ID = "ihl-12-settings-pii";

export function SettingsPiiContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <SettingsShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <SettingsCrumb parts={[{ label: "設定", action: () => hot(onAction, 0) }, { label: "PII" }]} />
      <h2 className="ihl-set__title">PII・プライバシー</h2>
      <p className="ihl-set__lead">公開範囲と個人情報の取り扱いを設定します。</p>
      <div className="ihl-form-field">
        <label className="ihl-form-field__label">公開ハンドル</label>
        <input className="ihl-form-control" defaultValue="kabutomushi_labo" readOnly aria-label="公開ハンドル" />
      </div>
      <div className="ihl-form-field">
        <label className="ihl-form-field__label">メール（非公開）</label>
        <input className="ihl-form-control" type="email" defaultValue="you@example.com" readOnly aria-label="メール" />
      </div>
      <div className="ihl-form-field">
        <label className="ihl-form-field__label">観測データの公開範囲</label>
        <select className="ihl-form-control ihl-form-select" aria-label="公開範囲">
          <option>コミュニティのみ</option>
          <option>非公開</option>
        </select>
      </div>
    </SettingsShell>
  );
}

export function SettingsPiiPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        保存する
      </PrimaryButton>
    </div>
  );
}

export { SettingsNullStatePanel as SettingsPiiStatePanel };
