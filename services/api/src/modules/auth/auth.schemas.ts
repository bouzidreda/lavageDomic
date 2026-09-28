import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(40),
  password: z.string().min(6).max(200),
  role: z.enum(["CLIENT", "PROVIDER"])
});

export const loginSchema = z.object({
  phone: z.string().min(6).max(40),
  password: z.string().min(6).max(200)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
