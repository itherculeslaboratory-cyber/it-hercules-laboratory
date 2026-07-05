import {
  MarketDetailStage2ContentArea,
  MarketDetailStage2PrimaryAction,
  MarketDetailStage2StatePanel,
} from "../../components/features/market/detail-board";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06b-s2 — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-detail-board-stage2__ContentArea": MarketDetailStage2ContentArea,
  "ihl-06-market-detail-board-stage2__PrimaryAction": MarketDetailStage2PrimaryAction,
  "ihl-06-market-detail-board-stage2__StatePanel": MarketDetailStage2StatePanel,
};
