import express from "express";
import path from "node:path";

import authRouter from "@/modules/auth/auth.route";
import golferRouter from "@/modules/golfer/golfer.route";
import userRouter from "@/modules/user/user.route";

import docsRouter from "./docs.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/docs",
    route: docsRouter,
  },
  {
    path: "/users",
    route: userRouter,
  },
  {
    path: "/golfer",
    route: golferRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
