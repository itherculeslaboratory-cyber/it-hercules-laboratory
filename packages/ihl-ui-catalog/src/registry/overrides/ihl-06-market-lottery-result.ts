import {
  MarketLotteryResultContentArea,
  MarketLotteryResultPrimaryAction,
  MarketLotteryResultStatePanel,
} from "../../components/features/market/lottery";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06lot-result — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-lottery-result__ContentArea": MarketLotteryResultContentArea,
  "ihl-06-market-lottery-result__PrimaryAction": MarketLotteryResultPrimaryAction,
  "ihl-06-market-lottery-result__StatePanel": MarketLotteryResultStatePanel,
};
