import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateClass,
  GetClasses,
  GetClassById,
  UpdateClass,
  DeleteClass,
} from "./class.controller";

const classRoutes = Router();

classRoutes.post("/create", authMiddleware, CreateClass);
classRoutes.get("/list", authMiddleware, GetClasses);
classRoutes.get("/:id", authMiddleware, GetClassById);
classRoutes.patch("/update/:id", authMiddleware, UpdateClass);
classRoutes.delete("/delete/:id", authMiddleware, DeleteClass);

export default classRoutes;
