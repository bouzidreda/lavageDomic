import { env } from "../lib/env";
import { authStore } from "../store/auth";

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

export async function api<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = authStore.getAccessToken();
  const res = await fetch(`${env.API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, payload);

  if ((payload as any)?.tokens?.accessToken) authStore.setTokens((payload as any).tokens);

  return payload as T;
}
