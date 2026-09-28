import crypto from "crypto";
import { env } from "../config/env";

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const keylen = 32;
  const iter = 100000 + env.BCRYPT_COST * 1000;
  const h = crypto.pbkdf2Sync(password, salt, iter, keylen, "sha256").toString("hex");
  return `${salt}:${iter}:${h}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, iterS, h] = stored.split(":");
  if (!salt || !iterS || !h) return false;
  const iter = Number(iterS);
  if (!Number.isFinite(iter) || iter <= 0) return false;
  const keylen = 32;
  const calc = crypto.pbkdf2Sync(password, salt, iter, keylen, "sha256").toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(calc, "hex"), Buffer.from(h, "hex"));
  } catch {
    return false;
  }
}