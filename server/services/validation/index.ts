import {
  Project,
  Blueprint,
  Matrix,
  Specification,
  Question,
  DataPack,
  ValidationReport,
  ValidationRuleResult,
  TraceabilityLink
} from "../../../shared/types/index.js";

// Helper for floating point comparison with precision epsilon
function isEqual(a: number, b: number, eps = 0.001): boolean {
  return Math.abs(a - b) < eps;
}

// Simple LaTeX validator checking balanced braces and math delimiters
function validateLatexSyntax(text: string): { valid: boolean; error?: string } {
  if (!text) return { valid: true };
  const mathMatches = text.match(/\$([^\$]+)\$/g);
  if (!mathMatches) return { valid: true };

  for (const match of mathMatches) {
    const expr = match.slice(1, -1);
    let openBraces = 0;
    for (const char of expr) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
      if (openBraces < 0) {
        return { valid: false, error: `Thừa dấu đóng ngoặc nhọn '}' trong biểu thức: ${match}` };
      }
    }
    if (openBraces > 0) {
      return { valid: false, error: `Thiếu dấu đóng ngoặc nhọn '}' trong biểu thức: ${match}` };
    }
  }
  return { valid: true };
}

export class ValidationEngine {
  public static runFullValidation(params: {
    project: Project;
    blueprint?: Blueprint;
    matrix?: Matrix;
    specification?: Specification;
    questions?: Question[];
    dataPack?: DataPack;
  }): { report: ValidationReport; traceability: TraceabilityLink[] } {
    const { project, blueprint, matrix, specification, questions = [], dataPack } = params;
    const results: ValidationRuleResult[] = [];

    // V01: Tổng điểm toàn bài phải bằng tổng điểm dự án
    let matrixScoreValid = true;
    let questionsScoreValid = true;
    let checkedScore = project.totalScore;

    if (matrix && matrix.cells.length > 0) {
      const matSum = matrix.cells.reduce((sum, c) => sum + (c.totalScore || 0), 0);
      if (!isEqual(matSum, project.totalScore)) {
        matrixScoreValid = false;
        checkedScore = matSum;
      }
    }

    if (questions.length > 0) {
      const qSum = questions.reduce((sum, q) => sum + (q.score || 0), 0);
      if (!isEqual(qSum, project.totalScore)) {
        questionsScoreValid = false;
        checkedScore = qSum;
      }
    }

    const v01Passed = matrixScoreValid && questionsScoreValid;
    results.push({
      ruleCode: "V01",
      ruleName: "Tổng điểm toàn bài khớp tổng điểm dự án",
      severity: "CRITICAL",
      passed: v01Passed,
      message: v01Passed
        ? `Tổng điểm (${project.totalScore.toFixed(2)}) khớp đúng tổng điểm dự án (${project.totalScore.toFixed(2)}).`
        : `Tổng điểm hiện tại (${checkedScore.toFixed(2)}) không khớp tổng điểm dự án (${project.totalScore.toFixed(2)}).`
    });

    // V02: Tổng điểm các chủ đề phải bằng tổng điểm toàn bài
    if (blueprint && blueprint.topicAllocations.length > 0) {
      const sumTopics = blueprint.topicAllocations.reduce((sum, t) => sum + t.targetScore, 0);
      const v02Passed = isEqual(sumTopics, project.totalScore);
      results.push({
        ruleCode: "V02",
        ruleName: "Tổng điểm các chủ đề bằng tổng điểm toàn bài",
        severity: "CRITICAL",
        passed: v02Passed,
        message: v02Passed
          ? `Tổng điểm phân bổ theo các chủ đề (${sumTopics.toFixed(2)}) bằng tổng điểm toàn bài.`
          : `Tổng điểm phân bổ các chủ đề (${sumTopics.toFixed(2)}) khác tổng điểm toàn bài (${project.totalScore.toFixed(2)}).`
      });
    }

    // V03: Tổng điểm các dạng câu phải bằng tổng điểm toàn bài
    if (blueprint && blueprint.questionTypeConfigs.length > 0) {
      const sumTypes = blueprint.questionTypeConfigs.reduce((sum, qt) => sum + (qt.totalScore || qt.count * qt.pointsPerItem), 0);
      const v03Passed = isEqual(sumTypes, project.totalScore);
      results.push({
        ruleCode: "V03",
        ruleName: "Tổng điểm các dạng câu bằng tổng điểm toàn bài",
        severity: "CRITICAL",
        passed: v03Passed,
        message: v03Passed
          ? `Tổng điểm phân bổ các dạng câu (${sumTypes.toFixed(2)}) khớp tổng điểm toàn bài.`
          : `Tổng điểm các dạng câu (${sumTypes.toFixed(2)}) lệch so với tổng điểm dự án (${project.totalScore.toFixed(2)}).`
      });
    }

    // V04: Tổng điểm các mức độ nhận thức phải khớp tỉ lệ cấu hình
    if (blueprint && matrix && matrix.cells.length > 0) {
      const cognitiveTotals = { NB: 0, TH: 0, VD: 0, VDC: 0 };
      matrix.cells.forEach(c => {
        if (cognitiveTotals[c.cognitiveLevel] !== undefined) {
          cognitiveTotals[c.cognitiveLevel] += c.totalScore;
        }
      });
      const expectedNB = (blueprint.cognitiveWeights.NB / 100) * project.totalScore;
      const expectedTH = (blueprint.cognitiveWeights.TH / 100) * project.totalScore;
      const expectedVD = (blueprint.cognitiveWeights.VD / 100) * project.totalScore;
      const expectedVDC = (blueprint.cognitiveWeights.VDC / 100) * project.totalScore;

      const v04Passed =
        isEqual(cognitiveTotals.NB, expectedNB, 0.25) &&
        isEqual(cognitiveTotals.TH, expectedTH, 0.25) &&
        isEqual(cognitiveTotals.VD, expectedVD, 0.25) &&
        isEqual(cognitiveTotals.VDC, expectedVDC, 0.25);

      results.push({
        ruleCode: "V04",
        ruleName: "Tỉ lệ mức độ nhận thức khớp với cấu hình Blueprint",
        severity: "CRITICAL",
        passed: v04Passed,
        message: v04Passed
          ? `Tỉ lệ nhận thức: NB ${cognitiveTotals.NB}đ (${blueprint.cognitiveWeights.NB}%), TH ${cognitiveTotals.TH}đ (${blueprint.cognitiveWeights.TH}%), VD ${cognitiveTotals.VD}đ (${blueprint.cognitiveWeights.VD}%), VDC ${cognitiveTotals.VDC}đ (${blueprint.cognitiveWeights.VDC}%).`
          : `Tỉ lệ nhận thức thực tế (NB:${cognitiveTotals.NB}đ, TH:${cognitiveTotals.TH}đ, VD:${cognitiveTotals.VD}đ, VDC:${cognitiveTotals.VDC}đ) chưa khớp với mục tiêu Blueprint.`
      });
    }

    // V05: Ma trận và đặc tả phải có cùng số câu, dạng câu và điểm
    if (matrix && specification && matrix.cells.length > 0 && specification.rows.length > 0) {
      const matrixTotalQuestions = matrix.cells.reduce((sum, c) => sum + c.count, 0);
      const specTotalQuestions = specification.rows.reduce((sum, r) => sum + r.count, 0);
      const matrixTotalScore = matrix.cells.reduce((sum, c) => sum + c.totalScore, 0);
      const specTotalScore = specification.rows.reduce((sum, r) => sum + r.score, 0);

      const v05Passed = matrixTotalQuestions === specTotalQuestions && isEqual(matrixTotalScore, specTotalScore);
      results.push({
        ruleCode: "V05",
        ruleName: "Ma trận và đặc tả khớp số câu và điểm số",
        severity: "CRITICAL",
        passed: v05Passed,
        message: v05Passed
          ? `Ma trận và đặc tả khớp nhau hoàn toàn (${matrixTotalQuestions} câu, ${matrixTotalScore.toFixed(2)} điểm).`
          : `Lệch số liệu giữa Ma trận (${matrixTotalQuestions} câu, ${matrixTotalScore.toFixed(2)}đ) và Bản đặc tả (${specTotalQuestions} câu, ${specTotalScore.toFixed(2)}đ).`
      });
    }

    // V06: Mỗi câu hỏi phải liên kết với một dòng đặc tả
    if (questions.length > 0) {
      const unlinked = questions.filter(q => !q.specificationId);
      const v06Passed = unlinked.length === 0;
      results.push({
        ruleCode: "V06",
        ruleName: "Mọi câu hỏi đều liên kết với một dòng đặc tả",
        severity: "CRITICAL",
        passed: v06Passed,
        message: v06Passed
          ? `Tất cả ${questions.length} câu hỏi đều có mã liên kết đặc tả hợp lệ.`
          : `Có ${unlinked.length} câu hỏi chưa được gán dòng đặc tả.`
      });
    }

    // V07: Mỗi dòng đặc tả phải có YCCĐ và nguồn
    if (specification && specification.rows.length > 0) {
      const invalidRows = specification.rows.filter(r => !r.yccdText || !r.sourceReference);
      const v07Passed = invalidRows.length === 0;
      results.push({
        ruleCode: "V07",
        ruleName: "Mỗi dòng đặc tả có đầy đủ YCCĐ và nguồn tham chiếu",
        severity: "CRITICAL",
        passed: v07Passed,
        message: v07Passed
          ? `Tất cả ${specification.rows.length} dòng đặc tả đều có YCCĐ và nguồn tài liệu.`
          : `Có ${invalidRows.length} dòng đặc tả còn thiếu YCCĐ hoặc nguồn tham chiếu.`
      });
    }

    // V08: Mỗi câu phải có đáp án hoặc rubric
    if (questions.length > 0) {
      let missingAnswerCount = 0;
      questions.forEach(q => {
        if (q.type === "MULTIPLE_CHOICE") {
          const hasCorrect = q.mcOptions?.some(o => o.isCorrect);
          if (!hasCorrect) missingAnswerCount++;
        } else if (q.type === "TRUE_FALSE_4") {
          const hasAllKeys = q.tfItems && q.tfItems.length === 4;
          if (!hasAllKeys) missingAnswerCount++;
        } else if (q.type === "SHORT_ANSWER") {
          if (!q.saSpec?.expectedAnswer) missingAnswerCount++;
        } else if (q.type === "ESSAY") {
          if (!q.rubricSteps || q.rubricSteps.length === 0) missingAnswerCount++;
        }
      });
      const v08Passed = missingAnswerCount === 0;
      results.push({
        ruleCode: "V08",
        ruleName: "Mỗi câu hỏi có đầy đủ đáp án hoặc hướng dẫn chấm",
        severity: "CRITICAL",
        passed: v08Passed,
        message: v08Passed
          ? `Tất cả ${questions.length} câu hỏi đều có đáp án/rubric chuẩn xác.`
          : `Có ${missingAnswerCount} câu hỏi chưa có đáp án hoặc rubric chấm.`
      });
    }

    // V09: Tổng điểm rubric phải bằng điểm câu tự luận
    if (questions.length > 0) {
      const essayQuestions = questions.filter(q => q.type === "ESSAY");
      let rubricMismatchCount = 0;
      essayQuestions.forEach(q => {
        const rubricSum = q.rubricSteps?.reduce((sum, s) => sum + s.score, 0) || 0;
        if (!isEqual(rubricSum, q.score)) {
          rubricMismatchCount++;
        }
      });
      const v09Passed = rubricMismatchCount === 0;
      results.push({
        ruleCode: "V09",
        ruleName: "Tổng điểm rubric bằng điểm câu tự luận",
        severity: "CRITICAL",
        passed: v09Passed,
        message: v09Passed
          ? `Tất cả ${essayQuestions.length} câu tự luận có điểm rubric khớp điểm câu hỏi.`
          : `Có ${rubricMismatchCount} câu tự luận có tổng điểm rubric không khớp điểm của câu.`
      });
    }

    // V10: Câu nhiều lựa chọn chỉ có duy nhất 1 đáp án đúng
    if (questions.length > 0) {
      const mcQuestions = questions.filter(q => q.type === "MULTIPLE_CHOICE");
      let badMcCount = 0;
      mcQuestions.forEach(q => {
        const correctCount = q.mcOptions?.filter(o => o.isCorrect).length || 0;
        if (correctCount !== 1) {
          badMcCount++;
        }
      });
      const v10Passed = badMcCount === 0;
      results.push({
        ruleCode: "V10",
        ruleName: "Câu trắc nghiệm 4 lựa chọn có đúng duy nhất 1 đáp án",
        severity: "CRITICAL",
        passed: v10Passed,
        message: v10Passed
          ? `Tất cả ${mcQuestions.length} câu trắc nghiệm nhiều lựa chọn đều có đúng 1 đáp án đúng.`
          : `Có ${badMcCount} câu trắc nghiệm có số lượng đáp án đúng khác 1.`
      });
    }

    // V11: Câu Đúng–Sai phải có đủ 4 ý nhận định
    if (questions.length > 0) {
      const tfQuestions = questions.filter(q => q.type === "TRUE_FALSE_4");
      let badTfCount = 0;
      tfQuestions.forEach(q => {
        if (!q.tfItems || q.tfItems.length !== 4) {
          badTfCount++;
        }
      });
      const v11Passed = badTfCount === 0;
      results.push({
        ruleCode: "V11",
        ruleName: "Câu trắc nghiệm Đúng-Sai có đủ 4 ý nhận định",
        severity: "ERROR",
        passed: v11Passed,
        message: v11Passed
          ? `Tất cả ${tfQuestions.length} câu Đúng-Sai có đủ 4 lệnh hỏi a, b, c, d.`
          : `Có ${badTfCount} câu Đúng-Sai không đủ 4 ý nhận định.`
      });
    }

    // V12: Câu trả lời ngắn có đáp án rõ ràng
    if (questions.length > 0) {
      const saQuestions = questions.filter(q => q.type === "SHORT_ANSWER");
      const badSaCount = saQuestions.filter(q => !q.saSpec?.expectedAnswer?.trim()).length;
      const v12Passed = badSaCount === 0;
      results.push({
        ruleCode: "V12",
        ruleName: "Câu trả lời ngắn có đáp án rõ ràng và đơn vị",
        severity: "WARNING",
        passed: v12Passed,
        message: v12Passed
          ? `Tất cả ${saQuestions.length} câu trả lời ngắn đều có giá trị đáp án cụ thể.`
          : `Có ${badSaCount} câu trả lời ngắn chưa nhập đáp án chuẩn.`
      });
    }

    // V13: Không có câu hỏi trùng hoặc gần trùng trong cùng đề
    if (questions.length > 0) {
      const stemSet = new Set<string>();
      let duplicateCount = 0;
      questions.forEach(q => {
        const normalized = q.stem.trim().toLowerCase().replace(/\s+/g, " ");
        if (stemSet.has(normalized)) {
          duplicateCount++;
        } else {
          stemSet.add(normalized);
        }
      });
      const v13Passed = duplicateCount === 0;
      results.push({
        ruleCode: "V13",
        ruleName: "Không có câu hỏi trùng lặp trong đề thi",
        severity: "WARNING",
        passed: v13Passed,
        message: v13Passed
          ? "Không phát hiện câu hỏi bị trùng lặp nội dung."
          : `Phát hiện ${duplicateCount} câu hỏi có nội dung trùng lặp.`
      });
    }

    // V14: Nội dung câu bám sát tài liệu nguồn
    if (questions.length > 0) {
      const missingSourceCount = questions.filter(q => !q.sourceReference).length;
      const v14Passed = missingSourceCount === 0;
      results.push({
        ruleCode: "V14",
        ruleName: "Nội dung câu hỏi bám sát tài liệu nguồn đã duyệt",
        severity: "CRITICAL",
        passed: v14Passed,
        message: v14Passed
          ? `Tất cả các câu hỏi đều có xuất xứ từ tài liệu nguồn.`
          : `Có ${missingSourceCount} câu hỏi chưa xác định được nguồn gốc tài liệu.`
      });
    }

    // V16: Kiểm tra cú pháp công thức LaTeX
    if (questions.length > 0) {
      let latexErrorCount = 0;
      questions.forEach(q => {
        const stemCheck = validateLatexSyntax(q.stem);
        if (!stemCheck.valid) latexErrorCount++;
        q.mcOptions?.forEach(o => {
          if (!validateLatexSyntax(o.content).valid) latexErrorCount++;
        });
        q.tfItems?.forEach(i => {
          if (!validateLatexSyntax(i.content).valid) latexErrorCount++;
        });
      });
      const v16Passed = latexErrorCount === 0;
      results.push({
        ruleCode: "V16",
        ruleName: "Không có công thức toán học LaTeX bị lỗi cú pháp",
        severity: "ERROR",
        passed: v16Passed,
        message: v16Passed
          ? "Các công thức toán học LaTeX đều đúng cú pháp."
          : `Phát hiện ${latexErrorCount} công thức LaTeX lỗi đóng mở ngoặc.`
      });
    }

    // Build Traceability Matrix
    const traceability: TraceabilityLink[] = questions.map((q, idx) => {
      const specRow = specification?.rows.find(r => r.id === q.specificationId);
      const topic = dataPack?.topics.find(t => t.id === q.topicId);
      const unit = dataPack?.units.find(u => u.id === q.unitId);
      const yccd = dataPack?.yccds.find(y => y.id === q.yccdId);

      return {
        questionId: q.id,
        questionOrder: q.orderNumber || idx + 1,
        questionType: q.type,
        stem: q.stem,
        score: q.score,
        cognitiveLevel: q.cognitiveLevel,
        specRowId: q.specificationId || "N/A",
        yccdCode: yccd?.code || specRow?.yccdId || "N/A",
        yccdText: yccd?.description || specRow?.yccdText || "N/A",
        topicName: topic?.name || "N/A",
        unitName: unit?.name || "N/A",
        sourceReference: q.sourceReference || specRow?.sourceReference || "N/A",
        hasRubricOrAnswer: Boolean(
          (q.type === "MULTIPLE_CHOICE" && q.mcOptions?.some(o => o.isCorrect)) ||
          (q.type === "TRUE_FALSE_4" && q.tfItems?.length === 4) ||
          (q.type === "SHORT_ANSWER" && q.saSpec?.expectedAnswer) ||
          (q.type === "ESSAY" && q.rubricSteps?.length)
        )
      };
    });

    const criticalErrorsCount = results.filter(r => r.severity === "CRITICAL" && !r.passed).length;
    const errorsCount = results.filter(r => r.severity === "ERROR" && !r.passed).length;
    const warningsCount = results.filter(r => r.severity === "WARNING" && !r.passed).length;

    const report: ValidationReport = {
      projectId: project.id,
      timestamp: new Date().toISOString(),
      allPassed: criticalErrorsCount === 0 && errorsCount === 0,
      criticalErrorsCount,
      errorsCount,
      warningsCount,
      totalRulesChecked: results.length,
      ruleResults: results
    };

    return { report, traceability };
  }
}
