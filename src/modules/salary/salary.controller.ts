import { Response } from "express";
import { SalaryRecord } from "./salary.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const GenerateSalarySlip = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const { employee_id, employee_type, salary_month, salary_basic, salary_allowances, salary_deductions, salary_bonus, salary_fine } = req.body;

    // Check if already generated for this month
    const existing = await SalaryRecord.findOne({ organization_id: organizationId, employee_id, salary_month });
    if (existing) {
      return res.status(409).json({ success: false, message: `Salary already generated for ${salary_month}` });
    }

    const netSalary = (salary_basic || 0) + (salary_allowances || 0) + (salary_bonus || 0) - (salary_deductions || 0) - (salary_fine || 0);

    const record = await SalaryRecord.create({
      organization_id: organizationId,
      employee_id,
      employee_type,
      salary_month,
      salary_basic,
      salary_allowances: salary_allowances || 0,
      salary_deductions: salary_deductions || 0,
      salary_bonus: salary_bonus || 0,
      salary_fine: salary_fine || 0,
      salary_net: netSalary,
      salary_status: "Pending",
    });

    return res.status(201).json({ success: true, message: "Salary slip generated", data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetSalaryRecords = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  const { salary_month, employee_type, status } = req.query;
  try {
    const filter: any = { organization_id: organizationId };
    if (salary_month) filter.salary_month = salary_month;
    if (employee_type) filter.employee_type = employee_type;
    if (status) filter.salary_status = status;

    const [records, total] = await Promise.all([
      SalaryRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SalaryRecord.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: records, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetEmployeeSalaryHistory = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { employee_id } = req.params;
  try {
    const records = await SalaryRecord.find({ organization_id: organizationId, employee_id })
      .sort({ salary_month: -1 })
      .lean();
    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const PaySalary = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const record = await SalaryRecord.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!record) return res.status(404).json({ success: false, message: "Salary record not found" });
    if (record.salary_status === "Paid") {
      return res.status(400).json({ success: false, message: "Already paid" });
    }

    record.salary_status = "Paid";
    record.salary_payment_date = new Date();
    record.salary_payment_mode = req.body.salary_payment_mode || "Bank Transfer";
    record.salary_remark = req.body.salary_remark || "";
    record.paid_by = userId;
    await record.save();

    return res.status(200).json({ success: true, message: "Salary paid", data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
