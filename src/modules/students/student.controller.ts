import bcrypt from "bcryptjs";
import { Response } from "express";
import { Student } from "./student.model";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { Organization } from "../organization/organization.model";
import { GenerateAdmissionNo } from "./students.helper";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateStudent = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) return res.status(404).json({ success: false, message: "Organization not found" });

    const studentRole = await Role.findOne({ role_name: "STUDENT" });
    if (!studentRole) return res.status(404).json({ success: false, message: "Student role not found. Please create STUDENT role first." });

    const existingUser = await User.findOne({ user_email: req.body.student_email });
    if (existingUser) return res.status(409).json({ success: false, message: "Email already in use" });

    const admissionNo = await GenerateAdmissionNo(organization.organization_name, organizationId);
    const plainPassword = `Student@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      user_name: req.body.student_name,
      user_email: req.body.student_email,
      user_phone: req.body.student_phone,
      user_password: hashedPassword,
      user_role_id: studentRole._id.toString(),
      user_organization_id: organizationId,
      user_isActive: true,
      user_isEmailVerified: true,
      user_country: req.body.student_country || "",
    });

    const student = await Student.create({
      organization_id: organizationId,
      user_id: user._id,
      student_admission_no: admissionNo,
      student_name: req.body.student_name,
      student_email: req.body.student_email,
      student_phone: req.body.student_phone,
      student_gender: req.body.student_gender,
      student_dob: req.body.student_dob,
      student_blood_group: req.body.student_blood_group,
      student_religion: req.body.student_religion,
      student_category: req.body.student_category,
      student_address: req.body.student_address,
      student_city: req.body.student_city,
      student_state: req.body.student_state,
      student_pincode: req.body.student_pincode,
      student_class_id: req.body.student_class_id,
      student_section_id: req.body.student_section_id,
      student_session: req.body.student_session,
      student_admission_date: req.body.student_admission_date || new Date(),
      father_name: req.body.father_name,
      father_phone: req.body.father_phone,
      father_occupation: req.body.father_occupation,
      mother_name: req.body.mother_name,
      mother_phone: req.body.mother_phone,
      mother_occupation: req.body.mother_occupation,
      guardian_name: req.body.guardian_name,
      guardian_phone: req.body.guardian_phone,
      guardian_relation: req.body.guardian_relation,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
      credentials: { email: req.body.student_email, password: plainPassword },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStudents = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  const sectionId = req.query.section_id;
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (classId) filter.student_class_id = classId;
    if (sectionId) filter.student_section_id = sectionId;
    if (status !== undefined) filter.student_status = status === "true";
    if (search) {
      filter.$or = [
        { student_name: { $regex: search, $options: "i" } },
        { student_email: { $regex: search, $options: "i" } },
        { student_admission_no: { $regex: search, $options: "i" } },
        { student_phone: { $regex: search, $options: "i" } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("student_class_id", "class_name class_numeric")
        .populate("student_section_id", "section_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: students,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStudentById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      organization_id: organizationId,
    })
      .populate("student_class_id", "class_name class_numeric")
      .populate("student_section_id", "section_name")
      .lean();

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    return res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateStudent = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const student = await Student.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Sync name/email/phone to user as well
    if (req.body.student_email || req.body.student_name || req.body.student_phone) {
      await User.findByIdAndUpdate(student.user_id, {
        ...(req.body.student_name && { user_name: req.body.student_name }),
        ...(req.body.student_email && { user_email: req.body.student_email }),
        ...(req.body.student_phone && { user_phone: req.body.student_phone }),
      });
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: "Student updated", data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const ToggleStudentStatus = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const student = await Student.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const newStatus = !student.student_status;
    student.student_status = newStatus;
    await student.save();

    await User.findByIdAndUpdate(student.user_id, { user_isActive: newStatus });

    return res.status(200).json({
      success: true,
      message: `Student ${newStatus ? "activated" : "deactivated"}`,
      data: { student_status: newStatus },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteStudent = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const student = await Student.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Soft delete: deactivate
    await User.findByIdAndUpdate(student.user_id, { user_isActive: false });
    await Student.findByIdAndUpdate(student._id, { student_status: false });

    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
