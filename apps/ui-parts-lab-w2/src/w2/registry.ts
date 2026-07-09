import type { ComponentType } from "react";

import type { CatalogComponent } from "@ihl/ui-catalog/registry";

import { resolveCatalogComponent } from "@ihl/ui-catalog/registry";

import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";

import { CATALOG_W2_OVERRIDES } from "./catalogW2Overrides";

import { HomeCommandPanelW2 } from "./HomeCommandPanelW2";

import {

  MarketBrowseContentAreaW2,

  MarketBrowsePrimaryActionW2,

  MarketBrowseStatePanelW2,

} from "./MarketBrowseW2";

import {

  MarketDetailBoardContentAreaW2,

  MarketDetailBoardPrimaryActionW2,

  MarketDetailBoardStatePanelW2,

} from "./MarketDetailBoardW2";

import {

  MarketListingDetailContentAreaW2,

  MarketListingDetailPrimaryActionW2,

  MarketListingDetailStatePanelW2,

} from "./MarketListingDetailW2";

import {

  MarketBidEntryContentAreaW2,

  MarketBidEntryPrimaryActionW2,

  MarketBidEntryStatePanelW2,

} from "./MarketBidEntryW2";

import {

  MarketLotteryApplyContentAreaW2,

  MarketLotteryApplyPrimaryActionW2,

  MarketLotteryApplyStatePanelW2,

} from "./MarketLotteryApplyW2";

import {

  MarketPriorityApplyContentAreaW2,

  MarketPriorityApplyPrimaryActionW2,

  MarketPriorityApplyStatePanelW2,

} from "./MarketPriorityApplyW2";

import {

  KarmaSummaryContentAreaW2,

  KarmaSummaryPrimaryActionW2,

  KarmaSummaryStatePanelW2,

} from "./KarmaSummaryW2";

import {

  ProfileContentAreaW2,

  ProfilePrimaryActionW2,

  ProfileStatePanelW2,

} from "./ProfileW2";

import {

  ObsConfirmContentAreaW2,

  ObsConfirmPrimaryActionW2,

  ObsConfirmStatePanelW2,

  ObsDeviceLinkContentAreaW2,

  ObsDeviceLinkPrimaryActionW2,

  ObsDeviceLinkStatePanelW2,

  ObsInputRowContentAreaW2,

  ObsInputRowPrimaryActionW2,

  ObsInputRowStatePanelW2,

} from "./ObsRegistrationW2";

import {

  ObsContextPickerContentAreaW2,

  ObsContextPickerPrimaryActionW2,

  ObsContextPickerStatePanelW2,

} from "./ObsContextPickerW2";

import {

  PreferenceLearningContentAreaW2,

  PreferenceLearningPrimaryActionW2,

  PreferenceLearningStatePanelW2,

} from "./PreferenceLearningW2";

import {

  ObsSearchContentAreaW2,

  ObsSearchPrimaryActionW2,

  ObsSearchStatePanelW2,

} from "./ObsSearchW2";

import {

  BoardHubContentAreaW2,

  BoardHubPrimaryActionW2,

  BoardHubStatePanelW2,

} from "./BoardHubW2";

import {

  OfficialBoardHubContentAreaW2,

  OfficialBoardHubPrimaryActionW2,

  OfficialBoardHubStatePanelW2,

} from "./OfficialBoardHubW2";

import {

  GitHubBoardHubContentAreaW2,

  GitHubBoardHubPrimaryActionW2,

  GitHubBoardHubStatePanelW2,

} from "./GitHubBoardHubW2";

import {

  BoardGripeContentAreaW2,

  BoardGripePrimaryActionW2,

  BoardGripeStatePanelW2,

  BoardImproveContentAreaW2,

  BoardImprovePrimaryActionW2,

  BoardImproveStatePanelW2,

} from "./BoardThreadListW2";

import {

  BoardThreadViewContentAreaW2,

  BoardThreadViewPrimaryActionW2,

  BoardThreadViewStatePanelW2,

} from "./BoardThreadViewW2";

import { PaperProgressPanelW2 } from "./PaperProgressW2";

import { PaperTemplateFillPanelW2 } from "./PaperTemplateFillW2";



