import mongoose, { Schema, Document } from "mongoose";

export interface ISection extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  section_name: string;
  section_capacity?: number;
  section_class_teacher_id?: mongoose.Types.ObjectId;
  section_status: boolean;
}

const sectionSchema = new Schema<ISection>(
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
    section_name: { type: String, required: true, trim: true },
    section_capacity: { type: Number, default: 40 },
    section_class_teacher_id: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    section_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

sectionSchema.index(
  { organization_id: 1, class_id: 1, section_name: 1 },
  { unique: true },
);

export const Section = mongoose.model<ISection>("Section", sectionSchema);
