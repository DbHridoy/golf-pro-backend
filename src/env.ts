import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BASE_URL: z.string().default("/api/v1"),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.url().nonempty("MONGO_URI is required"),
  JWT_SECRET: z.string().default("lp01yPo31ACozd4pDI9Z1DSD30A"),
  JWT_REFRESH_SECRET: z.string().default("rwN17KgtvujqVe6jANmu3r5FIFY0jw"),
  JWT_EXPIRY: z.string(),
  CLIENT_URL: z.url().default("http://localhost:3000"),
  JWT_REFRESH_EXPIRY: z.string(),
  SALT_ROUNDS: z.coerce.number().default(12),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  GMAIL_USER: z.string(),
  GMAIL_PASS: z.string(),
  GOLF_API_KEY: z.string().default("5821ef48-e3ee-473b-a20d-140800c2b914"),
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
