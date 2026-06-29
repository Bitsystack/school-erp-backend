import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CreateEvent, GetEvents, GetEventById, UpdateEvent, DeleteEvent } from "./event.controller";

const eventRoutes = Router();

eventRoutes.post("/create", authMiddleware, CreateEvent);
eventRoutes.get("/list", authMiddleware, GetEvents);
eventRoutes.get("/:id", authMiddleware, GetEventById);
eventRoutes.patch("/update/:id", authMiddleware, UpdateEvent);
eventRoutes.delete("/delete/:id", authMiddleware, DeleteEvent);

export default eventRoutes;
