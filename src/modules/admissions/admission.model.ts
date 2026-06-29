import mongoose, { Schema, Document } from "mongoose";

export interface IAdmission extends Document {
  organization_id: mongoose.Types.ObjectId;
  admission_form_no: string;
  applicant_name: string;
  applicant_dob: Date;
  applicant_gender: "Male" | "Female" | "Other";
  applicant_phone: string;
  applicant_email?: string;
  applicant_address?: string;
  applicant_photo?: string;
  admission_class_id?: mongoose.Types.ObjectId;
  admission_session?: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  previous_school?: string;
  previous_class?: string;
  admission_documents?: string[];
  admission_status: "Pending" | "Approved" | "Rejected" | "Enrolled";
  admission_notes?: string;
  processed_by?: mongoose.Types.ObjectId;
  processed_at?: Date;
}

const admissionSchema = new Schema<IAdmission>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    admission_form_no: { type: String, required: true, unique: true },
    applicant_name: { type: String, required: true, trim: true },
    applicant_dob: { type: Date, required: true },
    applicant_gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    applicant_phone: { type: String, required: true },
    applicant_email: String,
    applicant_address: String,
    applicant_photo: String,
    admission_class_id: { type: Schema.Types.ObjectId, ref: "Class" },
    admission_session: String,
    father_name: String,
    father_phone: String,
    mother_name: String,
    mother_phone: String,
    previous_school: String,
    previous_class: String,
    admission_documents: [String],
    admission_status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Enrolled"],
      default: "Pending",
    },
    admission_notes: String,
    processed_by: { type: Schema.Types.ObjectId, ref: "User" },
    processed_at: Date,
  },
  { timestamps: true },
);

admissionSchema.index({ organization_id: 1, admission_status: 1 });

export const Admission = mongoose.model<IAdmission>(
  "Admission",
  admissionSchema,
);
