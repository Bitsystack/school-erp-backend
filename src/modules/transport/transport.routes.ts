import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateVehicle,
  GetVehicles,
  CreateRoute,
  GetRoutes,
  AssignTransport,
  GetTransportAssignments,
} from "./transport.controller";

const transportRoutes = Router();

transportRoutes.post("/vehicle/create", authMiddleware, CreateVehicle);
transportRoutes.get("/vehicle/list", authMiddleware, GetVehicles);
transportRoutes.post("/route/create", authMiddleware, CreateRoute);
transportRoutes.get("/route/list", authMiddleware, GetRoutes);
transportRoutes.post("/assign", authMiddleware, AssignTransport);
transportRoutes.get("/assignments", authMiddleware, GetTransportAssignments);

export default transportRoutes;
