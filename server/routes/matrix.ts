import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";

const router = Router();

// GET /api/matrix/blueprint/:projectId
router.get("/blueprint/:projectId", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.blueprints[req.params.projectId] || null);
});

// PUT /api/matrix/blueprint/:projectId
router.put("/blueprint/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  db.blueprints[projectId] = {
    ...db.blueprints[projectId],
    ...req.body,
    projectId,
    updatedAt: new Date().toISOString()
  };

  const proj = db.projects.find(p => p.id === projectId);
  if (proj && proj.status === "DATA_APPROVED") {
    proj.status = "BLUEPRINT_CONFIGURED";
  }

  DatabaseService.save();
  res.json(db.blueprints[projectId]);
});

// GET /api/matrix/:projectId
router.get("/:projectId", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.matrices[req.params.projectId] || null);
});

// POST /api/matrix/:projectId/generate
router.post("/:projectId/generate", async (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const bp = db.blueprints[projectId];
  const dp = db.dataPacks[projectId];

  const { result } = await AIOrchestrator.executeModule<{
    cells: any[];
    summaryRationale: string;
  }>({
    moduleCode: "AI03",
    projectId,
    inputData: { blueprint: bp, dataPack: dp }
  });

  const matrix = {
    id: "mat-" + projectId,
    projectId,
    isApproved: false,
    version: 1,
    updatedAt: new Date().toISOString(),
    cells: result.cells.map((c, idx) => ({
      id: "mc-" + (idx + 1),
      topicId: dp.topics[0]?.id || "top-1",
      unitId: dp.units[0]?.id || "unit-1",
      questionType: c.questionType,
      cognitiveLevel: c.cognitiveLevel,
      count: c.count,
      pointsPerItem: c.scorePerItem,
      totalScore: c.totalScore,
      note: c.note
    }))
  };

  db.matrices[projectId] = matrix;
  const proj = db.projects.find(p => p.id === projectId);
  if (proj) proj.status = "MATRIX_GENERATED";

  DatabaseService.save();
  res.json(matrix);
});

// PUT /api/matrix/:projectId
router.put("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  db.matrices[projectId] = {
    ...db.matrices[projectId],
    ...req.body,
    projectId,
    updatedAt: new Date().toISOString()
  };
  DatabaseService.save();
  res.json(db.matrices[projectId]);
});

// POST /api/matrix/:projectId/approve
router.post("/:projectId/approve", (req: any, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const author = req.user || db.users[3];

  if (!db.matrices[projectId]) return res.status(404).json({ error: "Matrix not found" });

  db.matrices[projectId].isApproved = true;
  db.matrices[projectId].approvedAt = new Date().toISOString();
  db.matrices[projectId].approvedBy = author.fullName;

  const proj = db.projects.find(p => p.id === projectId);
  if (proj) proj.status = "MATRIX_APPROVED";

  DatabaseService.save();
  res.json(db.matrices[projectId]);
});

export default router;
