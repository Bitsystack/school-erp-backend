import mongoose, { Schema, Document } from "mongoose";

export interface ISalaryRecord extends Document {
  organization_id: mongoose.Types.ObjectId;
  employee_id: mongoose.Types.ObjectId;     // Teacher or Staff user_id
  employee_type: "Teacher" | "Staff";
  salary_month: string;  // e.g., "2024-01"
  salary_basic: number;
  salary_allowances?: number;
  salary_deductions?: number;
  salary_bonus?: number;
  salary_fine?: number;
  salary_net: number;
  salary_payment_date?: Date;
  salary_payment_mode?: "Cash" | "Bank Transfer" | "Cheque";
  salary_status: "Pending" | "Paid";
  salary_remark?: string;
  paid_by?: mongoose.Types.ObjectId;
}

const salarySchema = new Schema<ISalaryRecord>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    employee_type: {
      type: String,
      enum: ["Teacher", "Staff"],
      required: true,
    },
    salary_month: { type: String, required: true },
    salary_basic: { type: Number, required: true },
    salary_allowances: { type: Number, default: 0 },
    salary_deductions: { type: Number, default: 0 },
    salary_bonus: { type: Number, default: 0 },
    salary_fine: { type: Number, default: 0 },
    salary_net: { type: Number, required: true },
    salary_payment_date: Date,
    salary_payment_mode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque"],
    },
    salary_status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    salary_remark: String,
    paid_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

salarySchema.index(
  { organization_id: 1, employee_id: 1, salary_month: 1 },
  { unique: true },
);

export const SalaryRecord = mongoose.model<ISalaryRecord>(
  "SalaryRecord",
  salarySchema,
);
