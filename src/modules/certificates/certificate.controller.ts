import { Response } from "express";
import { Certificate } from "./certificate.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";
import crypto from "crypto";

export const GenerateCertificate = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const certCount = await Certificate.countDocuments({ organization_id: organizationId });
    const certificate_no = `CERT-${Date.now().toString().slice(-6)}-${(certCount + 1).toString().padStart(4, "0")}`;
    const qr_code = crypto.createHash("sha256").update(`${organizationId}-${certificate_no}-${Date.now()}`).digest("hex").slice(0, 24);

    const certificate = await Certificate.create({
      ...req.body,
      organization_id: organizationId,
      certificate_no,
      qr_code,
      issue_date: req.body.issue_date || new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetCertificates = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { certificate_type, student_id } = req.query;

  try {
    const filter: any = { organization_id: organizationId };
    if (certificate_type) filter.certificate_type = certificate_type;
    if (student_id) filter.student_id = student_id;
    if (search) {
      filter.$or = [
        { student_name: { $regex: search, $options: "i" } },
        { admission_no: { $regex: search, $options: "i" } },
        { certificate_no: { $regex: search, $options: "i" } },
      ];
    }

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Certificate.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: certificates,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetCertificateById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      organization_id: organizationId,
    }).lean();
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });
    return res.status(200).json({ success: true, data: certificate });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const VerifyCertificate = async (req: any, res: Response) => {
  const { qrCode } = req.params;
  try {
    const certificate = await Certificate.findOne({ qr_code: qrCode, status: "ISSUED" })
      .populate("organization_id", "org_name org_email org_phone org_address logo")
      .lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or revoked certificate",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: certificate,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
