import { model, Schema } from "mongoose";

const AdminSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
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
