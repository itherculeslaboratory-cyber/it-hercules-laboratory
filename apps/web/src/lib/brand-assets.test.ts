import { describe, expect, it } from "vitest";
import { isIndulgenceSku } from "@/components/brand/econ-icon";
import { BRAND_ASSETS } from "@/lib/brand-assets";

describe("brand assets", () => {
  it("exposes public paths for logo and economy icons", () => {
    expect(BRAND_ASSETS.logoPrimary).toBe("/brand/logo-primary.png");
    expect(BRAND_ASSETS.logoMark).toBe("/brand/logo-mark.png");
    expect(BRAND_ASSETS.favicon).toBe("/favicon.png");
    expect(BRAND_ASSETS.ptCoin).toBe("/economy/pt-coin.png");
    expect(BRAND_ASSETS.indulgence).toBe("/economy/indulgence-token.png");
  });

  it("detects indulgence shop SKUs", () => {
    expect(isIndulgenceSku("indulgence_7d")).toBe(true);
    expect(isIndulgenceSku("pt_boost")).toBe(false);
  });
});
