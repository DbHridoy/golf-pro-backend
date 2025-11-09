import ReportModel from "./report.model";

class ReportRepository {
  async getAllReports() {
    return await ReportModel.find().lean();
  }
  async findReportById(reportId) {
    const report = await ReportModel.findById(reportId).lean();
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  }

  async createNewReport(reporter, reported, message) {
    const data = {
      reporter,
      reported,
      message,
    };
    const newReport = new ReportModel(data);
    return await newReport.save();
  }
}

const reportRepository = new ReportRepository();

export default reportRepository;
