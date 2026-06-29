import mongoose, { Schema, Document } from "mongoose";

export interface IHomework extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  section_id?: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  teacher_id: mongoose.Types.ObjectId;
  homework_title: string;
  homework_description?: string;
  homework_attachments?: string[];
  homework_assign_date: Date;
  homework_submission_date: Date;
  homework_status: boolean;
}

const homeworkSchema = new Schema<IHomework>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    section_id: { type: Schema.Types.ObjectId, ref: "Section" },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher_id: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    homework_title: { type: String, required: true, trim: true },
    homework_description: String,
    homework_attachments: [String],
    homework_assign_date: { type: Date, default: Date.now },
    homework_submission_date: { type: Date, required: true },
    homework_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

homeworkSchema.index({ organization_id: 1, class_id: 1 });

export const Homework = mongoose.model<IHomework>("Homework", homeworkSchema);
