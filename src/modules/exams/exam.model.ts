import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  exam_name: string;
  exam_term?: string;
  exam_session?: string;
  exam_start_date: Date;
  exam_end_date: Date;
  exam_description?: string;
  exam_status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

const examSchema = new Schema<IExam>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_id: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    exam_name: { type: String, required: true, trim: true },
    exam_term: String,
    exam_session: String,
    exam_start_date: { type: Date, required: true },
    exam_end_date: { type: Date, required: true },
    exam_description: String,
    exam_status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
  },
  { timestamps: true },
);

examSchema.index({ organization_id: 1, class_id: 1 });

export const Exam = mongoose.model<IExam>("Exam", examSchema);
