import { model, Schema } from "mongoose";

const ReportSchema = new Schema(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reported: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReportModel = model("Report", ReportSchema);

export default ReportModel;
