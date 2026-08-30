import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";
import { Question } from "../../shared/types/index.js";

const router = Router();

// GET /api/questions?projectId=...
router.get("/", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  if (projectId) {
    return res.json(db.questions[String(projectId)] || []);
  }
  // All questions for bank
  const all: Question[] = [];
  Object.values(db.questions).forEach(list => all.push(...list));
  res.json(all);
});

// POST /api/questions/generate-one
router.post("/generate-one", async (req, res) => {
  const { projectId, specRowId, questionType, cognitiveLevel } = req.body;
  const db = DatabaseService.get();
  const spec = db.specifications[projectId];
  const specRow = spec?.rows.find(r => r.id === specRowId);

  const { result } = await AIOrchestrator.executeModule<any>({
    moduleCode: "AI05",
    projectId,
    inputData: { specRow, questionType, cognitiveLevel }
  });

  const newQ: Question = {
    id: "q-" + Date.now(),
    projectId,
    specificationId: specRowId || "spec-row-1",
    section: questionType === "MULTIPLE_CHOICE" ? "PHAN_1" : questionType === "TRUE_FALSE_4" ? "PHAN_2" : questionType === "SHORT_ANSWER" ? "PHAN_3" : "PHAN_4",
    orderNumber: (db.questions[projectId]?.length || 0) + 1,
    type: result.type || questionType || "MULTIPLE_CHOICE",
    stem: result.stem,
    score: result.score || (questionType === "MULTIPLE_CHOICE" ? 0.25 : 1.0),
    cognitiveLevel: result.cognitiveLevel || cognitiveLevel || "NB",
    topicId: specRow?.topicId || "top-1",
    unitId: specRow?.unitId || "unit-1-1",
    yccdId: specRow?.yccdId || "yccd-1",
    sourceReference: result.sourceReference || specRow?.sourceReference || "SGK",
    explanation: result.explanation,
    mcOptions: result.mcOptions,
    tfItems: result.tfItems,
    saSpec: result.saSpec,
    rubricSteps: result.rubricSteps,
    aiGenerated: true,
    status: "REVIEWED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.questions[projectId]) db.questions[projectId] = [];
  db.questions[projectId].push(newQ);

  const proj = db.projects.find(p => p.id === projectId);
  if (proj) proj.status = "QUESTIONS_GENERATED";

  DatabaseService.save();
  res.status(201).json(newQ);
});

// PUT /api/questions/:id
router.put("/:id", (req, res) => {
  const { projectId } = req.body;
  const db = DatabaseService.get();
  const list = db.questions[projectId] || [];
  const idx = list.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Question not found" });

  list[idx] = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  DatabaseService.save();
  res.json(list[idx]);
});

// DELETE /api/questions/:id?projectId=...
router.delete("/:id", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  if (projectId && db.questions[String(projectId)]) {
    db.questions[String(projectId)] = db.questions[String(projectId)].filter(q => q.id !== req.params.id);
    DatabaseService.save();
  }
  res.json({ success: true });
});

export default router;
