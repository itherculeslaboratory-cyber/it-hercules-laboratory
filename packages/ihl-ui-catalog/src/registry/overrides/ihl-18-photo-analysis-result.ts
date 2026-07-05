import { PhotoAnalysisResultContentArea, PhotoAnalysisResultPrimaryAction, PhotoAnalysisResultStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 18photo — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-18-photo-analysis-result__ContentArea": PhotoAnalysisResultContentArea,
  "ihl-18-photo-analysis-result__PrimaryAction": PhotoAnalysisResultPrimaryAction,
  "ihl-18-photo-analysis-result__StatePanel": PhotoAnalysisResultStatePanel,
};
