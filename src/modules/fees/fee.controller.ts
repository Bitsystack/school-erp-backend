import { Response } from "express";
import { FeeStructure, FeeCollection } from "./fee.model";
import { generateReceiptNo } from "../../utils/generateId";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateFeeStructure = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const structure = await FeeStructure.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Fee structure created", data: structure });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetFeeStructures = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  try {
    const filter: any = { organization_id: organizationId };
    if (classId) filter.class_id = classId;
    if (search) filter.fee_title = { $regex: search, $options: "i" };

    const [structures, total] = await Promise.all([
      FeeStructure.find(filter)
        .populate("class_id", "class_name class_numeric")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeStructure.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: structures,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const CollectFee = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const receipt_no = await generateReceiptNo(FeeCollection, organizationId);
    const total = req.body.collection_amount_paid + (req.body.collection_fine || 0) - (req.body.collection_discount || 0);

    const collection = await FeeCollection.create({
      ...req.body,
      organization_id: organizationId,
      collection_receipt_no: receipt_no,
      collection_total_amount: total,
      collection_balance: req.body.collection_balance || 0,
      collected_by: userId,
      collection_payment_date: req.body.collection_payment_date || new Date(),
    });
    return res.status(201).json({ success: true, message: "Fee collected", data: collection });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetAllCollections = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const classId = req.query.class_id;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;
  try {
    const filter: any = { organization_id: organizationId };
    if (startDate && endDate) {
      filter.collection_payment_date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const [collections, total] = await Promise.all([
      FeeCollection.find(filter)
        .populate("student_id", "student_name student_admission_no")
        .populate("fee_structure_id", "fee_title fee_amount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeCollection.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: collections,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetStudentFeeHistory = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { student_id } = req.params;
  try {
    const history = await FeeCollection.find({ organization_id: organizationId, student_id })
      .populate("fee_structure_id", "fee_title fee_amount fee_frequency")
      .sort({ collection_payment_date: -1 })
      .lean();

    const totalPaid = history.reduce((sum, r) => sum + r.collection_amount_paid, 0);
    const totalFine = history.reduce((sum, r) => sum + (r.collection_fine || 0), 0);

    return res.status(200).json({
      success: true,
      data: history,
      summary: { total_paid: totalPaid, total_fine: totalFine },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetOrganizationFeeStats = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { month, year } = req.query;
  try {
    const matchFilter: any = { organization_id: organizationId };
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      matchFilter.collection_payment_date = { $gte: start, $lt: end };
    }

    const stats = await FeeCollection.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total_collected: { $sum: "$collection_amount_paid" },
          total_fine: { $sum: "$collection_fine" },
          total_discount: { $sum: "$collection_discount" },
          total_balance: { $sum: "$collection_balance" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
