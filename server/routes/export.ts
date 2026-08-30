import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { ExportService } from "../services/export/index.js";
import { ValidationEngine } from "../services/validation/index.js";

const router = Router();

// GET /api/export/:projectId/excel
router.get("/:projectId/excel", async (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const buffer = await ExportService.generateExcel({
    project,
    matrix: db.matrices[projectId],
    specification: db.specifications[projectId]
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=MaTran_DacTa_${project.id}.xlsx`);
  res.send(buffer);
});

// GET /api/export/:projectId/word
router.get("/:projectId/word", async (req, res) => {
  const { projectId } = req.params;
  const { withAnswers } = req.query;
  const db = DatabaseService.get();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const buffer = await ExportService.generateWord({
    project,
    questions: db.questions[projectId] || [],
    withAnswers: withAnswers === "true"
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename=De_Kiem_Tra_${project.id}.docx`);
  res.send(buffer);
});

// GET /api/export/:projectId/zip
router.get("/:projectId/zip", async (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { report } = ValidationEngine.runFullValidation({
    project,
    blueprint: db.blueprints[projectId],
    matrix: db.matrices[projectId],
    specification: db.specifications[projectId],
    questions: db.questions[projectId] || [],
    dataPack: db.dataPacks[projectId]
  });

  const zipBuffer = await ExportService.generateProjectZip({
    project,
    matrix: db.matrices[projectId],
    specification: db.specifications[projectId],
    questions: db.questions[projectId] || [],
    validationReport: report
  });

  project.status = "EXPORTED";
  DatabaseService.save();

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=HoSoDe_${project.id}.zip`);
  res.send(zipBuffer);
});

export default router;
