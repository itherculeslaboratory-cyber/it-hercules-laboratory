import {
  ContributionContentArea,
  ContributionPrimaryAction,
  ContributionStatePanel,
} from "../../components/features/profile/contribution";
import type { CatalogComponent } from "../overrides.types";

/** @owner 14 — contribution badge O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-14-contribution-badge__ContentArea": ContributionContentArea,
  "ihl-14-contribution-badge__PrimaryAction": ContributionPrimaryAction,
  "ihl-14-contribution-badge__StatePanel": ContributionStatePanel,
};
