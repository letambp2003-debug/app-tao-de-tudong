import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { SUBJECT_RULE_PROFILES } from "../../shared/rules/index.js";

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

export default router;
