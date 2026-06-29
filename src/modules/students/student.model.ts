import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  organization_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  student_admission_no: string;
  student_roll_no?: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_gender: "Male" | "Female" | "Other";
  student_dob: Date;
  student_blood_group?: string;
  student_religion?: string;
  student_category?: string;
  student_address?: string;
  student_city?: string;
  student_state?: string;
  student_pincode?: string;
  student_photo?: string;
  student_class_id?: mongoose.Types.ObjectId;
  student_section_id?: mongoose.Types.ObjectId;
  student_session?: string;
  student_admission_date: Date;
  student_status: boolean;
  // Parent/Guardian Info
  father_name?: string;
  father_phone?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_occupation?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
}

const studentSchema = new Schema<IStudent>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    student_admission_no: {
      type: String,
      required: true,
      unique: true,
    },
    student_roll_no: String,
    student_name: { type: String, required: true, trim: true },
    student_email: { type: String, required: true, lowercase: true },
    student_phone: { type: String, required: true },
    student_gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    student_dob: { type: Date, required: true },
    student_blood_group: String,
    student_religion: String,
    student_category: String,
    student_address: String,
    student_city: String,
    student_state: String,
    student_pincode: String,
    student_photo: { type: String, default: "" },
    student_class_id: { type: Schema.Types.ObjectId, ref: "Class" },
    student_section_id: { type: Schema.Types.ObjectId, ref: "Section" },
    student_session: String,
    student_admission_date: { type: Date, default: Date.now },
    student_status: { type: Boolean, default: true },
    // Parent/Guardian
    father_name: String,
    father_phone: String,
    father_occupation: String,
    mother_name: String,
    mother_phone: String,
    mother_occupation: String,
    guardian_name: String,
    guardian_phone: String,
    guardian_relation: String,
  },
  { timestamps: true },
);

studentSchema.index({ organization_id: 1, student_status: 1 });
studentSchema.index({ organization_id: 1, student_class_id: 1 });

export const Student = mongoose.model<IStudent>("Student", studentSchema);
