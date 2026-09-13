import { z } from "zod";

export const updateUserStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]),
    reason: z.string().max(500).optional()
  })
  .superRefine((v, ctx) => {
    if (v.status === "SUSPENDED" && !v.reason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "SUSPEND_REASON_REQUIRED"
      });
    }
  });

export const updateProviderVerificationSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  notes: z.string().max(500).optional()
});

export const upsertCmsPageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  content: z.string().min(1).max(30000)
});

export const reviewProviderDocumentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().max(500).optional()
});
