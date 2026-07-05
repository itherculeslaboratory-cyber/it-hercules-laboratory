import {
  PtShopContentArea,
  PtShopPrimaryAction,
  PtShopStatePanel,
} from "../../components/features/economy/pt-shop";
import type { CatalogComponent } from "../overrides.types";

/** @owner 22 — PT shop O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-22-pt-shop__ContentArea": PtShopContentArea,
  "ihl-22-pt-shop__PrimaryAction": PtShopPrimaryAction,
  "ihl-22-pt-shop__StatePanel": PtShopStatePanel,
};
