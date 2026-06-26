export type StructuredRowGroup = "measurement" | "photo_condition" | "env_snapshot";

export type EnvSnapshotSource = "manual_entry" | "ingest_snapshot" | "registry_poll";

export type StructuredRowMethod = "manual_entry" | "iot_switchbot" | "ingest_snapshot" | "registry_poll" | "device_fetch";

export interface StructuredRowData {
  item: string;
  value: string;
  unit: string;
  method: StructuredRowMethod;
  deviceId?: string;
  locked?: boolean;
}

export interface ObservationEnvSnapshot {
  deviceId: string;
  source: EnvSnapshotSource | "";
  capturedAt: string;
  locked: boolean;
  rows: StructuredRowData[];
}

/** @deprecated alias — use StructuredRowData */
export type ObservationDraftRow = StructuredRowData;

/** @deprecated alias — use StructuredRowData */
export type ObservationPhotoConditionRow = StructuredRowData;

export interface ObservationPhotoCaptureEnvSnapshot {
  deviceId: string;
  temperature?: string;
  humidity?: string;
  co2?: string;
  fetchedAt: string;
}

export interface ObservationDraftPhotoFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataUrl: string;
}

export type ObservationPhaseKey =
  | "larva_l1"
  | "larva_l2"
  | "larva_l3_early"
  | "larva_l3_late"
  | "prepupa"
  | "pupa"
  | "adult";

export interface ObservationDeviceDeclaration {
  deviceId: string;
  role: "temp_humidity" | "gyro" | "co2" | "lux" | "custom";
  source: "registry_poll" | "manual_entry" | "unchanged";
}

export interface ObservationDraft {
  domain: string;
  species: string;
  targetId: string;
  stage: string;
  phaseKey: ObservationPhaseKey;
  phaseLabel: string;
  larvaSubtype: string;
  sex: "unknown" | "male" | "female" | "not_applicable";
  scopeRoute: string;
  individualId: string;
  displayName: string;
  renameFrom: string;
  brandTemplateId: string;
  measurementTemplateId: string;
  measurementTemplateTargetSpecies: string;
  sireId: string;
  damId: string;
  photoMode: "camera" | "file_select";
  selectedItems: string[];
  customItemChoices: string[];
  customUnitChoices: string[];
  rows: ObservationDraftRow[];
  statusStrip: string;
  hasPhoto: boolean;
  photoPreview: string;
  photoPreviewUrl: string;
  photoFile: ObservationDraftPhotoFile | null;
  photoConditions: ObservationPhotoConditionRow[];
  photoConditionCustomItemChoices: string[];
  photoConditionCustomUnitChoices: string[];
  photoCaptureDeviceId: string;
  photoCaptureEnvSnapshot: ObservationPhotoCaptureEnvSnapshot | null;
  periodicEnabled: boolean;
  deviceId: string;
  envTemperature: string;
  envHumidity: string;
  placementId: string;
  /** 設置開始日（YYYY-MM-DD）— 終了は次回観測・棚移動で暗黙終了 */
  placementStartedAt: string;
  devices: ObservationDeviceDeclaration[];
  includeEnvSnapshot: boolean;
  envSnapshot: ObservationEnvSnapshot;
  priorCaptureId: string;
  entryMode: "qr" | "continue" | "manual" | "";
  nextObservationAt: string;
  nextObservationSource: "user" | "template_default";
  skipNextObservation: boolean;
}

export interface ObservationCommitRecord {
  sessionId: string;
  r2Key: string;
  species: string;
  displayName?: string;
  nameEventId?: string;
  createdAt: string;
}

export type ObservationEditSection = "photo" | "measurement" | "env";

export interface ObservationInputQueryContext {
  species?: string;
  scopeRoute?: string;
  individualId?: string;
  targetId?: string;
  from?: string | null;
  edit?: string | null;
}

const DRAFT_STORAGE_KEY = "ihl_obs_draft";
const COMMIT_STORAGE_KEY = "ihl_obs_last_commit";

/** タブ内のみ。大きな写真 blob は sessionStorage に載せずここに保持する。 */
let inMemoryPhotoCache: {
  photoPreview: string;
  photoPreviewUrl: string;
  photoFile: ObservationDraftPhotoFile | null;
} | null = null;

