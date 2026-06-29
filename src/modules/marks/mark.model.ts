import mongoose, { Schema, Document } from "mongoose";

export interface IMark extends Document {
  organization_id: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  mark_obtained: number;
  mark_full: number;
  mark_pass: number;
  mark_grade?: string;
  mark_remark?: string;
  entered_by: mongoose.Types.ObjectId;
}

const markSchema = new Schema<IMark>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    exam_id: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class_id: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    mark_obtained: { type: Number, required: true },
    mark_full: { type: Number, required: true, default: 100 },
    mark_pass: { type: Number, required: true, default: 33 },
    mark_grade: String,
    mark_remark: String,
    entered_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

markSchema.index(
  { exam_id: 1, student_id: 1, subject_id: 1 },
  { unique: true },
);

export const Mark = mongoose.model<IMark>("Mark", markSchema);
