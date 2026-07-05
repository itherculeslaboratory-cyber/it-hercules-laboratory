import type { CatalogComponent } from "../../../registry/overrides.types";
import {
  MarketAuctionBidContentArea,
  MarketAuctionBidPrimaryAction,
  MarketAuctionBidStatePanel,
} from "./auction";
import {
  MarketBrowseContentArea,
  MarketBrowsePrimaryAction,
  MarketBrowseStatePanel,
} from "./browse";
import {
  MarketDetailBoardContentArea,
  MarketDetailBoardPrimaryAction,
  MarketDetailBoardStatePanel,
  MarketDetailStage2ContentArea,
  MarketDetailStage2PrimaryAction,
  MarketDetailStage2StatePanel,
  MarketDetailStage3ContentArea,
  MarketDetailStage3PrimaryAction,
  MarketDetailStage3StatePanel,
} from "./detail-board";
import {
  GmoTransferCodeDisplay,
  GmoTransferFeeBreakdown,
  GmoTransferPanel,
  GmoTransferStatusChip,
} from "./gmo-transfer";
import {
  MarketListingCreateContentArea,
  MarketListingCreatePrimaryAction,
  MarketListingCreateStatePanel,
} from "./listing-create";
import {
  MarketLotteryApplyContentArea,
  MarketLotteryApplyPrimaryAction,
  MarketLotteryApplyStatePanel,
  MarketLotteryLoseContentArea,
  MarketLotteryLosePrimaryAction,
  MarketLotteryLoseStatePanel,
  MarketLotteryResultContentArea,
  MarketLotteryResultPrimaryAction,
  MarketLotteryResultStatePanel,
  MarketLotteryTabContentArea,
  MarketLotteryTabPrimaryAction,
  MarketLotteryTabStatePanel,
} from "./lottery";
import {
  MarketPriorityLoseContentArea,
  MarketPriorityLosePrimaryAction,
  MarketPriorityLoseStatePanel,
  MarketPriorityQueueContentArea,
  MarketPriorityQueuePrimaryAction,
  MarketPriorityQueueStatePanel,
  MarketPriorityTabContentArea,
  MarketPriorityTabPrimaryAction,
  MarketPriorityTabStatePanel,
} from "./priority";
import {
  MarketSocialContentArea,
  MarketSocialPrimaryAction,
  MarketSocialStatePanel,
} from "./social";

/** 06 マーケット + 23 GMO — COMPONENT_OVERRIDES 用マップ */
export const MARKET_COMPONENT_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-06-market-browse__ContentArea": MarketBrowseContentArea,
  "ihl-06-market-browse__PrimaryAction": MarketBrowsePrimaryAction,
  "ihl-06-market-browse__StatePanel": MarketBrowseStatePanel,

  "ihl-06-market-listing-create__ContentArea": MarketListingCreateContentArea,
  "ihl-06-market-listing-create__PrimaryAction": MarketListingCreatePrimaryAction,
  "ihl-06-market-listing-create__StatePanel": MarketListingCreateStatePanel,

  "ihl-06-market-detail-board__ContentArea": MarketDetailBoardContentArea,
  "ihl-06-market-detail-board__PrimaryAction": MarketDetailBoardPrimaryAction,
  "ihl-06-market-detail-board__StatePanel": MarketDetailBoardStatePanel,

  "ihl-06-market-detail-board-stage2__ContentArea": MarketDetailStage2ContentArea,
  "ihl-06-market-detail-board-stage2__PrimaryAction": MarketDetailStage2PrimaryAction,
  "ihl-06-market-detail-board-stage2__StatePanel": MarketDetailStage2StatePanel,

  "ihl-06-market-detail-board-stage3__ContentArea": MarketDetailStage3ContentArea,
  "ihl-06-market-detail-board-stage3__PrimaryAction": MarketDetailStage3PrimaryAction,
  "ihl-06-market-detail-board-stage3__StatePanel": MarketDetailStage3StatePanel,

  "ihl-06-market-lottery-tab__ContentArea": MarketLotteryTabContentArea,
  "ihl-06-market-lottery-tab__PrimaryAction": MarketLotteryTabPrimaryAction,
  "ihl-06-market-lottery-tab__StatePanel": MarketLotteryTabStatePanel,

  "ihl-06-market-lottery-apply__ContentArea": MarketLotteryApplyContentArea,
  "ihl-06-market-lottery-apply__PrimaryAction": MarketLotteryApplyPrimaryAction,
  "ihl-06-market-lottery-apply__StatePanel": MarketLotteryApplyStatePanel,

  "ihl-06-market-lottery-result__ContentArea": MarketLotteryResultContentArea,
  "ihl-06-market-lottery-result__PrimaryAction": MarketLotteryResultPrimaryAction,
  "ihl-06-market-lottery-result__StatePanel": MarketLotteryResultStatePanel,

  "ihl-06-market-lottery-result-lose__ContentArea": MarketLotteryLoseContentArea,
  "ihl-06-market-lottery-result-lose__PrimaryAction": MarketLotteryLosePrimaryAction,
  "ihl-06-market-lottery-result-lose__StatePanel": MarketLotteryLoseStatePanel,

  "ihl-06-market-priority-tab__ContentArea": MarketPriorityTabContentArea,
  "ihl-06-market-priority-tab__PrimaryAction": MarketPriorityTabPrimaryAction,
  "ihl-06-market-priority-tab__StatePanel": MarketPriorityTabStatePanel,

  "ihl-06-market-priority-queue__ContentArea": MarketPriorityQueueContentArea,
  "ihl-06-market-priority-queue__PrimaryAction": MarketPriorityQueuePrimaryAction,
  "ihl-06-market-priority-queue__StatePanel": MarketPriorityQueueStatePanel,

  "ihl-06-market-priority-queue-lose__ContentArea": MarketPriorityLoseContentArea,
  "ihl-06-market-priority-queue-lose__PrimaryAction": MarketPriorityLosePrimaryAction,
  "ihl-06-market-priority-queue-lose__StatePanel": MarketPriorityLoseStatePanel,

  "ihl-06-market-auction-bid__ContentArea": MarketAuctionBidContentArea,
  "ihl-06-market-auction-bid__PrimaryAction": MarketAuctionBidPrimaryAction,
  "ihl-06-market-auction-bid__StatePanel": MarketAuctionBidStatePanel,

  "ihl-06-market-social__ContentArea": MarketSocialContentArea,
  "ihl-06-market-social__PrimaryAction": MarketSocialPrimaryAction,
  "ihl-06-market-social__StatePanel": MarketSocialStatePanel,

  "ihl-23-gmo-transfer__FeeBreakdown": GmoTransferFeeBreakdown,
  "ihl-23-gmo-transfer__GmoTransferPanel": GmoTransferPanel,
  "ihl-23-gmo-transfer__StatusChip": GmoTransferStatusChip,
  "ihl-23-gmo-transfer__TransferCodeDisplay": GmoTransferCodeDisplay,
};
