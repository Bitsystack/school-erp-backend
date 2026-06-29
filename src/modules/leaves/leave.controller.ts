import { Response } from "express";
import { Leave } from "./leave.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const ApplyLeave = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const from = new Date(req.body.leave_from_date);
    const to = new Date(req.body.leave_to_date);
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      ...req.body,
      organization_id: organizationId,
      leave_applied_by: userId,
      leave_total_days: totalDays,
      leave_status: "Pending",
    });
    return res.status(201).json({ success: true, message: "Leave applied", data: leave });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetLeaves = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (status) filter.leave_status = status;

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate("leave_applied_by", "user_name user_email")
        .populate("leave_approved_by", "user_name user_email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Leave.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: leaves, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetMyLeaves = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const leaves = await Leave.find({ organization_id: organizationId, leave_applied_by: userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: leaves });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetLeaveById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const leave = await Leave.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("leave_applied_by", "user_name user_email");
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });
    return res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const ApproveRejectLeave = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  const { action, rejection_reason } = req.body; // action: "Approved" | "Rejected"
  try {
    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be 'Approved' or 'Rejected'" });
    }

    const leave = await Leave.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });
    if (leave.leave_status !== "Pending") {
      return res.status(400).json({ success: false, message: "Leave already processed" });
    }

    leave.leave_status = action;
    leave.leave_approved_by = userId;
    leave.leave_approved_at = new Date();
    if (action === "Rejected" && rejection_reason) {
      leave.leave_rejection_reason = rejection_reason;
    }
    await leave.save();

    return res.status(200).json({ success: true, message: `Leave ${action}`, data: leave });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
