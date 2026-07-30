import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  SendSingleWhatsApp,
  SendBroadcast,
  GetNotificationLogs,
} from "./notification.controller";

const notificationRoutes = Router();

notificationRoutes.post("/send-whatsapp", authMiddleware, SendSingleWhatsApp);
notificationRoutes.post("/broadcast", authMiddleware, SendBroadcast);
notificationRoutes.get("/logs", authMiddleware, GetNotificationLogs);

export default notificationRoutes;
