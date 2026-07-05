import {
  BoardHubContentArea,
  BoardHubPrimaryAction,
  BoardHubStatePanel,
} from "../../components/features/board/hub";
import type { CatalogComponent } from "../overrides.types";

/** @owner 07a — board hub O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-07-board-hub__ContentArea": BoardHubContentArea,
  "ihl-07-board-hub__PrimaryAction": BoardHubPrimaryAction,
  "ihl-07-board-hub__StatePanel": BoardHubStatePanel,
};
