import { PaperTemplatePanel } from "../../components/PaperTemplatePanel";
import type { CatalogComponent } from "../overrides.types";

/** @owner 09t — single MainPanel O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-09-paper-template-fill__PaperTemplatePanel": PaperTemplatePanel,
};
