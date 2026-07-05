import {
  BoardGripeContentArea,
  BoardGripePrimaryAction,
  BoardGripeStatePanel,
} from "../../components/features/board/gripe";
import type { CatalogComponent } from "../overrides.types";

/** @owner 07g — 愚痴板 O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-07-board-post---__ContentArea": BoardGripeContentArea,
  "ihl-07-board-post---__PrimaryAction": BoardGripePrimaryAction,
  "ihl-07-board-post---__StatePanel": BoardGripeStatePanel,
};
