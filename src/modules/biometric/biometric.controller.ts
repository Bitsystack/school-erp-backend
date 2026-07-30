import { Response } from "express";
import { BiometricLog } from "./biometric.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const SyncDeviceLogs = async (req: any, res: Response) => {
  const organizationId = req.user?.organizationId || req.body.organization_id;
  if (!organizationId) {
    return res.status(400).json({ success: false, message: "organization_id is required" });
  }

  try {
    const logs = Array.isArray(req.body.logs) ? req.body.logs : [req.body];
    const logDocs = logs.map((log: any) => ({
      organization_id: organizationId,
      device_id: log.device_id || "GATE-01",
      device_name: log.device_name || "Main Gate Terminal",
      location: log.location || "Main Gate",
      biometric_user_id: log.biometric_user_id || log.card_no || "UNKNOWN",
      user_name: log.user_name || "Gate User",
      user_type: log.user_type || "Student",
      punch_time: log.punch_time ? new Date(log.punch_time) : new Date(),
      punch_direction: log.punch_direction || "IN",
      verification_mode: log.verification_mode || "CARD",
      status: log.status || "SUCCESS",
    }));

    const inserted = await BiometricLog.insertMany(logDocs);

    return res.status(201).json({
      success: true,
      message: `${inserted.length} punch log(s) synchronized`,
      count: inserted.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetPunchLogs = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { device_id, punch_direction, date } = req.query;

  try {
    const filter: any = { organization_id: organizationId };
    if (device_id) filter.device_id = device_id;
    if (punch_direction) filter.punch_direction = punch_direction;
    if (date) {
      const start = new Date(date as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filter.punch_time = { $gte: start, $lte: end };
    }
    if (search) {
      filter.$or = [
        { user_name: { $regex: search, $options: "i" } },
        { biometric_user_id: { $regex: search, $options: "i" } },
        { device_name: { $regex: search, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      BiometricLog.find(filter)
        .sort({ punch_time: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BiometricLog.countDocuments(filter),
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

export const GetGateDevices = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const devices = await BiometricLog.aggregate([
      { $match: { organization_id: organizationId } },
      {
        $group: {
          _id: "$device_id",
          device_name: { $first: "$device_name" },
          location: { $first: "$location" },
          total_punches: { $sum: 1 },
          last_punch_at: { $max: "$punch_time" },
        },
      },
      { $sort: { last_punch_at: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: devices,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