export type WriteDraftResult = { ok: true } | { ok: false; warning: string };

export type SessionStoredObservationDraft = ObservationDraft & {
  /** true = 写真本体は inMemoryPhotoCache にある（または再選択が必要） */
  photoDataInMemory?: boolean;
};

function getSessionStorage(): Storage | null {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  if (typeof globalThis.sessionStorage !== "undefined") {
    return globalThis.sessionStorage;
  }
  return null;
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

function hasPhotoPayload(draft: ObservationDraft): boolean {
  return Boolean(
    draft.hasPhoto ||
      draft.photoPreview ||
      draft.photoPreviewUrl ||
      draft.photoFile?.dataUrl,
  );
}

/** タブ内メモリへ写真 blob を退避（writeDraft から呼ぶ） */
export function cacheDraftPhoto(draft: ObservationDraft): void {
  if (!hasPhotoPayload(draft)) {
    if (!draft.hasPhoto) {
      inMemoryPhotoCache = null;
    }
    return;
  }
  const dataUrl = draft.photoFile?.dataUrl || draft.photoPreviewUrl || draft.photoPreview;
  inMemoryPhotoCache = {
    photoPreview: draft.photoPreview || dataUrl,
    photoPreviewUrl: draft.photoPreviewUrl || draft.photoPreview || dataUrl,
    photoFile: draft.photoFile ?? {
      name: "photo",
      type: dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg",
      size: 0,
      lastModified: Date.now(),
      dataUrl,
    },
  };
}

/** sessionStorage 用に肥大フィールドを除去する（写真 data URL は永続化しない） */
export function slimDraftForSessionStorage(draft: ObservationDraft): SessionStoredObservationDraft {
  const photoCached = hasPhotoPayload(draft);

  return {
    ...draft,
    hasPhoto: photoCached || draft.hasPhoto,
    photoPreview: "",
    photoPreviewUrl: "",
    photoFile: draft.photoFile
      ? {
          name: draft.photoFile.name,
          type: draft.photoFile.type,
          size: draft.photoFile.size,
          lastModified: draft.photoFile.lastModified,
          dataUrl: "",
        }
      : null,
    photoDataInMemory: photoCached,
  };
}

/** @alias slimDraftForSessionStorage */
export const slimDraftForStorage = slimDraftForSessionStorage;

function mergePhotoFromMemory(parsed: SessionStoredObservationDraft): Pick<
  ObservationDraft,
  "hasPhoto" | "photoPreview" | "photoPreviewUrl" | "photoFile"
> {
  if (inMemoryPhotoCache && (parsed.hasPhoto || parsed.photoDataInMemory)) {
    return {
      hasPhoto: true,
      photoPreview: inMemoryPhotoCache.photoPreview,
      photoPreviewUrl: inMemoryPhotoCache.photoPreviewUrl,
      photoFile: inMemoryPhotoCache.photoFile,
    };
  }

  if (parsed.hasPhoto || parsed.photoDataInMemory) {
    return {
      hasPhoto: true,
      photoPreview: "",
      photoPreviewUrl: "",
      photoFile: parsed.photoFile?.name
        ? { ...parsed.photoFile, dataUrl: "" }
        : null,
    };
  }

  return {
    hasPhoto: false,
    photoPreview: "",
    photoPreviewUrl: "",
    photoFile: null,
  };
}

/** テスト用: タブ内写真キャッシュをクリア */
export function clearInMemoryPhotoCache(): void {
  inMemoryPhotoCache = null;
}

const DEFAULT_ENV_SNAPSHOT_ROWS: StructuredRowData[] = [
  { item: "温度", value: "", unit: "°C", method: "manual_entry", locked: false },
  { item: "湿度", value: "", unit: "%", method: "manual_entry", locked: false },
];

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_ENV_SNAPSHOT: ObservationEnvSnapshot = {
  deviceId: "",
  source: "",
  capturedAt: "",
  locked: false,
  rows: DEFAULT_ENV_SNAPSHOT_ROWS,
};

export const DEFAULT_OBSERVATION_DRAFT: ObservationDraft = {
  domain: "biological",
  species: "",
  targetId: "",
  stage: "",
  phaseKey: "adult",
  phaseLabel: "生体",
  larvaSubtype: "",
  sex: "unknown",
  scopeRoute: "biological",
  individualId: "",
  displayName: "",
  renameFrom: "",
  brandTemplateId: "",
  measurementTemplateId: "",
  measurementTemplateTargetSpecies: "",
  sireId: "",
  damId: "",
  photoMode: "file_select",
  selectedItems: ["体長", "胸幅"],
  customItemChoices: [],
  customUnitChoices: [],
  rows: [
    { item: "体長", value: "", unit: "mm", method: "manual_entry" },
    { item: "胸幅", value: "", unit: "mm", method: "manual_entry" },
  ],
  statusStrip: "待機中",
  hasPhoto: false,
  photoPreview: "",
  photoPreviewUrl: "",
  photoFile: null,
  photoConditions: [
    { item: "アスペクト比", value: "4:3", unit: "", method: "manual_entry", deviceId: "" },
    { item: "色補正", value: "なし", unit: "", method: "manual_entry", deviceId: "" },
    { item: "撮影角度", value: "背面", unit: "", method: "manual_entry", deviceId: "" },
  ],
  photoConditionCustomItemChoices: [],
  photoConditionCustomUnitChoices: [],
  photoCaptureDeviceId: "",
  photoCaptureEnvSnapshot: null,
  periodicEnabled: false,
  deviceId: "",
  envTemperature: "",
  envHumidity: "",
  placementId: "",
  placementStartedAt: todayIsoDate(),
  devices: [],
  includeEnvSnapshot: false,
  envSnapshot: DEFAULT_ENV_SNAPSHOT,
  priorCaptureId: "",
  entryMode: "",
  nextObservationAt: "",
  nextObservationSource: "user",
  skipNextObservation: false,
};

function parseJson<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readDraft(): ObservationDraft | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }
  const parsed = parseJson<Partial<SessionStoredObservationDraft>>(storage.getItem(DRAFT_STORAGE_KEY));
  if (!parsed) {
    return null;
  }
  const photoFields = mergePhotoFromMemory({
    ...DEFAULT_OBSERVATION_DRAFT,
    ...parsed,
    photoDataInMemory: parsed.photoDataInMemory,
  } as SessionStoredObservationDraft);
  const draft: ObservationDraft = {
    ...DEFAULT_OBSERVATION_DRAFT,
    ...parsed,
    ...photoFields,
    rows: parsed.rows?.length ? parsed.rows : DEFAULT_OBSERVATION_DRAFT.rows,
    photoConditions: parsed.photoConditions?.length
      ? parsed.photoConditions.map((row) => ({
          ...row,
          method: normalizeStructuredRowMethod(row.method),
          deviceId: row.deviceId ?? "",
        }))
      : DEFAULT_OBSERVATION_DRAFT.photoConditions,
    photoPreviewUrl: photoFields.photoPreviewUrl,
    photoFile: photoFields.photoFile,
    photoConditionCustomItemChoices: parsed.photoConditionCustomItemChoices ?? [],
    photoConditionCustomUnitChoices: parsed.photoConditionCustomUnitChoices ?? [],
    customItemChoices: parsed.customItemChoices ?? [],
    customUnitChoices: parsed.customUnitChoices ?? [],
    placementId: parsed.placementId ?? "",
    placementStartedAt: parsed.placementStartedAt ?? todayIsoDate(),
    devices: parsed.devices?.length
      ? parsed.devices.map((d) => ({
          deviceId: d.deviceId ?? "",
          role: d.role ?? "temp_humidity",
          source: d.source ?? "registry_poll",
        }))
      : [],
    includeEnvSnapshot: parsed.includeEnvSnapshot ?? parsed.periodicEnabled ?? false,
    envSnapshot: normalizeEnvSnapshot(parsed),
    priorCaptureId: parsed.priorCaptureId ?? "",
    entryMode: parsed.entryMode ?? "",
    nextObservationAt: parsed.nextObservationAt ?? "",
    nextObservationSource: parsed.nextObservationSource ?? "user",
    skipNextObservation: parsed.skipNextObservation ?? false,
  };
  return draft.hasPhoto ? clearEnvSnapshotFromDraft(draft) : draft;
}

