import { Response } from "express";
import { Visitor } from "./visitor.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const RegisterVisitor = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const todayCount = await Visitor.countDocuments({ organization_id: organizationId });
    const gate_pass_no = `PASS-${Date.now().toString().slice(-4)}-${(todayCount + 1).toString().padStart(3, "0")}`;

    const visitor = await Visitor.create({
      ...req.body,
      organization_id: organizationId,
      gate_pass_no,
      check_in_time: new Date(),
      status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      data: visitor,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const CheckoutVisitor = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const visitor = await Visitor.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId, status: "ACTIVE" },
      {
        check_out_time: new Date(),
        status: "CHECKED_OUT",
        remarks: req.body.remarks,
      },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Active visitor pass not found or already checked out",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visitor checked out successfully",
      data: visitor,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetVisitors = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { status, date } = req.query;

  try {
    const filter: any = { organization_id: organizationId };
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filter.check_in_time = { $gte: start, $lte: end };
    }
    if (search) {
      filter.$or = [
        { visitor_name: { $regex: search, $options: "i" } },
        { visitor_phone: { $regex: search, $options: "i" } },
        { gate_pass_no: { $regex: search, $options: "i" } },
        { person_to_meet: { $regex: search, $options: "i" } },
      ];
    }

    const [visitors, total] = await Promise.all([
      Visitor.find(filter)
        .sort({ check_in_time: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Visitor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: visitors,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
