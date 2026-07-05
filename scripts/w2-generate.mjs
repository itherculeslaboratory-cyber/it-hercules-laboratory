#!/usr/bin/env node
/**
 * W2 codegen — 263 部品 TSX · 55 ScreenDef · catalog/ui-components.yaml
 * Run: node scripts/w2-generate.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { loadAllOverrideKeys, loadManifestScreenOverrideKeys } from "./w2-override-keys.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHARDS = path.join(ROOT, "docs/planning/quantum/shards");
const GEN = path.join(ROOT, "packages/ihl-ui-catalog/src/generated");
const GEN_COMP = path.join(GEN, "components");
const SCREEN_DEFS = path.join(ROOT, "screen-defs");
const CATALOG_YAML = path.join(ROOT, "catalog/ui-components.yaml");
const WALKTHROUGH = path.join(ROOT, "02-設計/_ui-global/ux-walkthrough/walkthrough.js");

const AUTH_SCREENS = {
  O1: {
    layout: "auth",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "form", component_id: "ihl-00-onboarding-login__LoginMagicLinkForm", region: "ContentArea" },
    ],
    transitions: [{ from: "form.submit", to_screen_id: "O2", label: "ログインリンク送信後" }],
  },
  O2: {
    layout: "auth",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "form", component_id: "ihl-00-onboarding-signup__SignupOnboardingForm", region: "ContentArea" },
    ],
    transitions: [
      { from: "form.terms_link", to_screen_id: "O3", label: "利用規約" },
      { from: "form.submit", to_screen_id: "01", label: "はじめる" },
    ],
  },
  O3: {
    layout: "auth",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "form", component_id: "ihl-00-terms__TermsAgreementForm", region: "ContentArea" },
    ],
    transitions: [
      { from: "form.back", to_screen_id: "O2", label: "戻る" },
      { from: "form.agree", to_screen_id: "O2", label: "同意して続ける" },
    ],
  },
};

/** ScreenDef transitions — walkthrough では表現できない node-scoped 等 */
const SCREEN_TRANSITION_OVERRIDES = {
  "06b": [
    { from: "part-0.hotspot.0", to_screen_id: "06b-s2", label: "ステッパ › 配送（Stage 2）" },
    { from: "hotspot.1", to_screen_id: "06a", label: "一覧へ" },
    { from: "hotspot.2", to_screen_id: "01", label: "ホーム" },
  ],
  "03": [
    { from: "hotspot.0", to_screen_id: "03m", label: "死亡率 詳細", params: { metric: "mortality" } },
    { from: "hotspot.1", to_screen_id: "03m", label: "完品率 詳細", params: { metric: "completion" } },
    { from: "hotspot.2", to_screen_id: "03m", label: "羽化不全率 詳細", params: { metric: "eclosion_failure" } },
    { from: "hotspot.3", to_screen_id: "03g", label: "成長 詳細" },
  ],
  "05b": [
    { from: "hotspot.0", to_screen_id: "05i", label: "計測入力" },
    { from: "hotspot.1", to_screen_id: "05a", label: "戻る › 検索" },
    {
      from: "hotspot.2",
      to_screen_id: "03",
      label: "この個体の血統を見る",
      params: { organism: "IND-0210" },
    },
  ],
};

/** walkthrough だけでは足りない ScreenDef フィールド差分 */
const SCREEN_DEF_PATCHES = {
  "03m": {
    route: "/cross/:id/metrics/:metric",
    title: "率 詳細一覧",
    notes: "W2 O2 hand UI — mock: mockups/ihl-03-lineage-mortality-detail.png · ?metric= で mortality|completion|eclosion_failure",
  },
  "03": {
    notes: "W2 O2 hand UI — mock: mockups/ihl-03-lineage-cross.png · 03m は metric バリアント共用",
  },
};

