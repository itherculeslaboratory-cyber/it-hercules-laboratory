"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AUTH_SESSION_COOKIE, clearAuthSessionCookie, getCookie } from "@/lib/auth-session";

export const DEFAULT_ACTOR_ID = "u_demo";

interface SessionResponse {
  status: string;
  actor_id: string;
}

export function useAuthSession() {
  const [actorId, setActorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getCookie(AUTH_SESSION_COOKIE)) {
      setActorId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<SessionResponse>("/api/v1/auth/session");
      setActorId(res.actor_id);
    } catch {
      clearAuthSessionCookie();
      setActorId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearAuthSessionCookie();
    setActorId(null);
    window.location.href = "/login";
  }, []);

  return {
    actorId,
    isAuthenticated: Boolean(actorId),
    loading,
    logout,
    refresh,
  };
}

/** Session actor_id when logged in; dev fallback `u_demo` when not. */
export function useActorId() {
  const { actorId, loading } = useAuthSession();
  return { actorId: actorId ?? DEFAULT_ACTOR_ID, loading, isAuthenticated: Boolean(actorId) };
}
