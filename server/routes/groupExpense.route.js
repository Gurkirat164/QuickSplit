import Router from "express";
import {
    getExpenses,
    createExpense,
    settleExpense
} from "../controller/expense.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true }); // mergeParams to access :groupId from parent router

// All routes require authentication
router.use(verifyJWT);

// Group-specific expense routes
router.route("/").get(getExpenses).post(createExpense);

// Settlement route
router.route("/settle").post(settleExpense);

export default router;
