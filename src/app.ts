import express, { Application, Request, Response } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route";

const app: Application = express();
app.use(helmet());
app.use(
  cors({
    origin: "*",
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
