import { Response } from "express";
import { Event } from "./event.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateEvent = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const event = await Event.create({ ...req.body, organization_id: organizationId, event_created_by: userId });
    return res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetEvents = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const status = req.query.status;
  try {
    const filter: any = { organization_id: organizationId };
    if (status) filter.event_status = status;
    if (search) filter.event_title = { $regex: search, $options: "i" };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("event_created_by", "user_name user_email")
        .sort({ event_start_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: events,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetEventById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const event = await Event.findOne({ _id: req.params.id, organization_id: organizationId })
      .populate("event_created_by", "user_name user_email");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, data: event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateEvent = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true },
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event updated", data: event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteEvent = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
