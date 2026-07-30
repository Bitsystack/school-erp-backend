import mongoose, { Schema, Document } from "mongoose";

export interface IIssueLog {
  issued_to_name: string;
  issued_to_role: "Student" | "Teacher" | "Staff" | "Department";
  quantity: number;
  issue_date: Date;
  return_date?: Date;
  status: "ISSUED" | "RETURNED";
  remarks?: string;
}

export interface IInventoryItem extends Document {
  organization_id: mongoose.Types.ObjectId;
  item_name: string;
  item_code: string;
  category: "Stationery" | "Sports" | "Lab Equipment" | "IT Hardware" | "Furniture" | "Uniform" | "Other";
  total_quantity: number;
  available_quantity: number;
  unit_price: number;
  supplier_name?: string;
  storage_location?: string;
  min_reorder_level: number;
  issue_logs: IIssueLog[];
  status: "ACTIVE" | "DISCONTINUED";
}

const issueLogSchema = new Schema<IIssueLog>({
  issued_to_name: { type: String, required: true, trim: true },
  issued_to_role: {
    type: String,
    enum: ["Student", "Teacher", "Staff", "Department"],
    default: "Staff",
  },
  quantity: { type: Number, required: true, min: 1 },
  issue_date: { type: Date, default: Date.now },
  return_date: { type: Date },
  status: { type: String, enum: ["ISSUED", "RETURNED"], default: "ISSUED" },
  remarks: { type: String, trim: true },
});

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    item_name: { type: String, required: true, trim: true },
    item_code: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Stationery", "Sports", "Lab Equipment", "IT Hardware", "Furniture", "Uniform", "Other"],
      default: "Stationery",
    },
    total_quantity: { type: Number, required: true, min: 0 },
    available_quantity: { type: Number, required: true, min: 0 },
    unit_price: { type: Number, default: 0 },
    supplier_name: { type: String, trim: true },
    storage_location: { type: String, trim: true },
    min_reorder_level: { type: Number, default: 5 },
    issue_logs: [issueLogSchema],
    status: { type: String, enum: ["ACTIVE", "DISCONTINUED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

inventoryItemSchema.index(
  { organization_id: 1, item_code: 1 },
  { unique: true }
);
inventoryItemSchema.index({ organization_id: 1, category: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>(
  "InventoryItem",
  inventoryItemSchema
);
