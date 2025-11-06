import express from "express";
import cookies from "cookie-parser";
import cors from "cors";

const app = express();

app.get("/", (req, res) => res.send("Root working"));

app.use(
    express.urlencoded({
        extended: true
    })
);

const allowedOrigins = [process.env.CORS_ORIGIN];

app.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        }
    })
);

app.use(cookies());

app.use(
    express.json({
        limit: "16kb"
    })
);

app.use(express.static("public/temp"));

import userRoute from "./routes/user.route.js";
import groupRoute from "./routes/group.route.js";
import expenseRoute from "./routes/expense.route.js";

// API routes
app.use("/api/v1/users", userRoute);
app.use("/api/auth", userRoute); // Also expose on /api/auth for client compatibility
app.use("/api/groups", groupRoute);
app.use("/api/expenses", expenseRoute);

export { app };
