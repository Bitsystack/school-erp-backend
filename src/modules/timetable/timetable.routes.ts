import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateTimetableSlot,
  GetTimetable,
  UpdateTimetableSlot,
  DeleteTimetableSlot,
} from "./timetable.controller";

const timetableRoutes = Router();

timetableRoutes.post("/create", authMiddleware, CreateTimetableSlot);
timetableRoutes.get("/", authMiddleware, GetTimetable);
timetableRoutes.patch("/update/:id", authMiddleware, UpdateTimetableSlot);
timetableRoutes.delete("/delete/:id", authMiddleware, DeleteTimetableSlot);

export default timetableRoutes;
