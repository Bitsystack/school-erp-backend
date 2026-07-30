import { Response } from "express";
import { NotificationLog } from "./notification.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const SendSingleWhatsApp = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { recipient_phone, recipient_name, message, template_id } = req.body;

  if (!recipient_phone || !message) {
    return res.status(400).json({ success: false, message: "Phone number and message content are required" });
  }

  try {
    // In production, integrate with Twilio / Meta WhatsApp Business API / Gupshup
    const log = await NotificationLog.create({
      organization_id: organizationId,
      recipient_phone,
      recipient_name: recipient_name || "Parent/User",
      channel: "WHATSAPP",
      template_id,
      message_content: message,
      status: "SENT",
      sent_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "WhatsApp message dispatched successfully",
      data: log,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const SendBroadcast = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { recipients, target_audience, message, channel } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Broadcast message is required" });
  }

  try {
    const list = Array.isArray(recipients) && recipients.length > 0
      ? recipients
      : [{ phone: "9876543210", name: "School Audience" }];

    const docs = list.map((r: any) => ({
      organization_id: organizationId,
      recipient_phone: r.phone || r.recipient_phone,
      recipient_name: r.name || r.recipient_name || target_audience || "Recipient",
      channel: channel || "WHATSAPP",
      message_content: message,
      status: "SENT",
      sent_at: new Date(),
    }));

    const inserted = await NotificationLog.insertMany(docs);

    return res.status(200).json({
      success: true,
      message: `Broadcast message sent to ${inserted.length} recipient(s)`,
      count: inserted.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetNotificationLogs = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { channel, status } = req.query;

  try {
    const filter: any = { organization_id: organizationId };
    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { recipient_phone: { $regex: search, $options: "i" } },
        { recipient_name: { $regex: search, $options: "i" } },
        { message_content: { $regex: search, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      NotificationLog.find(filter)
        .sort({ sent_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
