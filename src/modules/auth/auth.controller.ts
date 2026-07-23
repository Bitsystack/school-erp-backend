import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { Organization } from "../organization/organization.model";
import { generateTokens } from "../../utils/generateToken";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";
import { sendForgotPasswordEmail } from "../../utils/sendForgotPasswordEmail";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  setupOrganizationSchema,
} from "./auth.validation";

// ─── Cookie helpers ───────────────────────────────────────────
// const COOKIE_OPTIONS = (maxAgeMs: number) => ({
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict" as const,
//   maxAge: maxAgeMs,
// });

const COOKIE_OPTIONS = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: maxAgeMs,
});

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, COOKIE_OPTIONS(24 * 60 * 60 * 1000)); // 1 day
  res.cookie(
    "refreshToken",
    refreshToken,
    COOKIE_OPTIONS(7 * 24 * 60 * 60 * 1000),
  ); // 7 days
};

const clearAuthCookies = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: new Date(0),
  });
};

// ─── Build safe user response object ─────────────────────────
const buildUserResponse = async (user: any) => {
  const role = user.user_role_id
    ? await Role.findById(user.user_role_id)
        .select("role_name role_display_name role_permissions")
        .lean()
    : null;

  const organization =
    user.user_organization_id && user.user_organization_id !== ""
      ? await Organization.findById(user.user_organization_id).lean()
      : null;

  return {
    _id: user._id,
    user_name: user.user_name,
    user_email: user.user_email,
    user_phone: user.user_phone,
    user_country: user.user_country,
    user_business_type: user.user_business_type,
    user_isEmailVerified: user.user_isEmailVerified,
    user_isActive: user.user_isActive,
    user_hasBusiness: user.user_hasBusiness,
    user_organization_id: user.user_organization_id,
    user_lastLogin: user.user_lastLogin,
    role: role || null,
    organization: organization || null,
  };
};

// ─────────────────────────────────────────────────────────────
// STEP 1 — Register
//   Landing page pe "Create Account" form submit karta hai
//   Fields: name, email, phone, password, country, business_type
// ─────────────────────────────────────────────────────────────
export const Register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { user_email, user_password, ...rest } = validatedData;

    // Duplicate email check
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // ORGANIZATION_ADMIN role assign hoga
    const orgAdminRole = await Role.findOne({
      role_name: "ORGANIZATION_ADMIN",
    });
    if (!orgAdminRole) {
      return res.status(500).json({
        success: false,
        message: "System roles not configured. Please run seed script first.",
      });
    }

    const hashedPassword = await bcrypt.hash(user_password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      ...rest,
      user_email,
      user_password: hashedPassword,
      user_isEmailVerified: false,
      user_isActive: true,
      user_organization_id: "",
      user_role_id: orgAdminRole._id.toString(),
      user_emailVerificationToken: emailVerificationToken,
      user_emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
      message:
        "Account created! Please check your email to verify your account.",
      data: {
        user_id: user._id,
        user_email: user.user_email,
        user_isEmailVerified: false,
        user_hasBusiness: false,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Verify Email
// ─────────────────────────────────────────────────────────────
export const VerifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  try {
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    const user = await User.findOne({
      user_emailVerificationToken: token,
      user_emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification link. Please request a new one.",
      });
    }

    user.user_isEmailVerified = true;
    user.user_emailVerificationToken = undefined;
    user.user_emailVerificationExpires = undefined;
    await user.save();

    // Auto-login after verification — tokens set so frontend can redirect to onboarding
    const payload = {
      userId: user._id.toString(),
      roleId: user.user_role_id || "",
      organizationId: user.user_organization_id || "",
    };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      data: {
        user_id: user._id,
        user_hasBusiness: user.user_hasBusiness,
        // Frontend uses user_hasBusiness to decide:
        // false → redirect to /setup-school
        // true  → redirect to /dashboard
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Resend Verification Email
// ─────────────────────────────────────────────────────────────
export const ResendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ user_email });
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.status(200).json({
        success: true,
        message: "If this email exists, a verification link has been sent.",
      });
    }

    if (user.user_isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.user_emailVerificationToken = token;
    user.user_emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    await user.save();

    await sendVerificationEmail(
      user.user_email,
      user.user_name,
      `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
    );

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// STEP 2 — Setup Organization (Onboarding)
//   After email verify, user fills school details
//   This creates the school and links it to the user
// ─────────────────────────────────────────────────────────────
export const SetupOrganization = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.user_isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before setting up your school",
      });
    }

    if (user.user_hasBusiness) {
      return res.status(409).json({
        success: false,
        message: "You have already set up a school",
      });
    }

    const validatedData = setupOrganizationSchema.parse(req.body);

    // Create the organization
    const organization = await Organization.create({
      ...validatedData,
      organization_owner_id: user._id,
    });

    // Link organization to user
    user.user_organization_id = organization._id.toString();
    user.user_hasBusiness = true;
    await user.save();

    // Refresh tokens with organizationId now included
    const payload = {
      userId: user._id.toString(),
      roleId: user.user_role_id || "",
      organizationId: organization._id.toString(),
    };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: "School setup complete! Welcome to your dashboard.",
      data: {
        organization,
        user: await buildUserResponse(user),
      },
    });
  } catch (error: any) {
    console.error("Setup Organization Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
export const Login = async (req: Request, res: Response) => {
  try {
    const { user_email, user_password } = loginSchema.parse(req.body);

    const user = await User.findOne({ user_email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.user_isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Update last login
    user.user_lastLogin = new Date();
    await user.save();

    const payload = {
      userId: user._id.toString(),
      roleId: user.user_role_id || "",
      organizationId: user.user_organization_id || "",
    };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    const userData = await buildUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        // Frontend routing hints:
        // user_isEmailVerified = false → /verify-email
        // user_hasBusiness = false     → /setup-school
        // else                         → /dashboard
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Refresh Token
//   Frontend calls this when accessToken expires
// ─────────────────────────────────────────────────────────────
export const RefreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      roleId: string;
      organizationId: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user || !user.user_isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid session" });
    }

    const payload = {
      userId: user._id.toString(),
      roleId: user.user_role_id || "",
      organizationId: user.user_organization_id || "",
    };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (error: any) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────
export const Logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────
export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { user_email } = forgotPasswordSchema.parse(req.body);

    const user = await User.findOne({ user_email });

    // Always return 200 — don't reveal if email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.user_forgotPasswordToken = token;
    user.user_forgotPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendForgotPasswordEmail(user.user_email, user.user_name, resetLink);

    return res.status(200).json({
      success: true,
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────
export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({
      user_forgotPasswordToken: token,
      user_forgotPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.user_password = await bcrypt.hash(password, 12);
    user.user_forgotPasswordToken = undefined;
    user.user_forgotPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now login.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Change Password (logged-in user)
// ─────────────────────────────────────────────────────────────
export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { current_password, new_password } = changePasswordSchema.parse(
      req.body,
    );

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(current_password, user.user_password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.user_password = await bcrypt.hash(new_password, 12);
    await user.save();

    // Invalidate session — force re-login
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
