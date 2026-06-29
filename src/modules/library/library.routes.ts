import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  CreateBook,
  GetBooks,
  GetBookById,
  UpdateBook,
  DeleteBook,
  IssueBook,
  ReturnBook,
  GetActiveIssues,
} from "./library.controller";

const libraryRoutes = Router();

// Books
libraryRoutes.post("/book/create", authMiddleware, CreateBook);
libraryRoutes.get("/book/list", authMiddleware, GetBooks);
libraryRoutes.get("/book/:id", authMiddleware, GetBookById);
libraryRoutes.patch("/book/update/:id", authMiddleware, UpdateBook);
libraryRoutes.delete("/book/delete/:id", authMiddleware, DeleteBook);

// Issues
libraryRoutes.post("/issue", authMiddleware, IssueBook);
libraryRoutes.patch("/return/:issue_id", authMiddleware, ReturnBook);
libraryRoutes.get("/issues", authMiddleware, GetActiveIssues);

export default libraryRoutes;
