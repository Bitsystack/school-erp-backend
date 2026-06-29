import { Response } from "express";
import { Exam } from "./exam.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateExam = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const exam = await Exam.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Exam created", data: exam });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetExams = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (classId) filter.class_id = classId;
    if (status) filter.exam_status = status;
    if (search) filter.exam_name = { $regex: search, $options: "i" };

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .populate("class_id", "class_name class_numeric")
        .sort({ exam_start_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: exams,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetExamById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const exam = await Exam.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("class_id", "class_name class_numeric");
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    return res.status(200).json({ success: true, data: exam });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateExam = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    return res.status(200).json({ success: true, message: "Exam updated", data: exam });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteExam = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    return res.status(200).json({ success: true, message: "Exam deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
