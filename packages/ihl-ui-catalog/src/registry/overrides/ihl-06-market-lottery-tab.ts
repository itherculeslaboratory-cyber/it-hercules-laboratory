import {
  MarketLotteryTabContentArea,
  MarketLotteryTabPrimaryAction,
  MarketLotteryTabStatePanel,
} from "../../components/features/market/lottery";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06lot-tab — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-lottery-tab__ContentArea": MarketLotteryTabContentArea,
  "ihl-06-market-lottery-tab__PrimaryAction": MarketLotteryTabPrimaryAction,
  "ihl-06-market-lottery-tab__StatePanel": MarketLotteryTabStatePanel,
};
