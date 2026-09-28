import { z } from "zod";

const providerDocumentSchema = z.object({
  type: z.enum(["NATIONAL_ID", "DRIVING_LICENSE", "PASSPORT", "OWNERSHIP_PAPER"]),
  label: z.string().max(160).optional(),
  payload: z.string().min(20).max(200000)
});

export const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(190),
    phone: z.string().min(6).max(40),
    password: z.string().min(8).max(200),
    role: z.enum(["CLIENT", "PROVIDER"]),
    providerDocuments: z.array(providerDocumentSchema).max(8).optional()
  })
  .superRefine((val, ctx) => {
    if (val.role === "PROVIDER" && (!val.providerDocuments || val.providerDocuments.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["providerDocuments"],
        message: "Provider account requires at least one identity document"
      });
    }
  });

export const loginSchema = z.object({
  identifier: z.string().min(3).max(190),
  password: z.string().min(8).max(200)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(190)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(256),
  newPassword: z.string().min(8).max(200)
});