import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const issues = err.issues ?? (err as any).errors ?? [];
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: issues.map((e: any) => ({
        field: Array.isArray(e.path) ? e.path.join(".") : e.path,
        message: e.message,
      })),
    });
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Default server error
  console.error("Unhandled Error:", err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
