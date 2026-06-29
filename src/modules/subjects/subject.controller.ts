import { Response } from "express";
import { Subject } from "./subject.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateSubject = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const existing = await Subject.findOne({
      organization_id: organizationId,
      class_id: req.body.class_id,
      subject_code: req.body.subject_code,
    });
    if (existing) return res.status(409).json({ success: false, message: "Subject code already exists for this class" });

    const subject = await Subject.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Subject created", data: subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSubjects = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  try {
    const filter: any = { organization_id: organizationId };
    if (classId) filter.class_id = classId;
    if (search) {
      filter.$or = [
        { subject_name: { $regex: search, $options: "i" } },
        { subject_code: { $regex: search, $options: "i" } },
      ];
    }

    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .populate("class_id", "class_name class_numeric")
        .populate("subject_teacher_id", "teacher_name teacher_email")
        .sort({ subject_name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subject.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: subjects,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSubjectById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const subject = await Subject.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("class_id", "class_name")
      .populate("subject_teacher_id", "teacher_name teacher_email");
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, data: subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateSubject = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, message: "Subject updated", data: subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteSubject = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, message: "Subject deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
