import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. server/routes/auth.ts
write("server/routes/auth.ts", `import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";

const router = Router();

// GET /api/auth/me
router.get("/me", (req: any, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  const db = DatabaseService.get();
  res.json({ user: db.users[3] }); // Default teacher
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email } = req.body;
  const db = DatabaseService.get();
  const user = db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase()) || db.users[3];
  res.json({
    token: user.id,
    user
  });
});

// GET /api/auth/users (for switching roles in dev)
router.get("/users", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.users);
});

export default router;
`);

// 2. server/routes/projects.ts
write("server/routes/projects.ts", `import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { Project, ProjectStatus } from "../../shared/types/index.js";
import { getRuleProfileById } from "../../shared/rules/index.js";

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
  const profile = getRuleProfileById(ruleProfileId || "KHTN_8");

  const newProject: Project = {
    id: "proj-" + Date.now(),
    name: name || \`Đề kiểm tra \${subject} \${grade}\`,
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
    details: \`Tạo mới dự án "\${newProject.name}"\`,
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
`);

// 3. server/routes/sources.ts
write("server/routes/sources.ts", `import { Router } from "express";
import multer from "multer";
import path from "path";
import { DatabaseService } from "../services/database/mockDb.js";
import { SourceMaterial } from "../../shared/types/index.js";
import { DocumentExtractorService } from "../services/extractor/index.js";

const router = Router();
const upload = multer({ dest: "server/data/uploads/" });

// GET /api/sources?projectId=...
router.get("/", (req, res) => {
  const { projectId } = req.query;
  const db = DatabaseService.get();
  const list = projectId ? db.sources.filter(s => s.projectId === projectId) : db.sources;
  res.json(list);
});

// POST /api/sources/upload
router.post("/upload", upload.single("file"), async (req: any, res) => {
  const { projectId, sourceType } = req.body;
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
`);

// 4. server/routes/datapack.ts
write("server/routes/datapack.ts", `import { Router } from "express";
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
  }>({
    moduleCode: "AI02",
    projectId,
    inputData: { project: proj, sourcesCount: sources.length }
  });

  const dp = {
    projectId,
    isApproved: false,
    version: 1,
    topics: result.topics.map((t, idx) => ({ id: "top-" + (idx + 1), ...t })),
    units: result.units.map((u, idx) => ({ id: "unit-" + (idx + 1), ...u, topicId: "top-1" })),
    yccds: result.yccds.map((y, idx) => ({ id: "yccd-" + (idx + 1), ...y, unitId: "unit-1" }))
  };

  db.dataPacks[projectId] = dp;
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
`);

// 5. server/routes/matrix.ts
write("server/routes/matrix.ts", `import { Router } from "express";
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
`);

// 6. server/routes/spec.ts
write("server/routes/spec.ts", `import { Router } from "express";
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
`);

// 7. server/routes/questions.ts
write("server/routes/questions.ts", `import { Router } from "express";
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
`);

