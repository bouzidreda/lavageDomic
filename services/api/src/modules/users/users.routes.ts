import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { updateMeSchema } from "./users.schemas";
import { me, updateMe } from "./users.controller";

export const usersRouter = Router();
usersRouter.get("/me", requireAuth, asyncHandler(me));
usersRouter.patch("/me", requireAuth, validateBody(updateMeSchema), asyncHandler(updateMe));