/** 3101 専用コンポーネント上書き — 3100 catalog 非改変 · B 軸 W2 hand UI */

const DEDICATED_W2_OVERRIDES: Record<string, CatalogComponent> = {

  "ihl-01-nav-home__HomeCommandPanel": HomeCommandPanelW2,

  "ihl-06-market-browse__ContentArea": MarketBrowseContentAreaW2,

  "ihl-06-market-browse__PrimaryAction": MarketBrowsePrimaryActionW2,

  "ihl-06-market-browse__StatePanel": MarketBrowseStatePanelW2,

  "ihl-06-market-listing-detail__ContentArea": MarketListingDetailContentAreaW2,

  "ihl-06-market-listing-detail__PrimaryAction": MarketListingDetailPrimaryActionW2,

  "ihl-06-market-listing-detail__StatePanel": MarketListingDetailStatePanelW2,

  "ihl-06-market-auction-bid__ContentArea": MarketBidEntryContentAreaW2,

  "ihl-06-market-auction-bid__PrimaryAction": MarketBidEntryPrimaryActionW2,

  "ihl-06-market-auction-bid__StatePanel": MarketBidEntryStatePanelW2,

  "ihl-06-market-lottery-apply__ContentArea": MarketLotteryApplyContentAreaW2,

  "ihl-06-market-lottery-apply__PrimaryAction": MarketLotteryApplyPrimaryActionW2,

  "ihl-06-market-lottery-apply__StatePanel": MarketLotteryApplyStatePanelW2,

  "ihl-06-market-priority-queue__ContentArea": MarketPriorityApplyContentAreaW2,

  "ihl-06-market-priority-queue__PrimaryAction": MarketPriorityApplyPrimaryActionW2,

  "ihl-06-market-priority-queue__StatePanel": MarketPriorityApplyStatePanelW2,

  "ihl-06-market-detail-board__ContentArea": MarketDetailBoardContentAreaW2,

  "ihl-06-market-detail-board__PrimaryAction": MarketDetailBoardPrimaryActionW2,

  "ihl-06-market-detail-board__StatePanel": MarketDetailBoardStatePanelW2,

  "ihl-profile-three-metrics__ContentArea": ProfileContentAreaW2,

  "ihl-profile-three-metrics__PrimaryAction": ProfilePrimaryActionW2,

  "ihl-profile-three-metrics__StatePanel": ProfileStatePanelW2,

  "ihl-08-karma-summary__ContentArea": KarmaSummaryContentAreaW2,

  "ihl-08-karma-summary__PrimaryAction": KarmaSummaryPrimaryActionW2,

  "ihl-08-karma-summary__StatePanel": KarmaSummaryStatePanelW2,

  "ihl-05-obs-context-picker__ContentArea": ObsContextPickerContentAreaW2,

  "ihl-05-obs-context-picker__PrimaryAction": ObsContextPickerPrimaryActionW2,

  "ihl-05-obs-context-picker__StatePanel": ObsContextPickerStatePanelW2,

  "ihl-05-obs-input-row__ContentArea": ObsInputRowContentAreaW2,

  "ihl-05-obs-input-row__PrimaryAction": ObsInputRowPrimaryActionW2,

  "ihl-05-obs-input-row__StatePanel": ObsInputRowStatePanelW2,

  "ihl-05-obs-device-link__ContentArea": ObsDeviceLinkContentAreaW2,

  "ihl-05-obs-device-link__PrimaryAction": ObsDeviceLinkPrimaryActionW2,

  "ihl-05-obs-device-link__StatePanel": ObsDeviceLinkStatePanelW2,

  "ihl-05-obs-confirm__ContentArea": ObsConfirmContentAreaW2,

  "ihl-05-obs-confirm__PrimaryAction": ObsConfirmPrimaryActionW2,

  "ihl-05-obs-confirm__StatePanel": ObsConfirmStatePanelW2,

  "ihl-10-preference-pairwise__ContentArea": PreferenceLearningContentAreaW2,

  "ihl-10-preference-pairwise__PrimaryAction": PreferenceLearningPrimaryActionW2,

  "ihl-10-preference-pairwise__StatePanel": PreferenceLearningStatePanelW2,

  "ihl-05-obs-search-grid__ContentArea": ObsSearchContentAreaW2,

  "ihl-05-obs-search-grid__PrimaryAction": ObsSearchPrimaryActionW2,

  "ihl-05-obs-search-grid__StatePanel": ObsSearchStatePanelW2,

  "ihl-07-board-hub__ContentArea": BoardHubContentAreaW2,

  "ihl-07-board-hub__PrimaryAction": BoardHubPrimaryActionW2,

  "ihl-07-board-hub__StatePanel": BoardHubStatePanelW2,

  "ihl-07-board-official-hub__ContentArea": OfficialBoardHubContentAreaW2,

  "ihl-07-board-official-hub__PrimaryAction": OfficialBoardHubPrimaryActionW2,

  "ihl-07-board-official-hub__StatePanel": OfficialBoardHubStatePanelW2,

  "ihl-07-github-board-hub__ContentArea": GitHubBoardHubContentAreaW2,

  "ihl-07-github-board-hub__PrimaryAction": GitHubBoardHubPrimaryActionW2,

  "ihl-07-github-board-hub__StatePanel": GitHubBoardHubStatePanelW2,

  "ihl-07-board-post---__ContentArea": BoardGripeContentAreaW2,

  "ihl-07-board-post---__PrimaryAction": BoardGripePrimaryActionW2,

  "ihl-07-board-post---__StatePanel": BoardGripeStatePanelW2,

  "ihl-07-board-thread-post__ContentArea": BoardImproveContentAreaW2,

  "ihl-07-board-thread-post__PrimaryAction": BoardImprovePrimaryActionW2,

  "ihl-07-board-thread-post__StatePanel": BoardImproveStatePanelW2,

  "ihl-07-board-thread-view__ContentArea": BoardThreadViewContentAreaW2,

  "ihl-07-board-thread-view__PrimaryAction": BoardThreadViewPrimaryActionW2,

  "ihl-07-board-thread-view__StatePanel": BoardThreadViewStatePanelW2,

  "ihl-09-paper-in-progress__PaperProgressPanel": PaperProgressPanelW2 as ComponentType<W2ComponentProps>,

  "ihl-09-paper-template-fill__PaperTemplatePanel": PaperTemplateFillPanelW2 as ComponentType<W2ComponentProps>,

};



