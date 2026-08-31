import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { config } from "./config/index.js";
import { DatabaseService } from "./services/database/mockDb.js";
import { authMiddleware } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import sourceRoutes from "./routes/sources.js";
import datapackRoutes from "./routes/datapack.js";
import matrixRoutes from "./routes/matrix.js";
import specRoutes from "./routes/spec.js";
import questionRoutes from "./routes/questions.js";
import examRoutes from "./routes/exam.js";
import validateRoutes from "./routes/validate.js";
import exportRoutes from "./routes/export.js";
import adminRoutes from "./routes/admin.js";

DatabaseService.initialize();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory
const uploadsDir = path.resolve(process.cwd(), "server/data/uploads");
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {}
}
app.use("/uploads", express.static(uploadsDir));

// Global Auth Context Middleware
app.use(authMiddleware);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/datapack", datapackRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/spec", specRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/validate", validateRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "EDUTEST AI API",
    time: new Date().toISOString(),
    geminiEnabled: Boolean(config.geminiApiKey)
  });
});

// Serve frontend static build if available
const distPath = path.resolve(process.cwd(), "dist");
const clientDistPath = path.resolve(process.cwd(), "client/dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.resolve(clientDistPath, "index.html"));
  });
}

export default app;
export { app };
