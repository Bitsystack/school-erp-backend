import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateInventoryItem,
  GetInventoryItems,
  IssueInventoryItem,
  UpdateInventoryItem,
  DeleteInventoryItem,
} from "./inventory.controller";

const inventoryRoutes = Router();

inventoryRoutes.post("/item/create", authMiddleware, CreateInventoryItem);
inventoryRoutes.post("/create", authMiddleware, CreateInventoryItem);
inventoryRoutes.get("/item/list", authMiddleware, GetInventoryItems);
inventoryRoutes.get("/list", authMiddleware, GetInventoryItems);
inventoryRoutes.post("/issue", authMiddleware, IssueInventoryItem);
inventoryRoutes.patch("/item/update/:id", authMiddleware, UpdateInventoryItem);
inventoryRoutes.delete("/item/delete/:id", authMiddleware, DeleteInventoryItem);

export default inventoryRoutes;
