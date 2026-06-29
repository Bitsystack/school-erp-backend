import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  MarkAttendance,
  GetAttendanceByDate,
  GetStudentAttendance,
  GetClassAttendanceSummary,
} from "./attendance.controller";

const attendanceRoutes = Router();

attendanceRoutes.post("/mark", authMiddleware, MarkAttendance);
attendanceRoutes.get("/by-date", authMiddleware, GetAttendanceByDate);
attendanceRoutes.get("/student/:student_id", authMiddleware, GetStudentAttendance);
attendanceRoutes.get("/class-summary", authMiddleware, GetClassAttendanceSummary);

export default attendanceRoutes;
