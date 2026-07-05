import { createDeviceRegistryPart } from "../../components/features/_shared/DeviceRegistryParts";
import type { CatalogComponent } from "../overrides.types";

/** @owner 13 — device registry O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-13-device-registry__CollectorSetupBanner": createDeviceRegistryPart("CollectorSetupBanner", "ihl-13-device-registry__CollectorSetupBanner"),
  "ihl-13-device-registry__CsvImportBlock": createDeviceRegistryPart("CsvImportBlock", "ihl-13-device-registry__CsvImportBlock"),
  "ihl-13-device-registry__DeviceListCard": createDeviceRegistryPart("DeviceListCard", "ihl-13-device-registry__DeviceListCard"),
  "ihl-13-device-registry__ManualRegisterForm": createDeviceRegistryPart("ManualRegisterForm", "ihl-13-device-registry__ManualRegisterForm"),
};
