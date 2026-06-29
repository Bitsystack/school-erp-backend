import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  organization_id: mongoose.Types.ObjectId;
  event_title: string;
  event_description?: string;
  event_type?: string;
  event_start_date: Date;
  event_end_date?: Date;
  event_venue?: string;
  event_attachments?: string[];
  event_created_by: mongoose.Types.ObjectId;
  event_status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

const eventSchema = new Schema<IEvent>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    event_title: { type: String, required: true, trim: true },
    event_description: String,
    event_type: String,
    event_start_date: { type: Date, required: true },
    event_end_date: Date,
    event_venue: String,
    event_attachments: [String],
    event_created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
  },
  { timestamps: true },
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
