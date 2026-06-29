import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  subject_name: string;
  subject_code: string;
  subject_type: "Theory" | "Practical" | "Both";
  subject_teacher_id?: mongoose.Types.ObjectId;
  subject_full_marks?: number;
  subject_pass_marks?: number;
  subject_status: boolean;
}

const subjectSchema = new Schema<ISubject>(
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
    subject_name: { type: String, required: true, trim: true },
    subject_code: { type: String, required: true, trim: true },
    subject_type: {
      type: String,
      enum: ["Theory", "Practical", "Both"],
      default: "Theory",
    },
    subject_teacher_id: { type: Schema.Types.ObjectId, ref: "Teacher" },
    subject_full_marks: { type: Number, default: 100 },
    subject_pass_marks: { type: Number, default: 33 },
    subject_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

subjectSchema.index(
  { organization_id: 1, class_id: 1, subject_code: 1 },
  { unique: true },
);

export const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
