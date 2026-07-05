import {
  MarketAuctionBidContentArea,
  MarketAuctionBidPrimaryAction,
  MarketAuctionBidStatePanel,
} from "../../components/features/market/auction";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06auc — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-auction-bid__ContentArea": MarketAuctionBidContentArea,
  "ihl-06-market-auction-bid__PrimaryAction": MarketAuctionBidPrimaryAction,
  "ihl-06-market-auction-bid__StatePanel": MarketAuctionBidStatePanel,
};
