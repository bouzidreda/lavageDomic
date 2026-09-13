import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { upsertAddressSchema, upsertVehicleSchema, updateMeSchema } from "./users.schemas";
import {
  createOrUpdateAddress,
  createOrUpdateVehicle,
  deleteAddress,
  deleteVehicle,
  listAddresses,
  listVehicles,
  me,
  updateMe
} from "./users.controller";

export const usersRouter = Router();
usersRouter.get("/me", requireAuth, asyncHandler(me));
usersRouter.patch("/me", requireAuth, validateBody(updateMeSchema), asyncHandler(updateMe));

usersRouter.get("/me/addresses", requireAuth, asyncHandler(listAddresses));
usersRouter.post("/me/addresses", requireAuth, validateBody(upsertAddressSchema), asyncHandler(createOrUpdateAddress));
usersRouter.delete("/me/addresses/:id", requireAuth, asyncHandler(deleteAddress));

usersRouter.get("/me/vehicles", requireAuth, asyncHandler(listVehicles));
usersRouter.post("/me/vehicles", requireAuth, validateBody(upsertVehicleSchema), asyncHandler(createOrUpdateVehicle));
usersRouter.delete("/me/vehicles/:id", requireAuth, asyncHandler(deleteVehicle));