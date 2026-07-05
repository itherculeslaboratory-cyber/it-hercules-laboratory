import {
  BuilderEntryContentArea,
  BuilderEntryPrimaryAction,
  BuilderEntryStatePanel,
} from "../../components/features/builder/entry";
import type { CatalogComponent } from "../overrides.types";

/** @owner 16e — builder entry O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-16-edit-this-screen-entry__ContentArea": BuilderEntryContentArea,
  "ihl-16-edit-this-screen-entry__PrimaryAction": BuilderEntryPrimaryAction,
  "ihl-16-edit-this-screen-entry__StatePanel": BuilderEntryStatePanel,
};
