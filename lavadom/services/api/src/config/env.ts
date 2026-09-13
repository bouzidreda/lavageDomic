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
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
  RATE_LIMIT_PER_MIN: z.coerce.number().default(120),
  APP_BASE_URL: z.string().default("http://localhost:5173"),
  PASSWORD_RESET_TTL_MIN: z.coerce.number().default(30),
  PLATFORM_COMMISSION_RATE: z.coerce.number().default(0.15),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("no-reply@lavadom.ma"),
  SMS_FROM: z.string().default("Lavadom"),
  DOCS_ENCRYPTION_KEY: z.string().min(16).default("change-me-in-production"),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_API_BASE: z.string().default("https://api-m.sandbox.paypal.com")
});

export const env = S.parse(process.env);
