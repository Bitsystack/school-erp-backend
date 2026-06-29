import { Response } from "express";
import { Book, BookIssue } from "./library.model";
import { getPagination, buildPaginationResponse } from "../../utils/pagination";

export const CreateBook = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const book = await Book.create({ ...req.body, organization_id: organizationId });
    return res.status(201).json({ success: true, message: "Book added", data: book });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetBooks = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip, search } = getPagination(req);
  const category = req.query.category;
  try {
    const filter: any = { organization_id: organizationId, book_status: true };
    if (category) filter.book_category = category;
    if (search) {
      filter.$or = [
        { book_title: { $regex: search, $options: "i" } },
        { book_author: { $regex: search, $options: "i" } },
        { book_isbn: { $regex: search, $options: "i" } },
      ];
    }
    const [books, total] = await Promise.all([
      Book.find(filter).sort({ book_title: 1 }).skip(skip).limit(limit).lean(),
      Book.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: books, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetBookById = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const book = await Book.findOne({ _id: req.params.id, organization_id: organizationId });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    return res.status(200).json({ success: true, data: book });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const UpdateBook = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, organization_id: organizationId },
      req.body,
      { new: true },
    );
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    return res.status(200).json({ success: true, message: "Book updated", data: book });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteBook = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    await Book.findOneAndUpdate({ _id: req.params.id, organization_id: organizationId }, { book_status: false });
    return res.status(200).json({ success: true, message: "Book removed" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const IssueBook = async (req: any, res: Response) => {
  const { organizationId, userId } = req.user;
  try {
    const book = await Book.findOne({ _id: req.body.book_id, organization_id: organizationId });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    if (book.book_available_copies <= 0) {
      return res.status(400).json({ success: false, message: "No copies available" });
    }

    const issue = await BookIssue.create({
      ...req.body,
      organization_id: organizationId,
      issued_by: userId,
      issue_date: new Date(),
      issue_status: "Issued",
    });

    // Decrease available copies
    await Book.findByIdAndUpdate(book._id, { $inc: { book_available_copies: -1 } });

    return res.status(201).json({ success: true, message: "Book issued", data: issue });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const ReturnBook = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  try {
    const issue = await BookIssue.findOne({ _id: req.params.issue_id, organization_id: organizationId });
    if (!issue) return res.status(404).json({ success: false, message: "Issue record not found" });
    if (issue.issue_status === "Returned") {
      return res.status(400).json({ success: false, message: "Book already returned" });
    }

    const returnDate = new Date();
    const daysLate = Math.floor((returnDate.getTime() - issue.due_date.getTime()) / (1000 * 60 * 60 * 24));
    const fine = daysLate > 0 ? daysLate * (req.body.fine_per_day || 5) : 0;

    issue.return_date = returnDate;
    issue.issue_status = "Returned";
    issue.issue_fine = fine;
    await issue.save();

    await Book.findByIdAndUpdate(issue.book_id, { $inc: { book_available_copies: 1 } });

    return res.status(200).json({ success: true, message: "Book returned", data: issue });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const GetActiveIssues = async (req: any, res: Response) => {
  const { organizationId } = req.user;
  const { page, limit, skip } = getPagination(req);
  const status = req.query.status || "Issued";
  try {
    const filter: any = { organization_id: organizationId, issue_status: status };

    const [issues, total] = await Promise.all([
      BookIssue.find(filter)
        .populate("book_id", "book_title book_author book_isbn")
        .sort({ issue_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BookIssue.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: issues, pagination: buildPaginationResponse(total, page, limit) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
