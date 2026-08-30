import ExcelJS from "exceljs";
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from "docx";
import JSZip from "jszip";
import {
  Project,
  Matrix,
  Specification,
  Question,
  ValidationReport,
  COGNITIVE_LEVEL_LABELS,
  QUESTION_TYPE_LABELS
} from "../../../shared/types/index.js";

export class ExportService {
  public static async generateExcel(params: {
    project: Project;
    matrix?: Matrix;
    specification?: Specification;
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "EDUTEST AI";
    workbook.created = new Date();

    // Sheet 1: Ma trận đề kiểm tra
    const matrixSheet = workbook.addWorksheet("1. Ma trận đề kiểm tra");
    matrixSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Chủ đề / Đơn vị kiến thức", key: "topic", width: 35 },
      { header: "Dạng câu hỏi", key: "type", width: 28 },
      { header: "Nhận biết (NB)", key: "nb", width: 14 },
      { header: "Thông hiểu (TH)", key: "th", width: 14 },
      { header: "Vận dụng (VD)", key: "vd", width: 14 },
      { header: "Vận dụng cao (VDC)", key: "vdc", width: 16 },
      { header: "Tổng số câu", key: "totalQ", width: 14 },
      { header: "Tổng điểm", key: "totalScore", width: 14 }
    ];

    matrixSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    matrixSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A70EB" } };

    if (params.matrix && params.matrix.cells.length > 0) {
      params.matrix.cells.forEach((cell, idx) => {
        matrixSheet.addRow({
          stt: idx + 1,
          topic: cell.topicId || "Chất và sự biến đổi của chất",
          type: QUESTION_TYPE_LABELS[cell.questionType] || cell.questionType,
          nb: cell.cognitiveLevel === "NB" ? `${cell.count} câu (${cell.totalScore}đ)` : "-",
          th: cell.cognitiveLevel === "TH" ? `${cell.count} câu (${cell.totalScore}đ)` : "-",
          vd: cell.cognitiveLevel === "VD" ? `${cell.count} câu (${cell.totalScore}đ)` : "-",
          vdc: cell.cognitiveLevel === "VDC" ? `${cell.count} câu (${cell.totalScore}đ)` : "-",
          totalQ: cell.count,
          totalScore: cell.totalScore
        });
      });
    }

    // Sheet 2: Bản đặc tả
    const specSheet = workbook.addWorksheet("2. Bản đặc tả ma trận");
    specSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Chủ đề / Đơn vị", key: "topic", width: 30 },
      { header: "Mã YCCĐ & Nội dung cần đạt", key: "yccd", width: 45 },
      { header: "Mức độ", key: "level", width: 14 },
      { header: "Dạng câu", key: "type", width: 22 },
      { header: "Số câu", key: "count", width: 10 },
      { header: "Điểm", key: "score", width: 10 },
      { header: "Nguồn SGK / Tài liệu", key: "source", width: 30 }
    ];

    specSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    specSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0E7490" } };

