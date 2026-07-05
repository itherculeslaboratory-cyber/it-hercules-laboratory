import {
  GmoTransferCodeDisplay,
  GmoTransferFeeBreakdown,
  GmoTransferPanel,
  GmoTransferStatusChip,
} from "../../components/features/market/gmo-transfer";
import type { CatalogComponent } from "../overrides.types";

/** @owner 23 — GMO transfer custom regions */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-23-gmo-transfer__FeeBreakdown": GmoTransferFeeBreakdown,
  "ihl-23-gmo-transfer__GmoTransferPanel": GmoTransferPanel,
  "ihl-23-gmo-transfer__StatusChip": GmoTransferStatusChip,
  "ihl-23-gmo-transfer__TransferCodeDisplay": GmoTransferCodeDisplay,
};
