import { Response } from "express";
import { Complaint } from "./complaint.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const RaiseComplaint = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const complaint = await Complaint.create({
      ...req.body,
      organization_id: organizationId,
      complaint_raised_by: userId,
      complaint_status: "Open",
    });
    return res.status(201).json({ success: true, message: "Complaint raised", data: complaint });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetComplaints = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (status) filter.complaint_status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("complaint_raised_by", "user_name user_email")
        .populate("complaint_resolved_by", "user_name user_email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: complaints, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateComplaintStatus = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  const { status, resolution_note } = req.body;
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.complaint_status = status;
    if (status === "Resolved" || status === "Closed") {
      complaint.complaint_resolved_by = userId;
      complaint.complaint_resolved_at = new Date();
      complaint.complaint_resolution_note = resolution_note || "";
    }
    await complaint.save();

    return res.status(200).json({ success: true, message: "Complaint status updated", data: complaint });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
