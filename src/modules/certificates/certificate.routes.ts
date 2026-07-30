import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  GenerateCertificate,
  GetCertificates,
  GetCertificateById,
  VerifyCertificate,
} from "./certificate.controller";

const certificateRoutes = Router();

// Public route for QR verification
certificateRoutes.get("/verify/:qrCode", VerifyCertificate);

// Protected routes
certificateRoutes.post("/generate", authMiddleware, GenerateCertificate);
certificateRoutes.post("/create", authMiddleware, GenerateCertificate);
certificateRoutes.get("/list", authMiddleware, GetCertificates);
certificateRoutes.get("/:id", authMiddleware, GetCertificateById);

export default certificateRoutes;
