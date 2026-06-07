import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  organization_name: string;
  organization_phone: string;
  organization_whatsapp?: string;
  organization_email: string;
  organization_website?: string;
  organization_country: string;
  organization_address?: string;
  organization_pincode?: string;
  organization_gstin?: string;
  organization_upi_id?: string;
  organization_logo?: string;
  organization_owner_id: mongoose.Types.ObjectId;
}

const organizationSchema = new Schema(
  {
    organization_name: {
      type: String,
      required: true,
    },

    organization_phone: {
      type: String,
      required: true,
    },

    organization_whatsapp: String,

    organization_email: {
      type: String,
      required: true,
    },

    organization_website: String,

    organization_country: {
      type: String,
      required: true,
    },

    organization_address: String,

    organization_pincode: String,

    organization_gstin: String,

    organization_upi_id: String,

    organization_logo: String,

    organization_owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Organization = mongoose.model("Organization", organizationSchema);
