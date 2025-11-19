import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/async-handler.middleware";

import reportService from "./report.service";

class ReportController {
  reportProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const reporter = userId;
    const reported = req.body.reported;
    const message = req.body.message;
    const newReport = await reportService.reportProfile(
      reporter,
      reported,
      message
    );

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "You have successfully reported this profile",
      data: newReport,
    });
  });

  getAllReports = asyncHandler(async (req, res) => {
    const allReports = await reportService.getAllReports();
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Successfully fetched all the reports",
      data: allReports,
    });
  });
}

const reportController = new ReportController();

export default reportController;
