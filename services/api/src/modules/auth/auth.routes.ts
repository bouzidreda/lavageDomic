import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";
import { login, refresh, register, logout } from "./auth.controller";

export const authRouter = Router();
authRouter.post("/register", validateBody(registerSchema), asyncHandler(register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(login));
authRouter.post("/refresh", validateBody(refreshSchema), asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
