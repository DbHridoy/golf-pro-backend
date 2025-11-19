import { model, Schema } from "mongoose";

const AdminSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  fullName: {
    type: String,
    trim: true,
    required: true,
    maxlength: [100, "Full name cannot exceed 100 characters"],
  },
  gender: {
    type: String,
   
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  profileImage: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc: Record<string, any>, ret: Record<string, any>) {
      delete ret.__v;
      return ret;
    },
  },
});

AdminSchema.index({ userId: 1 }, { unique: true });

const AdminModel = model("Admin", AdminSchema);

export default AdminModel;
