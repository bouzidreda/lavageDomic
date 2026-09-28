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
  priceFrom: z.number().min(0).max(100000).optional(),
  identityDocUrl: z.string().url().max(500).optional(),
  availabilityJson: z.string().max(6000).optional(),
  availabilityStatus: z.enum(["AVAILABLE", "OFFLINE"]).optional()
});

export const submitProviderDocumentsSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(["NATIONAL_ID", "DRIVING_LICENSE", "PASSPORT", "OWNERSHIP_PAPER"]),
      label: z.string().max(160).optional(),
      payload: z.string().min(20).max(200000)
    })
  ).min(1).max(8)
});
