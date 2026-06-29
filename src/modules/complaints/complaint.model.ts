import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  organization_id: mongoose.Types.ObjectId;
  complaint_title: string;
  complaint_description: string;
  complaint_type?: string;
  complaint_raised_by: mongoose.Types.ObjectId;  // User ID
  complaint_against?: string;
  complaint_attachments?: string[];
  complaint_status: "Open" | "In Progress" | "Resolved" | "Closed";
  complaint_resolved_by?: mongoose.Types.ObjectId;
  complaint_resolved_at?: Date;
  complaint_resolution_note?: string;
}

const complaintSchema = new Schema<IComplaint>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    complaint_title: { type: String, required: true, trim: true },
    complaint_description: { type: String, required: true },
    complaint_type: String,
    complaint_raised_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaint_against: String,
    complaint_attachments: [String],
    complaint_status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    complaint_resolved_by: { type: Schema.Types.ObjectId, ref: "User" },
    complaint_resolved_at: Date,
    complaint_resolution_note: String,
  },
  { timestamps: true },
);

complaintSchema.index({ organization_id: 1, complaint_status: 1 });

export const Complaint = mongoose.model<IComplaint>(
  "Complaint",
  complaintSchema,
);
