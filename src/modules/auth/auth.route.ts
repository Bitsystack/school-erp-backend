import { Router } from "express";

import {
  Register,
  Login,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
} from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", Register);
authRoutes.get("/verify-email", VerifyEmail);
authRoutes.post("/login", Login);
authRoutes.post("/forgot-password", ForgotPassword);
authRoutes.post("/reset-password", ResetPassword);

export default authRoutes;
