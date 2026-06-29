import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  GenerateSalarySlip,
  GetSalaryRecords,
  GetEmployeeSalaryHistory,
  PaySalary,
} from "./salary.controller";

const salaryRoutes = Router();

salaryRoutes.post("/generate", authMiddleware, GenerateSalarySlip);
salaryRoutes.get("/list", authMiddleware, GetSalaryRecords);
salaryRoutes.get("/employee/:employee_id", authMiddleware, GetEmployeeSalaryHistory);
salaryRoutes.patch("/pay/:id", authMiddleware, PaySalary);

export default salaryRoutes;
