import {
  MarketPriorityTabContentArea,
  MarketPriorityTabPrimaryAction,
  MarketPriorityTabStatePanel,
} from "../../components/features/market/priority";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06pri-tab — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-priority-tab__ContentArea": MarketPriorityTabContentArea,
  "ihl-06-market-priority-tab__PrimaryAction": MarketPriorityTabPrimaryAction,
  "ihl-06-market-priority-tab__StatePanel": MarketPriorityTabStatePanel,
};
