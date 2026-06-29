import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  ApplyLeave,
  GetLeaves,
  GetLeaveById,
  ApproveRejectLeave,
  GetMyLeaves,
} from "./leave.controller";

const leaveRoutes = Router();

leaveRoutes.post("/apply", authMiddleware, ApplyLeave);
leaveRoutes.get("/list", authMiddleware, GetLeaves);
leaveRoutes.get("/my-leaves", authMiddleware, GetMyLeaves);
leaveRoutes.get("/:id", authMiddleware, GetLeaveById);
leaveRoutes.patch("/action/:id", authMiddleware, ApproveRejectLeave);

export default leaveRoutes;
