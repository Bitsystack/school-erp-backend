import mongoose, { Schema, Document } from "mongoose";

// Fee Structure (defines fee types per class)
export interface IFeeStructure extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  fee_title: string;
  fee_description?: string;
  fee_amount: number;
  fee_frequency: "Monthly" | "Quarterly" | "Annually" | "OneTime";
  fee_due_day?: number;
  fee_session?: string;
  fee_status: boolean;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    fee_title: { type: String, required: true, trim: true },
    fee_description: String,
    fee_amount: { type: Number, required: true },
    fee_frequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annually", "OneTime"],
      required: true,
    },
    fee_due_day: Number,
    fee_session: String,
    fee_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FeeStructure = mongoose.model<IFeeStructure>(
  "FeeStructure",
  feeStructureSchema,
);

// Fee Collection (payment records per student)
export interface IFeeCollection extends Document {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  fee_structure_id: mongoose.Types.ObjectId;
  collection_amount_paid: number;
  collection_discount?: number;
  collection_fine?: number;
  collection_total_amount: number;
  collection_balance: number;
  collection_payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer";
  collection_payment_date: Date;
  collection_receipt_no: string;
  collection_month?: string;
  collection_remarks?: string;
  collected_by: mongoose.Types.ObjectId;
}

const feeCollectionSchema = new Schema<IFeeCollection>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    fee_structure_id: {
      type: Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    collection_amount_paid: { type: Number, required: true },
    collection_discount: { type: Number, default: 0 },
    collection_fine: { type: Number, default: 0 },
    collection_total_amount: { type: Number, required: true },
    collection_balance: { type: Number, default: 0 },
    collection_payment_mode: {
      type: String,
      enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
      required: true,
    },
    collection_payment_date: { type: Date, default: Date.now },
    collection_receipt_no: { type: String, required: true, unique: true },
    collection_month: String,
    collection_remarks: String,
    collected_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

feeCollectionSchema.index({ organization_id: 1, student_id: 1 });

export const FeeCollection = mongoose.model<IFeeCollection>(
  "FeeCollection",
  feeCollectionSchema,
);
