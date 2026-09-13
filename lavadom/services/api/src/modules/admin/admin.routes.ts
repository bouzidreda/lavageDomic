import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  dashboard,
  listBookings,
  listProviderDocuments,
  listCms,
  listUsers,
  userDetails,
  reviewProviderDocument,
  reportCommissions,
  upsertCms,
  updateProviderVerification,
  updateUserStatus
} from "./admin.controller";
import {
  reviewProviderDocumentSchema,
  updateProviderVerificationSchema,
  updateUserStatusSchema,
  upsertCmsPageSchema
} from "./admin.schemas";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/dashboard", asyncHandler(dashboard));
adminRouter.get("/users", asyncHandler(listUsers));
adminRouter.get("/users/:id", asyncHandler(userDetails));
adminRouter.patch("/users/:id/status", validateBody(updateUserStatusSchema), asyncHandler(updateUserStatus));
adminRouter.get("/providers/:id/documents", asyncHandler(listProviderDocuments));
adminRouter.patch("/providers/:providerId/documents/:documentId/review", validateBody(reviewProviderDocumentSchema), asyncHandler(reviewProviderDocument));
adminRouter.patch("/providers/:id/verification", validateBody(updateProviderVerificationSchema), asyncHandler(updateProviderVerification));
adminRouter.get("/reports/commissions", asyncHandler(reportCommissions));
adminRouter.get("/bookings", asyncHandler(listBookings));
adminRouter.get("/cms", asyncHandler(listCms));
adminRouter.post("/cms", validateBody(upsertCmsPageSchema), asyncHandler(upsertCms));
