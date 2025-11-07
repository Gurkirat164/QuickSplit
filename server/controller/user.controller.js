import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

        console.log(req.body);

        if (!fullName || !email || !password || !confirmPassword) {
            throw new ApiError(400, "All fields are required");
        }

        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }

        const checkUserExists = await User.findOne({
            email: email.toLowerCase()
        });

        if (checkUserExists) {
            throw new ApiError(409, "User with this email already exists");
        }

        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            username: email.split("@")[0]
        });

        await newUser.save(); // ✅ pre('save') runs here

        const userResponse = {
            _id: newUser._id,
            name: newUser.fullName,
            email: newUser.email,
            username: newUser.username
        };

        return res
            .status(201)
            .json(
                new ApiResponse(userResponse, 201, "User registered successfully")
            );
    } catch (error) {
        console.error("Error in User Registration: ", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiError(
                    error.statusCode || 500,
                    error.message || "Internal Server Error",
                    error
                )
            );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and Password are required");
        }

        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const { accessToken, refreshToken } = await generateAccessRefreshTokens(
            user._id
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/"
        };

        // Create user object without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.fullName,
            email: user.email,
            username: user.username
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    {
                        user: userResponse,
                        accessToken,
                        refreshToken
                    },
                    200,
                    "Login successful"
                )
            );
    } catch (error) {
        console.error("Error in User Login: ", error.message);
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

const checkUserExists = asyncHandler(async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const user = await User.findOne({ 
            email: email.toLowerCase() 
        }).select("_id fullName email username");

        if (!user) {
            return res
                .status(404)
                .json(
                    new ApiResponse(
                        null,
                        404,
                        "User not found"
                    )
                );
        }

        const userResponse = {
            _id: user._id,
            name: user.fullName,
            email: user.email,
            username: user.username
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    userResponse,
                    200,
                    "User found"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message
                )
            );
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, email } = req.body;

        // Validate input
        if (!fullName && !email) {
            throw new ApiError(400, "At least one field is required to update");
        }

        // Check if email is being updated and if it already exists
        if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: userId } // Exclude current user
            });

            if (existingUser) {
                throw new ApiError(409, "Email is already in use");
            }
        }

        // Prepare update object
        const updateData = {};
        if (fullName) updateData.fullName = fullName.trim();
        if (email) updateData.email = email.toLowerCase().trim();

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        const userResponse = {
            _id: updatedUser._id,
            name: updatedUser.fullName,
            email: updatedUser.email,
            username: updatedUser.username
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    userResponse,
                    200,
                    "Profile updated successfully"
                )
            );
    } catch (error) {
        console.error("Error updating profile:", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message
                )
            );
    }
});

const changePassword = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new ApiError(400, "All password fields are required");
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            throw new ApiError(400, "New passwords do not match");
        }

        // Check password length
        if (newPassword.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        // Get user with password
        const user = await User.findById(userId).select("+password");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, "Current password is incorrect");
        }

        // Update password
        user.password = newPassword;
        await user.save(); // pre('save') hook will hash the password

        // Clear refresh token to log out user from all devices
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        // Clear cookies
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/"
        };

        return res
            .status(200)
            .cookie("accessToken", "", options)
            .cookie("refreshToken", "", options)
            .json(
                new ApiResponse(
                    null,
                    200,
                    "Password changed successfully. Please login again."
                )
            );
    } catch (error) {
        console.error("Error changing password:", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message
                )
            );
    }
});

export { registerUser, loginUser, logoutUser, checkUserExists, updateProfile, changePassword };

