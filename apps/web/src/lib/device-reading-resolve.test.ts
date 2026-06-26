import { describe, expect, it } from "vitest";
import {
  photoConditionIotUnsupportedMessage,
  photoConditionSupportsIot,
  resolvePhotoConditionMethodChoices,
  resolveRowReading,
  sanitizePhotoConditionRow,
  type DeviceSyncResponse,
} from "./device-reading-resolve";

const hub3Status: DeviceSyncResponse = {
  status: "ok",
  device_id: "hub3-7e",
  readings: {
    temperature_c: 22.0,
    humidity_pct: 45.0,
    light_level: 7,
  },
  sanitized: {
    temperatureC: 22.0,
    humidityPct: 45.0,
    lightLevel: 7,
  },
};

describe("resolveRowReading", () => {
  it("maps 照度レベル to light_level (discrete level, not lux)", () => {
    expect(resolveRowReading("照度レベル", hub3Status)).toEqual({ value: "7", unit: "level" });
    expect(resolveRowReading("照度レベル", hub3Status, "photo_condition")).toEqual({
      value: "7",
      unit: "level",
    });
  });

  it("does not return temperature for 照明 in photo_conditions", () => {
    expect(resolveRowReading("照明", hub3Status, "photo_condition")).toBeNull();
  });

  it("does not fallback to temperature for unknown photo_condition items", () => {
    expect(resolveRowReading("背景", hub3Status, "photo_condition")).toBeNull();
    expect(resolveRowReading("色補正", hub3Status, "photo_condition")).toBeNull();
  });

  it("strictly matches measurement rows without fallback", () => {
    expect(resolveRowReading("体長", hub3Status)).toBeNull();
    expect(resolveRowReading("温度", hub3Status)).toEqual({ value: "22", unit: "°C" });
    expect(resolveRowReading("湿度", hub3Status)).toEqual({ value: "45", unit: "%" });
  });

  it("photoConditionSupportsIot whitelist", () => {
    expect(photoConditionSupportsIot("照度レベル")).toBe(true);
    expect(photoConditionSupportsIot(" 照度レベル ")).toBe(true);
    expect(photoConditionSupportsIot("照明")).toBe(false);
    expect(photoConditionSupportsIot("温度")).toBe(false);
  });

  it("resolvePhotoConditionMethodChoices exposes IoT only for 照度レベル", () => {
    expect(resolvePhotoConditionMethodChoices("照度レベル")).toEqual(["manual_entry", "iot_switchbot"]);
    expect(resolvePhotoConditionMethodChoices("照明")).toEqual(["manual_entry"]);
    expect(resolvePhotoConditionMethodChoices("アスペクト比")).toEqual(["manual_entry"]);
  });

  it("sanitizePhotoConditionRow resets invalid IoT methods", () => {
    expect(
      sanitizePhotoConditionRow({
        item: "照明",
        value: "LED",
        unit: "",
        method: "iot_switchbot",
        deviceId: "hub3-1",
      }),
    ).toEqual({
      item: "照明",
      value: "LED",
      unit: "",
      method: "manual_entry",
      deviceId: "",
    });
    expect(
      sanitizePhotoConditionRow({
        item: "照度レベル",
        value: "",
        unit: "level",
        method: "device_fetch",
        deviceId: "",
      }),
    ).toEqual({
      item: "照度レベル",
      value: "",
      unit: "level",
      method: "manual_entry",
      deviceId: "",
    });
    expect(
      sanitizePhotoConditionRow({
        item: "照度レベル",
        value: "7",
        unit: "level",
        method: "iot_switchbot",
        deviceId: "hub3-1",
      }).method,
    ).toBe("iot_switchbot");
  });

  it("photoConditionIotUnsupportedMessage for 照明", () => {
    expect(photoConditionIotUnsupportedMessage("照明")).toContain("手入力");
  });
});
