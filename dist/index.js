import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Tesla TS API is running");
});
//# sourceMappingURL=index.js.map