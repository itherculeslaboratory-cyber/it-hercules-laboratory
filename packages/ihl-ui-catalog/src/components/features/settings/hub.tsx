import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { SettingsCard, SettingsCrumb, SettingsNullStatePanel, SettingsShell, hot } from "./shared";

const ID = "ihl-12-settings-hub";

export function SettingsHubContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <SettingsShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <SettingsCrumb parts={[{ label: "設定" }]} />
      <h2 className="ihl-set__title">設定</h2>
      <div className="ihl-set-grid">
        <SettingsCard icon="🌐" title="言語と表示" desc="言語、タイムゾーン、テーマなど。" onClick={() => {}} />
        <SettingsCard icon="🔔" title="通知" desc="通知の設定や配信方法を管理。" onClick={() => {}} />
        <SettingsCard icon="🛡" title="プライバシーと PII" desc="PII の取り扱い設定。" onClick={() => hot(onAction, 0)} />
        <SettingsCard icon="📡" title="機器管理 (IoT)" desc="デバイス接続・プロビジョニング。" onClick={() => hot(onAction, 1)} />
        <SettingsCard icon="🧩" title="UI テンプレ選択" desc="ワールドテンプレートと画面レイアウト。" onClick={() => hot(onAction, 2)} />
        <SettingsCard icon="👤" title="アカウント" desc="ロール・アクセス権限。" onClick={() => {}} />
        <SettingsCard icon="⬇" title="データエクスポート" desc="エクスポート・バックアップ。" onClick={() => {}} />
      </div>
    </SettingsShell>
  );
}

export function SettingsHubPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        PII 設定
      </PrimaryButton>
    </div>
  );
}

export { SettingsNullStatePanel as SettingsHubStatePanel };
