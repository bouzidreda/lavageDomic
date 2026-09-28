import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { rateLimit } from "./middleware/rateLimit";
import { errorMiddleware } from "./middleware/error";

import { healthRouter } from "./modules/health/health.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { providersRouter } from "./modules/providers/providers.routes";
import { bookingsRouter } from "./modules/bookings/bookings.routes";
import { reviewsRouter } from "./modules/reviews/reviews.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit);

  app.get("/", (_req, res) => res.json({ ok: true, name: "lavadom-api" }));

  app.use("/v1/health", healthRouter);
  app.use("/v1/auth", authRouter);
  app.use("/v1/users", usersRouter);
  app.use("/v1/providers", providersRouter);
  app.use("/v1/bookings", bookingsRouter);
  app.use("/v1/reviews", reviewsRouter);

  app.use(errorMiddleware);

  return app;
}
