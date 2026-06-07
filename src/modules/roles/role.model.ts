import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  role_name: string;
  role_display_name: string;
  role_description: string;
  role_level: number;
  role_isSystemRole: boolean;
  role_permissions: string[];
}

const roleSchema = new Schema<IRole>(
  {
    role_name: {
      type: String,
      required: true,
      unique: true,
    },

    role_display_name: {
      type: String,
      required: true,
    },

    role_description: {
      type: String,
      required: true,
    },

    role_level: {
      type: Number,
      required: true,
    },

    role_isSystemRole: {
      type: Boolean,
      default: false,
    },

    role_permissions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Role = mongoose.model<IRole>("Role", roleSchema);
