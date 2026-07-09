/** 3101 lab — localStorage WorkflowContext + sessionStorage draft (TRN v2 · ADR-H-15) */

export const OBS_CONTEXT_KEY = "ihl.observation.context.v1";
export const OBS_DRAFT_KEY = "ihl.observation.draft.lab.v1";

export type ObsSubspeciesStatus = "subspecies" | "species_only" | "unresolved";

export type ObsWorkflowContext = {
  domain: string;
  displayJa: string;
  scientificName: string;
  /** metadata 絞り込み用 — 種レベル学名 */
  speciesName: string;
  stage: "egg" | "larva" | "pupa" | "adult" | "unknown";
  subspeciesStatus: ObsSubspeciesStatus;
  /** 購読リスト参照（G1 · user gate） */
  subscriptionId?: string;
  tags: string[];
  /** 05tl / UI テンプレ横断スコープ（G5） */
  templateDomain?: string;
};

export type ObsMeasurementRow = {
  item: string;
  value: string;
  unit: string;
  method: "manual_entry" | "iot_switchbot";
};

export type ObservationLabDraft = {
  context: ObsWorkflowContext | null;
  phaseLabel: string;
  sex: "male" | "female" | "unknown";
  placementId: string;
  placementStartedAt: string;
  deviceRole: string;
  deviceId: string;
  includeEnvSnapshot: boolean;
  nextObservationAt: string;
  nextObservationSource: "user" | "template_default" | "";
  skipNextObservation: boolean;
  rows: ObsMeasurementRow[];
  hasPhoto: boolean;
  displayName: string;
  updatedAt: string;
};

const DEFAULT_CONTEXT: ObsWorkflowContext = {
  domain: "biological",
  displayJa: "Dynastes hercules hercules · 原名亜種",
  scientificName: "Dynastes hercules hercules",
  speciesName: "Dynastes hercules",
  stage: "larva",
  subspeciesStatus: "subspecies",
  tags: [
    "domain:biological",
    "order:Coleoptera",
    "family:Scarabaeidae",
    "genus:Dynastes",
    "species:Dynastes hercules",
    "subspecies:D. h. hercules",
  ],
  templateDomain: "biological",
};

export function defaultWorkflowContext(): ObsWorkflowContext {
  return { ...DEFAULT_CONTEXT, tags: [...DEFAULT_CONTEXT.tags] };
}

export function defaultObservationDraft(): ObservationLabDraft {
  return {
    context: null,
    phaseLabel: "L3 幼虫",
    sex: "unknown",
    placementId: "",
    placementStartedAt: "",
    deviceRole: "temp_humidity",
    deviceId: "",
    includeEnvSnapshot: false,
    nextObservationAt: "",
    nextObservationSource: "",
    skipNextObservation: false,
    rows: [{ item: "weight", value: "42.5", unit: "g", method: "manual_entry" }],
    hasPhoto: false,
    displayName: "",
    updatedAt: new Date().toISOString(),
  };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readWorkflowContext(): ObsWorkflowContext | null {
  if (typeof localStorage === "undefined") return null;
  return safeParse<ObsWorkflowContext>(localStorage.getItem(OBS_CONTEXT_KEY));
}

export function writeWorkflowContext(ctx: ObsWorkflowContext): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(OBS_CONTEXT_KEY, JSON.stringify(ctx));
}

export function readObservationDraft(): ObservationLabDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  return safeParse<ObservationLabDraft>(sessionStorage.getItem(OBS_DRAFT_KEY));
}

export function writeObservationDraft(draft: ObservationLabDraft): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    OBS_DRAFT_KEY,
    JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
  );
}

export function mergeContextIntoDraft(ctx: ObsWorkflowContext): ObservationLabDraft {
  const existing = readObservationDraft() ?? defaultObservationDraft();
  return { ...existing, context: ctx };
}

export function hydrateDraftFromContext(): ObservationLabDraft {
  const ctx = readWorkflowContext();
  const base = readObservationDraft() ?? defaultObservationDraft();
  if (ctx) return { ...base, context: ctx };
  return base;
}

export function targetChipLabel(ctx: ObsWorkflowContext | null, phaseLabel: string): string {
  if (!ctx) return "対象未選択 — タップして選ぶ";
  const stageLabels: Record<string, string> = {
    egg: "卵",
    larva: "幼虫",
    pupa: "蛹",
    adult: "成虫",
    unknown: "不明",
  };
  const stage = stageLabels[ctx.stage] ?? ctx.stage;
  return `${ctx.displayJa} · ${phaseLabel || stage}`;
}

export function isApplyEnabled(subspecies: ObsSubspeciesStatus, treeSelected: boolean): boolean {
  if (subspecies === "subspecies" || subspecies === "species_only") return true;
  return treeSelected && subspecies !== "unresolved";
}
