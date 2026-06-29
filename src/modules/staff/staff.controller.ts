import bcrypt from "bcryptjs";
import { Response } from "express";
import { Staff } from "./staff.model";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { Organization } from "../organization/organization.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

const generateStaffId = async (orgName: string, orgId: string): Promise<string> => {
  const prefix = orgName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
  const last = await Staff.findOne({ organization_id: orgId }).sort({ createdAt: -1 }).select("staff_employee_id");
  let next = 1;
  if (last?.staff_employee_id) {
    const match = last.staff_employee_id.match(/(\d+)$/);
    if (match) next = Number(match[1]) + 1;
  }
  return `${prefix}-STF-${String(next).padStart(4, "0")}`;
};

export const CreateStaff = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) return res.status(404).json({ success: false, message: "Organization not found" });

    const staffRole = await Role.findOne({ role_name: "STAFF" });
    if (!staffRole) return res.status(404).json({ success: false, message: "STAFF role not found" });

    const existingUser = await User.findOne({ user_email: req.body.staff_email });
    if (existingUser) return res.status(409).json({ success: false, message: "Email already in use" });

    const employeeId = await generateStaffId(organization.organization_name, organizationId);
    const plainPassword = `Staff@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      user_name: req.body.staff_name,
      user_email: req.body.staff_email,
      user_phone: req.body.staff_phone,
      user_password: hashedPassword,
      user_role_id: staffRole._id.toString(),
      user_organization_id: organizationId,
      user_isActive: true,
      user_isEmailVerified: true,
      user_country: req.body.staff_country || "",
    });

    const staff = await Staff.create({
      organization_id: organizationId,
      user_id: user._id,
      staff_employee_id: employeeId,
      staff_name: req.body.staff_name,
      staff_email: req.body.staff_email,
      staff_phone: req.body.staff_phone,
      staff_gender: req.body.staff_gender,
      staff_dob: req.body.staff_dob,
      staff_department: req.body.staff_department,
      staff_designation: req.body.staff_designation,
      staff_qualification: req.body.staff_qualification,
      staff_experience: req.body.staff_experience,
      staff_joining_date: req.body.staff_joining_date,
      staff_salary: req.body.staff_salary,
      staff_address: req.body.staff_address,
    });

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
      credentials: { email: req.body.staff_email, password: plainPassword },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStaff = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const department = req.query.department;
  try {
    const filter: any = { organization_id: organizationId };
    if (department) filter.staff_department = department;
    if (search) {
      filter.$or = [
        { staff_name: { $regex: search, $options: "i" } },
        { staff_email: { $regex: search, $options: "i" } },
        { staff_employee_id: { $regex: search, $options: "i" } },
      ];
    }

    const [staffList, total] = await Promise.all([
      Staff.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Staff.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: staffList,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStaffById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization_id: organizationId }).lean();
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    return res.status(200).json({ success: true, data: staff });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateStaff = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    await User.findByIdAndUpdate(staff.user_id, {
      ...(req.body.staff_name && { user_name: req.body.staff_name }),
      ...(req.body.staff_email && { user_email: req.body.staff_email }),
      ...(req.body.staff_phone && { user_phone: req.body.staff_phone }),
    });

    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, message: "Staff updated", data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const ToggleStaffStatus = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    const newStatus = !staff.staff_status;
    staff.staff_status = newStatus;
    await staff.save();
    await User.findByIdAndUpdate(staff.user_id, { user_isActive: newStatus });
    return res.status(200).json({ success: true, message: `Staff ${newStatus ? "activated" : "deactivated"}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteStaff = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    await User.findByIdAndUpdate(staff.user_id, { user_isActive: false });
    await Staff.findByIdAndUpdate(staff._id, { staff_status: false });
    return res.status(200).json({ success: true, message: "Staff deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
