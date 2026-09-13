import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtClaims = { sub: string; role: "CLIENT" | "PROVIDER" | "ADMIN" };

export function signAccess(claims: JwtClaims) {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SEC });
}

export function signRefresh(claims: JwtClaims) {
  return jwt.sign(claims, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL_SEC });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtClaims;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtClaims;
}
