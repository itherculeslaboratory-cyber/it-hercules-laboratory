import { ObsContextPickerContentArea, ObsContextPickerPrimaryAction, ObsContextPickerStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05ctx — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-context-picker__ContentArea": ObsContextPickerContentArea,
  "ihl-05-obs-context-picker__PrimaryAction": ObsContextPickerPrimaryAction,
  "ihl-05-obs-context-picker__StatePanel": ObsContextPickerStatePanel,
};
