import {
  BoardThreadContentArea,
  BoardThreadPrimaryAction,
  BoardThreadStatePanel,
} from "../../components/features/board/thread";
import type { CatalogComponent } from "../overrides.types";

/** @owner 07b/07o — board thread O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-07-board-thread-post__ContentArea": BoardThreadContentArea,
  "ihl-07-board-thread-post__PrimaryAction": BoardThreadPrimaryAction,
  "ihl-07-board-thread-post__StatePanel": BoardThreadStatePanel,
};
