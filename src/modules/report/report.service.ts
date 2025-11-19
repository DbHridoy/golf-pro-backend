import reportRepository from "./report.repository";

class ReportService{
    reportProfile(reporter,reported,message){
        const newReport=reportRepository.createNewReport(reporter,reported,message)
        return newReport
    }
    getAllReports(){
        const allReports=reportRepository.getAllReports()
        return allReports
    }
}

const reportService=new ReportService()

export default reportService;