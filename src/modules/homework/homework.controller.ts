import { Response } from "express";
import { Homework } from "./homework.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateHomework = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const hw = await Homework.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Homework assigned", data: hw });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetHomeworks = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { class_id, section_id, subject_id } = req.query;
  try {
    const filter: any = { organization_id: organizationId, homework_status: true };
    if (class_id) filter.class_id = class_id;
    if (section_id) filter.section_id = section_id;
    if (subject_id) filter.subject_id = subject_id;
    if (search) filter.homework_title = { $regex: search, $options: "i" };

    const [homeworks, total] = await Promise.all([
      Homework.find(filter)
        .populate("class_id", "class_name")
        .populate("section_id", "section_name")
        .populate("subject_id", "subject_name subject_code")
        .populate("teacher_id", "teacher_name")
        .sort({ homework_submission_date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Homework.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: homeworks, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetHomeworkById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const hw = await Homework.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("class_id", "class_name")
      .populate("subject_id", "subject_name");
    if (!hw) return res.status(404).json({ success: false, message: "Homework not found" });
    return res.status(200).json({ success: true, data: hw });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateHomework = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const hw = await Homework.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true },
    );
    if (!hw) return res.status(404).json({ success: false, message: "Homework not found" });
    return res.status(200).json({ success: true, message: "Homework updated", data: hw });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteHomework = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    await Homework.findOneAndUpdate({ _id: req.params.id, organization_id: organizationId }, { homework_status: false });
    return res.status(200).json({ success: true, message: "Homework deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
