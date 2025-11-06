import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config();

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;

        app.listen(PORT, () => {
            console.log("Server running on PORT : ", PORT);
        });

        app.on("error", (err) => {
            console.log("Server Error: ", err);
            process.exit();
        });
    })
    .catch(() => {
        console.error("ERROR :: MongoDB :: Connection Failed !!!", err);
        process.exit(1); // exit process if DB connection fails
    });
