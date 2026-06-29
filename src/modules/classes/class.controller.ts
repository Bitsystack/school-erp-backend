import { Response } from "express";
import { Class } from "./class.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateClass = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const existing = await Class.findOne({
      organization_id: organizationId,
      class_name: req.body.class_name,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Class already exists" });
    }
    const cls = await Class.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Class created", data: cls });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetClasses = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  try {
    const filter: any = { organization_id: organizationId };
    if (search) filter.class_name = { $regex: search, $options: "i" };

    const [classes, total] = await Promise.all([
      Class.find(filter).sort({ class_numeric: 1, class_name: 1 }).skip(skip).limit(limit).lean(),
      Class.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: classes,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetClassById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const cls = await Class.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    return res.status(200).json({ success: true, data: cls });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateClass = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    return res.status(200).json({ success: true, message: "Class updated", data: cls });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteClass = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    return res.status(200).json({ success: true, message: "Class deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
