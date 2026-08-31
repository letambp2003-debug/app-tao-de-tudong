import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { Project, ProjectStatus } from "../../shared/types/index.js";
import { getRuleProfileById, getRuleProfileForSubject } from "../../shared/rules/index.js";

const router = Router();

// GET /api/projects
router.get("/", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.projects);
});

// GET /api/projects/:id
router.get("/:id", (req, res) => {
  const db = DatabaseService.get();
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json(project);
});

// POST /api/projects
router.post("/", (req: any, res) => {
  const { name, subject, grade, textbookSeries, semester, examPeriod, durationMinutes, totalScore, ruleProfileId } = req.body;
  const db = DatabaseService.get();
  const author = req.user || db.users[3];
  const profile = getRuleProfileForSubject(subject || "Toán học", Number(grade) || 8);

  const newProject: Project = {
    id: "proj-" + Date.now(),
    name: name || `Đề kiểm tra ${subject} ${grade}`,
    subject: subject || profile.subject,
    grade: Number(grade) || profile.grade,
    textbookSeries: textbookSeries || "Kết nối tri thức với cuộc sống",
    semester: semester || "HK1",
    examPeriod: examPeriod || "GIUA_KY",
    durationMinutes: Number(durationMinutes) || profile.defaultDuration,
    totalScore: Number(totalScore) || profile.defaultTotalScore,
    status: "DRAFT",
    organizationId: author.organizationId || "org-001",
    authorId: author.id,
    authorName: author.fullName,
    organizationName: "Trường THCS Chu Văn An",
    ruleProfileId: profile.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  db.projects.unshift(newProject);

  // Initialize empty containers
  db.dataPacks[newProject.id] = {
    projectId: newProject.id,
    isApproved: false,
    version: 1,
    topics: [],
    units: [],
    yccds: []
  };

  db.blueprints[newProject.id] = {
    id: "bp-" + newProject.id,
    projectId: newProject.id,
    totalScore: newProject.totalScore,
    durationMinutes: newProject.durationMinutes,
    cognitiveWeights: profile.defaultCognitiveWeights,
    questionTypeConfigs: profile.defaultQuestionTypeConfigs,
    topicAllocations: [],
    updatedAt: new Date().toISOString()
  };

  db.matrices[newProject.id] = {
    id: "mat-" + newProject.id,
    projectId: newProject.id,
    cells: [],
    isApproved: false,
    version: 1,
    updatedAt: new Date().toISOString()
  };

  db.specifications[newProject.id] = {
    id: "spec-" + newProject.id,
    projectId: newProject.id,
    rows: [],
    isApproved: false,
    version: 1,
    updatedAt: new Date().toISOString()
  };

  db.questions[newProject.id] = [];

  // Audit log
  db.auditLogs.unshift({
    id: "log-" + Date.now(),
    userId: author.id,
    userName: author.fullName,
    action: "CREATE_PROJECT",
    targetType: "PROJECT",
    targetId: newProject.id,
    projectId: newProject.id,
    details: `Tạo mới dự án "${newProject.name}"`,
    timestamp: new Date().toISOString()
  });

  DatabaseService.save();
  res.status(201).json(newProject);
});

// PUT /api/projects/:id
router.put("/:id", (req: any, res) => {
  const db = DatabaseService.get();
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Project not found" });

  const current = db.projects[index];
  const updated: Project = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
    version: current.version + 1
  };

  db.projects[index] = updated;
  DatabaseService.save();
  res.json(updated);
});

// POST /api/projects/:id/clone
router.post("/:id/clone", (req: any, res) => {
  const db = DatabaseService.get();
  const sourceProj = db.projects.find(p => p.id === req.params.id);
  if (!sourceProj) return res.status(404).json({ error: "Source project not found" });

  const author = req.user || db.users[3];
  const newId = "proj-" + Date.now();
  const clonedProj: Project = {
    ...sourceProj,
    id: newId,
    name: sourceProj.name + " (Bản sao)",
    status: "DRAFT",
    authorId: author.id,
    authorName: author.fullName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  db.projects.unshift(clonedProj);
  if (db.dataPacks[sourceProj.id]) db.dataPacks[newId] = JSON.parse(JSON.stringify(db.dataPacks[sourceProj.id]));
  if (db.blueprints[sourceProj.id]) db.blueprints[newId] = JSON.parse(JSON.stringify(db.blueprints[sourceProj.id]));
  if (db.matrices[sourceProj.id]) db.matrices[newId] = JSON.parse(JSON.stringify(db.matrices[sourceProj.id]));
  if (db.specifications[sourceProj.id]) db.specifications[newId] = JSON.parse(JSON.stringify(db.specifications[sourceProj.id]));
  if (db.questions[sourceProj.id]) db.questions[newId] = JSON.parse(JSON.stringify(db.questions[sourceProj.id]));

  DatabaseService.save();
  res.status(201).json(clonedProj);
});

// DELETE /api/projects/:id
router.delete("/:id", (req, res) => {
  const db = DatabaseService.get();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  delete db.dataPacks[req.params.id];
  delete db.blueprints[req.params.id];
  delete db.matrices[req.params.id];
  delete db.specifications[req.params.id];
  delete db.questions[req.params.id];
  DatabaseService.save();
  res.json({ success: true, message: "Project deleted" });
});

export default router;
