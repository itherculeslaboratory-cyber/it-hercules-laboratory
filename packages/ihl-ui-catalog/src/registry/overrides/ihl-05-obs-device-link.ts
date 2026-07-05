import { ObsDeviceLinkContentArea, ObsDeviceLinkPrimaryAction, ObsDeviceLinkStatePanel } from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05iot — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-device-link__ContentArea": ObsDeviceLinkContentArea,
  "ihl-05-obs-device-link__PrimaryAction": ObsDeviceLinkPrimaryAction,
  "ihl-05-obs-device-link__StatePanel": ObsDeviceLinkStatePanel,
};
