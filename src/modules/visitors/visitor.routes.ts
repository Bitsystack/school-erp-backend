import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  RegisterVisitor,
  CheckoutVisitor,
  GetVisitors,
} from "./visitor.controller";

const visitorRoutes = Router();

visitorRoutes.post("/register", authMiddleware, RegisterVisitor);
visitorRoutes.post("/create", authMiddleware, RegisterVisitor);
visitorRoutes.patch("/checkout/:id", authMiddleware, CheckoutVisitor);
visitorRoutes.get("/list", authMiddleware, GetVisitors);

export default visitorRoutes;
