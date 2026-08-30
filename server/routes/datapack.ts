import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";

const router = Router();

// GET /api/datapack/:projectId
router.get("/:projectId", (req, res) => {
  const db = DatabaseService.get();
  const dp = db.dataPacks[req.params.projectId];
  if (!dp) return res.status(404).json({ error: "Data Pack not found" });
  res.json(dp);
});

// POST /api/datapack/:projectId/generate
router.post("/:projectId/generate", async (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const proj = db.projects.find(p => p.id === projectId);
  const sources = db.sources.filter(s => s.projectId === projectId);

  const { result } = await AIOrchestrator.executeModule<{
    topics: any[];
    units: any[];
    yccds: any[];
  }>({
    moduleCode: "AI02",
    projectId,
    inputData: { project: proj, sourcesCount: sources.length }
  });

  const dp = {
    projectId,
    isApproved: false,
    version: 1,
    topics: result.topics.map((t, idx) => ({ id: "top-" + (idx + 1), ...t })),
    units: result.units.map((u, idx) => ({ id: "unit-" + (idx + 1), ...u, topicId: "top-1" })),
    yccds: result.yccds.map((y, idx) => ({ id: "yccd-" + (idx + 1), ...y, unitId: "unit-1" }))
  };

  db.dataPacks[projectId] = dp;
  if (proj && (proj.status === "SOURCES_UPLOADED" || proj.status === "DRAFT")) {
    proj.status = "DATA_EXTRACTED";
  }

  DatabaseService.save();
  res.json(dp);
});

// PUT /api/datapack/:projectId
router.put("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  db.dataPacks[projectId] = {
    ...db.dataPacks[projectId],
    ...req.body,
    projectId
  };
  DatabaseService.save();
  res.json(db.dataPacks[projectId]);
});

// POST /api/datapack/:projectId/approve
router.post("/:projectId/approve", (req: any, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const author = req.user || db.users[3];

  if (!db.dataPacks[projectId]) return res.status(404).json({ error: "Data Pack not found" });

  db.dataPacks[projectId].isApproved = true;
  db.dataPacks[projectId].approvedAt = new Date().toISOString();
  db.dataPacks[projectId].approvedBy = author.fullName;

  const proj = db.projects.find(p => p.id === projectId);
  if (proj) {
    proj.status = "DATA_APPROVED";
  }

  db.auditLogs.unshift({
    id: "log-" + Date.now(),
    userId: author.id,
    userName: author.fullName,
    action: "APPROVE_DATAPACK",
    targetType: "DATAPACK",
    targetId: projectId,
    projectId,
    details: "Giáo viên phê duyệt chuẩn hóa Data Pack",
    timestamp: new Date().toISOString()
  });

  DatabaseService.save();
  res.json(db.dataPacks[projectId]);
});

export default router;
