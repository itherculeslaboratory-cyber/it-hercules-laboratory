import type { ScreenDef } from "@ihl/ui-catalog/types/w2";

import index from "../../../../screen-defs/index.json";



const modules = import.meta.glob<ScreenDef>("../../../../screen-defs/*.json", { eager: true, import: "default" });



/** 3101 W2 — catalog 生成 screen-def を上書き（再生成で消えない） */

const W2_SCREEN_DEF_PATCHES: Record<string, ScreenDef> = {

  "07a": {

    screen_id: "07a",

    route: "/knowledge",

    title: "知の広場",

    layout: "standard",

    nodes: [

      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },

      { id: "part-0", component_id: "ihl-07-board-hub__ContentArea", region: "ContentArea" },

      { id: "part-1", component_id: "ihl-07-board-hub__PrimaryAction", region: "PrimaryAction" },

      { id: "part-2", component_id: "ihl-07-board-hub__StatePanel", region: "StatePanel" },

    ],

    transitions: [

      { from: "hotspot.0", to_screen_id: "07a-official", label: "公式掲示板" },

      { from: "hotspot.1", to_screen_id: "09", label: "論文" },

      { from: "hotspot.2", to_screen_id: "07gh", label: "GitHub掲示板" },

    ],

    notes: "W2 知の広場 Hub — 3 柱 · タブなし",

  },

  "09": {

    screen_id: "09",

    route: "/knowledge/papers/in-progress",

    title: "知の広場 › 論文",

    layout: "standard",

    nodes: [

      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },

      { id: "main", component_id: "ihl-09-paper-in-progress__PaperProgressPanel", region: "PaperProgressPanel" },

    ],

    transitions: [{ from: "hotspot.0", to_screen_id: "09t", label: "テンプレ穴埋め" }],

    notes: "W2 PaperProgressW2 — 6 節 + 5 ステップ",

  },

  "09t": {

    screen_id: "09t",

    route: "/knowledge/papers/template",

    title: "知の広場 › 論文テンプレ",

    layout: "standard",

    nodes: [

      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },

      { id: "main", component_id: "ihl-09-paper-template-fill__PaperTemplatePanel", region: "PaperTemplatePanel" },

    ],

    transitions: [{ from: "hotspot.0", to_screen_id: "09", label: "進行中論文" }],

    notes: "W2 PaperTemplateFillW2",

  },

  "07a-official": {
    screen_id: "07a-official",
    route: "/knowledge/board",
    title: "知の広場 › 掲示板",
    layout: "standard",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "part-0", component_id: "ihl-07-board-official-hub__ContentArea", region: "ContentArea" },
      { id: "part-1", component_id: "ihl-07-board-official-hub__PrimaryAction", region: "PrimaryAction" },
      { id: "part-2", component_id: "ihl-07-board-official-hub__StatePanel", region: "StatePanel" },
    ],
    transitions: [
      { from: "hotspot.0", to_screen_id: "07b", label: "改善" },
      { from: "hotspot.1", to_screen_id: "07g", label: "愚痴" },
    ],
    notes: "W2 公式掲示板 — 愚痴+改善 2 カード",
  },

  "07gh": {
    screen_id: "07gh",
    route: "/knowledge/github",
    title: "GitHub 掲示板",
    layout: "standard",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "part-0", component_id: "ihl-07-github-board-hub__ContentArea", region: "ContentArea" },
      { id: "part-1", component_id: "ihl-07-github-board-hub__PrimaryAction", region: "PrimaryAction" },
      { id: "part-2", component_id: "ihl-07-github-board-hub__StatePanel", region: "StatePanel" },
    ],
    transitions: [],
    notes: "W2 GitHub 柱 — link-out",
  },

  "07-thread": {
    screen_id: "07-thread",
    route: "/board/:kind/:thread_id",
    title: "掲示板 › スレッド本文",
    layout: "standard",
    nodes: [
      { id: "chrome", component_id: "ihl-brand-chrome", region: "AppShell" },
      { id: "part-0", component_id: "ihl-07-board-thread-view__ContentArea", region: "ContentArea" },
      { id: "part-1", component_id: "ihl-07-board-thread-view__PrimaryAction", region: "PrimaryAction" },
      { id: "part-2", component_id: "ihl-07-board-thread-view__StatePanel", region: "StatePanel" },
    ],
    transitions: [
      { from: "hotspot.0", to_screen_id: "11", label: "指摘" },
      { from: "hotspot.1", to_screen_id: "07g", label: "愚痴板へ" },
      { from: "hotspot.2", to_screen_id: "07b", label: "改善板へ" },
    ],
    notes: "W2 5ch 型スレ本文",
  },

};



function applyW2ScreenPatches(def: ScreenDef): ScreenDef {

  return W2_SCREEN_DEF_PATCHES[def.screen_id] ?? def;

}



export function getScreenDef(screenId: string): ScreenDef | null {

  const file = (index as Record<string, string>)[screenId];

  if (W2_SCREEN_DEF_PATCHES[screenId]) {

    return W2_SCREEN_DEF_PATCHES[screenId];

  }

  if (!file || file === "index.json") return null;

  const key = `../../../../screen-defs/${file}`;

  const def = modules[key] ?? null;

  return def ? applyW2ScreenPatches(def) : null;

}



export function hasScreenDef(screenId: string): boolean {

  if (screenId in W2_SCREEN_DEF_PATCHES) return true;

  return Boolean((index as Record<string, string>)[screenId]);

}



export function listScreenDefIds(): string[] {

  const ids = new Set(Object.keys(index as Record<string, string>));

  for (const id of Object.keys(W2_SCREEN_DEF_PATCHES)) {

    ids.add(id);

  }

  return [...ids];

}


