import { Response } from "express";
import { Announcement } from "./announcement.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateAnnouncement = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const announcement = await Announcement.create({
      ...req.body,
      organization_id: organizationId,
      announcement_published_by: userId,
    });
    return res.status(201).json({ success: true, message: "Announcement created", data: announcement });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAnnouncements = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const target = req.query.target;
  try {
    const filter: any = { organization_id: organizationId, announcement_is_published: true };
    if (target) filter.announcement_target = target;
    if (search) filter.announcement_title = { $regex: search, $options: "i" };

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate("announcement_published_by", "user_name user_email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: announcements,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAnnouncementById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const announcement = await Announcement.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("announcement_published_by", "user_name user_email");
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
    return res.status(200).json({ success: true, data: announcement });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateAnnouncement = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true },
    );
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
    return res.status(200).json({ success: true, message: "Announcement updated", data: announcement });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteAnnouncement = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const announcement = await Announcement.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
    return res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
