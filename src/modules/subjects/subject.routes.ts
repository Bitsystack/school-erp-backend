import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateSubject,
  GetSubjects,
  GetSubjectById,
  UpdateSubject,
  DeleteSubject,
} from "./subject.controller";

const subjectRoutes = Router();

subjectRoutes.post("/create", authMiddleware, CreateSubject);
subjectRoutes.get("/list", authMiddleware, GetSubjects);
subjectRoutes.get("/:id", authMiddleware, GetSubjectById);
subjectRoutes.patch("/update/:id", authMiddleware, UpdateSubject);
subjectRoutes.delete("/delete/:id", authMiddleware, DeleteSubject);

export default subjectRoutes;
