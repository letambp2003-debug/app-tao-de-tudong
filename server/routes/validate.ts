import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { ValidationEngine } from "../services/validation/index.js";

const router = Router();

// GET /api/validate/:projectId
router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const project = db.projects.find(p => p.id === projectId);

  if (!project) return res.status(404).json({ error: "Project not found" });

  const blueprint = db.blueprints[projectId];
  const matrix = db.matrices[projectId];
  const specification = db.specifications[projectId];
  const questions = db.questions[projectId] || [];
  const dataPack = db.dataPacks[projectId];

  const { report, traceability } = ValidationEngine.runFullValidation({
    project,
    blueprint,
    matrix,
    specification,
    questions,
    dataPack
  });

  if (report.allPassed && (project.status === "QUESTIONS_REVIEWED" || project.status === "QUESTIONS_GENERATED")) {
    project.status = "VALIDATED";
    DatabaseService.save();
  }

  res.json({ report, traceability });
});

// POST /api/validate/:projectId/auto-fix
router.post("/:projectId/auto-fix", (req, res) => {
  const { projectId } = req.params;
  try {
    const result = ValidationEngine.autoFix(projectId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to auto fix validation issues" });
  }
});

export default router;
