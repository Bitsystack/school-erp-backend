import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CreateExam, GetExams, GetExamById, UpdateExam, DeleteExam } from "./exam.controller";

const examRoutes = Router();

examRoutes.post("/create", authMiddleware, CreateExam);
examRoutes.get("/list", authMiddleware, GetExams);
examRoutes.get("/:id", authMiddleware, GetExamById);
examRoutes.patch("/update/:id", authMiddleware, UpdateExam);
examRoutes.delete("/delete/:id", authMiddleware, DeleteExam);

export default examRoutes;
