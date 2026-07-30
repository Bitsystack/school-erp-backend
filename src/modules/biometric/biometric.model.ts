import mongoose, { Schema, Document } from "mongoose";

export interface IBiometricLog extends Document {
  organization_id: mongoose.Types.ObjectId;
  device_id: string;
  device_name: string;
  location: string;
  user_ref_id?: mongoose.Types.ObjectId;
  user_type: "Student" | "Teacher" | "Staff" | "Visitor";
  biometric_user_id: string;
  user_name: string;
  punch_time: Date;
  punch_direction: "IN" | "OUT";
  verification_mode: "FP" | "CARD" | "FACE" | "PIN";
  status: "SUCCESS" | "DENIED";
}

const biometricLogSchema = new Schema<IBiometricLog>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    device_id: { type: String, required: true, trim: true },
    device_name: { type: String, required: true, trim: true },
    location: { type: String, default: "Main Gate" },
    user_ref_id: { type: Schema.Types.ObjectId },
    user_type: {
      type: String,
      enum: ["Student", "Teacher", "Staff", "Visitor"],
      default: "Student",
    },
    biometric_user_id: { type: String, required: true, trim: true },
    user_name: { type: String, required: true, trim: true },
    punch_time: { type: Date, default: Date.now },
    punch_direction: { type: String, enum: ["IN", "OUT"], required: true },
    verification_mode: {
      type: String,
      enum: ["FP", "CARD", "FACE", "PIN"],
      default: "FACE",
    },
    status: { type: String, enum: ["SUCCESS", "DENIED"], default: "SUCCESS" },
  },
  { timestamps: true }
);

biometricLogSchema.index({ organization_id: 1, punch_time: -1 });
biometricLogSchema.index({ organization_id: 1, biometric_user_id: 1 });
biometricLogSchema.index({ device_id: 1 });

export const BiometricLog = mongoose.model<IBiometricLog>(
  "BiometricLog",
  biometricLogSchema
);
