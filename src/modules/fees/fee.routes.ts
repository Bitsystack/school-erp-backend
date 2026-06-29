import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateFeeStructure,
  GetFeeStructures,
  CollectFee,
  GetStudentFeeHistory,
  GetOrganizationFeeStats,
  GetAllCollections,
} from "./fee.controller";

const feeRoutes = Router();

// Fee Structure
feeRoutes.post("/structure/create", authMiddleware, CreateFeeStructure);
feeRoutes.get("/structure/list", authMiddleware, GetFeeStructures);

// Fee Collection
feeRoutes.post("/collect", authMiddleware, CollectFee);
feeRoutes.get("/collections", authMiddleware, GetAllCollections);
feeRoutes.get("/student/:student_id", authMiddleware, GetStudentFeeHistory);
feeRoutes.get("/stats", authMiddleware, GetOrganizationFeeStats);

export default feeRoutes;
