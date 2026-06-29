import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { RaiseComplaint, GetComplaints, UpdateComplaintStatus } from "./complaint.controller";

const complaintRoutes = Router();

complaintRoutes.post("/raise", authMiddleware, RaiseComplaint);
complaintRoutes.get("/list", authMiddleware, GetComplaints);
complaintRoutes.patch("/status/:id", authMiddleware, UpdateComplaintStatus);

export default complaintRoutes;
