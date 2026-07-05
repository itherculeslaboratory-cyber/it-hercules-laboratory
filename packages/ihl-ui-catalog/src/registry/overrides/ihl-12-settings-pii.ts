import {
  SettingsPiiContentArea,
  SettingsPiiPrimaryAction,
  SettingsPiiStatePanel,
} from "../../components/features/settings/pii";
import type { CatalogComponent } from "../overrides.types";

/** @owner 12pii — settings PII O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-12-settings-pii__ContentArea": SettingsPiiContentArea,
  "ihl-12-settings-pii__PrimaryAction": SettingsPiiPrimaryAction,
  "ihl-12-settings-pii__StatePanel": SettingsPiiStatePanel,
};
