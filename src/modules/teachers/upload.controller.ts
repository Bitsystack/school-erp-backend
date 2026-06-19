import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary";

export const UploadLogo = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File required",
      });
    }
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64",
    )}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "teacher",
    });

    return res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};