/** 観測 O2 手実装 — ContentArea 単一ノード（walkthrough.js hotspots → transitions） */
const OBS_HAND_SCREENS = {
  "05ctx": "ihl-05-obs-context-picker__ContentArea",
  "05a": "ihl-05-obs-search-grid__ContentArea",
  "05b": "ihl-05-obs-detail-similar__ContentArea",
  "05i": "ihl-05-obs-input-row__ContentArea",
  "05i-m": "ihl-05-obs-input-male__ContentArea",
  "05i-f": "ihl-05-obs-input-female__ContentArea",
  "05tl": "ihl-05-obs-template-list__ContentArea",
  "05td": "ihl-05-obs-template-detail__ContentArea",
  "05fork": "ihl-05-obs-template-fork__ContentArea",
  "05iot": "ihl-05-obs-device-link__ContentArea",
  "18photo": "ihl-18-photo-analysis-result__ContentArea",
};

/** ホーム・血統・論文 O2 手実装 — 単一 MainPanel（walkthrough.js hotspots → transitions） */
const FEATURE_PANEL_HAND_SCREENS = {
  "01": "ihl-01-nav-home__HomeCommandPanel",
  "03": "ihl-03-lineage-cross__CrossDashboardPanel",
  "03met": "ihl-03-lineage-metrics-detail__MetricsDetailPanel",
  "03m": "ihl-03-lineage-mortality-detail__MortalityListPanel",
  "03g": "ihl-03-lineage-growth-detail__GrowthDetailPanel",
  "09": "ihl-09-paper-in-progress__PaperProgressPanel",
  "09t": "ihl-09-paper-template-fill__PaperTemplatePanel",
};

function parseCompShard(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const id = path.basename(filePath, ".md").replace(/^comp-/, "");
  const region = id.split("__")[1] ?? "Unknown";
  const mock = text.match(/\| mock \| `([^`]+)` \|/)?.[1] ?? `${id.split("__")[0]}.png`;
  const primitive = text.match(/\| primitive \| (\w+) \|/)?.[1] ?? (region === "PrimaryAction" ? "button" : "card");
  const reuse = text.match(/\| reuse \| (\w+) \|/)?.[1] ?? "optional";
  return { id, region, mock, primitive, reuse, label: id };
}

function safeFileName(id) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function exportName(id) {
  return id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("");
}

function loadScreens() {
  const code = fs.readFileSync(WALKTHROUGH, "utf8");
  const start = code.indexOf("const SCREENS = ");
  const end = code.indexOf("const DEFAULT_SCREEN");
  const objSrc = code.slice(start + "const SCREENS = ".length, end).trim().replace(/;\s*$/, "");
  return eval(`(${objSrc})`);
}

function mockBasename(mockPath) {
  const m = String(mockPath || "").match(/([^/]+\.png)$/);
  return m?.[1] ?? null;
}

/** GMO 23 — ScreenDef node order（override ファイル順と独立） */
const SCREEN_OVERRIDE_KEY_ORDER = {
  "23": [
    "ihl-23-gmo-transfer__StatusChip",
    "ihl-23-gmo-transfer__FeeBreakdown",
    "ihl-23-gmo-transfer__TransferCodeDisplay",
    "ihl-23-gmo-transfer__GmoTransferPanel",
  ],
};

function regionFromComponentId(componentId) {
  return componentId.split("__")[1] ?? "ContentArea";
}

function orderOverrideKeys(screenId, keys) {
  const custom = SCREEN_OVERRIDE_KEY_ORDER[screenId];
  if (custom) return custom.filter((k) => keys.includes(k));
  return keys;
}

function buildHandScreenDef(screenId, screen, contentComponentIds, notes) {
  const transitions = (screen.hotspots ?? []).map((h, i) => ({
    from: `hotspot.${i}`,
    to_screen_id: h.target,
    label: h.label,
  }));
  const ordered = orderOverrideKeys(screenId, contentComponentIds);
  return {
    screen_id: screenId,
    route: screen.route ?? `/${screenId}`,
    title: screen.title,
    layout: "standard",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      ...ordered.map((component_id, i) => ({
        id: ordered.length === 1 ? "main" : `part-${i}`,
        component_id,
        region: regionFromComponentId(component_id),
      })),
    ],
    transitions,
    notes,
  };
}

function generateComponentTsx(part) {
  const fn = exportName(part.id);
  const metaJson = JSON.stringify({
    id: part.id,
    region: part.region,
    primitive: part.primitive,
    mock: part.mock,
    label: part.label,
  });
  return `/* AUTO-GENERATED by scripts/w2-generate.mjs — do not edit */
