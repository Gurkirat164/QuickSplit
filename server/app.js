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
app.use("/api/v1/users", userRoute);

export { app };
