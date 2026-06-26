/** SwitchBot sync / ingest snapshot → structured row value (OBS-RX · ADR-H-35). */

export interface DeviceSyncResponse {
  status?: string;
  device_id?: string;
  readings?: {
    temperature_c?: number | null;
    humidity_pct?: number | null;
    light_level?: number | null;
  };
  sanitized?: {
    temperatureC?: number;
    humidityPct?: number;
    co2Ppm?: number;
    lightLevel?: number;
  };
}

export type DeviceReadingContext = "measurement" | "photo_condition";

/** photo_conditions で IoT 取得可能な項目（B モデル: 照明は手入力のみ） */
export const PHOTO_CONDITION_IOT_ITEMS = new Set(["照度レベル"]);

export type PhotoConditionMethod = "manual_entry" | "iot_switchbot";

export function photoConditionSupportsIot(item: string): boolean {
  return PHOTO_CONDITION_IOT_ITEMS.has(item.trim());
}

/** 撮影条件行の方法 DD 候補（OBS-RX-ROW-11: 照度レベルのみ IoT） */
export function resolvePhotoConditionMethodChoices(item: string): PhotoConditionMethod[] {
  return photoConditionSupportsIot(item) ? ["manual_entry", "iot_switchbot"] : ["manual_entry"];
}

/** 旧 draft / テンプレ由来の不正 method を手入力へ矯正 */
export function sanitizePhotoConditionRow<T extends { item: string; method: string; deviceId?: string }>(
  row: T,
): T {
  const item = row.item.trim();
  const allowed = resolvePhotoConditionMethodChoices(item);
  let method = row.method;
  if (method === "iot") {
    method = "iot_switchbot";
  }
  if (method === "ingest_snapshot" || method === "registry_poll" || method === "device_fetch") {
    method = "manual_entry";
  }
  if (!allowed.includes(method as PhotoConditionMethod)) {
    method = "manual_entry";
  }
  const deviceId = method === "iot_switchbot" ? row.deviceId ?? "" : "";
  return { ...row, item, method, deviceId };
}

export function readNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatLightLevel(level: number): { value: string; unit: string } {
  const discrete = Math.round(level);
  return { value: String(discrete), unit: "level" };
}

/**
 * Strict item matching — no temperature/humidity fallback for unknown items.
 * photo_condition + 照明 → null (manual LED/color temp only).
 */
export function resolveRowReading(
  item: string,
  status: DeviceSyncResponse,
  context: DeviceReadingContext = "measurement",
): { value: string; unit: string } | null {
  const temperature = readNumeric(status.readings?.temperature_c ?? status.sanitized?.temperatureC);
  const humidity = readNumeric(status.readings?.humidity_pct ?? status.sanitized?.humidityPct);
  const co2 = readNumeric(status.sanitized?.co2Ppm);
  const lightLevel = readNumeric(status.readings?.light_level ?? status.sanitized?.lightLevel);

  if (context === "photo_condition") {
    if (item === "照明") {
      return null;
    }
    if (item === "照度レベル" && lightLevel !== null) {
      return formatLightLevel(lightLevel);
    }
    return null;
  }

  if (item === "温度" && temperature !== null) {
    return { value: String(temperature), unit: "°C" };
  }
  if (item === "湿度" && humidity !== null) {
    return { value: String(humidity), unit: "%" };
  }
  if (item === "CO2濃度" && co2 !== null) {
    return { value: String(co2), unit: "ppm" };
  }
  if (item === "照度レベル" && lightLevel !== null) {
    return formatLightLevel(lightLevel);
  }
  return null;
}

export function photoConditionIotUnsupportedMessage(item: string): string {
  if (item === "照明") {
    return "照明は手入力のみです（LED・色温度を記録してください）";
  }
  return "この項目は IoT 取得に対応していません";
}
