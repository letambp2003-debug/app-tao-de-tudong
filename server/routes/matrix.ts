import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";

const router = Router();

// Helper to sync blueprint cognitive weights from matrix cells
function syncBlueprintCognitiveWeights(projectId: string, matrixCells: any[]) {
  const db = DatabaseService.get();
  const bp = db.blueprints[projectId];
  const proj = db.projects.find(p => p.id === projectId);
  if (!bp || !matrixCells || matrixCells.length === 0) return;

  const totalScore = proj?.totalScore || 10.0;
  const cognitiveScores: Record<string, number> = { NB: 0, TH: 0, VD: 0, VDC: 0 };

  matrixCells.forEach(c => {
    if (cognitiveScores[c.cognitiveLevel] !== undefined) {
      cognitiveScores[c.cognitiveLevel] += (c.totalScore || 0);
    }
  });

  const rawNB = Math.round((cognitiveScores.NB / totalScore) * 100);
  const rawTH = Math.round((cognitiveScores.TH / totalScore) * 100);
  const rawVD = Math.round((cognitiveScores.VD / totalScore) * 100);
  const rawVDC = Math.round((cognitiveScores.VDC / totalScore) * 100);

  const sum = rawNB + rawTH + rawVD + rawVDC;
  const diff = 100 - sum;

  bp.cognitiveWeights = {
    NB: rawNB + diff,
    TH: rawTH,
    VD: rawVD,
    VDC: rawVDC
  };
}

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
  const apiKey = req.headers["x-gemini-api-key"] as string || req.body?.apiKey;
  const db = DatabaseService.get();
  const proj = db.projects.find(p => p.id === projectId);
  const bp = db.blueprints[projectId];
  const dp = db.dataPacks[projectId] || { topics: [], units: [], yccds: [] };

  const { result } = await AIOrchestrator.executeModule<{
    cells: any[];
    summaryRationale: string;
  }>({
    moduleCode: "AI03",
    projectId,
    inputData: { blueprint: bp, dataPack: dp, project: proj },
    apiKey
  });

  const topicCodeMap: Record<string, string> = {};
  (dp.topics || []).forEach(t => { if (t.code) topicCodeMap[t.code] = t.id; });
  const unitCodeMap: Record<string, string> = {};
  (dp.units || []).forEach(u => { if (u.code) unitCodeMap[u.code] = u.id; });

  const cells = (result.cells || []).map((c, idx) => {
    const topId = (c.topicCode && topicCodeMap[c.topicCode]) || dp.topics[idx % (dp.topics.length || 1)]?.id || "top-1";
    const matchedUnit = dp.units.find(u => u.topicId === topId);
    const unId = (c.unitCode && unitCodeMap[c.unitCode]) || matchedUnit?.id || dp.units[0]?.id || "unit-1";

    const pointsPerItem = c.pointsPerItem || (c.questionType === "MULTIPLE_CHOICE" ? 0.25 : c.questionType === "SHORT_ANSWER" ? 0.5 : 1.0);
    const totalScore = Number((c.count * pointsPerItem).toFixed(2));

    return {
      id: "mc-" + (idx + 1),
      topicId: topId,
      unitId: unId,
      questionType: c.questionType,
      cognitiveLevel: c.cognitiveLevel,
      count: c.count,
      pointsPerItem,
      totalScore,
      note: c.note
    };
  });

  const matrix = {
    id: "mat-" + projectId,
    projectId,
    isApproved: false,
    version: 1,
    updatedAt: new Date().toISOString(),
    cells
  };

  db.matrices[projectId] = matrix;
  if (proj) proj.status = "MATRIX_GENERATED";

  // Auto-sync blueprint cognitive weights to match matrix perfectly
  syncBlueprintCognitiveWeights(projectId, cells);

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

  if (db.matrices[projectId]?.cells) {
    syncBlueprintCognitiveWeights(projectId, db.matrices[projectId].cells);
  }

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
