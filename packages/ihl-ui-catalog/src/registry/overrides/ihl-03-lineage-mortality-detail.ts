import { LineageMortalityPanel } from "../../components/LineageMortalityPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 03m — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-03-lineage-mortality-detail__MortalityListPanel": LineageMortalityPanel,
};
