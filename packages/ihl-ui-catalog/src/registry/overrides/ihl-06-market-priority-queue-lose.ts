import {
  MarketPriorityLoseContentArea,
  MarketPriorityLosePrimaryAction,
  MarketPriorityLoseStatePanel,
} from "../../components/features/market/priority";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06pri-lose — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-priority-queue-lose__ContentArea": MarketPriorityLoseContentArea,
  "ihl-06-market-priority-queue-lose__PrimaryAction": MarketPriorityLosePrimaryAction,
  "ihl-06-market-priority-queue-lose__StatePanel": MarketPriorityLoseStatePanel,
};
