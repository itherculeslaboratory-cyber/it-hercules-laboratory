import {
  DisputeContentArea,
  DisputePrimaryAction,
  DisputeStatePanel,
} from "../../components/features/dispute/tworoom";
import type { CatalogComponent } from "../overrides.types";

/** @owner 11 — dispute tworoom O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-11-dispute-tworoom__ContentArea": DisputeContentArea,
  "ihl-11-dispute-tworoom__PrimaryAction": DisputePrimaryAction,
  "ihl-11-dispute-tworoom__StatePanel": DisputeStatePanel,
};
