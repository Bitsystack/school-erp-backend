import mongoose, { Schema, Document } from "mongoose";

export interface INotificationLog extends Document {
  organization_id: mongoose.Types.ObjectId;
  recipient_phone: string;
  recipient_name?: string;
  recipient_role?: string;
  channel: "WHATSAPP" | "SMS" | "EMAIL";
  template_id?: string;
  message_content: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  sent_at: Date;
  error_reason?: string;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    recipient_phone: { type: String, required: true, trim: true },
    recipient_name: { type: String, trim: true },
    recipient_role: { type: String, default: "Parent" },
    channel: {
      type: String,
      enum: ["WHATSAPP", "SMS", "EMAIL"],
      default: "WHATSAPP",
    },
    template_id: { type: String, trim: true },
    message_content: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
      default: "SENT",
    },
    sent_at: { type: Date, default: Date.now },
    error_reason: { type: String },
  },
  { timestamps: true }
);

notificationLogSchema.index({ organization_id: 1, sent_at: -1 });
notificationLogSchema.index({ organization_id: 1, recipient_phone: 1 });
notificationLogSchema.index({ status: 1 });

export const NotificationLog = mongoose.model<INotificationLog>(
  "NotificationLog",
  notificationLogSchema
);
