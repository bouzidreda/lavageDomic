import { api } from "./client";

export type BookingStatus = "REQUESTED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type Booking = {
  id: string;
  providerId: string;
  clientId: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  notes: string | null;
  totalPrice: number;
  commissionAmount: number;
  providerAmount: number;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
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

export function updateBookingStatus(input: { bookingId: string; status: BookingStatus }) {
  return api<{ booking: Booking }>("/v1/bookings/status", "PATCH", input);
}

export function createPaymentIntent(input: { bookingId: string; method?: "PAYPAL" | "CASH" | "CARD" }) {
  return api<{ payment: { bookingId: string; method: string; providerOrderId: string; approveUrl: string; mocked: boolean } }>(
    "/v1/bookings/payment-intent",
    "POST",
    input
  );
}

export function capturePayment(input: { bookingId: string }) {
  return api<{ payment: { bookingId: string; status: string; captureId: string; mocked: boolean } }>(
    "/v1/bookings/payment-capture",
    "POST",
    input
  );
}