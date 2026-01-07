import type { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "@/middlewares/error-handler.middleware";
import { notFound } from "@/middlewares/not-found.middleware";
import rootRouter from "@/routes/index.js";

import { env } from "./env.js";
import { initializeEventScheduler } from "./services/event-scheduler.service.js";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
initializeEventScheduler();

app.get("/", (req, res) => {
  res.json({
    message: "<<<<<<<<<<<<<<<<<<<<  API is running in full speed!!!  >>>>>>>>>>>>>>>>>>>>>>>>>",
  });
});

app.use(env.BASE_URL, rootRouter);

app.use(notFound);
app.use(errorHandler);

export default app;