import { describe, expect, it } from "vitest";
import { DEFAULT_ACTOR_ID } from "./useAuthSession";

describe("DEFAULT_ACTOR_ID", () => {
  it("is the dev fallback tenant id", () => {
    expect(DEFAULT_ACTOR_ID).toBe("u_demo");
  });
});
