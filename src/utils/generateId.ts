import mongoose from "mongoose";

/**
 * Generates a sequential ID with a prefix
 * e.g. "STU-0001", "ADM-0001"
 */
export const generateSequentialId = async (
  model: mongoose.Model<any>,
  field: string,
  prefix: string,
  orgPrefix: string,
  organizationId: string,
): Promise<string> => {
  const filter: any = { organization_id: organizationId };
  const last = await model
    .findOne(filter)
    .sort({ createdAt: -1 })
    .select(field);

  let nextNumber = 1;
  if (last && last[field]) {
    const match = last[field].match(/(\d+)$/);
    if (match) nextNumber = Number(match[1]) + 1;
  }

  return `${orgPrefix}-${prefix}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Generate receipt number for fee collection
 */
export const generateReceiptNo = async (
  model: mongoose.Model<any>,
  organizationId: string,
): Promise<string> => {
  const count = await model.countDocuments({ organization_id: organizationId });
  const timestamp = Date.now().toString().slice(-6);
  return `RCP-${String(count + 1).padStart(4, "0")}-${timestamp}`;
};
