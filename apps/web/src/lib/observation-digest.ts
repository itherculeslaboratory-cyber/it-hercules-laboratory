import type { ObservationDraft } from "@/lib/observation-draft";
import { buildEnvironmentSnapshotCommitBody, measurementRowSource } from "@/lib/observation-draft";

type DigestRow = {
  item: string;
  value: string;
  unit: string;
  method: string;
  device_id?: string;
  source?: string;
};

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function buildObservationCommitDigestPayload(draft: ObservationDraft) {
  const rows: DigestRow[] = draft.rows
    .filter((row) => row.item.trim() && row.value.trim())
    .map((row) => ({
      item: row.item.trim(),
      value: row.value.trim(),
      unit: row.unit || "",
      method: row.method || "manual_entry",
      ...(row.deviceId ? { device_id: row.deviceId } : {}),
      source: measurementRowSource(row),
    }));

  const photoConditions = draft.photoConditions
    .filter((row) => row.item.trim())
    .map((row) => ({
      item: row.item.trim(),
      value: row.value || "",
      unit: row.unit || "",
      method: row.method || "manual_entry",
      ...(row.deviceId ? { device_id: row.deviceId } : {}),
    }));

  const devices = draft.devices
    .filter((d) => d.deviceId.trim())
    .map((d) => ({
      device_id: d.deviceId,
      role: d.role,
      source: d.source,
    }));

  const envSnapshot = buildEnvironmentSnapshotCommitBody(draft);
  const envOut =
    envSnapshot && Object.keys(envSnapshot).length > 0 ? envSnapshot : null;

  const payload: Record<string, unknown> = {
    v: 1,
    species: draft.species || "",
    stage_name: draft.stage || "adult",
    sex: draft.sex || "unknown",
    has_photo: draft.hasPhoto,
    schema_version: 1,
    rows,
    photo_conditions: photoConditions,
    devices,
  };

  if (draft.individualId) payload.individual_id = draft.individualId;
  if (draft.priorCaptureId) payload.prior_capture_id = draft.priorCaptureId;
  if (draft.entryMode) payload.entry_mode = draft.entryMode;
  if (draft.placementId) payload.placement_id = draft.placementId;
  if (envOut) payload.environment_snapshot = envOut;

  return payload;
}

export async function computeObservationClientContentDigest(draft: ObservationDraft): Promise<string> {
  const canonical = canonicalJson(buildObservationCommitDigestPayload(draft));
  const enc = new TextEncoder().encode(canonical);
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return "";
  }
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function resolvePhotoDataUrl(draft: ObservationDraft): string | undefined {
  return draft.photoFile?.dataUrl || draft.photoPreviewUrl || draft.photoPreview || undefined;
}
