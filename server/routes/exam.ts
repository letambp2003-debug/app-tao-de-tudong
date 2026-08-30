import { Router } from "express";
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
