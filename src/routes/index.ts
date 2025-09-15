import express from "express";

import authRouter from "@/modules/auth/auth.route";

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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
