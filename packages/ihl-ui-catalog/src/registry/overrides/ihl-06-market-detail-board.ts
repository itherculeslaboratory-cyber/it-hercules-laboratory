import {
  MarketDetailBoardContentArea,
  MarketDetailBoardPrimaryAction,
  MarketDetailBoardStatePanel,
} from "../../components/features/market/detail-board";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06b — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-detail-board__ContentArea": MarketDetailBoardContentArea,
  "ihl-06-market-detail-board__PrimaryAction": MarketDetailBoardPrimaryAction,
  "ihl-06-market-detail-board__StatePanel": MarketDetailBoardStatePanel,
};
