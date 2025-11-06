import Router from "express";
import {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    getBalances
} from "../controller/group.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import groupExpenseRouter from "./groupExpense.route.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Group routes
router.route("/").get(getGroups).post(createGroup);

router
    .route("/:groupId")
    .get(getGroupById)
    .put(updateGroup)
    .delete(deleteGroup);

// Member management routes
router.route("/:groupId/members").post(addMember);

router.route("/:groupId/members/:memberId").delete(removeMember);

// Balance routes
router.route("/:groupId/balances").get(getBalances);

// Nested expense routes for a specific group
router.use("/:groupId/expenses", groupExpenseRouter);

export default router;
