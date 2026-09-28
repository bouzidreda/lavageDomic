import { z } from "zod";

export const searchSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  maxKm: z.number().min(0.1).max(200),
  minRating: z.number().min(0).max(5).optional(),
  sort: z.enum(["DISTANCE", "RATING", "PRICE"]).optional(),
  q: z.string().max(120).optional()
});

export const updateProviderSchema = z.object({
  bio: z.string().max(2000).optional(),
  city: z.string().max(120).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(0.1).max(200).optional(),
  priceFrom: z.number().min(0).max(100000).optional()
});
