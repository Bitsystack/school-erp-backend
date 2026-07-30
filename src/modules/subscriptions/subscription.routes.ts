import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  GetPlans,
  GetCurrentSubscription,
  SubscribeOrUpgrade,
  GetInvoices,
} from "./subscription.controller";

const subscriptionRoutes = Router();

subscriptionRoutes.get("/plans", GetPlans);
subscriptionRoutes.get("/current", authMiddleware, GetCurrentSubscription);
subscriptionRoutes.post("/subscribe", authMiddleware, SubscribeOrUpgrade);
subscriptionRoutes.post("/upgrade", authMiddleware, SubscribeOrUpgrade);
subscriptionRoutes.get("/invoices", authMiddleware, GetInvoices);

export default subscriptionRoutes;
