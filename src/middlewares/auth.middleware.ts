import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import { User } from "../modules/users/user.model";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      roleId: string;
      organizationId?: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.user_isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.user = {
      userId: decoded.userId,
      roleId: decoded.roleId,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
