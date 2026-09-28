import { env } from "../lib/env";
import { authStore } from "../store/auth";
import { refresh } from "./auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, payload: unknown) {
    super(`API Error ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

async function rawRequest(path: string, method: HttpMethod, body?: unknown, accessToken?: string) {
  const res = await fetch(`${env.API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await res.json().catch(() => ({}));
  return { res, payload };
}

export async function api<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = authStore.getAccessToken();
  let { res, payload } = await rawRequest(path, method, body, token ?? undefined);

  if (res.status === 401) {
    const rt = authStore.getRefreshToken();
    if (rt) {
      try {
        const refreshed = await refresh({ refreshToken: rt });
        authStore.setTokens(refreshed.tokens);
        ({ res, payload } = await rawRequest(path, method, body, refreshed.tokens.accessToken));
      } catch {
        authStore.clear();
      }
    }
  }

  if (!res.ok) throw new ApiError(res.status, payload);

  if ((payload as any)?.tokens?.accessToken) authStore.setTokens((payload as any).tokens);

  return payload as T;
}