export function isEnvSnapshotLocked(source: EnvSnapshotSource | ""): boolean {
  return source === "ingest_snapshot" || source === "registry_poll";
}

function normalizeEnvSnapshot(parsed: Partial<ObservationDraft>): ObservationEnvSnapshot {
  if (parsed.envSnapshot?.rows?.length) {
    const source = parsed.envSnapshot.source ?? "";
    const locked = parsed.envSnapshot.locked ?? isEnvSnapshotLocked(source);
    return {
      deviceId: parsed.envSnapshot.deviceId ?? "",
      source,
      capturedAt: parsed.envSnapshot.capturedAt ?? "",
      locked,
      rows: sanitizeEnvSnapshotRows(
        parsed.envSnapshot.rows.map((row) => ({
          ...row,
          method: normalizeStructuredRowMethod(row.method),
          locked: row.locked ?? locked,
        })),
      ),
    };
  }
  const temperature = parsed.envTemperature ?? "";
  const humidity = parsed.envHumidity ?? "";
  const source = (parsed as { envSnapshotSource?: EnvSnapshotSource }).envSnapshotSource ?? "";
  const locked = isEnvSnapshotLocked(source);
  return {
    deviceId: parsed.deviceId ?? "",
    source,
    capturedAt: "",
    locked,
    rows: [
      { item: "温度", value: temperature, unit: "°C", method: source || "manual_entry", locked },
      { item: "湿度", value: humidity, unit: "%", method: source || "manual_entry", locked },
    ],
  };
}

