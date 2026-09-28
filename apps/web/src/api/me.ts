import { api } from "./client";

export function me() {
  return api<{ user: { id: string; role: string; name: string; phone: string } }>("/v1/users/me", "GET");
}

export function updateMe(input: { name?: string; phone?: string }) {
  return api<{ user: { id: string; role: string; name: string; phone: string } }>("/v1/users/me", "PATCH", input);
}
