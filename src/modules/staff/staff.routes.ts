import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateStaff,
  GetStaff,
  GetStaffById,
  UpdateStaff,
  ToggleStaffStatus,
  DeleteStaff,
} from "./staff.controller";

const staffRoutes = Router();

staffRoutes.post("/create", authMiddleware, CreateStaff);
staffRoutes.get("/list", authMiddleware, GetStaff);
staffRoutes.get("/:id", authMiddleware, GetStaffById);
staffRoutes.patch("/update/:id", authMiddleware, UpdateStaff);
staffRoutes.patch("/status/:id", authMiddleware, ToggleStaffStatus);
staffRoutes.delete("/delete/:id", authMiddleware, DeleteStaff);

export default staffRoutes;