export function normalizeStructuredRowMethod(method: string): StructuredRowMethod {
  if (method === "device_fetch") {
    return "device_fetch";
  }
  if (
    method === "iot_switchbot" ||
    method === "iot" ||
    method === "ingest_snapshot" ||
    method === "registry_poll"
  ) {
    return method === "iot" ? "iot_switchbot" : (method as StructuredRowMethod);
  }
  return "manual_entry";
}

export function envSnapshotTemperature(snapshot: ObservationEnvSnapshot): string {
  return snapshot.rows.find((row) => row.item === "温度")?.value ?? "";
}

export function envSnapshotHumidity(snapshot: ObservationEnvSnapshot): string {
  return snapshot.rows.find((row) => row.item === "湿度")?.value ?? "";
}

export interface IngestLatestTelemetry {
  temperature_c?: number | null;
  humidity_pct?: number | null;
  captured_at?: string | null;
  bucket_start_unix?: number | null;
}

export function applyIngestTelemetryToEnvSnapshot(
  snapshot: ObservationEnvSnapshot,
  deviceId: string,
  telemetry: IngestLatestTelemetry,
): ObservationEnvSnapshot {
  const capturedAt = telemetry.captured_at ?? new Date().toISOString();
  const temperature =
    telemetry.temperature_c !== null && telemetry.temperature_c !== undefined
      ? String(telemetry.temperature_c)
      : "";
  const humidity =
    telemetry.humidity_pct !== null && telemetry.humidity_pct !== undefined
      ? String(telemetry.humidity_pct)
      : "";
  return {
    deviceId,
    source: "ingest_snapshot",
    capturedAt,
    locked: true,
    rows: [
      {
        item: "温度",
        value: temperature,
        unit: "°C",
        method: "device_fetch",
        locked: true,
      },
      {
        item: "湿度",
        value: humidity,
        unit: "%",
        method: "device_fetch",
        locked: true,
      },
    ],
  };
}

/** 環境・設置チャンクで宣言した温湿度機器（binding）を解決する。 */
export function resolveBindingEnvDeviceId(draft: ObservationDraft): string {
  const fromRole = draft.devices.find((d) => d.role === "temp_humidity" && d.deviceId.trim())?.deviceId;
  if (fromRole?.trim()) {
    return fromRole.trim();
  }
  const fromAny = draft.devices.find((d) => d.deviceId.trim())?.deviceId;
  if (fromAny?.trim()) {
    return fromAny.trim();
  }
  return draft.envSnapshot.deviceId.trim() || draft.deviceId.trim();
}

export function hasEnvSnapshotValues(snapshot: ObservationEnvSnapshot): boolean {
  return Boolean(envSnapshotTemperature(snapshot) || envSnapshotHumidity(snapshot));
}

