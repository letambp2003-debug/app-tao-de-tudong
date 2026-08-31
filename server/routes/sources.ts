import { Router } from "express";
import multer from "multer";
import path from "path";
import { DatabaseService } from "../services/database/mockDb.js";
import { SourceMaterial } from "../../shared/types/index.js";
import { DocumentExtractorService } from "../services/extractor/index.js";
import { getCurriculumData, CURRICULUM_DATABASE } from "../../shared/rules/curriculumDatabase.js";

const router = Router();
const upload = multer({ dest: "server/data/uploads/" });

// GET /api/sources?projectId=...
router.get("/", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  const list = projectId ? db.sources.filter(s => s.projectId === projectId) : db.sources;
  res.json(list);
});

// GET /api/sources/appendix/:projectId
router.get("/appendix/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const curriculum = getCurriculumData(proj.subject, proj.grade, proj.semester as any, proj.examPeriod as any);
  res.json({
    curriculum,
    midtermNotes: curriculum.midtermAppendixNotes,
    finalNotes: curriculum.finalAppendixNotes
  });
});

// GET /api/sources/appendix-templates
router.get("/appendix-templates", (req, res) => {
  res.json(CURRICULUM_DATABASE);
});

// POST /api/sources/upload
router.post("/upload", upload.single("file"), async (req: any, res) => {
  const { projectId, sourceType, appendixScope } = req.body;
  const file = req.file;

  const db = DatabaseService.get();
  const newSource: SourceMaterial = {
    id: "src-" + Date.now(),
    projectId: projectId || "proj-khtn8-midterm",
    fileName: file ? file.originalname : "Tai_Lieu_Tham_Khao_GDPT2018.pdf",
    fileType: file && file.originalname.endsWith(".docx") ? "DOCX" : file && file.originalname.endsWith(".xlsx") ? "XLSX" : "PDF",
    fileSize: file ? file.size : 2048000,
    fileUrl: file ? "/uploads/" + file.filename : "/uploads/sample.pdf",
    hash: "hash-" + Date.now(),
    sourceType: sourceType || "SGK",
    status: "PENDING",
    pageCount: 1,
    createdAt: new Date().toISOString()
  };

  db.sources.push(newSource);

  // Auto extract fragments
  try {
    const extracted = await DocumentExtractorService.extractDocument(newSource);
    newSource.status = "EXTRACTED";
    newSource.pageCount = extracted.pageCount;
    newSource.extractedText = extracted.extractedText;
    db.sourceFragments.push(...extracted.fragments);
  } catch (err) {
    console.error("Extraction error:", err);
    newSource.status = "ERROR";
  }

  // Update project status if needed
  const proj = db.projects.find(p => p.id === projectId);
  if (proj && proj.status === "DRAFT") {
    proj.status = "SOURCES_UPLOADED";
  }

  DatabaseService.save();
  res.status(201).json(newSource);
});

// GET /api/sources/:id/fragments
router.get("/:id/fragments", (req, res) => {
  const db = DatabaseService.get();
  const frags = db.sourceFragments.filter(f => f.sourceId === req.params.id);
  res.json(frags);
});

export default router;
