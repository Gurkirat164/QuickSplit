import Router from "express";
import {
    loginUser,
    logoutUser,
    registerUser
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

// Get current user
router.route("/me").get(verifyJWT, async (req, res) => {
    try {
        const user = {
            _id: req.user._id,
            name: req.user.fullName,
            email: req.user.email,
            username: req.user.username
        };
        
        res.status(200).json({
            payload: user,
            statusCode: 200,
            message: "User fetched successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            payload: null,
            statusCode: 500,
            message: error.message,
            success: false
        });
    }
});

export default router;
