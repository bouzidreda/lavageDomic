import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(190).optional(),
  phone: z.string().min(6).max(40).optional()
});

export const upsertAddressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(2).max(80),
  addressLine: z.string().min(5).max(300),
  city: z.string().max(120).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional()
});

export const upsertVehicleSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(2).max(120),
  brand: z.string().max(80).optional(),
  model: z.string().max(120).optional(),
  plateNumber: z.string().max(40).optional(),
  color: z.string().max(40).optional()
});