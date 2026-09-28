import type { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt";

export type AuthedReq = Request & { user?: { id: string; role: "CLIENT" | "PROVIDER" | "ADMIN" } };

export function requireAuth(req: AuthedReq, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "UNAUTHORIZED" });
  const token = h.slice("Bearer ".length);
  try {
    const c = verifyAccess(token);
    req.user = { id: c.sub, role: c.role };
    next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}

export function requireRole(...roles: Array<"CLIENT" | "PROVIDER" | "ADMIN">) {
  return (req: AuthedReq, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "FORBIDDEN" });
    next();
  };
}
