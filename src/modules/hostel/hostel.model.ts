import mongoose, { Schema, Document } from "mongoose";

// Hostel master
export interface IHostel extends Document {
  organization_id: mongoose.Types.ObjectId;
  hostel_name: string;
  hostel_type: "Boys" | "Girls" | "Mixed";
  hostel_capacity?: number;
  hostel_address?: string;
  hostel_warden_name?: string;
  hostel_warden_phone?: string;
  hostel_status: boolean;
}

const hostelSchema = new Schema<IHostel>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    hostel_name: { type: String, required: true, trim: true },
    hostel_type: {
      type: String,
      enum: ["Boys", "Girls", "Mixed"],
      required: true,
    },
    hostel_capacity: Number,
    hostel_address: String,
    hostel_warden_name: String,
    hostel_warden_phone: String,
    hostel_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Hostel = mongoose.model<IHostel>("Hostel", hostelSchema);

// Hostel Room
export interface IHostelRoom extends Document {
  organization_id: mongoose.Types.ObjectId;
  hostel_id: mongoose.Types.ObjectId;
  room_no: string;
  room_type: "Single" | "Double" | "Triple" | "Dormitory";
  room_capacity: number;
  room_occupied: number;
  room_cost_per_month?: number;
  room_status: boolean;
}

const hostelRoomSchema = new Schema<IHostelRoom>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    hostel_id: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    room_no: { type: String, required: true },
    room_type: {
      type: String,
      enum: ["Single", "Double", "Triple", "Dormitory"],
      required: true,
    },
    room_capacity: { type: Number, required: true },
    room_occupied: { type: Number, default: 0 },
    room_cost_per_month: Number,
    room_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const HostelRoom = mongoose.model<IHostelRoom>(
  "HostelRoom",
  hostelRoomSchema,
);

// Hostel Allotment
export interface IHostelAllotment extends Document {
  organization_id: mongoose.Types.ObjectId;
  hostel_id: mongoose.Types.ObjectId;
  room_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  allotment_date: Date;
  allotment_vacate_date?: Date;
  allotment_status: "Active" | "Vacated";
}

const hostelAllotmentSchema = new Schema<IHostelAllotment>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    hostel_id: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "HostelRoom",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    allotment_date: { type: Date, default: Date.now },
    allotment_vacate_date: Date,
    allotment_status: {
      type: String,
      enum: ["Active", "Vacated"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export const HostelAllotment = mongoose.model<IHostelAllotment>(
  "HostelAllotment",
  hostelAllotmentSchema,
);
