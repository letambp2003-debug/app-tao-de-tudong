import fs from "fs";

const db = JSON.parse(fs.readFileSync("server/data/db.json", "utf-8"));
const projectId = "proj-khtn8-midterm";

db.matrices[projectId].cells = [
  { id: "mc-1", topicId: "top-1", unitId: "unit-1-1", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 8, pointsPerItem: 0.25, totalScore: 2.0 },
  { id: "mc-2", topicId: "top-1", unitId: "unit-1-2", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
  { id: "mc-8", topicId: "top-2", unitId: "unit-2-1", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
  { id: "mc-4", topicId: "top-1", unitId: "unit-1-1", questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
  { id: "mc-9", topicId: "top-2", unitId: "unit-2-1", questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
  { id: "mc-5", topicId: "top-1", unitId: "unit-1-3", questionType: "SHORT_ANSWER", cognitiveLevel: "TH", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
  { id: "mc-6", topicId: "top-1", unitId: "unit-1-3", questionType: "SHORT_ANSWER", cognitiveLevel: "VD", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
  { id: "mc-7", topicId: "top-1", unitId: "unit-1-2", questionType: "ESSAY", cognitiveLevel: "VD", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
  { id: "mc-10", topicId: "top-2", unitId: "unit-2-1", questionType: "ESSAY", cognitiveLevel: "VDC", count: 1, pointsPerItem: 1.0, totalScore: 1.0 }
];

db.specifications[projectId].rows = [
  { id: "spec-row-1", matrixCellId: "mc-1", topicId: "top-1", unitId: "unit-1-1", yccdId: "yccd-1", yccdText: "Nhận biết được hiện tượng vật lí và hiện tượng hóa học trong đời sống.", cognitiveLevel: "NB", questionType: "MULTIPLE_CHOICE", count: 8, score: 2.0, competency: "Nhận thức khoa học tự nhiên", sourceReference: "SGK KHTN 8 - Bài 2, tr.12-14" },
  { id: "spec-row-2", matrixCellId: "mc-2", topicId: "top-1", unitId: "unit-1-2", yccdId: "yccd-2", yccdText: "Nhận biết các dấu hiệu phản ứng hóa học xảy ra và định luật bảo toàn khối lượng.", cognitiveLevel: "NB", questionType: "MULTIPLE_CHOICE", count: 4, score: 1.0, competency: "Nhận thức khoa học tự nhiên", sourceReference: "SGK KHTN 8 - Bài 3, tr.16-19" },
  { id: "spec-row-8", matrixCellId: "mc-8", topicId: "top-2", unitId: "unit-2-1", yccdId: "yccd-4", yccdText: "Nhận biết đơn vị khối lượng riêng, công thức tính áp suất $p = \\frac{F}{S}$.", cognitiveLevel: "NB", questionType: "MULTIPLE_CHOICE", count: 4, score: 1.0, competency: "Nhận thức khoa học tự nhiên", sourceReference: "SGK KHTN 8 - Bài 14, tr.60-63" },
  { id: "spec-row-4", matrixCellId: "mc-4", topicId: "top-1", unitId: "unit-1-1", yccdId: "yccd-1", yccdText: "Phân tích các hiện tượng thực tế xác định biến đổi vật lí hoặc hóa học qua 4 nhận định.", cognitiveLevel: "TH", questionType: "TRUE_FALSE_4", count: 1, score: 1.0, competency: "Tìm hiểu tự nhiên", sourceReference: "SGK KHTN 8 - Bài 2, tr.13" },
  { id: "spec-row-9", matrixCellId: "mc-9", topicId: "top-2", unitId: "unit-2-1", yccdId: "yccd-4", yccdText: "Đánh giá đúng/sai về áp suất chất lỏng trong bình trụ qua 4 nhận định.", cognitiveLevel: "TH", questionType: "TRUE_FALSE_4", count: 1, score: 1.0, competency: "Tìm hiểu tự nhiên", sourceReference: "SGK KHTN 8 - Bài 16, tr.68-71" },
  { id: "spec-row-5", matrixCellId: "mc-5", topicId: "top-1", unitId: "unit-1-3", yccdId: "yccd-3", yccdText: "Tính toán số mol, thể tích chất khí $V = n \\times 24,79$ ở điều kiện chuẩn.", cognitiveLevel: "TH", questionType: "SHORT_ANSWER", count: 2, score: 1.0, competency: "Vận dụng kiến thức, kĩ năng", sourceReference: "SGK KHTN 8 - Bài 4, tr.25" },
  { id: "spec-row-6", matrixCellId: "mc-6", topicId: "top-1", unitId: "unit-1-3", yccdId: "yccd-3", yccdText: "Tính nồng độ phần trăm ($C\\%$) và nồng độ mol ($C_M$) của dung dịch thu được sau phản ứng.", cognitiveLevel: "VD", questionType: "SHORT_ANSWER", count: 2, score: 1.0, competency: "Vận dụng kiến thức, kĩ năng", sourceReference: "SGK KHTN 8 - Bài 5, tr.30" },
  { id: "spec-row-7", matrixCellId: "mc-7", topicId: "top-1", unitId: "unit-1-2", yccdId: "yccd-2", yccdText: "Lập phương trình hóa học và vận dụng định luật bảo toàn khối lượng tính khối lượng sản phẩm.", cognitiveLevel: "VD", questionType: "ESSAY", count: 1, score: 1.0, competency: "Vận dụng kiến thức, kĩ năng", sourceReference: "SGK KHTN 8 - Bài 3, tr.18" },
  { id: "spec-row-10", matrixCellId: "mc-10", topicId: "top-2", unitId: "unit-2-1", yccdId: "yccd-4", yccdText: "Vận dụng kiến thức áp suất và khối lượng riêng giải bài toán áp suất lên mặt sàn.", cognitiveLevel: "VDC", questionType: "ESSAY", count: 1, score: 1.0, competency: "Vận dụng kiến thức, kĩ năng", sourceReference: "SGK KHTN 8 - Bài 17, tr.74-78" }
];

// Update specificationId for questions
db.questions[projectId].forEach((q, idx) => {
  if (idx < 8) q.specificationId = "spec-row-1";
  else if (idx < 12) q.specificationId = "spec-row-2";
  else if (idx < 16) q.specificationId = "spec-row-8";
});

fs.writeFileSync("server/data/db.json", JSON.stringify(db, null, 2), "utf-8");
console.log("Updated seed data scores to perfect 40-30-20-10 distribution.");