// 8. server/routes/exam.ts
write("server/routes/exam.ts", `import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { ExamAssembly, ExamCodeVersion } from "../../shared/types/index.js";

const router = Router();

// GET /api/exam/:projectId
router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const db = DatabaseService.get();
  const proj = db.projects.find(p => p.id === projectId);
  const questions = db.questions[projectId] || [];

  const part1 = questions.filter(q => q.section === "PHAN_1" || q.type === "MULTIPLE_CHOICE");
  const part2 = questions.filter(q => q.section === "PHAN_2" || q.type === "TRUE_FALSE_4");
  const part3 = questions.filter(q => q.section === "PHAN_3" || q.type === "SHORT_ANSWER");
  const part4 = questions.filter(q => q.section === "PHAN_4" || q.type === "ESSAY");

  const assembly: ExamAssembly = {
    projectId,
    examTitle: proj?.name || "ĐỀ KIỂM TRA ĐỊNH KỲ",
    schoolName: proj?.organizationName || "TRƯỜNG THCS CHU VĂN AN",
    subjectName: proj?.subject || "Khoa học tự nhiên",
    grade: proj?.grade || 8,
    durationMinutes: proj?.durationMinutes || 60,
    academicYear: "2026 - 2027",
    semester: proj?.semester || "Học kì I",
    instructions: "Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.",
    parts: [
      { id: "p1", title: "PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN", type: "MULTIPLE_CHOICE", description: "Mỗi câu chỉ chọn một phương án đúng.", questionIds: part1.map(q => q.id) },
      { id: "p2", title: "PHẦN II. TRẮC NGHIỆM ĐÚNG - SAI", type: "TRUE_FALSE_4", description: "Mỗi câu có 4 ý a, b, c, d.", questionIds: part2.map(q => q.id) },
      { id: "p3", title: "PHẦN III. TRẢ LỜI NGẮN", type: "SHORT_ANSWER", description: "Điền kết quả vào ô tương ứng.", questionIds: part3.map(q => q.id) },
      { id: "p4", title: "PHẦN IV. TỰ LUẬN", type: "ESSAY", description: "Trình bày lời giải chi tiết.", questionIds: part4.map(q => q.id) }
    ],
    examCodeVersions: [
      { examCode: "101", questionOrder: questions.map(q => ({ questionId: q.id })) },
      { examCode: "102", questionOrder: [...questions].reverse().map(q => ({ questionId: q.id })) }
    ],
    updatedAt: new Date().toISOString()
  };

  res.json(assembly);
});

// POST /api/exam/:projectId/shuffle-codes
router.post("/:projectId/shuffle-codes", (req, res) => {
  const { projectId } = req.params;
  const { count = 4 } = req.body;
  const db = DatabaseService.get();
  const questions = db.questions[projectId] || [];

  const versions: ExamCodeVersion[] = [];
  const baseCode = 101;

  for (let i = 0; i < count; i++) {
    const code = String(baseCode + i);
    // Controlled shuffle per section
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    versions.push({
      examCode: code,
      questionOrder: shuffled.map(q => ({ questionId: q.id }))
    });
  }

  res.json(versions);
});

export default router;
`);

// 9. server/routes/validate.ts
write("server/routes/validate.ts", `import { Router } from "express";
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

  if (report.allPassed && project.status === "QUESTIONS_REVIEWED") {
    project.status = "VALIDATED";
    DatabaseService.save();
  }

  res.json({ report, traceability });
});

export default router;
`);

// 10. server/routes/export.ts
write("server/routes/export.ts", `import { Router } from "express";
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
  res.setHeader("Content-Disposition", \`attachment; filename=MaTran_DacTa_\${project.id}.xlsx\`);
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
  res.setHeader("Content-Disposition", \`attachment; filename=De_Kiem_Tra_\${project.id}.docx\`);
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
  res.setHeader("Content-Disposition", \`attachment; filename=HoSoDe_\${project.id}.zip\`);
  res.send(zipBuffer);
});

export default router;
`);

// 11. server/routes/admin.ts
write("server/routes/admin.ts", `import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { SUBJECT_RULE_PROFILES } from "../../shared/rules/index.js";

const router = Router();

// GET /api/admin/audit-logs
router.get("/audit-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.auditLogs);
});

// GET /api/admin/ai-logs
router.get("/ai-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.aiUsageLogs);
});

// GET /api/admin/rules
router.get("/rules", (req, res) => {
  res.json(SUBJECT_RULE_PROFILES);
});

export default router;
`);

// 12. server/index.ts
write("server/index.ts", `import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config/index.js";
import { DatabaseService } from "./services/database/mockDb.js";
import { authMiddleware } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import sourceRoutes from "./routes/sources.js";
import datapackRoutes from "./routes/datapack.js";
import matrixRoutes from "./routes/matrix.js";
import specRoutes from "./routes/spec.js";
import questionRoutes from "./routes/questions.js";
import examRoutes from "./routes/exam.js";
import validateRoutes from "./routes/validate.js";
import exportRoutes from "./routes/export.js";
import adminRoutes from "./routes/admin.js";

DatabaseService.initialize();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "server/data/uploads")));

// Global Auth Context Middleware
app.use(authMiddleware);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/datapack", datapackRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/spec", specRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/validate", validateRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "EDUTEST AI API",
    time: new Date().toISOString(),
    geminiEnabled: Boolean(config.geminiApiKey)
  });
});

app.listen(config.port, () => {
  console.log(\`[EDUTEST AI SERVER] Listening on http://localhost:\${config.port}\`);
});
`);

console.log("Step 2 Server Routes generated successfully.");
