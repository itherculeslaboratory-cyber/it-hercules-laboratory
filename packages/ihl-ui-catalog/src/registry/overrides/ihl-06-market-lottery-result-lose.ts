import {
  MarketLotteryLoseContentArea,
  MarketLotteryLosePrimaryAction,
  MarketLotteryLoseStatePanel,
} from "../../components/features/market/lottery";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06lot-lose — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-lottery-result-lose__ContentArea": MarketLotteryLoseContentArea,
  "ihl-06-market-lottery-result-lose__PrimaryAction": MarketLotteryLosePrimaryAction,
  "ihl-06-market-lottery-result-lose__StatePanel": MarketLotteryLoseStatePanel,
};
