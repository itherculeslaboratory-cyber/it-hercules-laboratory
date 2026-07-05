import {
  MarketDetailStage3ContentArea,
  MarketDetailStage3PrimaryAction,
  MarketDetailStage3StatePanel,
} from "../../components/features/market/detail-board";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06b-s3 — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-detail-board-stage3__ContentArea": MarketDetailStage3ContentArea,
  "ihl-06-market-detail-board-stage3__PrimaryAction": MarketDetailStage3PrimaryAction,
  "ihl-06-market-detail-board-stage3__StatePanel": MarketDetailStage3StatePanel,
};
