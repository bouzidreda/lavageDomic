import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const msg = err?.message ?? "SERVER_ERROR";
  res.status(status).json({
    error: msg,
    ...(err?.details ? { details: err.details } : {})
  });
}
