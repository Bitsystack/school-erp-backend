import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateHostel,
  GetHostels,
  CreateRoom,
  GetRoomsByHostel,
  AllocateRoom,
  VacateRoom,
} from "./hostel.controller";

const hostelRoutes = Router();

hostelRoutes.post("/create", authMiddleware, CreateHostel);
hostelRoutes.get("/list", authMiddleware, GetHostels);
hostelRoutes.post("/room/create", authMiddleware, CreateRoom);
hostelRoutes.get("/room/:hostel_id", authMiddleware, GetRoomsByHostel);
hostelRoutes.post("/allot", authMiddleware, AllocateRoom);
hostelRoutes.patch("/vacate/:id", authMiddleware, VacateRoom);

export default hostelRoutes;
