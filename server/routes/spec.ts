import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";

const router = Router();

// GET /api/spec/:projectId
router.get("/:projectId", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.specifications[req.params.projectId] || null);
});

// POST /api/spec/:projectId/generate
router.post("/:projectId/generate", async (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const matrix = db.matrices[projectId];
  const dp = db.dataPacks[projectId];

  // Map matrix cells directly to specification rows
  const rows = (matrix?.cells || []).map((c, idx) => {
    const yccd = dp?.yccds[idx % (dp.yccds.length || 1)];
    return {
      id: "spec-row-" + (idx + 1),
      matrixCellId: c.id,
      topicId: c.topicId,
      unitId: c.unitId || "unit-1-1",
      yccdId: yccd?.id || "yccd-1",
      yccdText: yccd?.description || "Nắm vững kiến thức khoa học tự nhiên theo chuẩn YCCĐ.",
      cognitiveLevel: c.cognitiveLevel,
      questionType: c.questionType,
      count: c.count,
      score: c.totalScore,
      competency: "Tìm hiểu thế giới tự nhiên và vận dụng kiến thức",
      sourceReference: yccd?.sourceReference || "SGK KHTN 8"
    };
  });

  const spec = {
    id: "spec-" + projectId,
    projectId,
    isApproved: false,
    version: 1,
    updatedAt: new Date().toISOString(),
    rows
  };

  db.specifications[projectId] = spec;
  const proj = db.projects.find(p => p.id === projectId);
  if (proj) proj.status = "SPECIFICATION_GENERATED";

  DatabaseService.save();
  res.json(spec);
});

// PUT /api/spec/:projectId
router.put("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  db.specifications[projectId] = {
    ...db.specifications[projectId],
    ...req.body,
    projectId,
    updatedAt: new Date().toISOString()
  };
  DatabaseService.save();
  res.json(db.specifications[projectId]);
});

// POST /api/spec/:projectId/approve
router.post("/:projectId/approve", (req: any, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const author = req.user || db.users[3];

  if (!db.specifications[projectId]) return res.status(404).json({ error: "Spec not found" });

  db.specifications[projectId].isApproved = true;
  db.specifications[projectId].approvedAt = new Date().toISOString();
  db.specifications[projectId].approvedBy = author.fullName;

  const proj = db.projects.find(p => p.id === projectId);
  if (proj) proj.status = "SPECIFICATION_APPROVED";

  DatabaseService.save();
  res.json(db.specifications[projectId]);
});

export default router;
