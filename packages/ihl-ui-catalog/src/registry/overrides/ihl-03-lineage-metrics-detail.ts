import { LineageMetricsPanel } from "../../components/LineageMetricsPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 03met — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-03-lineage-metrics-detail__MetricsDetailPanel": LineageMetricsPanel,
};
