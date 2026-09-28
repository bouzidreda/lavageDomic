import { z } from "zod";

export const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  scheduledAt: z.string().min(10).refine((v) => Number.isFinite(new Date(v).getTime()), "INVALID_SCHEDULED_AT"),
  address: z.string().min(5).max(300),
  notes: z.string().max(2000).optional(),
  serviceIds: z.array(z.string().uuid()).min(1).max(10)
});

export const updateStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["REQUESTED", "ACCEPTED", "DECLINED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "DONE", "CANCELLED"])
});

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(["PAYPAL", "CASH", "CARD"]).default("PAYPAL")
});

export const capturePaymentSchema = z.object({
  bookingId: z.string().uuid()
});
