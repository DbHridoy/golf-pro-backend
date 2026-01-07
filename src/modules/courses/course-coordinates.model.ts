import { model, Schema } from "mongoose";

const CourseCoordinateSchema = new Schema(
  {},
  { strict: false, timestamps: true },
);

const CourseCoordinate = model("CourseCoordinate", CourseCoordinateSchema);

export default CourseCoordinate;
