import { Router } from "express";
import { GetMe } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.get("/my-info", authMiddleware, GetMe);

export default userRoutes;
