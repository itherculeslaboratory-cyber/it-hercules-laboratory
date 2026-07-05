import { LineageGrowthPanel } from "../../components/LineageGrowthPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 03g — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-03-lineage-growth-detail__GrowthDetailPanel": LineageGrowthPanel,
};
