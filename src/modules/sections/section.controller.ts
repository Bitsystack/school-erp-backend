import { Response } from "express";
import { Section } from "./section.model";
import { Class } from "../classes/class.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateSection = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const cls = await Class.findOne({ _id: req.body.class_id, organization_id: organizationId });
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    const existing = await Section.findOne({
      organization_id: organizationId,
      class_id: req.body.class_id,
      section_name: req.body.section_name,
    });
    if (existing) return res.status(409).json({ success: false, message: "Section already exists" });

    const section = await Section.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Section created", data: section });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSections = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  try {
    const filter: any = { organization_id: organizationId };
    if (classId) filter.class_id = classId;
    if (search) filter.section_name = { $regex: search, $options: "i" };

    const [sections, total] = await Promise.all([
      Section.find(filter)
        .populate("class_id", "class_name class_numeric")
        .populate("section_class_teacher_id", "teacher_name teacher_email")
        .sort({ section_name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Section.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: sections,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSectionById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const section = await Section.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("class_id", "class_name")
      .populate("section_class_teacher_id", "teacher_name teacher_email");
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    return res.status(200).json({ success: true, data: section });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateSection = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const section = await Section.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    return res.status(200).json({ success: true, message: "Section updated", data: section });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteSection = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const section = await Section.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    return res.status(200).json({ success: true, message: "Section deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
