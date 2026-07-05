import {
  MarketListingCreateContentArea,
  MarketListingCreatePrimaryAction,
  MarketListingCreateStatePanel,
} from "../../components/features/market/listing-create";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06list — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-listing-create__ContentArea": MarketListingCreateContentArea,
  "ihl-06-market-listing-create__PrimaryAction": MarketListingCreatePrimaryAction,
  "ihl-06-market-listing-create__StatePanel": MarketListingCreateStatePanel,
};
