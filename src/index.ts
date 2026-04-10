import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import teslaRoutes from "./routes/teslaRoutes";
import simRoutes from "./routes/simRoutes";

dotenv.config();

const app = express();

app.use(
  "/.well-known",
  express.static("public/.well-known", { dotfiles: "allow" })
);

app.use(express.static("public"));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Tesla TS API is running");
});

app.use(authRoutes);
app.use(teslaRoutes);
app.use(simRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});