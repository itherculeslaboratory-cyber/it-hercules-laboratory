import { ObsInputFemaleContentArea, ObsInputFemalePrimaryAction, ObsInputFemaleStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05i-f — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-input-female__ContentArea": ObsInputFemaleContentArea,
  "ihl-05-obs-input-female__PrimaryAction": ObsInputFemalePrimaryAction,
  "ihl-05-obs-input-female__StatePanel": ObsInputFemaleStatePanel,
};
