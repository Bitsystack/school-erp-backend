import { Router } from "express";

import { Register, Login } from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", Register);
authRoutes.post("/login", Login);

// authRoutes.post("/refresh-token", refreshToken);
// authRoutes.post("/logout", logout);

export default authRoutes;
