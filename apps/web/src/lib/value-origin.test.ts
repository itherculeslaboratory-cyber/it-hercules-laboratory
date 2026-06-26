import { describe, expect, it } from "vitest";
import { formatValueOriginLabel, valueOriginTone } from "./value-origin";

describe("formatValueOriginLabel", () => {
  it("maps dictionary keys to Japanese labels", () => {
    expect(formatValueOriginLabel("direct_observed")).toBe("直接観測");
    expect(formatValueOriginLabel("image_derived")).toBe("画像由来");
    expect(formatValueOriginLabel("environment_derived")).toBe("環境由来");
  });

  it("falls back to source when value_origin is empty", () => {
    expect(formatValueOriginLabel(null, "image_derived")).toBe("画像由来");
  });

  it("returns em dash when both are missing", () => {
    expect(formatValueOriginLabel(null, null)).toBe("—");
  });
});

describe("valueOriginTone", () => {
  it("assigns semantic tones for known origins", () => {
    expect(valueOriginTone("direct_observed")).toBe("success");
    expect(valueOriginTone("image_derived")).toBe("warning");
    expect(valueOriginTone("environment_derived")).toBe("info");
    expect(valueOriginTone(undefined)).toBe("muted");
  });
});
