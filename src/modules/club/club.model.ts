import { model, Schema } from "mongoose";

const ClubSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    email: { type: String, required: true },
    description: { type: String },
})

const ClubModel = model('Club', ClubSchema);
export default ClubModel