import { RegionPart } from "../../renderer/RegionPart";
import type { W2ComponentProps } from "../../types/w2";

const META = ${metaJson} as const;

export function ${fn}(props: W2ComponentProps) {
  return <RegionPart meta={META} {...props} />;
}

export default ${fn};
`;
}

function buildScreenDef(screenId, screen, partsByMock, manifestOverrideKeys) {
  if (AUTH_SCREENS[screenId]) {
    const auth = AUTH_SCREENS[screenId];
    const hotspots = screen.hotspots ?? [];
    const transitions =
      auth.transitions ??
      hotspots.map((h, i) => ({
        from: `hotspot.${i}`,
        to_screen_id: h.target,
        label: h.label,
      }));
    return {
      screen_id: screenId,
      route: screen.route ?? `/${screenId}`,
      title: screen.title,
      layout: auth.layout,
      nodes: auth.nodes,
      transitions,
      notes: "W2 auth layout — BrandChrome のみ",
    };
  }

  const handContentId = OBS_HAND_SCREENS[screenId] ?? FEATURE_PANEL_HAND_SCREENS[screenId];
  if (handContentId) {
    return buildHandScreenDef(
      screenId,
      screen,
      [handContentId],
      `W2 O2 hand UI — mock: ${screen.mock ?? ""}`,
    );
  }

  const overrideKeys = manifestOverrideKeys.get(screenId);
  if (overrideKeys?.length) {
    const mockLabel = mockBasename(screen.mock) ?? "";
    return buildHandScreenDef(
      screenId,
      screen,
      overrideKeys,
      `W2 O2 hand UI — mock: ${mockLabel}`,
    );
  }

  const mock = mockBasename(screen.mock);
  const parts = (mock ? partsByMock.get(mock) : []) ?? [];
  const nodes = [
    { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
    ...parts
      .filter((p) => !["AppShell", "PageHeader"].includes(p.region))
      .map((p, i) => ({
        id: `part-${i}`,
        component_id: p.id,
        region: p.region,
      })),
  ];

  const transitions = (screen.hotspots ?? []).map((h, i) => ({
    from: `hotspot.${i}`,
    to_screen_id: h.target,
    label: h.label,
  }));

  return {
    screen_id: screenId,
    route: screen.route ?? `/${screenId}`,
    title: screen.title,
    layout: "standard",
    nodes,
    transitions,
    notes: "W2 standard layout — PageHeader 省略（二重ヘッダー禁止）",
  };
}

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

// --- main ---
const allOverrideKeys = loadAllOverrideKeys(ROOT);
const manifestOverrideKeys = loadManifestScreenOverrideKeys(ROOT);

const shardFiles = fs
  .readdirSync(SHARDS)
  .filter((f) => f.startsWith("comp-") && f.endsWith(".md"))
  .sort();

const parts = shardFiles.map((f) => parseCompShard(path.join(SHARDS, f)));
console.log(`Parsed ${parts.length} component shards`);

fs.mkdirSync(GEN_COMP, { recursive: true });
fs.mkdirSync(SCREEN_DEFS, { recursive: true });

const partsByMock = new Map();
for (const p of parts) {
  if (!partsByMock.has(p.mock)) partsByMock.set(p.mock, []);
  partsByMock.get(p.mock).push(p);
}

const importLines = [];
const mapEntries = [];

for (const part of parts) {
  const file = `${safeFileName(part.id)}.tsx`;
  fs.writeFileSync(path.join(GEN_COMP, file), generateComponentTsx(part));
  const fn = exportName(part.id);
  importLines.push(`import { ${fn} } from "./components/${file.replace(".tsx", "")}";`);
  mapEntries.push(`  "${part.id}": ${fn},`);
}

fs.writeFileSync(
  path.join(GEN, "catalog-map.ts"),
  `/* AUTO-GENERATED */
