import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateHomework,
  GetHomeworks,
  GetHomeworkById,
  UpdateHomework,
  DeleteHomework,
} from "./homework.controller";

const homeworkRoutes = Router();

homeworkRoutes.post("/create", authMiddleware, CreateHomework);
homeworkRoutes.get("/list", authMiddleware, GetHomeworks);
homeworkRoutes.get("/:id", authMiddleware, GetHomeworkById);
homeworkRoutes.patch("/update/:id", authMiddleware, UpdateHomework);
homeworkRoutes.delete("/delete/:id", authMiddleware, DeleteHomework);

export default homeworkRoutes;
