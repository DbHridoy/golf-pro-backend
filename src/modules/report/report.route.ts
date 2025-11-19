import { Router } from "express";

import reportController from "./report.controller";

const router = Router();

router.post("/report-profile", reportController.reportProfile);
router.get("/get-all-reports", reportController.getAllReports);

export default router;
