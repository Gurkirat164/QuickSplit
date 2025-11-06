import Router from "express";
import {
    loginUser,
    logoutUser,
    registerUser
} from "../controller/user.controller";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser, (_, res) => {
    res.send("Login Successful");
});

router.route("/logout").post(logoutUser, (_, res) => {
    res.send("Logout Successful");
});

export default router;