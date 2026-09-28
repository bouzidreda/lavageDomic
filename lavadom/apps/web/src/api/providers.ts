import { api } from "./client";

export type Provider = {
  id: string;
  name: string;
  bio: string | null;
  city: string | null;
  lat: number;
  lng: number;
  radiusKm: number;
  priceFrom: number;
  ratingAvg: number;
  ratingCount: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  identityDocUrl: string | null;
  availabilityJson: string | null;
  availabilityStatus: "AVAILABLE" | "OFFLINE";
  distanceKm?: number;
};

export function searchProviders(input: {
  lat: number;
  lng: number;
  maxKm: number;
  minRating?: number;
  sort?: "DISTANCE" | "RATING" | "PRICE";
  q?: string;
}) {
  return api<{ items: Provider[] }>("/v1/providers/search", "POST", input);
}

export function getProvider(id: string) {
  return api<{ provider: Provider; services: { id: string; name: string; price: number }[] }>("/v1/providers/" + id, "GET");
}

export function updateProviderProfile(input: {
  bio?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  priceFrom?: number;
  identityDocUrl?: string;
  availabilityJson?: string;
  availabilityStatus?: "AVAILABLE" | "OFFLINE";
}) {
  return api<{ provider: Provider }>("/v1/providers/me", "PATCH", input);
}

export function myProviderProfile() {
  return api<{ provider: Provider }>("/v1/providers/me", "GET");
}

export function myProviderDocuments() {
  return api<{
    items: Array<{
      id: string;
      type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER";
      label: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      rejectionReason: string | null;
      reviewedAt: string | null;
      createdAt: string;
    }>;
  }>("/v1/providers/me/documents", "GET");
}

export function submitProviderDocuments(input: {
  items: Array<{ type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER"; label?: string; payload: string }>;
}) {
  return api<{ items: Array<{ id: string; status: string }> }>("/v1/providers/me/documents", "POST", input);
}
