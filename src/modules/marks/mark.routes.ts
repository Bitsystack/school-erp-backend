import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  EnterMarks,
  GetMarksByExam,
  GetStudentMarks,
  GetResultCard,
  UpdateMark,
} from "./mark.controller";

const markRoutes = Router();

markRoutes.post("/enter", authMiddleware, EnterMarks);
markRoutes.get("/by-exam", authMiddleware, GetMarksByExam);
markRoutes.get("/student/:student_id", authMiddleware, GetStudentMarks);
markRoutes.get("/result/:student_id/:exam_id", authMiddleware, GetResultCard);
markRoutes.patch("/update/:id", authMiddleware, UpdateMark);

export default markRoutes;
