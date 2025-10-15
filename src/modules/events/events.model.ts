import { model, Schema } from "mongoose";

const EventSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
}, { timestamps: true });

const EventModel = model("Event", EventSchema);
export default EventModel;
