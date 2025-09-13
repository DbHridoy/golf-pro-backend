import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.url().nonempty("MONGO_URI is required"),
  JWT_SECRET: z.string().default("lp01yPo31ACozd4pDI9Z1DSD30A"),
  JWT_REFRESH_SECRET: z.string().default("rwN17KgtvujqVe6jANmu3r5FIFY0jw"),
  JWT_EXPIRY: z.string(),
  JWT_REFRESH_EXPIRY: z.string(),
  SALT_ROUNDS: z.number().default(12),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

try {
  // eslint-disable-next-line node/no-process-env
  envSchema.parse(process.env);
}
catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Missing environment variables:", error.issues.flatMap(issue => issue.path));
  }
  else {
    console.error(error);
  }
  process.exit(1);
}

// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(process.env);
