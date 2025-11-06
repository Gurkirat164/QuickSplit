import express from "express";
import cookies from "cookie-parser";

const app = express();

app.get("/", (req, res) => res.send("Root working"));

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json({
        limit: "16kb"
    })
);

app.use(express.static("public/temp"));

export { app };
