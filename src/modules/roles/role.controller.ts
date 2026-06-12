import { Request, Response } from "express";
import { createRoleSchema, updateRoleSchema } from "./role.validation";
import { Role } from "./role.model";

export const CreateRole = async (req: Request, res: Response) => {
  const validatedData = createRoleSchema.parse(req.body);
  try {
    const existingRole = await Role.findOne({
      role_name: validatedData.role_name,
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role already exists",
      });
    }

    const lastRole = await Role.findOne().sort({
      role_level: -1,
    });

    const role = await Role.create({
      ...validatedData,
      role_level: lastRole ? lastRole.role_level + 1 : 1,
      role_isSystemRole: false,
    });

    return res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetRoles = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  const filter: any = {
    role_name: {
      $regex: search,
      $options: "i",
    },
  };

  try {
    const [roles, total] = await Promise.all([
      Role.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Role.countDocuments(filter),
    ]);

    if (roles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Roles list not found",
        data: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roles list",
      data: roles,
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
      message: error.message,
    });
  }
};

export const GetRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(200).json({
        success: false,
        message: "Role not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Role details",
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const UpdateRole = async (req: Request, res: Response) => {
  try {
    const validatedData = updateRoleSchema.parse(req.body);

    const role = await Role.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!role) {
      return res.status(200).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const DeleteRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(200).json({
        success: false,
        message: "Role not found",
      });
    }

    if (role.role_isSystemRole) {
      return res.status(200).json({
        success: false,
        message: "System role cannot be deleted",
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
