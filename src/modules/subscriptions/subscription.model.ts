import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  plan_name: "Basic" | "Pro" | "Enterprise";
  display_name: string;
  description: string;
  monthly_price: number;
  half_yearly_price: number; // 6 months
  yearly_price: number; // 12 months
  max_students: number;
  max_teachers: number;
  max_whatsapp_credits: number;
  includes_biometric: boolean;
  includes_custom_certificates: boolean;
  includes_inventory: boolean;
  includes_visitor_pass: boolean;
  features: string[];
  is_popular?: boolean;
}

export interface ISubscription extends Document {
  organization_id: mongoose.Types.ObjectId;
  plan_name: "Basic" | "Pro" | "Enterprise";
  billing_cycle: "MONTHLY" | "HALF_YEARLY" | "YEARLY";
  price_paid: number;
  start_date: Date;
  end_date: Date;
  status: "ACTIVE" | "EXPIRED" | "GRACE_PERIOD" | "CANCELLED";
  payment_method: "CARD" | "UPI" | "NET_BANKING" | "OFFLINE";
  transaction_id: string;
  invoice_no: string;
  auto_renew: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    plan_name: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      required: true,
      unique: true,
    },
    display_name: { type: String, required: true },
    description: { type: String, required: true },
    monthly_price: { type: Number, required: true },
    half_yearly_price: { type: Number, required: true },
    yearly_price: { type: Number, required: true },
    max_students: { type: Number, default: 500 },
    max_teachers: { type: Number, default: 50 },
    max_whatsapp_credits: { type: Number, default: 1000 },
    includes_biometric: { type: Boolean, default: false },
    includes_custom_certificates: { type: Boolean, default: false },
    includes_inventory: { type: Boolean, default: false },
    includes_visitor_pass: { type: Boolean, default: false },
    features: [{ type: String }],
    is_popular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const subscriptionSchema = new Schema<ISubscription>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    plan_name: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      required: true,
    },
    billing_cycle: {
      type: String,
      enum: ["MONTHLY", "HALF_YEARLY", "YEARLY"],
      required: true,
    },
    price_paid: { type: Number, required: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "GRACE_PERIOD", "CANCELLED"],
      default: "ACTIVE",
    },
    payment_method: {
      type: String,
      enum: ["CARD", "UPI", "NET_BANKING", "OFFLINE"],
      default: "UPI",
    },
    transaction_id: { type: String, required: true },
    invoice_no: { type: String, required: true },
    auto_renew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ organization_id: 1, end_date: -1 });
subscriptionSchema.index({ status: 1 });

export const Plan = mongoose.model<IPlan>("Plan", planSchema);
export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
