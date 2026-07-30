import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./modules/auth/auth.route";
import organizationRoutes from "./modules/organization/organization.routes";
import userRoutes from "./modules/users/user.routes";
import roleRoutes from "./modules/roles/role.routes";
import teacherRoutes from "./modules/teachers/teacher.routes";
import classRoutes from "./modules/classes/class.routes";
import sectionRoutes from "./modules/sections/section.routes";
import subjectRoutes from "./modules/subjects/subject.routes";
import studentRoutes from "./modules/students/student.routes";
import staffRoutes from "./modules/staff/staff.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import examRoutes from "./modules/exams/exam.routes";
import markRoutes from "./modules/marks/mark.routes";
import feeRoutes from "./modules/fees/fee.routes";
import timetableRoutes from "./modules/timetable/timetable.routes";
import announcementRoutes from "./modules/announcements/announcement.routes";
import eventRoutes from "./modules/events/event.routes";
import leaveRoutes from "./modules/leaves/leave.routes";
import salaryRoutes from "./modules/salary/salary.routes";
import homeworkRoutes from "./modules/homework/homework.routes";
import libraryRoutes from "./modules/library/library.routes";
import hostelRoutes from "./modules/hostel/hostel.routes";
import transportRoutes from "./modules/transport/transport.routes";
import admissionRoutes from "./modules/admissions/admission.routes";
import complaintRoutes from "./modules/complaints/complaint.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

// New Enterprise Scale Modules
import certificateRoutes from "./modules/certificates/certificate.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import biometricRoutes from "./modules/biometric/biometric.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import visitorRoutes from "./modules/visitors/visitor.routes";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes";

// Middleware
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Application = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin:"http://localhost:5173" ,
    credentials: true,
  }),
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logger (only in dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "School ERP API Running 🚀",
    version: "1.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organization", organizationRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/role", roleRoutes);

// Academic
app.use("/api/v1/class", classRoutes);
app.use("/api/v1/section", sectionRoutes);
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/homework", homeworkRoutes);

// People
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/staff", staffRoutes);

// Academics Operations
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/exam", examRoutes);
app.use("/api/v1/mark", markRoutes);

// Finance
app.use("/api/v1/fee", feeRoutes);
app.use("/api/v1/salary", salaryRoutes);

// Communication
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/complaint", complaintRoutes);

// HR
app.use("/api/v1/leave", leaveRoutes);

// Facilities
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/hostel", hostelRoutes);
app.use("/api/v1/transport", transportRoutes);

// Admissions
app.use("/api/v1/admission", admissionRoutes);

// Dashboard
app.use("/api/v1/dashboard", dashboardRoutes);

// New Enterprise Scale Modules (100k Users)
app.use("/api/v1/certificate", certificateRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/biometric", biometricRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/visitor", visitorRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
