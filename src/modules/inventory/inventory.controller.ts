import { Response } from "express";
import { InventoryItem } from "./inventory.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateInventoryItem = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const existing = await InventoryItem.findOne({
      organization_id: organizationId,
      item_code: req.body.item_code,
    });
    if (existing) return res.status(409).json({ success: false, message: "Item code already exists" });

    const total = Number(req.body.total_quantity || 0);
    const item = await InventoryItem.create({
      ...req.body,
      organization_id: organizationId,
      total_quantity: total,
      available_quantity: req.body.available_quantity !== undefined ? req.body.available_quantity : total,
    });

    return res.status(201).json({ success: true, message: "Inventory item created", data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetInventoryItems = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const { category } = req.query;

  try {
    const filter: any = { organization_id: organizationId };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: "i" } },
        { item_code: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      InventoryItem.find(filter)
        .sort({ item_name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryItem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const IssueInventoryItem = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { item_id, issued_to_name, issued_to_role, quantity, remarks } = req.body;

  try {
    const item = await InventoryItem.findOne({ _id: item_id, organization_id: organizationId });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const qty = Number(quantity);
    if (item.available_quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${item.available_quantity} available.`,
      });
    }

    item.available_quantity -= qty;
    item.issue_logs.push({
      issued_to_name,
      issued_to_role,
      quantity: qty,
      issue_date: new Date(),
      status: "ISSUED",
      remarks,
    });

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Inventory item issued successfully",
      data: item,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateInventoryItem = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Inventory item not found" });
    return res.status(200).json({ success: true, message: "Item updated", data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteInventoryItem = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, organization_id: organizationId });
    if (!item) return res.status(404).json({ success: false, message: "Inventory item not found" });
    return res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
