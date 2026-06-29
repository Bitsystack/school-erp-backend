import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  organization_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  section_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  teacher_id: mongoose.Types.ObjectId;
  timetable_day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  timetable_start_time: string;
  timetable_end_time: string;
  timetable_period_no?: number;
  timetable_room?: string;
  timetable_session?: string;
  timetable_status: boolean;
}

const timetableSchema = new Schema<ITimetable>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    section_id: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher_id: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    timetable_day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    timetable_start_time: { type: String, required: true },
    timetable_end_time: { type: String, required: true },
    timetable_period_no: Number,
    timetable_room: String,
    timetable_session: String,
    timetable_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

timetableSchema.index({
  organization_id: 1,
  class_id: 1,
  section_id: 1,
  timetable_day: 1,
});

export const Timetable = mongoose.model<ITimetable>(
  "Timetable",
  timetableSchema,
);
