export type HotspotItem = {
  hotspot: string;
  label: string;
  hint?: string;
};

export type ScreenFeatureConfig = {
  title: string;
  breadcrumb: string;
  lead?: string;
  items: HotspotItem[];
  primaryLabel?: string;
  primaryHotspot?: string;
  layout?: "hub" | "thread" | "metrics" | "shop" | "vote" | "form" | "dispute" | "pairwise" | "builder-entry";
};
