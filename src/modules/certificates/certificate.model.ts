import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  organization_id: mongoose.Types.ObjectId;
  student_id?: mongoose.Types.ObjectId;
  certificate_type: "TRANSFER" | "BONAFIDE" | "CHARACTER";
  certificate_no: string;
  student_name: string;
  admission_no: string;
  class_name: string;
  father_name: string;
  dob?: string;
  reason_for_leaving?: string;
  conduct_remark?: string;
  issue_date: Date;
  qr_code: string;
  status: "ISSUED" | "REVOKED";
}

const certificateSchema = new Schema<ICertificate>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    student_id: { type: Schema.Types.ObjectId, ref: "Student" },
    certificate_type: {
      type: String,
      enum: ["TRANSFER", "BONAFIDE", "CHARACTER"],
      required: true,
    },
    certificate_no: { type: String, required: true, trim: true },
    student_name: { type: String, required: true, trim: true },
    admission_no: { type: String, required: true, trim: true },
    class_name: { type: String, required: true, trim: true },
    father_name: { type: String, required: true, trim: true },
    dob: { type: String, trim: true },
    reason_for_leaving: { type: String, trim: true },
    conduct_remark: { type: String, default: "Excellent" },
    issue_date: { type: Date, default: Date.now },
    qr_code: { type: String, required: true, unique: true },
    status: { type: String, enum: ["ISSUED", "REVOKED"], default: "ISSUED" },
  },
  { timestamps: true }
);

certificateSchema.index(
  { organization_id: 1, certificate_no: 1 },
  { unique: true }
);
certificateSchema.index({ organization_id: 1, student_id: 1 });
certificateSchema.index({ qr_code: 1 }, { unique: true });

export const Certificate = mongoose.model<ICertificate>(
  "Certificate",
  certificateSchema
);
