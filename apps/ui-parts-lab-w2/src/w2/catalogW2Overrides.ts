import type { ComponentType } from "react";
import { COMPONENT_OVERRIDES } from "@ihl/ui-catalog/registry/overrides";
import type { CatalogComponent } from "@ihl/ui-catalog/registry/overrides.types";
import { inferW2Feature, withW2Shell } from "./withW2Shell";

/** 3100 専用 W2 実装済み — 二重ラップ禁止 */
const SKIP_PREFIXES = [
  "ihl-01-nav-home",
  "ihl-05-obs-context-picker",
  "ihl-05-obs-input-row",
  "ihl-05-obs-confirm",
  "ihl-05-obs-device-link",
  "ihl-05-obs-search-grid",
  "ihl-07-board-hub",
  "ihl-07-board-official-hub",
  "ihl-07-github-board-hub",
  "ihl-07-board-post---",
  "ihl-07-board-thread-post",
  "ihl-07-board-thread-view",
  "ihl-09-paper-board",
  "ihl-09-paper-in-progress",
  "ihl-09-paper-template-fill",
  "ihl-06-market-browse",
  "ihl-06-market-listing-detail",
  "ihl-06-market-detail-board",
  "ihl-06-market-lottery-apply",
  "ihl-06-market-priority-queue",
  "ihl-08-karma-summary",
  "ihl-10-preference-pairwise",
];

/** catalog hand UI → 3101 W2 層（B 軸 remediation · charter Q1 導線フッタ） */
export const CATALOG_W2_OVERRIDES: Record<string, CatalogComponent> = {};

for (const [componentId, Inner] of Object.entries(COMPONENT_OVERRIDES)) {
  const prefix = componentId.split("__")[0] ?? componentId;
  if (SKIP_PREFIXES.some((p) => prefix.startsWith(p))) continue;

  const feature = inferW2Feature(prefix);
  if (!feature) continue;

  CATALOG_W2_OVERRIDES[componentId] = withW2Shell(Inner as ComponentType, {
    feature,
    componentId,
  });
}
