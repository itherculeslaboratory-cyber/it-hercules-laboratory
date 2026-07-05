import { LineageCrossPanel } from "../../components/LineageCrossPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 03 — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-03-lineage-cross__CrossDashboardPanel": LineageCrossPanel,
};
