import mongoose, { Schema, Document } from "mongoose";

// Book master record
export interface IBook extends Document {
  organization_id: mongoose.Types.ObjectId;
  book_title: string;
  book_author?: string;
  book_publisher?: string;
  book_isbn?: string;
  book_category?: string;
  book_subject?: string;
  book_edition?: string;
  book_language?: string;
  book_total_copies: number;
  book_available_copies: number;
  book_price?: number;
  book_rack_no?: string;
  book_cover_image?: string;
  book_status: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    book_title: { type: String, required: true, trim: true },
    book_author: String,
    book_publisher: String,
    book_isbn: String,
    book_category: String,
    book_subject: String,
    book_edition: String,
    book_language: { type: String, default: "English" },
    book_total_copies: { type: Number, required: true, default: 1 },
    book_available_copies: { type: Number, required: true, default: 1 },
    book_price: Number,
    book_rack_no: String,
    book_cover_image: String,
    book_status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Book = mongoose.model<IBook>("Book", bookSchema);

// Book issue / return record
export interface IBookIssue extends Document {
  organization_id: mongoose.Types.ObjectId;
  book_id: mongoose.Types.ObjectId;
  member_id: mongoose.Types.ObjectId;  // Student or Teacher user_id
  member_type: "Student" | "Teacher" | "Staff";
  issue_date: Date;
  due_date: Date;
  return_date?: Date;
  issue_fine?: number;
  issue_status: "Issued" | "Returned" | "Overdue";
  issued_by: mongoose.Types.ObjectId;
}

const bookIssueSchema = new Schema<IBookIssue>(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    book_id: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    member_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    member_type: {
      type: String,
      enum: ["Student", "Teacher", "Staff"],
      required: true,
    },
    issue_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    return_date: Date,
    issue_fine: { type: Number, default: 0 },
    issue_status: {
      type: String,
      enum: ["Issued", "Returned", "Overdue"],
      default: "Issued",
    },
    issued_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

bookIssueSchema.index({ organization_id: 1, member_id: 1 });
bookIssueSchema.index({ organization_id: 1, issue_status: 1 });

export const BookIssue = mongoose.model<IBookIssue>(
  "BookIssue",
  bookIssueSchema,
);