${importLines.join("\n")}
import type { CatalogComponent } from "../registry/overrides";

export const GENERATED_CATALOG_MAP: Record<string, CatalogComponent> = {
${mapEntries.join("\n")}
};
`,
);

fs.writeFileSync(
  path.join(GEN, "meta.json"),
  JSON.stringify(parts, null, 2),
);

const screens = loadScreens();
const screenDefIndex = {};
for (const [screenId, screen] of Object.entries(screens)) {
  let def = buildScreenDef(screenId, screen, partsByMock, manifestOverrideKeys);
  if (SCREEN_TRANSITION_OVERRIDES[screenId]) {
    def = { ...def, transitions: SCREEN_TRANSITION_OVERRIDES[screenId] };
  }
  if (SCREEN_DEF_PATCHES[screenId]) {
    def = { ...def, ...SCREEN_DEF_PATCHES[screenId] };
  }
  const slug = `${screenId.replace(/[^a-zA-Z0-9-]/g, "-")}.json`;
  fs.writeFileSync(path.join(SCREEN_DEFS, slug), JSON.stringify(def, null, 2) + "\n");
  screenDefIndex[screenId] = slug;
}
fs.writeFileSync(path.join(SCREEN_DEFS, "index.json"), JSON.stringify(screenDefIndex, null, 2) + "\n");

const manualComponents = [
  { id: "ihl-brand-chrome", kind: "layout", path: "packages/ihl-ui-catalog/src/components/BrandChrome.tsx", status: "w2_pilot", description: "単一ブランドバー" },
  { id: "ihl-primitive-primary-button", kind: "action", path: "packages/ihl-ui-catalog/src/components/PrimaryButton.tsx", status: "w2_pilot", description: "主 CTA" },
  { id: "ihl-primitive-form-field", kind: "input", path: "packages/ihl-ui-catalog/src/components/FormField.tsx", status: "w2_pilot", description: "フォームフィールド" },
  { id: "ihl-00-onboarding-login__LoginMagicLinkForm", kind: "auth", path: "packages/ihl-ui-catalog/src/components/LoginMagicLinkForm.tsx", status: "w2_hand", description: "ログインカード" },
  { id: "ihl-00-onboarding-signup__SignupOnboardingForm", kind: "auth", path: "packages/ihl-ui-catalog/src/components/SignupOnboardingForm.tsx", status: "w2_hand", description: "新規登録カード" },
  { id: "ihl-00-terms__TermsAgreementForm", kind: "auth", path: "packages/ihl-ui-catalog/src/components/TermsAgreementForm.tsx", status: "w2_hand", description: "利用規約カード" },
  { id: "ihl-05-obs-hand-ui", kind: "feature", path: "packages/ihl-ui-catalog/src/components/features/observation/", status: "w2_hand", description: "観測 11 画面 O2 手実装" },
  { id: "ihl-06-market-hand-ui", kind: "feature", path: "packages/ihl-ui-catalog/src/components/features/market/", status: "w2_hand", description: "マーケット 15 画面 O2 手実装" },
  { id: "ihl-01-nav-home__HomeCommandPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/HomeCommandPanel.tsx", status: "w2_hand", description: "ホーム司令塔" },
  { id: "ihl-03-lineage-cross__CrossDashboardPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/LineageCrossPanel.tsx", status: "w2_hand", description: "血統・交配 Cross" },
  { id: "ihl-03-lineage-metrics-detail__MetricsDetailPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/LineageMetricsPanel.tsx", status: "w2_hand", description: "血統メトリクス詳細" },
  { id: "ihl-03-lineage-mortality-detail__MortalityListPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/LineageMortalityPanel.tsx", status: "w2_hand", description: "死亡一覧" },
  { id: "ihl-03-lineage-growth-detail__GrowthDetailPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/LineageGrowthPanel.tsx", status: "w2_hand", description: "成長詳細" },
  { id: "ihl-09-paper-in-progress__PaperProgressPanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/PaperInProgressPanel.tsx", status: "w2_hand", description: "論文 進行中" },
  { id: "ihl-09-paper-template-fill__PaperTemplatePanel", kind: "feature", path: "packages/ihl-ui-catalog/src/components/PaperTemplatePanel.tsx", status: "w2_hand", description: "論文テンプレート穴埋め" },
];

const featureHandPrefixes = [
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
];
const featureHandRegions = ["ContentArea", "PrimaryAction", "StatePanel"];
for (const prefix of featureHandPrefixes) {
  for (const region of featureHandRegions) {
    manualComponents.push({
      id: `${prefix}__${region}`,
      kind: "feature",
      path: "packages/ihl-ui-catalog/src/components/features/hand-components.ts",
      status: "w2_hand",
      description: `${region} · O2 hand UI`,
    });
  }
}
for (const region of ["CollectorSetupBanner", "CsvImportBlock", "DeviceListCard", "ManualRegisterForm"]) {
  manualComponents.push({
    id: `ihl-13-device-registry__${region}`,
    kind: "feature",
    path: "packages/ihl-ui-catalog/src/components/features/_shared/DeviceRegistryParts.tsx",
    status: "w2_hand",
    description: `${region} · 機器管理`,
  });
}
for (const region of ["BuilderShell", "CanvasDropZone", "LintPanel", "PartsPalette", "SaveBar"]) {
  manualComponents.push({
    id: `ihl-16-uibuilder-canvas__${region}`,
    kind: "feature",
    path: "packages/ihl-ui-catalog/src/components/features/_shared/BuilderParts.tsx",
    status: "w2_hand",
    description: `${region} · UIビルダー`,
  });
}

const handIds = new Set(manualComponents.map((c) => c.id));
for (const id of allOverrideKeys) {
  if (handIds.has(id)) continue;
  manualComponents.push({
    id,
    kind: "feature",
    path: "packages/ihl-ui-catalog/src/registry/overrides/",
    status: "w2_hand",
    description: "O2 hand override",
  });
  handIds.add(id);
}

const yamlParts = [
  "# UI 部品カタログ — UIbuilder / ScreenDef 正本（W2）",
  "# AUTO-GENERATED header + manual overrides — run: node scripts/w2-generate.mjs",
  "version: 1",
  "",
  "components:",
  ...manualComponents.map(
    (c) =>
      `  - id: ${c.id}\n    kind: ${c.kind}\n    path: ${c.path}\n    status: ${c.status}\n    props_schema:\n      state: ok|loading|empty|error\n      className: optional_string\n    description: ${c.description}`,
  ),
  ...parts
    .filter((p) => !handIds.has(p.id))
    .map((p) => {
      const file = `packages/ihl-ui-catalog/src/generated/components/${safeFileName(p.id)}.tsx`;
      return `  - id: ${p.id}\n    kind: feature\n    primitive: ${p.primitive}\n    path: ${file}\n    status: w2_scaffold\n    props_schema:\n      state: ok|loading|empty|error\n      className: optional_string\n    description: ${p.region} · ${p.mock}`;
    }),
];

fs.writeFileSync(CATALOG_YAML, yamlParts.join("\n") + "\n");

console.log(`Generated ${parts.length} components → ${GEN_COMP}`);
console.log(`Generated ${Object.keys(screens).length} screen-defs → ${SCREEN_DEFS}`);
console.log(`Updated ${CATALOG_YAML}`);

const merge = spawnSync(process.execPath, [path.join(ROOT, "scripts/w2-merge-overrides.mjs")], {
  stdio: "inherit",
  cwd: ROOT,
});
if (merge.status !== 0) {
  process.exit(merge.status ?? 1);
}
