import {
  SettingsHubContentArea,
  SettingsHubPrimaryAction,
  SettingsHubStatePanel,
} from "../../components/features/settings/hub";
import type { CatalogComponent } from "../overrides.types";

/** @owner 12hub — settings hub O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-12-settings-hub__ContentArea": SettingsHubContentArea,
  "ihl-12-settings-hub__PrimaryAction": SettingsHubPrimaryAction,
  "ihl-12-settings-hub__StatePanel": SettingsHubStatePanel,
};
