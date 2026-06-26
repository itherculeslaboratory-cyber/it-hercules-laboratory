import { AUTH_SESSION_COOKIE, getCookie } from "@/lib/auth-session";
import { resolveApiBase, resolveApiPath } from "@/lib/api-base";

function sessionHeaders(): Record<string, string> {
  const token = getCookie(AUTH_SESSION_COOKIE);
  if (!token) {
    return {};
  }
  return { "X-IHL-Session": token };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveApiPath(path);
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: isFormData
      ? { ...sessionHeaders(), ...init?.headers }
      : {
          "Content-Type": "application/json",
          ...sessionHeaders(),
          ...init?.headers,
        },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(String(detail), res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};
