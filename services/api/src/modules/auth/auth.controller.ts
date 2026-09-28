import type { Request, Response } from "express";
import { registerUser, loginUser, refreshTokens } from "./auth.service";

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

export async function logout(_req: Request, res: Response) {
  res.json({ ok: true });
}
