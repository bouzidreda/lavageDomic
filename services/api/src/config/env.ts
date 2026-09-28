import "dotenv/config";
import { z } from "zod";

const S = z.object({
  API_PORT: z.coerce.number().default(4000),
  ORACLE_USER: z.string(),
  ORACLE_PASSWORD: z.string(),
  ORACLE_CONNECT_STRING: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TTL_SEC: z.coerce.number().default(900),
  JWT_REFRESH_TTL_SEC: z.coerce.number().default(2592000),
  BCRYPT_COST: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_PER_MIN: z.coerce.number().default(120)
});

export const env = S.parse(process.env);