/** 写真あり時は温湿度スナップショットを draft から除去する（撮影条件のみ残す） */
export function clearEnvSnapshotFromDraft(draft: ObservationDraft): ObservationDraft {
  return {
    ...draft,
    includeEnvSnapshot: false,
    periodicEnabled: false,
    envTemperature: "",
    envHumidity: "",
    envSnapshot: {
      ...DEFAULT_ENV_SNAPSHOT,
      rows: DEFAULT_ENV_SNAPSHOT.rows.map((row) => ({ ...row })),
    },
  };
}

export function shouldIncludeEnvironmentSnapshot(draft: ObservationDraft): boolean {
  if (draft.hasPhoto) {
    return false;
  }
  return draft.includeEnvSnapshot || draft.periodicEnabled;
}

export function buildEnvironmentSnapshotCommitBody(draft: ObservationDraft): {
  temperature_c?: string;
  humidity_pct?: string;
  device_id?: string;
  source?: EnvSnapshotSource;
  captured_at?: string;
} {
  if (!shouldIncludeEnvironmentSnapshot(draft)) {
    return {};
  }
  const snapshot = draft.envSnapshot;
  const source = snapshot.source || "manual_entry";
  const temperature = envSnapshotTemperature(snapshot) || draft.envTemperature;
  const humidity = envSnapshotHumidity(snapshot) || draft.envHumidity;
  if (!temperature && !humidity) {
    return {};
  }
  const bindingDeviceId = resolveBindingEnvDeviceId(draft);
  return {
    temperature_c: temperature || undefined,
    humidity_pct: humidity || undefined,
    device_id: snapshot.deviceId || bindingDeviceId || undefined,
    source: source as EnvSnapshotSource,
    captured_at: snapshot.capturedAt || undefined,
  };
}

export function measurementRowSource(row: StructuredRowData): string {
  if (row.method === "iot_switchbot") {
    return "registry_poll";
  }
  return "manual_entry";
}

export function envSnapshotSourceLabel(source: EnvSnapshotSource | ""): string {
  switch (source) {
    case "ingest_snapshot":
    case "registry_poll":
      return "機器から取得";
    case "manual_entry":
      return "手入力";
    default:
      return "未設定";
  }
}

/** ingest 取得失敗時のユーザー向け文言（TELEMETRY_NOT_FOUND は手入力フォールバックを案内） */
export function formatEnvTelemetryFetchError(detail: string): string {
  if (detail.includes("TELEMETRY_NOT_FOUND")) {
    return "この機器の最新データがまだありません。下の行に手入力するか、しばらくしてから再度取得してください。";
  }
  return detail;
}

export function isEnvTelemetryNotFoundError(detail: string): boolean {
  return detail.includes("TELEMETRY_NOT_FOUND");
}

export interface DeviceRegistryEntry {
  device_id: string;
  display_name?: string;
  name?: string;
}

/** 機器レジストリから表示名を解決（見つからなければ ID をそのまま返す） */
export function resolveDeviceDisplayLabel(
  deviceId: string,
  registry: DeviceRegistryEntry[],
): string {
  const trimmed = deviceId.trim();
  if (!trimmed) {
    return "";
  }
  const found = registry.find((entry) => entry.device_id === trimmed);
  return found?.display_name?.trim() || found?.name?.trim() || trimmed;
}

/** env_snapshot 行から photo_condition 向け項目（アスペクト比等）を除外する */
export function sanitizeEnvSnapshotRows(rows: StructuredRowData[]): StructuredRowData[] {
  const envOnly = rows.filter((row) => row.item === "温度" || row.item === "湿度");
  if (envOnly.length >= 2) {
    return envOnly;
  }
  return DEFAULT_ENV_SNAPSHOT_ROWS.map((row) => {
    const existing = envOnly.find((entry) => entry.item === row.item);
    return existing ?? row;
  });
}

/** Remove one row while keeping at least `minRows` entries (default 1). */
export function removeDraftRowAt<T>(rows: T[], index: number, minRows = 1): T[] {
  if (rows.length <= minRows || index < 0 || index >= rows.length) {
    return rows;
  }
  return rows.filter((_, rowIndex) => rowIndex !== index);
}

