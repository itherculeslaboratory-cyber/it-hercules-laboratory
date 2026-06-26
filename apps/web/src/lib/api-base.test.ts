import { describe, expect, it } from "vitest";
import { normalizeApiBase, resolvePublicApiBase } from "./api-base";

describe("normalizeApiBase", () => {
  it("strips trailing slashes and /api suffix", () => {
    expect(normalizeApiBase("https://api.example.com/api/")).toBe("https://api.example.com");
    expect(normalizeApiBase("https://api.example.com")).toBe("https://api.example.com");
  });
});

describe("resolvePublicApiBase", () => {
  it("prefers NEXT_PUBLIC_IHL_API_URL", () => {
    const prevPub = process.env.NEXT_PUBLIC_IHL_API_URL;
    const prevSrv = process.env.IHL_API_URL;
    process.env.NEXT_PUBLIC_IHL_API_URL = "https://api.it-hercules.uk";
    process.env.IHL_API_URL = "https://other.example.com";
    expect(resolvePublicApiBase()).toBe("https://api.it-hercules.uk");
    process.env.NEXT_PUBLIC_IHL_API_URL = prevPub;
    process.env.IHL_API_URL = prevSrv;
  });

  it("falls back to https IHL_API_URL at build time", () => {
    const prevPub = process.env.NEXT_PUBLIC_IHL_API_URL;
    const prevSrv = process.env.IHL_API_URL;
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    process.env.IHL_API_URL = "https://api.it-hercules.uk";
    expect(resolvePublicApiBase()).toBe("https://api.it-hercules.uk");
    process.env.NEXT_PUBLIC_IHL_API_URL = prevPub;
    process.env.IHL_API_URL = prevSrv;
  });

  it("does not expose internal docker hostnames to the browser", () => {
    const prevPub = process.env.NEXT_PUBLIC_IHL_API_URL;
    const prevSrv = process.env.IHL_API_URL;
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    process.env.IHL_API_URL = "http://api:8000";
    expect(resolvePublicApiBase()).toBe("");
    process.env.NEXT_PUBLIC_IHL_API_URL = prevPub;
    process.env.IHL_API_URL = prevSrv;
  });
});
