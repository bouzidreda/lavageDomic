import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { searchSchema, updateProviderSchema } from "./providers.schemas";
import { byId, me, patchMe, search } from "./providers.controller";

export const providersRouter = Router();
providersRouter.post("/search", validateBody(searchSchema), asyncHandler(search));
providersRouter.get("/:id", asyncHandler(byId));
providersRouter.get("/me", requireAuth, requireRole("PROVIDER", "ADMIN"), asyncHandler(me));
providersRouter.patch("/me", requireAuth, requireRole("PROVIDER", "ADMIN"), validateBody(updateProviderSchema), asyncHandler(patchMe));
