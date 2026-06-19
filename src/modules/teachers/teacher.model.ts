import mongoose, { Schema } from "mongoose";

const teacherSchema = new Schema(
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

    teacher_employee_id: {
      type: String,
      required: true,
      unique: true,
    },

    teacher_name: {
      type: String,
      required: true,
      trim: true,
    },

    teacher_email: {
      type: String,
      required: true,
      lowercase: true,
    },

    teacher_phone: {
      type: String,
      required: true,
    },

    teacher_gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    teacher_dob: Date,

    teacher_qualification: String,

    teacher_experience: {
      type: Number,
      default: 0,
    },

    teacher_joining_date: Date,

    teacher_salary: {
      type: Number,
      default: 0,
    },

    teacher_address: String,

    teacher_photo: {
      type: String,
      default: "",
    },

    teacher_status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
