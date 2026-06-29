import { Response } from "express";
import { Attendance } from "./attendance.model";
import { Student } from "../students/student.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

// Mark attendance for an entire class/section on a date
export const MarkAttendance = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  const { class_id, section_id, attendance_date, attendance_records } = req.body;
  // attendance_records: [{ student_id, status, remark }]

  try {
    if (!Array.isArray(attendance_records) || attendance_records.length === 0) {
      return res.status(400).json({ success: false, message: "attendance_records array is required" });
    }

    const date = new Date(attendance_date);
    date.setHours(0, 0, 0, 0);

    // Upsert each record
    const ops = attendance_records.map((record: any) => ({
      updateOne: {
        filter: {
          organization_id: organizationId,
          student_id: record.student_id,
          attendance_date: date,
        },
        update: {
          $set: {
            organization_id: organizationId,
            class_id,
            section_id,
            student_id: record.student_id,
            attendance_date: date,
            attendance_status: record.status,
            attendance_remark: record.remark || "",
            attendance_taken_by: userId,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    return res.status(200).json({ success: true, message: "Attendance marked successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance for a class/section on a date
export const GetAttendanceByDate = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { class_id, section_id, date } = req.query;
  try {
    if (!class_id || !date) {
      return res.status(400).json({ success: false, message: "class_id and date are required" });
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const filter: any = {
      organization_id: organizationId,
      class_id,
      attendance_date: { $gte: queryDate, $lt: nextDay },
    };
    if (section_id) filter.section_id = section_id;

    const records = await Attendance.find(filter)
      .populate("student_id", "student_name student_admission_no student_photo")
      .lean();

    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance report for a student (monthly summary)
export const GetStudentAttendance = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { student_id } = req.params;
  const { month, year } = req.query;
  try {
    const filter: any = { organization_id: organizationId, student_id };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.attendance_date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter).sort({ attendance_date: 1 }).lean();

    const summary = {
      total: records.length,
      present: records.filter((r) => r.attendance_status === "Present").length,
      absent: records.filter((r) => r.attendance_status === "Absent").length,
      late: records.filter((r) => r.attendance_status === "Late").length,
      leave: records.filter((r) => r.attendance_status === "Leave").length,
    };

    return res.status(200).json({ success: true, data: records, summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance summary for all students in a class
export const GetClassAttendanceSummary = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { class_id, section_id, month, year } = req.query;
  try {
    if (!class_id) return res.status(400).json({ success: false, message: "class_id required" });

    const matchFilter: any = {
      organization_id: organizationId,
      class_id,
    };
    if (section_id) matchFilter.section_id = section_id;
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      matchFilter.attendance_date = { $gte: start, $lt: end };
    }

    const summary = await Attendance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$student_id",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$attendance_status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$attendance_status", "Absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$attendance_status", "Late"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          student_name: "$student.student_name",
          student_admission_no: "$student.student_admission_no",
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
    ]);

    return res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
