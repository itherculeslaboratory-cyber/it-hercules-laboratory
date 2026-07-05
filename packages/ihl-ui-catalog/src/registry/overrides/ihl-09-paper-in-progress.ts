import { PaperInProgressPanel } from "../../components/PaperInProgressPanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 09 — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-09-paper-in-progress__PaperProgressPanel": PaperInProgressPanel,
};
