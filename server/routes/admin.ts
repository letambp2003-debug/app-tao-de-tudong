import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { SUBJECT_RULE_PROFILES } from "../../shared/rules/index.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";

const router = Router();

// GET /api/admin/audit-logs
router.get("/audit-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.auditLogs);
});

// GET /api/admin/ai-logs
router.get("/ai-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.aiUsageLogs);
});

// GET /api/admin/rules
router.get("/rules", (req, res) => {
  res.json(SUBJECT_RULE_PROFILES);
});

// GET /api/admin/gemini-key
router.get("/gemini-key", (req, res) => {
  const key = AIOrchestrator.getApiKey();
  res.json({
    hasKey: Boolean(key && key.length > 5),
    maskedKey: key && key.length > 8 ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : ""
  });
});

// POST /api/admin/gemini-key
router.post("/gemini-key", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "Vui lòng nhập API Key hợp lệ của Google AI Studio" });
  }

  AIOrchestrator.setApiKey(apiKey.trim());
  res.json({
    success: true,
    message: "Đã lưu Google AI Studio API Key thành công!",
    hasKey: true,
    maskedKey: `${apiKey.trim().substring(0, 6)}...${apiKey.trim().substring(apiKey.trim().length - 4)}`
  });
});

export default router;
