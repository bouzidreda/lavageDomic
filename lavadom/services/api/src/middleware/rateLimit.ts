import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 60_000;

  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  b.count += 1;
  if (b.count > env.RATE_LIMIT_PER_MIN) return res.status(429).json({ error: "RATE_LIMIT" });
  return next();
}
