import { api } from "./client";

export type Booking = {
  id: string;
  providerId: string;
  clientId: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  scheduledAt: string;
  address: string;
  notes: string | null;
  totalPrice: number;
  createdAt: string;
};

export function createBooking(input: {
  providerId: string;
  scheduledAt: string;
  address: string;
  notes?: string;
  serviceIds: string[];
}) {
  return api<{ booking: Booking }>("/v1/bookings", "POST", input);
}

export function myBookings() {
  return api<{ items: Booking[] }>("/v1/bookings/me", "GET");
}

export function providerBookings() {
  return api<{ items: Booking[] }>("/v1/bookings/provider", "GET");
}

export function updateBookingStatus(input: { bookingId: string; status: Booking["status"] }) {
  return api<{ booking: Booking }>("/v1/bookings/status", "PATCH", input);
}
