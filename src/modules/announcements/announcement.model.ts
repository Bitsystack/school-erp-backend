import mongoose, { Schema, Document } from "mongoose";

export type AnnouncementTarget = "All" | "Teachers" | "Students" | "Parents" | "Staff";

export interface IAnnouncement extends Document {
  organization_id: mongoose.Types.ObjectId;
  announcement_title: string;
  announcement_content: string;
  announcement_target: AnnouncementTarget;
  announcement_class_ids?: mongoose.Types.ObjectId[];
  announcement_attachments?: string[];
  announcement_published_by: mongoose.Types.ObjectId;
  announcement_publish_date?: Date;
  announcement_expiry_date?: Date;
  announcement_is_published: boolean;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    announcement_title: { type: String, required: true, trim: true },
    announcement_content: { type: String, required: true },
    announcement_target: {
      type: String,
      enum: ["All", "Teachers", "Students", "Parents", "Staff"],
      default: "All",
    },
    announcement_class_ids: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    announcement_attachments: [String],
    announcement_published_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    announcement_publish_date: { type: Date, default: Date.now },
    announcement_expiry_date: Date,
    announcement_is_published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

announcementSchema.index({ organization_id: 1, announcement_target: 1 });

export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema,
);
