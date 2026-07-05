import {
  ComponentBoardContentArea,
  ComponentBoardPrimaryAction,
  ComponentBoardStatePanel,
} from "../../components/features/board/component-board";
import type { CatalogComponent } from "../overrides.types";

/** @owner 19board — component board O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-19-component-board__ContentArea": ComponentBoardContentArea,
  "ihl-19-component-board__PrimaryAction": ComponentBoardPrimaryAction,
  "ihl-19-component-board__StatePanel": ComponentBoardStatePanel,
};
