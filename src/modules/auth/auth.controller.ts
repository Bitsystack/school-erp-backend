import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../users/user.model";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import { generateTokens } from "../../utils/generateToken";
import { Role } from "../roles/role.model";
import crypto from "crypto";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";
import { sendForgotPasswordEmail } from "../../utils/sendForgotPasswordEmail";

export const Register = async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const { user_email, user_password, ...rest } = validatedData;
  try {
    const existingUser = await User.findOne({ user_email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    const findRole = await Role.findOne({ role_name: "ORGANIZATION_ADMIN" });

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      ...rest,
      user_email,
      user_password: hashedPassword,
      user_isEmailVerified: false,
      user_isActive: true,
      user_organization_id: "",
      user_role_id: findRole?._id.toString() || "",
      user_emailVerificationToken: emailVerificationToken,
      user_emailVerificationExpires: emailVerificationExpires,
      user_hasBusiness: false,
    });

    // Send verification email
    await sendVerificationEmail(
      user_email,
      rest.user_name,
      `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`,
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const VerifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  try {
    const user = await User.findOne({
      user_emailVerificationToken: token,
      user_emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.user_isEmailVerified = true;
    user.user_emailVerificationToken = undefined;
    user.user_emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  const { user_email, user_password } = validatedData;
  try {
    const user = await User.findOne({ user_email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      user_password,
      user.user_password,
    );

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!user.user_isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const payload = {
      userId: user._id.toString(),
      organizationId: user.user_organization_id || "",
      roleId: user.user_role_id || "",
    };

    const role = await Role.findById(user.user_role_id);
    const { accessToken, refreshToken } = generateTokens(payload);

    user.user_lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          user_name: user.user_name,
          user_email: user.user_email,
          user_phone: user.user_phone,
          user_organization_id: user.user_organization_id,
          user_role_id: user.user_role_id,
          user_lastLogin: user.user_lastLogin,
          user_isEmailVerified: user.user_isEmailVerified,
          user_hasBusiness: user.user_hasBusiness,
          user_isActive: user.user_isActive,
          user_business_type: user.user_business_type,
          role: role
            ? {
                _id: role._id,
                role_name: role.role_name,
                role_display_name: role.role_display_name,
                role_permissions: role.role_permissions,
              }
            : "",
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { user_email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({
      user_email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.user_forgotPasswordToken = token;

    user.user_forgotPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendForgotPasswordEmail(user.user_email, user.user_name, resetLink);

    return res.status(200).json({
      success: true,
      message: "Reset link sent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({
      user_forgotPasswordToken: token,
      user_forgotPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+user_password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.user_password = hashedPassword;
    user.user_forgotPasswordToken = undefined;
    user.user_forgotPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
