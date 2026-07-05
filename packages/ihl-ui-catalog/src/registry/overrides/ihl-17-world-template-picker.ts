import {
  TemplatePickerContentArea,
  TemplatePickerPrimaryAction,
  TemplatePickerStatePanel,
} from "../../components/features/settings/template-picker";
import type { CatalogComponent } from "../overrides.types";

/** @owner 17picker — UI template picker O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-17-world-template-picker__ContentArea": TemplatePickerContentArea,
  "ihl-17-world-template-picker__PrimaryAction": TemplatePickerPrimaryAction,
  "ihl-17-world-template-picker__StatePanel": TemplatePickerStatePanel,
};
