import {
  MarketBrowseContentArea,
  MarketBrowsePrimaryAction,
  MarketBrowseStatePanel,
} from "../../components/features/market/browse";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06a — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-browse__ContentArea": MarketBrowseContentArea,
  "ihl-06-market-browse__PrimaryAction": MarketBrowsePrimaryAction,
  "ihl-06-market-browse__StatePanel": MarketBrowseStatePanel,
};
