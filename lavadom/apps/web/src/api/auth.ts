import { api } from "./client";

export type UserProfile = {
  id: string;
  role: "CLIENT" | "PROVIDER" | "ADMIN";
  name: string;
  email: string;
  phone: string;
  accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  emailVerified: boolean;
};

export type AuthResponse = {
  user: UserProfile;
  tokens: { accessToken: string; refreshToken: string };
};

export type ProviderDocumentInput = {
  type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER";
  label?: string;
  payload: string;
};

export function login(input: { identifier: string; password: string }) {
  return api<AuthResponse>("/v1/auth/login", "POST", input);
}

export function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
  providerDocuments?: ProviderDocumentInput[];
}) {
  return api<AuthResponse>("/v1/auth/register", "POST", input);
}

export function refresh(input: { refreshToken: string }) {
  return api<AuthResponse>("/v1/auth/refresh", "POST", input);
}

export function forgotPassword(input: { email: string }) {
  return api<{ ok: true }>("/v1/auth/forgot-password", "POST", input);
}

export function resetPassword(input: { token: string; newPassword: string }) {
  return api<{ ok: true }>("/v1/auth/reset-password", "POST", input);
}

export function logout() {
  return api<{ ok: true }>("/v1/auth/logout", "POST");
}
