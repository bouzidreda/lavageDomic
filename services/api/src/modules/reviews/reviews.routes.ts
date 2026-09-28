import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { createReviewSchema } from "./reviews.schemas";
import { create, listByProvider } from "./reviews.controller";

export const reviewsRouter = Router();
reviewsRouter.get("/provider/:providerId", asyncHandler(listByProvider));
reviewsRouter.post("/", requireAuth, requireRole("CLIENT", "ADMIN"), validateBody(createReviewSchema), asyncHandler(create));
