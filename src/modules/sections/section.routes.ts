import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateSection,
  GetSections,
  GetSectionById,
  UpdateSection,
  DeleteSection,
} from "./section.controller";

const sectionRoutes = Router();

sectionRoutes.post("/create", authMiddleware, CreateSection);
sectionRoutes.get("/list", authMiddleware, GetSections);
sectionRoutes.get("/:id", authMiddleware, GetSectionById);
sectionRoutes.patch("/update/:id", authMiddleware, UpdateSection);
sectionRoutes.delete("/delete/:id", authMiddleware, DeleteSection);

export default sectionRoutes;
