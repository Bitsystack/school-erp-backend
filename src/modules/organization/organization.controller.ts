import { Response } from "express";

import { Organization } from "./organization.model";
import { User } from "../users/user.model";

import { createOrganizationSchema } from "./organization.validation";

import { generateTokens } from "../../utils/generateToken";

export const CreateOrganization = async (req: any, res: Response) => {
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

export const UpdateOrganization = async (req: any, res: Response) => {
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

export const DeleteOrganization = async (req: any, res: Response) => {
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
