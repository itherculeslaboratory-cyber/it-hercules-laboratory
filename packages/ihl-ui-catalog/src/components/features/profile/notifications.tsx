import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import { ProfileCrumb, ProfileNullStatePanel, ProfileShell, hot } from "./shared";

const ID = "ihl-profile-three-metrics";

export function ProfileNotificationsContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <ProfileShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <ProfileCrumb parts={[{ label: "マイページ" }, { label: "通知" }]} />
      <h2 className="ihl-prof__title">通知</h2>
      <div className="ihl-prof-notif">
        <button type="button" className="ihl-prof-notif-item" onClick={() => hot(onAction, 0)}>
          <strong>Q&A 回答が届きました</strong>
          <span style={{ display: "block", fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 4 }}>
            観測テンプレに関する質問
          </span>
        </button>
        <button type="button" className="ihl-prof-notif-item" onClick={() => hot(onAction, 1)}>
          <strong>マーケット：オファー更新</strong>
          <span style={{ display: "block", fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 4 }}>
            ヘラクレス ♂ 78mm
          </span>
        </button>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" className="ihl-prof__crumb" onClick={() => hot(onAction, 0)}>
          プロフィールへ
        </button>
        <button type="button" className="ihl-prof__crumb" onClick={() => hot(onAction, 1)}>
          マーケットへ
        </button>
      </div>
    </ProfileShell>
  );
}

export function ProfileNotificationsPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        プロフィールへ
      </PrimaryButton>
    </div>
  );
}

export { ProfileNullStatePanel as ProfileNotificationsStatePanel };