    if (params.specification && params.specification.rows.length > 0) {
      params.specification.rows.forEach((row, idx) => {
        specSheet.addRow({
          stt: idx + 1,
          topic: row.topicId,
          yccd: row.yccdText,
          level: COGNITIVE_LEVEL_LABELS[row.cognitiveLevel] || row.cognitiveLevel,
          type: QUESTION_TYPE_LABELS[row.questionType] || row.questionType,
          count: row.count,
          score: row.score,
          source: row.sourceReference
        });
      });
    }

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  public static async generateWord(params: {
    project: Project;
    questions: Question[];
    withAnswers?: boolean;
  }): Promise<Buffer> {
    const { project, questions, withAnswers = false } = params;

    const docParagraphs: Paragraph[] = [
      new Paragraph({
        text: project.organizationName ? project.organizationName.toUpperCase() : "TRƯỜNG THCS CHU VĂN AN",
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: project.name.toUpperCase(),
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: `Môn: ${project.subject} - Lớp: ${project.grade} | Thời gian: ${project.durationMinutes} phút | Tổng điểm: ${project.totalScore} điểm`,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: "--------------------------------------------------------", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "Họ và tên học sinh: ................................................................ Lớp: ............. SBD: .............." }),
      new Paragraph({ text: "" })
    ];

    // Group questions by section
    const part1 = questions.filter(q => q.section === "PHAN_1" || q.type === "MULTIPLE_CHOICE");
    const part2 = questions.filter(q => q.section === "PHAN_2" || q.type === "TRUE_FALSE_4");
    const part3 = questions.filter(q => q.section === "PHAN_3" || q.type === "SHORT_ANSWER");
    const part4 = questions.filter(q => q.section === "PHAN_4" || q.type === "ESSAY");

    if (part1.length > 0) {
      docParagraphs.push(new Paragraph({ text: "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (4,0 ĐIỂM)", heading: HeadingLevel.HEADING_3 }));
      docParagraphs.push(new Paragraph({ text: "Thí sinh trả lời từ câu 1 đến câu " + part1.length + ". Mỗi câu hỏi chỉ chọn một phương án đúng." }));
      part1.forEach((q, idx) => {
        docParagraphs.push(new Paragraph({ text: `Câu ${idx + 1} (${q.score}đ): ${q.stem}` }));
        q.mcOptions?.forEach(opt => {
          docParagraphs.push(new Paragraph({ text: `   ${opt.label}. ${opt.content} ${withAnswers && opt.isCorrect ? " [ĐÁP ÁN ĐÚNG]" : ""}` }));
        });
        if (withAnswers && q.explanation) {
          docParagraphs.push(new Paragraph({ text: `   -> Hướng dẫn giải: ${q.explanation}` }));
        }
      });
      docParagraphs.push(new Paragraph({ text: "" }));
    }

    if (part2.length > 0) {
      docParagraphs.push(new Paragraph({ text: "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG - SAI (2,0 ĐIỂM)", heading: HeadingLevel.HEADING_3 }));
      docParagraphs.push(new Paragraph({ text: "Thí sinh trả lời từng lệnh hỏi a, b, c, d trong mỗi câu. Thí sinh chọn Đúng (Đ) hoặc Sai (S)." }));
      part2.forEach((q, idx) => {
        docParagraphs.push(new Paragraph({ text: `Câu ${idx + 1} (${q.score}đ): ${q.stem}` }));
        q.tfItems?.forEach(item => {
          docParagraphs.push(new Paragraph({ text: `   ${item.label}) ${item.content} ${withAnswers ? (item.isCorrect ? " [ĐÚNG]" : " [SAI]") : ""}` }));
        });
        if (withAnswers && q.explanation) {
          docParagraphs.push(new Paragraph({ text: `   -> Giải thích: ${q.explanation}` }));
        }
      });
      docParagraphs.push(new Paragraph({ text: "" }));
    }

    if (part3.length > 0) {
      docParagraphs.push(new Paragraph({ text: "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (2,0 ĐIỂM)", heading: HeadingLevel.HEADING_3 }));
      part3.forEach((q, idx) => {
        docParagraphs.push(new Paragraph({ text: `Câu ${idx + 1} (${q.score}đ): ${q.stem}` }));
        if (withAnswers && q.saSpec) {
          docParagraphs.push(new Paragraph({ text: `   -> Đáp án: ${q.saSpec.expectedAnswer} ${q.saSpec.unit || ""} (Giải thích: ${q.explanation || ""})` }));
        }
      });
      docParagraphs.push(new Paragraph({ text: "" }));
    }

    if (part4.length > 0) {
      docParagraphs.push(new Paragraph({ text: "PHẦN IV. TỰ LUẬN (2,0 ĐIỂM)", heading: HeadingLevel.HEADING_3 }));
      part4.forEach((q, idx) => {
        docParagraphs.push(new Paragraph({ text: `Câu ${idx + 1} (${q.score}đ): ${q.stem}` }));
        if (withAnswers && q.rubricSteps && q.rubricSteps.length > 0) {
          docParagraphs.push(new Paragraph({ text: "   HƯỚNG DẪN CHẤM VÀ RUBRIC BIỂU ĐIỂM:" }));
          q.rubricSteps.forEach(step => {
            docParagraphs.push(new Paragraph({ text: `     + Bước ${step.stepNumber} (${step.score}đ): ${step.criterion} -> ${step.expectedContent}` }));
          });
        }
      });
    }

    const doc = new Document({
      sections: [{ properties: {}, children: docParagraphs }]
    });

    const uint8Array = await (await import("docx")).Packer.toBuffer(doc);
    return Buffer.from(uint8Array);
  }

