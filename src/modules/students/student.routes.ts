import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateStudent,
  GetStudents,
  GetStudentById,
  UpdateStudent,
  DeleteStudent,
  ToggleStudentStatus,
} from "./student.controller";

const studentRoutes = Router();

studentRoutes.post("/create", authMiddleware, CreateStudent);
studentRoutes.get("/list", authMiddleware, GetStudents);
studentRoutes.get("/:id", authMiddleware, GetStudentById);
studentRoutes.patch("/update/:id", authMiddleware, UpdateStudent);
studentRoutes.patch("/status/:id", authMiddleware, ToggleStudentStatus);
studentRoutes.delete("/delete/:id", authMiddleware, DeleteStudent);

export default studentRoutes;
