import type { ComponentType } from "react";
import type { W2ComponentProps } from "../../types/w2";
import { createBuilderPart } from "./_shared/BuilderParts";
import { createDeviceRegistryPart } from "./_shared/DeviceRegistryParts";
import { createContentArea, createPrimaryAction, createStatePanel } from "./_shared/StandardParts";

export type HandCatalogComponent = ComponentType<W2ComponentProps>;

/** 標準 3 部品セット（ContentArea / PrimaryAction / StatePanel） */
const STANDARD_PREFIXES = [
  "ihl-07-board-hub",
  "ihl-07-board-thread-post",
  "ihl-07-board-post---",
  "ihl-19-component-board",
  "ihl-12-settings-hub",
  "ihl-12-settings-pii",
  "ihl-17-world-template-picker",
  "ihl-profile-three-metrics",
  "ihl-08-karma-summary",
  "ihl-14-contribution-badge",
  "ihl-22-pt-shop",
  "ihl-10-preference-pairwise",
  "ihl-11-dispute-tworoom",
  "ihl-20-vote-general",
  "ihl-16-edit-this-screen-entry",
] as const;

const DEVICE_REGIONS = [
  "CollectorSetupBanner",
  "CsvImportBlock",
  "DeviceListCard",
  "ManualRegisterForm",
] as const;

const BUILDER_REGIONS = ["BuilderShell", "CanvasDropZone", "LintPanel", "PartsPalette", "SaveBar"] as const;

function registerStandardTriplet(map: Record<string, HandCatalogComponent>, prefix: string) {
  map[`${prefix}__ContentArea`] = createContentArea(`${prefix}__ContentArea`);
  map[`${prefix}__PrimaryAction`] = createPrimaryAction(`${prefix}__PrimaryAction`);
  map[`${prefix}__StatePanel`] = createStatePanel(`${prefix}__StatePanel`);
}

function buildHandComponentMap(): Record<string, HandCatalogComponent> {
  const map: Record<string, HandCatalogComponent> = {};

  for (const prefix of STANDARD_PREFIXES) {
    registerStandardTriplet(map, prefix);
  }

  for (const region of DEVICE_REGIONS) {
    const id = `ihl-13-device-registry__${region}`;
    map[id] = createDeviceRegistryPart(region, id);
  }

  for (const region of BUILDER_REGIONS) {
    const id = `ihl-16-uibuilder-canvas__${region}`;
    map[id] = createBuilderPart(region, id);
  }

  return map;
}

export const FEATURE_HAND_COMPONENTS = buildHandComponentMap();

/** w2-generate manualComponents 用 — O2 hand 登録 id 一覧 */
export const FEATURE_HAND_COMPONENT_IDS = Object.keys(FEATURE_HAND_COMPONENTS);
