import { authMiddleware } from "../../middlewares/auth.middleware";
import { Router } from "express";
import {
  CreateRole,
  DeleteRole,
  GetRoleById,
  GetRoles,
  UpdateRole,
} from "./role.controller";
const roleRoutes = Router();

roleRoutes.post("/add", authMiddleware, CreateRole);
roleRoutes.get("/list", authMiddleware, GetRoles);
roleRoutes.get("/:id", authMiddleware, GetRoleById);
roleRoutes.patch("/:id", authMiddleware, UpdateRole);
roleRoutes.delete("/:id", authMiddleware, DeleteRole);

export default roleRoutes;
