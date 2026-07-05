import { ObsInputMaleContentArea, ObsInputMalePrimaryAction, ObsInputMaleStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05i-m — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-input-male__ContentArea": ObsInputMaleContentArea,
  "ihl-05-obs-input-male__PrimaryAction": ObsInputMalePrimaryAction,
  "ihl-05-obs-input-male__StatePanel": ObsInputMaleStatePanel,
};
