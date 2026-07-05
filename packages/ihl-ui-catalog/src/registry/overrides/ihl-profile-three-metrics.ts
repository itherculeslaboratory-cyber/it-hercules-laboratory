import { ProfileContentArea, ProfilePrimaryAction, ProfileStatePanel } from "../../components/features/profile";
import type { CatalogComponent } from "../overrides.types";

/** @owner PR/PRnotif — profile O2 hand UI (screenId で差分) */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-profile-three-metrics__ContentArea": ProfileContentArea,
  "ihl-profile-three-metrics__PrimaryAction": ProfilePrimaryAction,
  "ihl-profile-three-metrics__StatePanel": ProfileStatePanel,
};
