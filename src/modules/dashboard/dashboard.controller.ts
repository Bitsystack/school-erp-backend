import { Response } from "express";
import { Student } from "../students/student.model";
import { Teacher } from "../teachers/teacher.model";
import { Staff } from "../staff/staff.model";
import { Attendance } from "../attendance/attendance.model";
import { FeeCollection } from "../fees/fee.model";
import { Exam } from "../exams/exam.model";
import { Leave } from "../leaves/leave.model";
import { Complaint } from "../complaints/complaint.model";
import { Announcement } from "../announcements/announcement.model";
import { Admission } from "../admissions/admission.model";
import { BookIssue } from "../library/library.model";
import { Class } from "../classes/class.model";

export const GetDashboardStats = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      todayPresent,
      todayAbsent,
      monthlyFeeCollected,
      pendingLeaves,
      openComplaints,
      pendingAdmissions,
      overdueBooks,
      upcomingExams,
      recentAnnouncements,
    ] = await Promise.all([
      Student.countDocuments({ organization_id: organizationId }),
      Student.countDocuments({ organization_id: organizationId, student_status: true }),
      Teacher.countDocuments({ organization_id: organizationId, teacher_status: true }),
      Staff.countDocuments({ organization_id: organizationId, staff_status: true }),
      Class.countDocuments({ organization_id: organizationId, class_status: true }),

      Attendance.countDocuments({
        organization_id: organizationId,
        attendance_date: { $gte: today, $lt: tomorrow },
        attendance_status: "Present",
      }),
      Attendance.countDocuments({
        organization_id: organizationId,
        attendance_date: { $gte: today, $lt: tomorrow },
        attendance_status: "Absent",
      }),

      FeeCollection.aggregate([
        { $match: { organization_id: organizationId, collection_payment_date: { $gte: firstDayOfMonth, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$collection_amount_paid" } } },
      ]),

      Leave.countDocuments({ organization_id: organizationId, leave_status: "Pending" }),
      Complaint.countDocuments({ organization_id: organizationId, complaint_status: "Open" }),
      Admission.countDocuments({ organization_id: organizationId, admission_status: "Pending" }),
      BookIssue.countDocuments({ organization_id: organizationId, issue_status: "Issued", due_date: { $lt: today } }),

      Exam.find({
        organization_id: organizationId,
        exam_status: "Upcoming",
        exam_start_date: { $gte: today },
      })
        .sort({ exam_start_date: 1 })
        .limit(5)
        .populate("class_id", "class_name")
        .lean(),

      Announcement.find({
        organization_id: organizationId,
        announcement_is_published: true,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          total_students: totalStudents,
          active_students: activeStudents,
          total_teachers: totalTeachers,
          total_staff: totalStaff,
          total_classes: totalClasses,
        },
        attendance_today: {
          present: todayPresent,
          absent: todayAbsent,
          total: todayPresent + todayAbsent,
          percentage: todayPresent + todayAbsent > 0
            ? ((todayPresent / (todayPresent + todayAbsent)) * 100).toFixed(1)
            : "0.0",
        },
        finance: {
          monthly_fee_collected: monthlyFeeCollected[0]?.total || 0,
        },
        alerts: {
          pending_leaves: pendingLeaves,
          open_complaints: openComplaints,
          pending_admissions: pendingAdmissions,
          overdue_books: overdueBooks,
        },
        upcoming_exams: upcomingExams,
        recent_announcements: recentAnnouncements,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
