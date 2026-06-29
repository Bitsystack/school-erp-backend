import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        roleId: string;
        organizationId: string;
      };
    }
  }
}
