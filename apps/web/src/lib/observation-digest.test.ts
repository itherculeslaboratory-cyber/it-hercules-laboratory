import { describe, expect, it } from "vitest";
import { buildObservationCommitDigestPayload } from "@/lib/observation-digest";
import { DEFAULT_OBSERVATION_DRAFT } from "@/lib/observation-draft";

describe("observation-digest", () => {
  it("builds stable digest payload from draft rows", () => {
    const draft = {
      ...DEFAULT_OBSERVATION_DRAFT,
      species: "Dynastes hercules hercules",
      rows: [{ item: "体長", value: "70", unit: "mm", method: "manual_entry", deviceId: "", source: "manual_entry" }],
    };
    const payload = buildObservationCommitDigestPayload(draft);
    expect(payload.v).toBe(1);
    expect(payload.rows).toHaveLength(1);
    expect(payload.rows[0]).toMatchObject({ item: "体長", value: "70" });
  });
});
