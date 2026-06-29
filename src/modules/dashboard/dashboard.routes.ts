import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { GetDashboardStats } from "./dashboard.controller";

const dashboardRoutes = Router();

dashboardRoutes.get("/stats", authMiddleware, GetDashboardStats);

export default dashboardRoutes;
