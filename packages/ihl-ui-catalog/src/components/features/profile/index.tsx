import type { W2ComponentProps } from "../../../types/w2";
import {
  ProfileMetricsContentArea,
  ProfileMetricsPrimaryAction,
  ProfileMetricsStatePanel,
} from "./metrics";
import {
  ProfileNotificationsContentArea,
  ProfileNotificationsPrimaryAction,
  ProfileNotificationsStatePanel,
} from "./notifications";

/** PR / PRnotif 共有 component_id — screenId で差分 */
export function ProfileContentArea(props: W2ComponentProps) {
  if (props.screenId === "PRnotif") return <ProfileNotificationsContentArea {...props} />;
  return <ProfileMetricsContentArea {...props} />;
}

export function ProfilePrimaryAction(props: W2ComponentProps) {
  if (props.screenId === "PRnotif") return <ProfileNotificationsPrimaryAction {...props} />;
  return <ProfileMetricsPrimaryAction {...props} />;
}

export function ProfileStatePanel(props: W2ComponentProps) {
  if (props.screenId === "PRnotif") return <ProfileNotificationsStatePanel {...props} />;
  return <ProfileMetricsStatePanel {...props} />;
}
