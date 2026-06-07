import { Router } from "express";

import { CreateOrganization } from "./organization.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { UploadLogo } from "./upload.controller";

const organizationRoutes = Router();

organizationRoutes.post("/create", authMiddleware, CreateOrganization);
organizationRoutes.post(
  "/logo",
  authMiddleware,
  upload.single("logo"),
  UploadLogo,
);

export default organizationRoutes;
