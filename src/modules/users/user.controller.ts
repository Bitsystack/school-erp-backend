import { Request, Response } from "express";
import { User } from "./user.model";
import { Organization } from "../organization/organization.model";
import { Role } from "../roles/role.model";

export const GetMe = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const user = await User.findById(userId).select("-user_password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let organization = null;
    let role = null;

    if (user.user_organization_id && user.user_organization_id.trim() !== "") {
      organization = await Organization.findById(
        user.user_organization_id,
      ).lean();
    }

    if (user.user_role_id && user.user_role_id.trim() !== "") {
      role = await Role.findById(user.user_role_id).lean();
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user,
        organization: organization || {},
        role: role || {},
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
