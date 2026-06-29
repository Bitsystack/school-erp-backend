import { Request } from "express";

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  search: string;
}

export const getPagination = (req: Request): PaginationOptions => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const search = String(req.query.search || "").trim();
  return { page, limit, skip, search };
};

export const buildPaginationResponse = (
  total: number,
  page: number,
  limit: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
