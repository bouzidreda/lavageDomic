import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { searchSchema, submitProviderDocumentsSchema, updateProviderSchema } from "./providers.schemas";
import { byId, me, myDocuments, patchMe, search, submitDocuments } from "./providers.controller";

export const providersRouter = Router();
providersRouter.post("/search", validateBody(searchSchema), asyncHandler(search));
providersRouter.get("/me", requireAuth, requireRole("PROVIDER", "ADMIN"), asyncHandler(me));
providersRouter.patch("/me", requireAuth, requireRole("PROVIDER", "ADMIN"), validateBody(updateProviderSchema), asyncHandler(patchMe));
providersRouter.get("/me/documents", requireAuth, requireRole("PROVIDER", "ADMIN"), asyncHandler(myDocuments));
providersRouter.post("/me/documents", requireAuth, requireRole("PROVIDER", "ADMIN"), validateBody(submitProviderDocumentsSchema), asyncHandler(submitDocuments));
providersRouter.get("/:id", asyncHandler(byId));
