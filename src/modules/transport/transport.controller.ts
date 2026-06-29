import { Response } from "express";
import { Vehicle, Route, TransportAssignment } from "./transport.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateVehicle = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const vehicle = await Vehicle.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Vehicle added", data: vehicle });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetVehicles = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  try {
    const [vehicles, total] = await Promise.all([
      Vehicle.find({ organization_id: organizationId }).sort({ vehicle_no: 1 }).skip(skip).limit(limit).lean(),
      Vehicle.countDocuments({ organization_id: organizationId }),
    ]);
    return res.status(200).json({ success: true, data: vehicles, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const CreateRoute = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const route = await Route.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Route created", data: route });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetRoutes = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const routes = await Route.find({ organization_id: organizationId, route_status: true })
      .populate("route_vehicle_id", "vehicle_no vehicle_name vehicle_driver_name")
      .lean();
    return res.status(200).json({ success: true, data: routes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const AssignTransport = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const existing = await TransportAssignment.findOne({
      organization_id: organizationId,
      student_id: req.body.student_id,
      assignment_status: "Active",
    });
    if (existing) return res.status(409).json({ success: false, message: "Student already has active transport assignment" });

    const assignment = await TransportAssignment.create({ ...req.body, organization_id: organizationId, assignment_status: "Active" });
    return res.status(201).json({ success: true, message: "Transport assigned", data: assignment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetTransportAssignments = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  const route_id = req.query.route_id;
  try {
    const filter: any = { organization_id: organizationId, assignment_status: "Active" };
    if (route_id) filter.route_id = route_id;

    const [assignments, total] = await Promise.all([
      TransportAssignment.find(filter)
        .populate("student_id", "student_name student_admission_no")
        .populate("route_id", "route_name")
        .populate("vehicle_id", "vehicle_no vehicle_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TransportAssignment.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: assignments, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
