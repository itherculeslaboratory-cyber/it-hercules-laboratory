import { ObsDetailSimilarContentArea, ObsDetailSimilarPrimaryAction, ObsDetailSimilarStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05b — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-detail-similar__ContentArea": ObsDetailSimilarContentArea,
  "ihl-05-obs-detail-similar__PrimaryAction": ObsDetailSimilarPrimaryAction,
  "ihl-05-obs-detail-similar__StatePanel": ObsDetailSimilarStatePanel,
};
