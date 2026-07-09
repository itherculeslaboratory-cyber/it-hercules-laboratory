export type Hotspot = {
  label: string;
  target: string;
  x: number;
  y: number;
  w: number;
  h: number;
  stub?: boolean;
};

export type ScreenDef = {
  id: string;
  group: string;
  title: string;
  route: string;
  mock: string;
  breadcrumb: string;
  hotspots?: Hotspot[];
  stubOnly?: boolean;
};

export type ScreensData = {
  defaultScreen: string;
  screens: Record<string, ScreenDef>;
};

export type ComposedPart = {
  id: string;
  label_ja: string;
  reuse: string;
  region: string;
  primitive: string;
  mock_file: string | null;
};

export type PartRegion = "AppShell" | "PageHeader" | "PrimaryAction" | "ContentArea" | "StatePanel";
