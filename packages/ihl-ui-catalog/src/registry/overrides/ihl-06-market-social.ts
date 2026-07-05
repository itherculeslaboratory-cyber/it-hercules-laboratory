import {
  MarketSocialContentArea,
  MarketSocialPrimaryAction,
  MarketSocialStatePanel,
} from "../../components/features/market/social";
import type { CatalogComponent } from "../overrides.types";

/** @owner 06soc — market O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-social__ContentArea": MarketSocialContentArea,
  "ihl-06-market-social__PrimaryAction": MarketSocialPrimaryAction,
  "ihl-06-market-social__StatePanel": MarketSocialStatePanel,
};
