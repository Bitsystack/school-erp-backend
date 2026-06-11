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
