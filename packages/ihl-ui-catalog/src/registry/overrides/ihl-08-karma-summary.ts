import {
  KarmaSummaryContentArea,
  KarmaSummaryPrimaryAction,
  KarmaSummaryStatePanel,
} from "../../components/features/profile/karma";
import type { CatalogComponent } from "../overrides.types";

/** @owner 08 — karma summary O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-08-karma-summary__ContentArea": KarmaSummaryContentArea,
  "ihl-08-karma-summary__PrimaryAction": KarmaSummaryPrimaryAction,
  "ihl-08-karma-summary__StatePanel": KarmaSummaryStatePanel,
};
