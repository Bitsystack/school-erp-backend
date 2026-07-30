import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
  organization_id: mongoose.Types.ObjectId;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  purpose: string;
  person_to_meet: string;
  person_role?: "Principal" | "Teacher" | "Staff" | "Student";
  gate_pass_no: string;
  badge_no?: string;
  check_in_time: Date;
  check_out_time?: Date;
  status: "ACTIVE" | "CHECKED_OUT";
  remarks?: string;
}

const visitorSchema = new Schema<IVisitor>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    visitor_name: { type: String, required: true, trim: true },
    visitor_phone: { type: String, required: true, trim: true },
    visitor_email: { type: String, trim: true },
    purpose: { type: String, required: true, trim: true },
    person_to_meet: { type: String, required: true, trim: true },
    person_role: {
      type: String,
      enum: ["Principal", "Teacher", "Staff", "Student"],
      default: "Teacher",
    },
    gate_pass_no: { type: String, required: true, trim: true },
    badge_no: { type: String, trim: true },
    check_in_time: { type: Date, default: Date.now },
    check_out_time: { type: Date },
    status: { type: String, enum: ["ACTIVE", "CHECKED_OUT"], default: "ACTIVE" },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

visitorSchema.index(
  { organization_id: 1, gate_pass_no: 1 },
  { unique: true }
);
visitorSchema.index({ organization_id: 1, check_in_time: -1 });
visitorSchema.index({ status: 1 });

export const Visitor = mongoose.model<IVisitor>("Visitor", visitorSchema);
