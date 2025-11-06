import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

const generateAccessRefreshTokens = async (userID) => {
    try {
        const foundUser = await User.findById(userID);
        const accessToken = foundUser.generateAccessTokens();
        const refreshToken = foundUser.generateRefreshTokens();

        foundUser.refreshToken = refreshToken;
        await foundUser.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            `Something went wrong while generating Tokens: ${error.message}`
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required"));
        }

        if (password !== confirmPassword) {
            return res
                .status(400)
                .json(new ApiError(400, "Passwords do not match"));
        }

        // Registration logic will go here
        const checkUserExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }]
        });

        if (checkUserExists) {
            return res
                .status(409)
                .json(new ApiError(409, "User with this email already exists"));
        }

        const newUser = new User.create({
            fullName,
            email: email.toLowerCase(),
            password,
            username: email.split("@")[0]
        });

        const isCreated = newUser.toObject();
        delete isCreated.password;
        delete isCreated.refreshToken;

        if (!isCreated)
            throw new ApiErrors(
                500,
                "Something went wrong in uploading the data."
            );

        return res
            .status(201)
            .json(
                new ApiResponse(isCreated, 201, "User registered successfully")
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiError(
                    error.statusCode || 500,
                    "Internal Server Error",
                    error
                )
            );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json(new ApiError(400, "Email and Password are required"));
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid email or password"));
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid email or password"));
        }

        const { accessToken, refreshToken } =
            await user.generateAccessRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    {
                        user,
                        accessToken,
                        refreshToken
                    },
                    200,
                    "Login successful"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(null, error.statusCode || 500, error.message)
            );
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        const userID = req.user._id;
        const foundUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");

        if (!foundUser) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/"
        };

        return res
            .status(200)
            .cookie("accessToken", options)
            .cookie("refreshToken", options)
            .json(new ApiResponse(null, 200, "User Logout successful"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(null, error.statusCode || 500, error.message)
            );
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken ||
            req.body.refreshToken ||
            req.header("x-refresh-token");

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh Token is required");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) throw new ApiError(401, "Invalid Refresh Token.");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/"
        };

        const { accessToken, refreshToken } = await generateAccessRefreshTokens(
            user._id
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    {
                        user,
                        accessToken,
                        refreshToken
                    },
                    200,
                    "Access Token refreshed successfully"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(null, error.statusCode || 500, error.message)
            );
    }

});

export { registerUser, loginUser, logoutUser };
