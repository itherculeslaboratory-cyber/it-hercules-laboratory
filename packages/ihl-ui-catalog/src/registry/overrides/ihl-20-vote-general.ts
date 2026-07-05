import {
  VoteGeneralContentArea,
  VoteGeneralPrimaryAction,
  VoteGeneralStatePanel,
} from "../../components/features/vote/general";
import type { CatalogComponent } from "../overrides.types";

/** @owner 20vote — general vote O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-20-vote-general__ContentArea": VoteGeneralContentArea,
  "ihl-20-vote-general__PrimaryAction": VoteGeneralPrimaryAction,
  "ihl-20-vote-general__StatePanel": VoteGeneralStatePanel,
};
