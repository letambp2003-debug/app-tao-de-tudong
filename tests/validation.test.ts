import { describe, it, expect } from "vitest";
import { ValidationEngine } from "../server/services/validation/index.js";
import { ExportService } from "../server/services/export/index.js";
import { DatabaseService } from "../server/services/database/mockDb.js";

describe("EDUTEST AI Validation Engine (V01 - V20)", () => {
  DatabaseService.initialize();
  const db = DatabaseService.get();
  const projectId = "proj-khtn8-midterm";

  const project = db.projects.find(p => p.id === projectId)!;
  const blueprint = db.blueprints[projectId]!;
  const matrix = db.matrices[projectId]!;
  const specification = db.specifications[projectId]!;
  const questions = db.questions[projectId]!;
  const dataPack = db.dataPacks[projectId]!;

  it("V01-V20: should validate the standard KHTN 8 seed project successfully", () => {
    const { report, traceability } = ValidationEngine.runFullValidation({
      project,
      blueprint,
      matrix,
      specification,
      questions,
      dataPack
    });

    expect(report).toBeDefined();
    expect(report.totalRulesChecked).toBeGreaterThanOrEqual(15);
    expect(report.criticalErrorsCount).toBe(0);
    expect(report.allPassed).toBe(true);
    expect(traceability.length).toBe(questions.length);
  });

  it("V01: should fail if matrix total score is not equal to 10.0", () => {
    const brokenMatrix = {
      ...matrix,
      cells: matrix.cells.slice(0, 3) // Only 3 cells, score far below 10
    };

    const { report } = ValidationEngine.runFullValidation({
      project,
      blueprint,
      matrix: brokenMatrix,
      specification,
      questions,
      dataPack
    });

    const v01 = report.ruleResults.find(r => r.ruleCode === "V01");
    expect(v01?.passed).toBe(false);
    expect(report.allPassed).toBe(false);
  });

  it("V16: should detect unmatched LaTeX braces", () => {
    const brokenQuestions = [
      ...questions.slice(0, 1),
      {
        ...questions[0],
        id: "q-broken-latex",
        stem: "Phương trình hóa học: $2Fe + 3Cl_{2 \\rightarrow 2FeCl_3$" // Missing closing brace
      }
    ];

    const { report } = ValidationEngine.runFullValidation({
      project,
      blueprint,
      matrix,
      specification,
      questions: brokenQuestions,
      dataPack
    });

    const v16 = report.ruleResults.find(r => r.ruleCode === "V16");
    expect(v16?.passed).toBe(false);
  });
});

describe("EDUTEST AI Exporter Engine", () => {
  DatabaseService.initialize();
  const db = DatabaseService.get();
  const projectId = "proj-khtn8-midterm";
  const project = db.projects.find(p => p.id === projectId)!;
  const matrix = db.matrices[projectId]!;
  const specification = db.specifications[projectId]!;
  const questions = db.questions[projectId]!;

  it("should generate Excel (.xlsx) file buffer without errors", async () => {
    const buffer = await ExportService.generateExcel({
      project,
      matrix,
      specification
    });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("should generate Word (.docx) exam paper buffer without errors", async () => {
    const buffer = await ExportService.generateWord({
      project,
      questions,
      withAnswers: false
    });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("should generate Word (.docx) answer & rubric guide buffer without errors", async () => {
    const buffer = await ExportService.generateWord({
      project,
      questions,
      withAnswers: true
    });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("should bundle project ZIP archive with reports and documents", async () => {
    const { report } = ValidationEngine.runFullValidation({
      project,
      blueprint: db.blueprints[projectId],
      matrix,
      specification,
      questions,
      dataPack: db.dataPacks[projectId]
    });

    const zipBuffer = await ExportService.generateProjectZip({
      project,
      matrix,
      specification,
      questions,
      validationReport: report
    });
    expect(zipBuffer).toBeDefined();
    expect(zipBuffer.length).toBeGreaterThan(2000);
  });
});
