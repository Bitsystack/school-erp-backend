import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import { Teacher } from "./teacher.model";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { Organization } from "../organization/organization.model";
import { GenerateTeacherId } from "./teachers.helper";

export const CreateTeacher = async (req: any, res: Response) => {
  const { organizationId } = req.user;

  try {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Teacher Role
    const teacherRole = await Role.findOne({ role_name: "TEACHER" });

    if (!teacherRole) {
      return res.status(404).json({
        success: false,
        message: "Teacher role not found",
      });
    }

    // Duplicate Email Check
    const existingUser = await User.findOne({
      user_email: req.body.teacher_email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Generate Employee Id
    const teacherEmployeeId = await GenerateTeacherId(
      organization.organization_name,
      organizationId,
    );

    // Generate Password
    const plainPassword = `Teacher@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create User
    const user = await User.create({
      user_name: req.body.teacher_name,
      user_email: req.body.teacher_email,
      user_phone: req.body.teacher_phone,
      user_password: hashedPassword,
      user_role_id: teacherRole._id.toString(),
      user_organization_id: organizationId,
      user_isActive: true,
      user_country: req.body.teacher_country,
    });

    // Create Teacher Profile
    const teacher = await Teacher.create({
      organization_id: organizationId,
      user_id: user._id,
      teacher_employee_id: teacherEmployeeId,
      teacher_name: req.body.teacher_name,
      teacher_email: req.body.teacher_email,
      teacher_phone: req.body.teacher_phone,
      teacher_gender: req.body.teacher_gender,
      teacher_qualification: req.body.teacher_qualification,
      teacher_experience: req.body.teacher_experience,
      teacher_joining_date: req.body.teacher_joining_date,
      teacher_salary: req.body.teacher_salary,
      teacher_address: req.body.teacher_address,
      teacher_photo: req.body.teacher_photo,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
      credentials: {
        email: req.body.teacher_email,
        password: plainPassword,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetTeachers = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.pageSize) || 10;
  const search = String(req.query.search || "");
  const skip = (page - 1) * limit;
  try {
    const teacherFilter: any = { organization_id: organizationId };

    if (search) {
      teacherFilter.$or = [
        {
          teacher_name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          teacher_email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          teacher_employee_id: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const teachers = await Teacher.find(teacherFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = await Promise.all(
      teachers.map(async (teacher) => {
        let user = null;
        let role = null;

        if (teacher.user_id) {
          user = await User.findById(teacher.user_id)
            .select(
              "-user_password -user_forgotPasswordToken -user_emailVerificationToken",
            )
            .lean();

          if (user?.user_role_id) {
            role = await Role.findById(user.user_role_id)
              .select("role_name role_display_name")
              .lean();
          }
        }

        return {
          ...teacher,
          role: role || {},
        };
      }),
    );

    const total = await Teacher.countDocuments(teacherFilter);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch teachers",
    });
  }
};

export const GetTeacherById = async (req: any, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  try {
    const teacher = await Teacher.findOne({
      _id: id,
      organization_id: organizationId,
    }).lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const user = await User.findById(teacher.user_id)
      .select(
        "-user_password -user_forgotPasswordToken -user_emailVerificationToken",
      )
      .lean();

    const role = user?.user_role_id
      ? await Role.findById(user.user_role_id)
          .select("role_name role_display_name")
          .lean()
      : null;

    return res.status(200).json({
      success: true,
      data: {
        ...teacher,
        user,
        role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const UpdateTeacher = async (req: any, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  try {
    const teacher = await Teacher.findOne({
      _id: id,
      organization_id: organizationId,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Email duplicate check
    if (req.body.teacher_email) {
      const existingUser = await User.findOne({
        user_email: req.body.teacher_email,
        _id: {
          $ne: teacher.user_id,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update User
    await User.findByIdAndUpdate(
      teacher.user_id,
      {
        user_name: req.body.teacher_name,
        user_email: req.body.teacher_email,
        user_phone: req.body.teacher_phone,
      },
      { new: true },
    );

    // Update Teacher
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      {
        teacher_name: req.body.teacher_name,
        teacher_email: req.body.teacher_email,
        teacher_phone: req.body.teacher_phone,
        teacher_gender: req.body.teacher_gender,
        teacher_qualification: req.body.teacher_qualification,
        teacher_experience: req.body.teacher_experience,
        teacher_joining_date: req.body.teacher_joining_date,
        teacher_salary: req.body.teacher_salary,
        teacher_address: req.body.teacher_address,
        teacher_status: req.body.teacher_status,
        teacher_photo: req.body.teacher_photo,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const DeleteTeacher = async (req: any, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  try {
    const teacher = await Teacher.findOne({
      _id: id,
      organization_id: organizationId,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Disable User Login
    await User.findByIdAndUpdate(teacher.user_id, {
      user_isActive: false,
    });

    // Disable Teacher
    await Teacher.findByIdAndUpdate(teacher._id, {
      teacher_status: false,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ToggleTeacherStatus = async (req: any, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user;
  try {
    const teacher = await Teacher.findOne({
      _id: id,
      organization_id: organizationId,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const newStatus = !teacher.teacher_status;

    // Update Teacher Status
    teacher.teacher_status = newStatus;
    await teacher.save();

    // Update User Login Status
    await User.findByIdAndUpdate(
      teacher.user_id,
      {
        user_isActive: newStatus,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: `Teacher ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
      data: {
        teacher_id: teacher._id,
        teacher_status: newStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update teacher status",
    });
  }
};
