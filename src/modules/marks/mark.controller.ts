import { Response } from "express";
import { Mark } from "./mark.model";

const calculateGrade = (obtained: number, full: number): string => {
  const pct = (obtained / full) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  if (pct >= 33) return "D";
  return "F";
};

// Bulk enter marks for multiple students in a subject/exam
export const EnterMarks = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  const { exam_id, subject_id, class_id, marks } = req.body;
  // marks: [{ student_id, mark_obtained, mark_full, mark_pass, mark_remark }]

  try {
    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ success: false, message: "marks array required" });
    }

    const ops = marks.map((m: any) => ({
      updateOne: {
        filter: { exam_id, student_id: m.student_id, subject_id },
        update: {
          $set: {
            organization_id: organizationId,
            exam_id,
            student_id: m.student_id,
            subject_id,
            class_id,
            mark_obtained: m.mark_obtained,
            mark_full: m.mark_full || 100,
            mark_pass: m.mark_pass || 33,
            mark_grade: calculateGrade(m.mark_obtained, m.mark_full || 100),
            mark_remark: m.mark_remark || "",
            entered_by: userId,
          },
        },
        upsert: true,
      },
    }));

    await Mark.bulkWrite(ops);
    return res.status(200).json({ success: true, message: "Marks saved successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetMarksByExam = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { exam_id, subject_id, class_id } = req.query;
  try {
    const filter: any = { organization_id: organizationId };
    if (exam_id) filter.exam_id = exam_id;
    if (subject_id) filter.subject_id = subject_id;
    if (class_id) filter.class_id = class_id;

    const marks = await Mark.find(filter)
      .populate("student_id", "student_name student_admission_no")
      .populate("subject_id", "subject_name subject_code")
      .lean();

    return res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStudentMarks = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { student_id } = req.params;
  const { exam_id } = req.query;
  try {
    const filter: any = { organization_id: organizationId, student_id };
    if (exam_id) filter.exam_id = exam_id;

    const marks = await Mark.find(filter)
      .populate("exam_id", "exam_name exam_term")
      .populate("subject_id", "subject_name subject_code")
      .lean();

    return res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Full result card for a student in one exam
export const GetResultCard = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { student_id, exam_id } = req.params;
  try {
    const marks = await Mark.find({ organization_id: organizationId, student_id, exam_id })
      .populate("subject_id", "subject_name subject_code subject_type")
      .populate("exam_id", "exam_name exam_term exam_session")
      .populate("student_id", "student_name student_admission_no student_class_id student_section_id")
      .lean();

    if (!marks.length) {
      return res.status(404).json({ success: false, message: "No marks found" });
    }

    const totalObtained = marks.reduce((sum, m) => sum + m.mark_obtained, 0);
    const totalFull = marks.reduce((sum, m) => sum + m.mark_full, 0);
    const percentage = ((totalObtained / totalFull) * 100).toFixed(2);
    const overallGrade = calculateGrade(totalObtained, totalFull);
    const hasFailed = marks.some((m) => m.mark_obtained < m.mark_pass);

    return res.status(200).json({
      success: true,
      data: {
        marks,
        summary: {
          total_obtained: totalObtained,
          total_full: totalFull,
          percentage,
          overall_grade: overallGrade,
          result: hasFailed ? "Fail" : "Pass",
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateMark = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const mark = await Mark.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      {
        ...req.body,
        mark_grade: calculateGrade(req.body.mark_obtained, req.body.mark_full || 100),
      },
      { new: true },
    );
    if (!mark) return res.status(404).json({ success: false, message: "Mark not found" });
    return res.status(200).json({ success: true, message: "Mark updated", data: mark });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
