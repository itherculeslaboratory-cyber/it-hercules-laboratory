import { HomeCommandPanel } from "../../components/HomeCommandPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 01 — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-01-nav-home__HomeCommandPanel": HomeCommandPanel,
};
