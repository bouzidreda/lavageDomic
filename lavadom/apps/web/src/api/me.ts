import { api } from "./client";
import type { UserProfile } from "./auth";

export function me() {
  return api<{ user: UserProfile }>("/v1/users/me", "GET");
}

export function updateMe(input: { name?: string; email?: string; phone?: string }) {
  return api<{ user: UserProfile }>("/v1/users/me", "PATCH", input);
}

export type UserAddress = {
  id: string;
  label: string;
  addressLine: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
};

export type UserVehicle = {
  id: string;
  label: string;
  brand: string | null;
  model: string | null;
  plateNumber: string | null;
  color: string | null;
};

export function listAddresses() {
  return api<{ items: UserAddress[] }>("/v1/users/me/addresses", "GET");
}

export function upsertAddress(input: {
  id?: string;
  label: string;
  addressLine: string;
  city?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}) {
  return api<{ item: UserAddress }>("/v1/users/me/addresses", "POST", input);
}

export function deleteAddress(id: string) {
  return api<{ ok: true }>(`/v1/users/me/addresses/${id}`, "DELETE");
}

export function listVehicles() {
  return api<{ items: UserVehicle[] }>("/v1/users/me/vehicles", "GET");
}

export function upsertVehicle(input: {
  id?: string;
  label: string;
  brand?: string;
  model?: string;
  plateNumber?: string;
  color?: string;
}) {
  return api<{ item: UserVehicle }>("/v1/users/me/vehicles", "POST", input);
}

export function deleteVehicle(id: string) {
  return api<{ ok: true }>(`/v1/users/me/vehicles/${id}`, "DELETE");
}