import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeApiBase,
  resolveApiPath,
  resolvePublicApiBase,
} from "./api-base";

describe("normalizeApiBase", () => {
  it("strips trailing slashes and /api suffix", () => {
    expect(normalizeApiBase("https://api.example.com/api/")).toBe("https://api.example.com");
    expect(normalizeApiBase("https://api.example.com")).toBe("https://api.example.com");
  });
});

describe("resolvePublicApiBase", () => {
  const envSnapshot = () => ({
    pub: process.env.NEXT_PUBLIC_IHL_API_URL,
    srv: process.env.IHL_API_URL,
  });

  const restoreEnv = (pub: string | undefined, srv: string | undefined) => {
    if (pub === undefined) {
      delete process.env.NEXT_PUBLIC_IHL_API_URL;
    } else {
      process.env.NEXT_PUBLIC_IHL_API_URL = pub;
    }
    if (srv === undefined) {
      delete process.env.IHL_API_URL;
    } else {
      process.env.IHL_API_URL = srv;
    }
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers NEXT_PUBLIC_IHL_API_URL", () => {
    const { pub, srv } = envSnapshot();
    process.env.NEXT_PUBLIC_IHL_API_URL = "https://api.it-hercules.uk";
    process.env.IHL_API_URL = "https://other.example.com";
    expect(resolvePublicApiBase()).toBe("https://api.it-hercules.uk");
    restoreEnv(pub, srv);
  });

  it("falls back to https IHL_API_URL at build time", () => {
    const { pub, srv } = envSnapshot();
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    process.env.IHL_API_URL = "https://api.it-hercules.uk";
    expect(resolvePublicApiBase()).toBe("https://api.it-hercules.uk");
    restoreEnv(pub, srv);
  });

  it("does not expose internal docker hostnames to the browser", () => {
    const { pub, srv } = envSnapshot();
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    process.env.IHL_API_URL = "http://api:8000";
    expect(resolvePublicApiBase()).toBe("");
    restoreEnv(pub, srv);
  });

  it("falls back to production API host at runtime", () => {
    const { pub, srv } = envSnapshot();
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    delete process.env.IHL_API_URL;
    vi.stubGlobal("window", { location: { hostname: "it-hercules.uk" } });
    expect(resolvePublicApiBase()).toBe("https://api.it-hercules.uk");
    restoreEnv(pub, srv);
  });
});

describe("resolveApiPath", () => {
  const restoreEnv = (pub: string | undefined, srv: string | undefined) => {
    if (pub === undefined) {
      delete process.env.NEXT_PUBLIC_IHL_API_URL;
    } else {
      process.env.NEXT_PUBLIC_IHL_API_URL = pub;
    }
    if (srv === undefined) {
      delete process.env.IHL_API_URL;
    } else {
      process.env.IHL_API_URL = srv;
    }
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefixes relative api paths when base is set", () => {
    const prevPub = process.env.NEXT_PUBLIC_IHL_API_URL;
    const prevSrv = process.env.IHL_API_URL;
    process.env.NEXT_PUBLIC_IHL_API_URL = "https://api.it-hercules.uk";
    vi.stubGlobal("window", { location: { hostname: "it-hercules.uk" } });
    expect(resolveApiPath("/api/v1/terms")).toBe("https://api.it-hercules.uk/api/v1/terms");
    restoreEnv(prevPub, prevSrv);
  });

  it("keeps same-origin paths in local dev", () => {
    const prevPub = process.env.NEXT_PUBLIC_IHL_API_URL;
    const prevSrv = process.env.IHL_API_URL;
    delete process.env.NEXT_PUBLIC_IHL_API_URL;
    process.env.IHL_API_URL = "http://localhost:8000";
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    expect(resolveApiPath("/api/v1/terms")).toBe("/api/v1/terms");
    restoreEnv(prevPub, prevSrv);
  });
});
