import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { createBookingSchema, updateStatusSchema } from "./bookings.schemas";
import { create, mine, provider, status } from "./bookings.controller";

export const bookingsRouter = Router();
bookingsRouter.post("/", requireAuth, requireRole("CLIENT", "ADMIN"), validateBody(createBookingSchema), asyncHandler(create));
bookingsRouter.get("/me", requireAuth, asyncHandler(mine));
bookingsRouter.get("/provider", requireAuth, requireRole("PROVIDER", "ADMIN"), asyncHandler(provider));
bookingsRouter.patch("/status", requireAuth, validateBody(updateStatusSchema), asyncHandler(status));
