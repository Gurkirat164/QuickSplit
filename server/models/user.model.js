import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
            required: true
        },
        fullName: {
            type: String,
            required: [true, "Full Name is required."]
        },
        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required."],
            minlength: [6, "Password must be at least 6 characters long."]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

//generate access tokens using jwt.
userSchema.methods.generateAccessTokens = function () {
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.username,
            username: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshTokens = function () {
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.username,
            username: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = model("User", userSchema);
