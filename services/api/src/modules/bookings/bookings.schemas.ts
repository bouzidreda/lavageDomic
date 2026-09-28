import { z } from "zod";

export const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  scheduledAt: z.string().min(10),
  address: z.string().min(5).max(300),
  notes: z.string().max(2000).optional(),
  serviceIds: z.array(z.string().uuid()).min(1).max(10)
});

export const updateStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["PENDING","CONFIRMED","IN_PROGRESS","DONE","CANCELLED"])
});
