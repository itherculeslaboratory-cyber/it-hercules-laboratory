import { ObsTemplateListContentArea, ObsTemplateListPrimaryAction, ObsTemplateListStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05tl — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-template-list__ContentArea": ObsTemplateListContentArea,
  "ihl-05-obs-template-list__PrimaryAction": ObsTemplateListPrimaryAction,
  "ihl-05-obs-template-list__StatePanel": ObsTemplateListStatePanel,
};
