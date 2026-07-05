import {
  PairwiseContentArea,
  PairwisePrimaryAction,
  PairwiseStatePanel,
} from "../../components/features/vote/pairwise";
import type { CatalogComponent } from "../overrides.types";

/** @owner 10 — preference pairwise O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-10-preference-pairwise__ContentArea": PairwiseContentArea,
  "ihl-10-preference-pairwise__PrimaryAction": PairwisePrimaryAction,
  "ihl-10-preference-pairwise__StatePanel": PairwiseStatePanel,
};
