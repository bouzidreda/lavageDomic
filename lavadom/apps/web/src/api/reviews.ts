import { api } from "./client";

export type Review = {
  id: string;
  bookingId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export function listProviderReviews(providerId: string) {
  return api<{ items: Review[] }>("/v1/reviews/provider/" + providerId, "GET");
}

export function createReview(input: { bookingId: string; rating: number; comment?: string }) {
  return api<{ review: Review }>("/v1/reviews", "POST", input);
}
