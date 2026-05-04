require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

// Root & Health check
app.get("/", (_req, res) => res.json({ 
  message: "SplitWise Pro API is running!", 
  health: "http://localhost:5000/api/health" 
}));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ──────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
