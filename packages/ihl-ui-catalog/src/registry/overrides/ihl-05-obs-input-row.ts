import { ObsInputRowContentArea, ObsInputRowPrimaryAction, ObsInputRowStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05i — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-input-row__ContentArea": ObsInputRowContentArea,
  "ihl-05-obs-input-row__PrimaryAction": ObsInputRowPrimaryAction,
  "ihl-05-obs-input-row__StatePanel": ObsInputRowStatePanel,
};
