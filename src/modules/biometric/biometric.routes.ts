import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  SyncDeviceLogs,
  GetPunchLogs,
  GetGateDevices,
} from "./biometric.controller";

const biometricRoutes = Router();

// IoT hardware endpoint (supports token or authMiddleware)
biometricRoutes.post("/device/sync-logs", SyncDeviceLogs);
biometricRoutes.post("/sync-logs", SyncDeviceLogs);

// Admin dashboard routes
biometricRoutes.get("/devices", authMiddleware, GetGateDevices);
biometricRoutes.get("/logs", authMiddleware, GetPunchLogs);

export default biometricRoutes;
