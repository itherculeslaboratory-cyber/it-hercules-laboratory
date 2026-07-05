import {
  ObsSearchGridContentArea,
  ObsSearchGridEmptyState,
  ObsSearchGridPagination,
  ObsSearchGridResultGridCard,
  ObsSearchGridSearchFilterBar,
} from "../../components/features/observation";
import type { CatalogComponent } from "../overrides.types";

/** @owner 05a — observation O2 hand UI */
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-05-obs-search-grid__ContentArea": ObsSearchGridContentArea,
  "ihl-05-obs-search-grid__EmptyState": ObsSearchGridEmptyState,
  "ihl-05-obs-search-grid__Pagination": ObsSearchGridPagination,
  "ihl-05-obs-search-grid__ResultGridCard": ObsSearchGridResultGridCard,
  "ihl-05-obs-search-grid__SearchFilterBar": ObsSearchGridSearchFilterBar,
};
