import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateAnnouncement,
  GetAnnouncements,
  GetAnnouncementById,
  UpdateAnnouncement,
  DeleteAnnouncement,
} from "./announcement.controller";

const announcementRoutes = Router();

announcementRoutes.post("/create", authMiddleware, CreateAnnouncement);
announcementRoutes.get("/list", authMiddleware, GetAnnouncements);
announcementRoutes.get("/:id", authMiddleware, GetAnnouncementById);
announcementRoutes.patch("/update/:id", authMiddleware, UpdateAnnouncement);
announcementRoutes.delete("/delete/:id", authMiddleware, DeleteAnnouncement);

export default announcementRoutes;
