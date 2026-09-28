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

export function updateProviderProfile(input: { bio?: string; city?: string; lat?: number; lng?: number; radiusKm?: number; priceFrom?: number }) {
  return api<{ provider: Provider }>("/v1/providers/me", "PATCH", input);
}

export function myProviderProfile() {
  return api<{ provider: Provider }>("/v1/providers/me", "GET");
}
