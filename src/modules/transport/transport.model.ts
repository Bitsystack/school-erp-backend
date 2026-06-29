import mongoose, { Schema, Document } from "mongoose";

// Vehicle master
export interface IVehicle extends Document {
  organization_id: mongoose.Types.ObjectId;
  vehicle_no: string;
  vehicle_name?: string;
  vehicle_type?: string;
  vehicle_capacity?: number;
  vehicle_driver_name?: string;
  vehicle_driver_phone?: string;
  vehicle_driver_license?: string;
  vehicle_status: boolean;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    vehicle_no: { type: String, required: true, unique: true },
    vehicle_name: String,
    vehicle_type: String,
    vehicle_capacity: Number,
    vehicle_driver_name: String,
    vehicle_driver_phone: String,
    vehicle_driver_license: String,
    vehicle_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);

// Route master
export interface IRoute extends Document {
  organization_id: mongoose.Types.ObjectId;
  route_name: string;
  route_stops?: { stop_name: string; stop_distance?: number; stop_fare?: number }[];
  route_vehicle_id?: mongoose.Types.ObjectId;
  route_status: boolean;
}

const routeSchema = new Schema<IRoute>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    route_name: { type: String, required: true, trim: true },
    route_stops: [
      {
        stop_name: String,
        stop_distance: Number,
        stop_fare: Number,
      },
    ],
    route_vehicle_id: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    route_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Route = mongoose.model<IRoute>("Route", routeSchema);

// Student Transport Assignment
export interface ITransportAssignment extends Document {
  organization_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  route_id: mongoose.Types.ObjectId;
  vehicle_id: mongoose.Types.ObjectId;
  pickup_stop?: string;
  drop_stop?: string;
  monthly_fare?: number;
  assignment_status: "Active" | "Inactive";
}

const transportAssignmentSchema = new Schema<ITransportAssignment>(
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
    route_id: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    vehicle_id: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    pickup_stop: String,
    drop_stop: String,
    monthly_fare: Number,
    assignment_status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export const TransportAssignment = mongoose.model<ITransportAssignment>(
  "TransportAssignment",
  transportAssignmentSchema,
);
