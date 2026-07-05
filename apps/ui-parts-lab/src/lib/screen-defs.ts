import type { ScreenDef } from "@ihl/ui-catalog/types/w2";
import index from "../../../../screen-defs/index.json";

const modules = import.meta.glob<ScreenDef>("../../../../screen-defs/*.json", { eager: true, import: "default" });

export function getScreenDef(screenId: string): ScreenDef | null {
  const file = (index as Record<string, string>)[screenId];
  if (!file || file === "index.json") return null;
  const key = `../../../../screen-defs/${file}`;
  return modules[key] ?? null;
}

export function hasScreenDef(screenId: string): boolean {
  return Boolean((index as Record<string, string>)[screenId]);
}

export function listScreenDefIds(): string[] {
  return Object.keys(index as Record<string, string>);
}
