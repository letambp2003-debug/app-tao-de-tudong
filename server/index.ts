import express from "express";
import cors from "cors";
import path from "path";
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
app.use("/uploads", express.static(path.resolve(process.cwd(), "server/data/uploads")));

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

app.listen(config.port, () => {
  console.log(`[EDUTEST AI SERVER] Listening on http://localhost:${config.port}`);
});
