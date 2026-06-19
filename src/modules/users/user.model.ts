import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  user_name: string;
  user_email: string;
  user_phone: string;
  user_password: string;
  user_country: string;
  user_business_type: string;
  user_isEmailVerified: boolean;
  user_isActive: boolean;
  user_lastLogin?: Date;
  user_organization_id?: string;
  user_role_id?: string;
  user_emailVerificationToken?: string;
  user_emailVerificationExpires?: Date;
  user_hasBusiness: boolean;
  user_forgotPasswordToken?: String;
  user_forgotPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
  user_name: { type: String, required: true },
  user_email: { type: String, required: true, unique: true },
  user_phone: { type: String, required: true },
  user_password: { type: String, required: true },
  user_country: { type: String, required: false },
  user_business_type: { type: String, required: false },
  user_isEmailVerified: { type: Boolean, default: false },
  user_isActive: { type: Boolean, default: true },
  user_lastLogin: { type: Date },
  user_organization_id: { type: String, ref: "Organization" },
  user_role_id: { type: String, ref: "Role" },
  user_emailVerificationToken: { type: String },
  user_emailVerificationExpires: { type: Date },
  user_hasBusiness: { type: Boolean, default: false },
  user_forgotPasswordToken: { type: String },
  user_forgotPasswordExpires: { type: Date },
});

export const User = mongoose.model<IUser>("User", UserSchema);
