import {
  MarketLotteryApplyContentArea,
  MarketLotteryApplyPrimaryAction,
  MarketLotteryApplyStatePanel,
} from "../../components/features/market/lottery";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06lot-apply — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-lottery-apply__ContentArea": MarketLotteryApplyContentArea,
  "ihl-06-market-lottery-apply__PrimaryAction": MarketLotteryApplyPrimaryAction,
  "ihl-06-market-lottery-apply__StatePanel": MarketLotteryApplyStatePanel,
};
