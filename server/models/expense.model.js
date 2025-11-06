import { model, Schema } from "mongoose";

// Split details sub-schema for custom splits
const splitDetailSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100
        },
        settled: {
            type: Boolean,
            default: false
        }
    },
    { _id: false }
);

const expenseSchema = new Schema(
    {
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: [true, "Group reference is required"],
            index: true
        },
        description: {
            type: String,
            required: [true, "Expense description is required"],
            trim: true,
            maxlength: [200, "Description cannot exceed 200 characters"]
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than 0"]
        },
        currency: {
            type: String,
            default: "USD",
            uppercase: true,
            enum: ["INR", "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY"]
        },
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Payer is required"],
            index: true
        },
        splitType: {
            type: String,
            enum: ["equal", "percentage", "custom", "settlement"],
            default: "equal",
            required: true
        },
        splitBetween: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        splitDetails: [splitDetailSchema], // For custom/percentage splits
        category: {
            type: String,
            default: "Other",
            enum: [
                "Food",
                "Transportation",
                "Entertainment",
                "Shopping",
                "Housing",
                "Utilities",
                "Healthcare",
                "Travel",
                "Education",
                "Fitness",
                "Settlement",
                "Other"
            ]
        },
        date: {
            type: Date,
            default: Date.now,
            index: true
        },
        notes: {
            type: String,
            maxlength: [500, "Notes cannot exceed 500 characters"]
        },
        attachments: [
            {
                url: String,
                filename: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        isSettlement: {
            type: Boolean,
            default: false
        },
        settled: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ paidBy: 1, date: -1 });
expenseSchema.index({ createdBy: 1, createdAt: -1 });
expenseSchema.index({ "splitBetween": 1 });

// Pre-save validation
expenseSchema.pre("save", function (next) {
    // Validate that splitBetween is not empty
    if (!this.splitBetween || this.splitBetween.length === 0) {
        return next(new Error("Expense must be split between at least one person"));
    }

    // Validate paidBy is in the group (will be checked in controller)
    
    // For custom splits, validate splitDetails
    if (this.splitType === "custom" || this.splitType === "percentage") {
        if (!this.splitDetails || this.splitDetails.length === 0) {
            return next(new Error("Custom/Percentage splits require splitDetails"));
        }

        // Validate total for percentage splits
        if (this.splitType === "percentage") {
            const totalPercentage = this.splitDetails.reduce(
                (sum, detail) => sum + (detail.percentage || 0),
                0
            );
            if (Math.abs(totalPercentage - 100) > 0.01) {
                return next(new Error("Percentage splits must add up to 100%"));
            }
        }

        // Validate total for custom splits
        if (this.splitType === "custom") {
            const totalAmount = this.splitDetails.reduce(
                (sum, detail) => sum + (detail.amount || 0),
                0
            );
            if (Math.abs(totalAmount - this.amount) > 0.01) {
                return next(new Error("Custom split amounts must equal total expense amount"));
            }
        }
    }

    next();
});

// Method to calculate split amounts
expenseSchema.methods.calculateSplits = function () {
    const splits = [];

    switch (this.splitType) {
        case "equal":
            const equalAmount = this.amount / this.splitBetween.length;
            this.splitBetween.forEach((userId) => {
                splits.push({
                    userId,
                    amount: equalAmount,
                    percentage: 100 / this.splitBetween.length
                });
            });
            break;

        case "percentage":
            this.splitDetails.forEach((detail) => {
                splits.push({
                    userId: detail.userId,
                    amount: (this.amount * detail.percentage) / 100,
                    percentage: detail.percentage
                });
            });
            break;

        case "custom":
            this.splitDetails.forEach((detail) => {
                splits.push({
                    userId: detail.userId,
                    amount: detail.amount,
                    percentage: (detail.amount / this.amount) * 100
                });
            });
            break;

        case "settlement":
            // For settlements, the full amount goes to one person
            if (this.splitBetween.length === 1) {
                splits.push({
                    userId: this.splitBetween[0],
                    amount: this.amount,
                    percentage: 100
                });
            }
            break;

        default:
            throw new Error("Invalid split type");
    }

    return splits;
};

// Static method to get expenses by group
expenseSchema.statics.getGroupExpenses = function (groupId, options = {}) {
    const query = this.find({ group: groupId, ...options.filter })
        .populate("paidBy", "fullName email username")
        .populate("splitBetween", "fullName email username")
        .populate("createdBy", "fullName email username")
        .sort(options.sort || { date: -1, createdAt: -1 });

    if (options.limit) {
        query.limit(options.limit);
    }

    if (options.skip) {
        query.skip(options.skip);
    }

    return query;
};

// Static method to get user expenses
expenseSchema.statics.getUserExpenses = function (userId, options = {}) {
    return this.find({
        $or: [
            { paidBy: userId },
            { splitBetween: userId }
        ],
        ...options.filter
    })
        .populate("group", "name description")
        .populate("paidBy", "fullName email username")
        .populate("splitBetween", "fullName email username")
        .sort(options.sort || { date: -1, createdAt: -1 });
};

export const Expense = model("Expense", expenseSchema);
