import { Router } from "express";
import {
  Register,
  VerifyEmail,
  ResendVerificationEmail,
  SetupOrganization,
  Login,
  Logout,
  RefreshToken,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
} from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const authRoutes = Router();

// ─── Public Routes ────────────────────────────────────────────

// Step 1: Create account (landing page form)
authRoutes.post("/register", Register);

// Step 1b: Email verification
authRoutes.get("/verify-email", VerifyEmail);
authRoutes.post("/resend-verification", ResendVerificationEmail);

// Login / Logout
authRoutes.post("/login", Login);
authRoutes.post("/logout", Logout);

// Token refresh (called by frontend interceptor when 401)
authRoutes.post("/refresh-token", RefreshToken);

// Password recovery
authRoutes.post("/forgot-password", ForgotPassword);
authRoutes.post("/reset-password", ResetPassword);

// ─── Protected Routes ────────────────────────────────────────

// Step 2: Onboarding — setup school (after email verified)
authRoutes.post("/setup-organization", authMiddleware, SetupOrganization);

// Change password (logged-in user)
authRoutes.post("/change-password", authMiddleware, ChangePassword);

export default authRoutes;
