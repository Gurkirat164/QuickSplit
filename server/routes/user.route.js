import Router from "express";
import {
    loginUser,
    logoutUser,
    registerUser
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser, (_, res) => {
    res.send("Login Successful");
});

router.route("/logout").post(verifyJWT, logoutUser, (_, res) => {
    res.send("Logout Successful");
});

export default router;
