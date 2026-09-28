import { api } from "./client";

export type AuthResponse = {
  user: { id: string; role: string; name: string; phone: string };
  tokens: { accessToken: string; refreshToken: string };
};

export function login(input: { phone: string; password: string }) {
  return api<AuthResponse>("/v1/auth/login", "POST", input);
}

export function register(input: { name: string; phone: string; password: string; role: "CLIENT" | "PROVIDER" }) {
  return api<AuthResponse>("/v1/auth/register", "POST", input);
}

export function refresh(input: { refreshToken: string }) {
  return api<AuthResponse>("/v1/auth/refresh", "POST", input);
}

export function logout() {
  return api<{ ok: true }>("/v1/auth/logout", "POST");
}
