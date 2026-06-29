import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  organization_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  staff_employee_id: string;
  staff_name: string;
  staff_email: string;
  staff_phone: string;
  staff_gender: "Male" | "Female" | "Other";
  staff_dob?: Date;
  staff_department?: string;
  staff_designation?: string;
  staff_qualification?: string;
  staff_experience?: number;
  staff_joining_date?: Date;
  staff_salary?: number;
  staff_address?: string;
  staff_photo?: string;
  staff_status: boolean;
}

const staffSchema = new Schema<IStaff>(
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
    staff_employee_id: { type: String, required: true, unique: true },
    staff_name: { type: String, required: true, trim: true },
    staff_email: { type: String, required: true, lowercase: true },
    staff_phone: { type: String, required: true },
    staff_gender: { type: String, enum: ["Male", "Female", "Other"] },
    staff_dob: Date,
    staff_department: String,
    staff_designation: String,
    staff_qualification: String,
    staff_experience: { type: Number, default: 0 },
    staff_joining_date: Date,
    staff_salary: { type: Number, default: 0 },
    staff_address: String,
    staff_photo: { type: String, default: "" },
    staff_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Staff = mongoose.model<IStaff>("Staff", staffSchema);
