import { Request, Response } from "express";

import { Organization } from "./organization.model";
import { User } from "../users/user.model";

import { createOrganizationSchema } from "./organization.validation";

import { generateTokens } from "../../utils/generateToken";
import mongoose from "mongoose";
import { Role } from "../roles/role.model";
export const GetOrganizations = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const filter: any = {};

    if (search) {
      filter.$or = [
        {
          user_name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          user_email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          user_phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "-user_password -user_forgotPasswordToken -user_emailVerificationToken -user_emailVerificationExpires -user_forgotPasswordExpires -__v",
      )
      .lean();

    const data = await Promise.all(
      users.map(async (user) => {
        let organization = null;
        let role = null;

        if (user.user_organization_id) {
          organization = await Organization.findById(user.user_organization_id)
            .select("-__v")
            .lean();
        }

        if (user.user_role_id) {
          role = await Role.findById(user.user_role_id)
            .select("role_name role_display_name role_level")
            .lean();
        }

        return {
          ...user,

          role: role || null,

          organization: organization || null,
        };
      }),
    );

    const total = await User.countDocuments(filter);

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
      message: error.message || "Failed to fetch users",
    });
  }
};

export const GetOrganizationById = async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const organization = await Organization.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "organization_owner_id",
          foreignField: "_id",
          as: "owner",
        },
      },

      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,

          // Organization Details
          organization_name: 1,
          organization_email: 1,
          organization_phone: 1,
          organization_whatsapp: 1,
          organization_website: 1,
          organization_country: 1,
          organization_address: 1,
          organization_pincode: 1,
          organization_gstin: 1,
          organization_upiId: 1,
          organization_logo: 1,
          organization_status: 1,
          createdAt: 1,
          updatedAt: 1,

          // Owner Details
          owner: {
            _id: "$owner._id",
            user_name: "$owner.user_name",
            user_email: "$owner.user_email",
            user_phone: "$owner.user_phone",
            user_country: "$owner.user_country",
            user_business_type: "$owner.user_business_type",
            user_isActive: "$owner.user_isActive",
            user_isEmailVerified: "$owner.user_isEmailVerified",
            createdAt: "$owner.createdAt",
          },
        },
      },
    ]);

    if (!organization.length) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: organization[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization",
    });
  }
};

export const CreateOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validatedData = createOrganizationSchema.parse(req.body);

    const organization = await Organization.create({
      ...validatedData,
      organization_owner_id: userId,
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        user_organization_id: organization._id,

        user_hasBusiness: true,
      },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = {
      userId: user._id.toString(),
      roleId: `${user.user_role_id}`,
      organizationId: organization._id.toString(),
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",

      data: {
        organization,
      },
    });
  } catch (error: any) {
    console.error("Create Organization Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization",
    });
  }
};

export const UpdateOrganization = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const validatedData = createOrganizationSchema.partial().parse(req.body);
  try {
    const organization = await Organization.findOneAndUpdate(
      { organization_owner_id: userId },
      validatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error: any) {
    console.error("Update Organization Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const DeleteOrganization = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const organization = await Organization.findOne({
      organization_owner_id: userId,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    await Organization.findByIdAndDelete(organization._id);

    await User.findByIdAndUpdate(userId, {
      user_organization_id: null,
      user_hasBusiness: false,
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Organization Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
