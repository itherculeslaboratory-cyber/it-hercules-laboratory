"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog-init";

/** Mounts once in RootLayout; initPostHog() itself is the no-op guard. */
export function PostHogProvider() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}
