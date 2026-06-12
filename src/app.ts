import express, { Application, Request, Response } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route";
import organizationRoutes from "./modules/organization/organization.routes";
import userRoutes from "./modules/users/user.routes";
import roleRoutes from "./modules/roles/role.routes";

const app: Application = express();
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: 1,
    message: "School ERP API Running 🚀",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organization", organizationRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/role", roleRoutes);

/**
 * API Routes
 */
// app.use("/api/v1/auth", authRoutes);

/**
 * Not Found Route
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
