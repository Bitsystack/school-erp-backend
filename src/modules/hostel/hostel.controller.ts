import { Response } from "express";
import { Hostel, HostelRoom, HostelAllotment } from "./hostel.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateHostel = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const hostel = await Hostel.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Hostel created", data: hostel });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetHostels = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  try {
    const [hostels, total] = await Promise.all([
      Hostel.find({ organization_id: organizationId }).sort({ hostel_name: 1 }).skip(skip).limit(limit).lean(),
      Hostel.countDocuments({ organization_id: organizationId }),
    ]);
    return res.status(200).json({ success: true, data: hostels, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const CreateRoom = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const room = await HostelRoom.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Room created", data: room });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetRoomsByHostel = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { hostel_id } = req.params;
  try {
    const rooms = await HostelRoom.find({ organization_id: organizationId, hostel_id }).lean();
    return res.status(200).json({ success: true, data: rooms });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const AllocateRoom = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const room = await HostelRoom.findOne({ _id: req.body.room_id, organization_id: organizationId });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (room.room_occupied >= room.room_capacity) {
      return res.status(400).json({ success: false, message: "Room is full" });
    }

    // Check if student already allotted
    const existing = await HostelAllotment.findOne({
      organization_id: organizationId,
      student_id: req.body.student_id,
      allotment_status: "Active",
    });
    if (existing) return res.status(409).json({ success: false, message: "Student already has active hostel allotment" });

    const allotment = await HostelAllotment.create({
      ...req.body,
      organization_id: organizationId,
      allotment_status: "Active",
    });

    await HostelRoom.findByIdAndUpdate(room._id, { $inc: { room_occupied: 1 } });

    return res.status(201).json({ success: true, message: "Room allotted", data: allotment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const VacateRoom = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const allotment = await HostelAllotment.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!allotment) return res.status(404).json({ success: false, message: "Allotment not found" });
    if (allotment.allotment_status === "Vacated") return res.status(400).json({ success: false, message: "Already vacated" });

    allotment.allotment_status = "Vacated";
    allotment.allotment_vacate_date = new Date();
    await allotment.save();

    await HostelRoom.findByIdAndUpdate(allotment.room_id, { $inc: { room_occupied: -1 } });

    return res.status(200).json({ success: true, message: "Room vacated", data: allotment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
