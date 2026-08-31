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
    appendixNotes?: string;
  }>({
    moduleCode: "AI02",
    projectId,
    inputData: { project: proj, sourcesCount: sources.length }
  });

  const topicCodeToId: Record<string, string> = {};
  const topics = (result.topics || []).map((t, idx) => {
    const id = "top-" + (idx + 1);
    if (t.code) topicCodeToId[t.code] = id;
    return { id, ...t };
  });

  const unitCodeToId: Record<string, string> = {};
  const units = (result.units || []).map((u, idx) => {
    const id = "unit-" + (idx + 1);
    if (u.code) unitCodeToId[u.code] = id;
    const parentTopicId = u.topicCode ? (topicCodeToId[u.topicCode] || topics[0]?.id) : (topics[0]?.id || "top-1");
    return { id, ...u, topicId: parentTopicId };
  });

  const yccds = (result.yccds || []).map((y, idx) => {
    const id = "yccd-" + (idx + 1);
    const parentUnitId = y.unitCode ? (unitCodeToId[y.unitCode] || units[0]?.id) : (units[0]?.id || "unit-1");
    const parentUnit = units.find(u => u.id === parentUnitId);
    const parentTopicId = y.topicCode ? (topicCodeToId[y.topicCode] || parentUnit?.topicId) : (parentUnit?.topicId || topics[0]?.id || "top-1");
    return { id, ...y, unitId: parentUnitId, topicId: parentTopicId };
  });

  const dp = {
    projectId,
    isApproved: false,
    version: 1,
    topics,
    units,
    yccds,
    appendixNotes: result.appendixNotes
  };

  db.dataPacks[projectId] = dp;

  // Also auto-update blueprint topic allocations
  if (db.blueprints[projectId]) {
    db.blueprints[projectId].topicAllocations = topics.map(t => ({
      topicId: t.id,
      targetScore: Number(((t.weightPercentageFinal || t.weightPercentageMidterm || 50) / 100 * (proj?.totalScore || 10)).toFixed(1)),
      targetPercentage: t.weightPercentageFinal || t.weightPercentageMidterm || 50
    }));
  }

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