/** Reindex per-row sync maps after a row is removed. */
export function reindexRowSyncMap<T>(map: Record<number, T>, removedIndex: number): Record<number, T> {
  const next: Record<number, T> = {};
  for (const [key, value] of Object.entries(map)) {
    const rowIndex = Number(key);
    if (rowIndex < removedIndex) {
      next[rowIndex] = value;
    } else if (rowIndex > removedIndex) {
      next[rowIndex - 1] = value;
    }
  }
  return next;
}

export function writeDraft(draft: ObservationDraft): WriteDraftResult {
  const storage = getSessionStorage();
  if (!storage) {
    return { ok: true };
  }
  cacheDraftPhoto(draft);
  const payload = JSON.stringify(slimDraftForSessionStorage(draft));
  try {
    storage.setItem(DRAFT_STORAGE_KEY, payload);
    return { ok: true };
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      console.error("writeDraft failed", error);
      return { ok: false, warning: "下書きの保存に失敗しました。" };
    }
    try {
      storage.removeItem(DRAFT_STORAGE_KEY);
      storage.setItem(DRAFT_STORAGE_KEY, payload);
      return { ok: true };
    } catch (retryError) {
      console.warn("writeDraft quota exceeded after retry", retryError);
      return {
        ok: false,
        warning:
          "下書きをブラウザに保存できませんでした（容量不足）。このタブでの入力は続行できます。",
      };
    }
  }
}

export function clearDraft() {
  const storage = getSessionStorage();
  inMemoryPhotoCache = null;
  storage?.removeItem(DRAFT_STORAGE_KEY);
}

export function readCommitRecord(): ObservationCommitRecord | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parseJson<ObservationCommitRecord>(window.sessionStorage.getItem(COMMIT_STORAGE_KEY));
}

export function writeCommitRecord(record: ObservationCommitRecord) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(COMMIT_STORAGE_KEY, JSON.stringify(record));
}

export function addMonthsToDateIso(base: Date, months: number): string {
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

export function prefillNextObservationFromTemplate(
  template: {
    default_follow_up_interval?: { unit?: string; value?: number };
    follow_up_intervals_by_stage?: Record<string, { interval?: { unit?: string; value?: number } }>;
  } | null,
  stageKey: string,
): { date: string; source: "template_default" } | null {
  if (!template) {
    return null;
  }
  const byStage = template.follow_up_intervals_by_stage?.[stageKey]?.interval;
  const fallback = template.default_follow_up_interval;
  const interval = byStage ?? fallback;
  if (!interval || interval.unit !== "month" || !interval.value) {
    return null;
  }
  return {
    date: addMonthsToDateIso(new Date(), interval.value),
    source: "template_default",
  };
}

export function normalizeObservationEdit(edit: string | null | undefined): ObservationEditSection | null {
  if (edit === "photo" || edit === "measurement" || edit === "env") {
    return edit;
  }
  if (edit === "periodic") {
    return "env";
  }
  return null;
}

function hasContextQuery(context: ObservationInputQueryContext): boolean {
  return Boolean(
    context.species?.trim() ||
      context.targetId?.trim() ||
      context.individualId?.trim(),
  );
}

export function resolveDraftForInput(
  currentDraft: ObservationDraft | null,
  context: ObservationInputQueryContext,
): ObservationDraft {
  const fromConfirm = context.from === "confirm";
  const queryHasContext = hasContextQuery(context);
  const speciesFromQuery = context.species?.trim() ?? "";
  const querySpeciesChanged =
    Boolean(speciesFromQuery) &&
    Boolean(currentDraft?.species.trim()) &&
    currentDraft?.species.trim() !== speciesFromQuery;

  const shouldStartFreshContext =
    !fromConfirm && queryHasContext && (!currentDraft || querySpeciesChanged);
  const base = shouldStartFreshContext
    ? DEFAULT_OBSERVATION_DRAFT
    : (currentDraft ?? DEFAULT_OBSERVATION_DRAFT);

  return {
    ...base,
    species: speciesFromQuery || base.species,
    scopeRoute: context.scopeRoute?.trim() || base.scopeRoute,
    individualId: context.individualId?.trim() || base.individualId,
    targetId: context.targetId?.trim() || base.targetId,
  };
}
