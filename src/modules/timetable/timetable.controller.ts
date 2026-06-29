import { Response } from "express";
import { Timetable } from "./timetable.model";

export const CreateTimetableSlot = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const slot = await Timetable.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Timetable slot created", data: slot });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetTimetable = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { class_id, section_id, teacher_id, day } = req.query;
  try {
    const filter: any = { organization_id: organizationId, timetable_status: true };
    if (class_id) filter.class_id = class_id;
    if (section_id) filter.section_id = section_id;
    if (teacher_id) filter.teacher_id = teacher_id;
    if (day) filter.timetable_day = day;

    const slots = await Timetable.find(filter)
      .populate("class_id", "class_name class_numeric")
      .populate("section_id", "section_name")
      .populate("subject_id", "subject_name subject_code")
      .populate("teacher_id", "teacher_name teacher_email")
      .sort({ timetable_day: 1, timetable_period_no: 1, timetable_start_time: 1 })
      .lean();

    // Group by day for easy frontend rendering
    const grouped = slots.reduce((acc: any, slot) => {
      const day = slot.timetable_day;
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {});

    return res.status(200).json({ success: true, data: slots, grouped });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateTimetableSlot = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const slot = await Timetable.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true },
    );
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
    return res.status(200).json({ success: true, message: "Slot updated", data: slot });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteTimetableSlot = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const slot = await Timetable.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
    return res.status(200).json({ success: true, message: "Slot deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
