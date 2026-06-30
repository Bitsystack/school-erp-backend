import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_name: string;
  class_code: string;
  class_description?: string;
  class_status: boolean;
}

const classSchema = new Schema<IClass>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_name: { type: String, required: true, trim: true },
    class_code: { type: String, required: true, trim: true },
    class_description: String,
    class_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

classSchema.index({ organization_id: 1, class_name: 1 }, { unique: true });

export const Class = mongoose.model<IClass>("Class", classSchema);