  public static async generateProjectZip(params: {
    project: Project;
    matrix?: Matrix;
    specification?: Specification;
    questions: Question[];
    validationReport?: ValidationReport;
  }): Promise<Buffer> {
    const zip = new JSZip();
    const prefix = `EDUTEST_${params.project.subject.replace(/\s+/g, "_")}_Lop${params.project.grade}`;

    // 1. Excel Matrix & Spec
    const excelBuffer = await ExportService.generateExcel({
      project: params.project,
      matrix: params.matrix,
      specification: params.specification
    });
    zip.file(`${prefix}_MaTran_Va_DacTa.xlsx`, excelBuffer);

    // 2. Word Exam
    const examWordBuffer = await ExportService.generateWord({
      project: params.project,
      questions: params.questions,
      withAnswers: false
    });
    zip.file(`${prefix}_De_Kiem_Tra.docx`, examWordBuffer);

    // 3. Word Rubric & Answers
    const answersWordBuffer = await ExportService.generateWord({
      project: params.project,
      questions: params.questions,
      withAnswers: true
    });
    zip.file(`${prefix}_Huong_Dan_Cham.docx`, answersWordBuffer);

    // 4. Project metadata JSON
    const projectBundle = {
      project: params.project,
      matrix: params.matrix,
      specification: params.specification,
      questions: params.questions,
      validationReport: params.validationReport,
      exportedAt: new Date().toISOString(),
      system: "EDUTEST AI v1.0"
    };
    zip.file(`${prefix}_ProjectData.json`, JSON.stringify(projectBundle, null, 2));

    // 5. Validation Report TXT
    if (params.validationReport) {
      const reportLines = [
        "===========================================================",
        "BÁO CÁO KIỂM ĐỊNH ĐỀ THI - HỆ THỐNG EDUTEST AI",
        "===========================================================",
        `Dự án: ${params.project.name}`,
        `Môn học: ${params.project.subject} - Lớp: ${params.project.grade}`,
        `Thời gian kiểm định: ${params.validationReport.timestamp}`,
        `Kết luận: ${params.validationReport.allPassed ? "ĐẠT CHUẨN KIỂM ĐỊNH" : "CẦN RÀ SOÁT LẠI"}`,
        `Lỗi nghiêm trọng: ${params.validationReport.criticalErrorsCount} | Lỗi: ${params.validationReport.errorsCount} | Cảnh báo: ${params.validationReport.warningsCount}`,
        "-----------------------------------------------------------",
        "CHI TIẾT CÁC QUY TẮC (V01 - V20):"
      ];
      params.validationReport.ruleResults.forEach(r => {
        reportLines.push(`[${r.passed ? "PASS" : "FAIL"}] ${r.ruleCode} (${r.severity}): ${r.ruleName}`);
        reportLines.push(`       -> ${r.message}`);
      });
      zip.file(`${prefix}_BaoCaoKiemDinh.txt`, reportLines.join("\n"));
    }

    return await zip.generateAsync({ type: "nodebuffer" });
  }
}
