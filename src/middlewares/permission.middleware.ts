import { Request, Response, NextFunction } from "express";

import { User } from "../modules/users/user.model";
import { Role } from "../modules/roles/role.model";

export const checkPermission =
  (permission: string) =>
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const role = await Role.findById(user.user_role_id);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      // SUPER_ADMIN bypass
      if (role.role_name === "SUPER_ADMIN") {
        return next();
      }

      const hasPermission = role.role_permissions.includes(permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
