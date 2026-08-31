import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";
import { Question } from "../../shared/types/index.js";

const router = Router();

function normalizeRubricSteps(steps: any[] | undefined, targetScore: number): any[] {
  if (!steps || steps.length === 0) {
    const half = Number((targetScore * 0.5).toFixed(2));
    const remainder = Number((targetScore - half).toFixed(2));
    return [
      { id: "r1", stepNumber: 1, criterion: "Nêu cơ sở lý thuyết và biểu thức tính toán", expectedContent: "Trình bày đúng định nghĩa/công thức và thay số liệu.", score: half },
      { id: "r2", stepNumber: 2, criterion: "Biến đổi, tính toán và rút ra kết luận", expectedContent: "Tính toán chính xác và đưa ra câu trả lời cuối cùng.", score: remainder }
    ];
  }

  const currentSum = steps.reduce((sum, s) => sum + (s.score || 0), 0);
  if (currentSum > 0 && Math.abs(currentSum - targetScore) > 0.001) {
    const numSteps = steps.length;
    let assigned = 0;
    return steps.map((s, idx) => {
      let stScore = 0;
      if (idx === numSteps - 1) {
        stScore = Number((targetScore - assigned).toFixed(2));
      } else {
        stScore = Number(((s.score / currentSum) * targetScore).toFixed(2));
        assigned += stScore;
      }
      return { ...s, score: stScore };
    });
  }
  return steps;
}

// GET /api/questions?projectId=...
router.get("/", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  res.json(db.questions[projectId as string] || []);
});

// POST /api/questions/generate-all/:projectId
router.post("/generate-all/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const apiKey = req.headers["x-gemini-api-key"] as string || req.body?.apiKey;
  const db = DatabaseService.get();
  const spec = db.specifications[projectId];
  const proj = db.projects.find(p => p.id === projectId);

  if (!spec || !proj) {
    return res.status(404).json({ error: "Chưa có bản đặc tả hoặc dự án không tồn tại" });
  }

  const generatedQuestions: Question[] = [];
  let order = 1;

  // Generate questions row by row from specification
  for (const row of spec.rows) {
    const count = row.count || 1;
    const pointsPerQuestion = Number(((row.score || 0.25) / count).toFixed(2));

    for (let i = 0; i < count; i++) {
      const { result } = await AIOrchestrator.executeModule<any>({
        moduleCode: "AI05",
        projectId,
        inputData: {
          specRow: row,
          questionType: row.questionType,
          cognitiveLevel: row.cognitiveLevel,
          project: proj,
          questionIndex: order
        },
        apiKey
      });

      const qType = result.type || row.questionType;
      const rubricSteps = qType === "ESSAY" ? normalizeRubricSteps(result.rubricSteps, pointsPerQuestion) : undefined;

      const newQ: Question = {
        id: `q-${projectId}-${row.questionType.toLowerCase()}-${order}`,
        projectId,
        specificationId: row.id,
        section: row.questionType === "MULTIPLE_CHOICE" ? "PHAN_1" : row.questionType === "TRUE_FALSE_4" ? "PHAN_2" : row.questionType === "SHORT_ANSWER" ? "PHAN_3" : "PHAN_4",
        orderNumber: order++,
        type: qType,
        stem: result.stem,
        score: pointsPerQuestion,
        cognitiveLevel: result.cognitiveLevel || row.cognitiveLevel,
        topicId: row.topicId,
        unitId: row.unitId,
        yccdId: row.yccdId,
        sourceReference: result.sourceReference || row.sourceReference || `SGK ${proj.subject} ${proj.grade}`,
        explanation: result.explanation,
        mcOptions: result.mcOptions,
        tfItems: result.tfItems,
        saSpec: result.saSpec,
        rubricSteps,
        aiGenerated: true,
        status: "APPROVED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      generatedQuestions.push(newQ);
    }
  }

  db.questions[projectId] = generatedQuestions;
  proj.status = "QUESTIONS_GENERATED";
  DatabaseService.save();

  res.json(generatedQuestions);
});

// POST /api/questions/generate-one
router.post("/generate-one", async (req, res) => {
  const { projectId, specRowId, questionType, cognitiveLevel } = req.body;
  const apiKey = req.headers["x-gemini-api-key"] as string || req.body?.apiKey;
  const db = DatabaseService.get();
  const spec = db.specifications[projectId];
  const specRow = spec?.rows.find(r => r.id === specRowId);
  const proj = db.projects.find(p => p.id === projectId);

  const { result } = await AIOrchestrator.executeModule<any>({
    moduleCode: "AI05",
    projectId,
    inputData: { specRow, questionType, cognitiveLevel, project: proj, questionIndex: (db.questions[projectId]?.length || 0) + 1 },
    apiKey
  });

  const qType = result.type || questionType || "MULTIPLE_CHOICE";
  const targetScore = specRow ? Number(((specRow.score || 1.0) / (specRow.count || 1)).toFixed(2)) : (result.score || (qType === "MULTIPLE_CHOICE" ? 0.25 : 1.0));
  const rubricSteps = qType === "ESSAY" ? normalizeRubricSteps(result.rubricSteps, targetScore) : undefined;

  const newQ: Question = {
    id: "q-" + Date.now(),
    projectId,
    specificationId: specRowId || "spec-row-1",
    section: questionType === "MULTIPLE_CHOICE" ? "PHAN_1" : questionType === "TRUE_FALSE_4" ? "PHAN_2" : questionType === "SHORT_ANSWER" ? "PHAN_3" : "PHAN_4",
    orderNumber: (db.questions[projectId]?.length || 0) + 1,
    type: qType,
    stem: result.stem,
    score: targetScore,
    cognitiveLevel: result.cognitiveLevel || cognitiveLevel || "NB",
    topicId: specRow?.topicId || "top-1",
    unitId: specRow?.unitId || "unit-1-1",
    yccdId: specRow?.yccdId || "yccd-1",
    sourceReference: result.sourceReference || specRow?.sourceReference || "SGK",
    explanation: result.explanation,
    mcOptions: result.mcOptions,
    tfItems: result.tfItems,
    saSpec: result.saSpec,
    rubricSteps,
    aiGenerated: true,
    status: "APPROVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.questions[projectId]) db.questions[projectId] = [];
  db.questions[projectId].push(newQ);

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

  const updatedQ = {
    ...list[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (updatedQ.type === "ESSAY" && updatedQ.rubricSteps) {
    updatedQ.rubricSteps = normalizeRubricSteps(updatedQ.rubricSteps, updatedQ.score);
  }

  list[idx] = updatedQ;
  DatabaseService.save();
  res.json(list[idx]);
});

// DELETE /api/questions/:id?projectId=...
router.delete("/:id", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  const list = db.questions[projectId as string] || [];
  db.questions[projectId as string] = list.filter(q => q.id !== req.params.id);
  DatabaseService.save();
  res.json({ success: true });
});

export default router;
