import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validateBody } from "../../middleware/validate";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema
} from "./auth.schemas";
import { forgotPassword, login, refresh, register, logout, resetPassword } from "./auth.controller";

export const authRouter = Router();
authRouter.post("/register", validateBody(registerSchema), asyncHandler(register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(login));
authRouter.post("/refresh", validateBody(refreshSchema), asyncHandler(refresh));
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(forgotPassword));
authRouter.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(resetPassword));
authRouter.post("/logout", asyncHandler(logout));