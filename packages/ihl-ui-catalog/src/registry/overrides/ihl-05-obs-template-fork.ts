import { ObsTemplateForkContentArea, ObsTemplateForkPrimaryAction, ObsTemplateForkStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05fork — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-template-fork__ContentArea": ObsTemplateForkContentArea,
  "ihl-05-obs-template-fork__PrimaryAction": ObsTemplateForkPrimaryAction,
  "ihl-05-obs-template-fork__StatePanel": ObsTemplateForkStatePanel,
};
