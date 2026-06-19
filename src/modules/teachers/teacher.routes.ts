import { Router } from "express";

import {
  CreateTeacher,
  GetTeachers,
  GetTeacherById,
  UpdateTeacher,
  DeleteTeacher,
  ToggleTeacherStatus,
} from "./teacher.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { UploadImage } from "./upload.controller";
import { upload } from "../../middlewares/upload.middleware";

const teacherRoutes = Router();

// Create Teacher
teacherRoutes.post("/create", authMiddleware, CreateTeacher);

// Get All Teachers
teacherRoutes.get("/list", authMiddleware, GetTeachers);

// Get Teacher By Id
teacherRoutes.get("/:id", authMiddleware, GetTeacherById);

// Update Teacher
teacherRoutes.patch("/update/:id", authMiddleware, UpdateTeacher);

// Active / Inactive Teacher
teacherRoutes.patch("/status/:id", authMiddleware, ToggleTeacherStatus);

// Delete Teacher (Soft Delete)
teacherRoutes.delete("/delete/:id", authMiddleware, DeleteTeacher);
teacherRoutes.post(
  "/add-image",
  authMiddleware,
  upload.single("image"),
  UploadImage,
);

export default teacherRoutes;
