import Router from "express";
import {
    getExpenseById,
    updateExpense,
    deleteExpense
} from "../controller/expense.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Expense routes by expense ID (not nested under group)
router.route("/:expenseId").get(getExpenseById).put(updateExpense).delete(deleteExpense);

export default router;
