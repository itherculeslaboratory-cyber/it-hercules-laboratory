import {
  MarketPriorityQueueContentArea,
  MarketPriorityQueuePrimaryAction,
  MarketPriorityQueueStatePanel,
} from "../../components/features/market/priority";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06pri-queue — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-priority-queue__ContentArea": MarketPriorityQueueContentArea,
  "ihl-06-market-priority-queue__PrimaryAction": MarketPriorityQueuePrimaryAction,
  "ihl-06-market-priority-queue__StatePanel": MarketPriorityQueueStatePanel,
};
