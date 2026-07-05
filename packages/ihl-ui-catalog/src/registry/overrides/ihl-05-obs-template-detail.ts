import { ObsTemplateDetailContentArea, ObsTemplateDetailPrimaryAction, ObsTemplateDetailStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05td — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-template-detail__ContentArea": ObsTemplateDetailContentArea,
  "ihl-05-obs-template-detail__PrimaryAction": ObsTemplateDetailPrimaryAction,
  "ihl-05-obs-template-detail__StatePanel": ObsTemplateDetailStatePanel,
};
