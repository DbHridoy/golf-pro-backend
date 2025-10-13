import { model, Schema } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Optional: automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OTPModel = model("OTP", otpSchema);
export default OTPModel;
