import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  organization_id: mongoose.Types.ObjectId;
  leave_applied_by: mongoose.Types.ObjectId; // User ID (teacher/staff)
  leave_type: "Sick" | "Casual" | "Earned" | "Maternity" | "Other";
  leave_from_date: Date;
  leave_to_date: Date;
  leave_total_days: number;
  leave_reason: string;
  leave_document?: string;
  leave_status: "Pending" | "Approved" | "Rejected";
  leave_approved_by?: mongoose.Types.ObjectId;
  leave_approved_at?: Date;
  leave_rejection_reason?: string;
}

const leaveSchema = new Schema<ILeave>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    leave_applied_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leave_type: {
      type: String,
      enum: ["Sick", "Casual", "Earned", "Maternity", "Other"],
      required: true,
    },
    leave_from_date: { type: Date, required: true },
    leave_to_date: { type: Date, required: true },
    leave_total_days: { type: Number, required: true },
    leave_reason: { type: String, required: true },
    leave_document: String,
    leave_status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    leave_approved_by: { type: Schema.Types.ObjectId, ref: "User" },
    leave_approved_at: Date,
    leave_rejection_reason: String,
  },
  { timestamps: true },
);

leaveSchema.index({ organization_id: 1, leave_applied_by: 1 });
leaveSchema.index({ organization_id: 1, leave_status: 1 });

export const Leave = mongoose.model<ILeave>("Leave", leaveSchema);
