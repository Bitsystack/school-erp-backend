import { Response } from "express";
import { Admission } from "./admission.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

const generateFormNo = async (orgId: string): Promise<string> => {
  const count = await Admission.countDocuments({ organization_id: orgId });
  const year = new Date().getFullYear();
  return `ADM-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const CreateAdmission = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const form_no = await generateFormNo(organizationId);
    const admission = await Admission.create({
      ...req.body,
      organization_id: organizationId,
      admission_form_no: form_no,
      admission_status: "Pending",
    });
    return res.status(201).json({ success: true, message: "Admission form submitted", data: admission });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAdmissions = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (status) filter.admission_status = status;
    if (search) {
      filter.$or = [
        { applicant_name: { $regex: search, $options: "i" } },
        { admission_form_no: { $regex: search, $options: "i" } },
        { applicant_phone: { $regex: search, $options: "i" } },
      ];
    }

    const [admissions, total] = await Promise.all([
      Admission.find(filter)
        .populate("admission_class_id", "class_name class_numeric")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Admission.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: admissions, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAdmissionById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const admission = await Admission.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("admission_class_id", "class_name class_numeric");
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    return res.status(200).json({ success: true, data: admission });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateAdmissionStatus = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  const { status, notes } = req.body;
  try {
    const admission = await Admission.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    admission.admission_status = status;
    admission.processed_by = userId;
    admission.processed_at = new Date();
    if (notes) admission.admission_notes = notes;
    await admission.save();

    return res.status(200).json({ success: true, message: `Admission ${status}`, data: admission });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
