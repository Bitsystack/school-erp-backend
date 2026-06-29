import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateAdmission,
  GetAdmissions,
  GetAdmissionById,
  UpdateAdmissionStatus,
} from "./admission.controller";

const admissionRoutes = Router();

admissionRoutes.post("/create", authMiddleware, CreateAdmission);
admissionRoutes.get("/list", authMiddleware, GetAdmissions);
admissionRoutes.get("/:id", authMiddleware, GetAdmissionById);
admissionRoutes.patch("/status/:id", authMiddleware, UpdateAdmissionStatus);

export default admissionRoutes;
