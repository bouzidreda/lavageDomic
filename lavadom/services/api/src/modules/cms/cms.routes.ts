import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getCms } from "./cms.controller";

export const cmsRouter = Router();

cmsRouter.get("/:slug", asyncHandler(getCms));
