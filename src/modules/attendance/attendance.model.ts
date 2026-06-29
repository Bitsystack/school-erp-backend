import mongoose, { Schema, Document } from "mongoose";

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";

export interface IAttendance extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  section_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  attendance_date: Date;
  attendance_status: AttendanceStatus;
  attendance_remark?: string;
  attendance_taken_by: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_id: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    section_id: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    attendance_date: { type: Date, required: true },
    attendance_status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
    },
    attendance_remark: String,
    attendance_taken_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate attendance for same student on same date
attendanceSchema.index(
  { organization_id: 1, student_id: 1, attendance_date: 1 },
  { unique: true },
);
attendanceSchema.index({ organization_id: 1, class_id: 1, attendance_date: 1 });

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema,
);
