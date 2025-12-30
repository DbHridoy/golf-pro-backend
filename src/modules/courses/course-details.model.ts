import { model, Schema } from "mongoose";

const CourseDetailsSchema = new Schema(
  {},
  { strict: false, timestamps: true },
);

const CourseDetails = model("CourseDetails", CourseDetailsSchema);

export default CourseDetails