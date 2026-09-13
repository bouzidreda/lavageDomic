import type { Request, Response } from "express";
import {
  forgotPasswordForEmail,
  loginUser,
  refreshTokens,
  registerUser,
  resetPasswordWithToken
} from "./auth.service";

export async function register(req: Request, res: Response) {
  const out = await registerUser(req.body);
  res.json(out);
}

export async function login(req: Request, res: Response) {
  const out = await loginUser(req.body);
  res.json(out);
}

export async function refresh(req: Request, res: Response) {
  const out = await refreshTokens(req.body);
  res.json(out);
}

export async function forgotPassword(req: Request, res: Response) {
  const out = await forgotPasswordForEmail(req.body.email);
  res.json(out);
}

export async function resetPassword(req: Request, res: Response) {
  const out = await resetPasswordWithToken(req.body.token, req.body.newPassword);
  res.json(out);
}

export async function logout(_req: Request, res: Response) {
  res.json({ ok: true });
}