export const W2_COMPONENT_OVERRIDES: Record<string, CatalogComponent> = {

  ...CATALOG_W2_OVERRIDES,

  ...DEDICATED_W2_OVERRIDES,

};



export function resolveW2CatalogComponent(componentId: string): ComponentType<W2ComponentProps> | null {

  return W2_COMPONENT_OVERRIDES[componentId] ?? resolveCatalogComponent(componentId);

}



/** Team 6 AUDIT — W2 registry 登録済み walkId（redirect エイリアス含む） */

export const W2_PATCHED_WALK_IDS = new Set([

  "01",

  "O1",

  "O2",

  "O3",

  "03",

  "03g",

  "03m",

  "03met",

  "05a",

  "05b",

  "05confirm",

  "05ctx",

  "05fork",

  "05i",

  "05i-f",

  "05i-m",

  "05iot",

  "05td",

  "05tl",

  "06a",

  "06detail",

  "06bid",

  "06priority-apply",

  "06lot-apply",

  "06b",

  "06b-s2",

  "06b-s3",

  "06auc",

  "06list",

  "06lot-tab",

  "06lot-apply",

  "06lot-result",

  "06lot-lose",

  "06pri-tab",

  "06pri-queue",

  "06pri-lose",

  "06soc",

  "07a",

  "07a-official",

  "07-thread",

  "07gh",

  "07b",

  "07g",

  "07o",

  "08",

  "09",

  "09t",

  "10",

  "11",

  "12hub",

  "12pii",

  "13",

  "14",

  "16",

  "16e",

  "17picker",

  "18photo",

  "19board",

  "20vote",

  "22",

  "23",

  "PR",

  "PRnotif",

]);



export function isW2PatchedWalkId(walkId: string): boolean {

  return W2_PATCHED_WALK_IDS.has(walkId);

}


