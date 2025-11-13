import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import reportController from "./report.controller";

const router = Router();

router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["golf_club", "admin", "golfer"]), reportController.createReport);

router.get("/", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), reportController.getAllReports);

router.get("/:reportId", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), reportController.getReportById);

router.delete("/:reportId", authMiddleware.authenticate, authMiddleware.authorize(["admin"]), reportController.deleteReport,
);

export default router;
