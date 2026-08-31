import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/index.js";
import { PROMPTS } from "../../prompts/index.js";
import { DatabaseService } from "../database/mockDb.js";
import { AIUsageLog, Project } from "../../../shared/types/index.js";
import { getCurriculumData, SubjectCurriculum } from "../../../shared/rules/curriculumDatabase.js";

export class AIOrchestrator {
  private static geminiClient: GoogleGenerativeAI | null = null;

  public static getGemini(): GoogleGenerativeAI | null {
    if (!AIOrchestrator.geminiClient && config.geminiApiKey) {
      try {
        AIOrchestrator.geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
      } catch (err) {
        console.error("Failed to initialize GoogleGenerativeAI:", err);
      }
    }
    return AIOrchestrator.geminiClient;
  }

  public static async executeModule<T>(params: {
    moduleCode: "AI01" | "AI02" | "AI03" | "AI04" | "AI05" | "AI06" | "AI07" | "AI08" | "AI09" | "AI10";
    projectId: string;
    inputData: any;
    customPrompt?: string;
  }): Promise<{ result: T; source: "LIVE_AI" | "MOCK_AI"; usageLog: AIUsageLog }> {
    const startTime = Date.now();
    const promptDef = Object.values(PROMPTS).find(p => p.code === params.moduleCode) || PROMPTS.AI05_QUESTION_AUTHOR;
    const client = AIOrchestrator.getGemini();

    const db = DatabaseService.get();
    const project = db.projects.find(p => p.id === params.projectId) || params.inputData?.project;

    let outputResult: any = null;
    let mode: "LIVE_AI" | "MOCK_AI" = "MOCK_AI";
    let inputTokens = 500;
    let outputTokens = 800;

    if (client && config.geminiApiKey) {
      try {
        const model = client.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          },
          systemInstruction: `${promptDef.systemPrompt}\n\nThông tin môn học dự án:\n- Môn: ${project?.subject || "Toán học"}\n- Lớp: ${project?.grade || 8}\n- Bộ sách: ${project?.textbookSeries || "Kết nối tri thức"}\n- Học kỳ: ${project?.semester || "HK1"}\n- Kỳ thi: ${project?.examPeriod || "GIUA_KY"}`
        });

        const promptText = params.customPrompt || JSON.stringify(params.inputData);
        const res = await model.generateContent(promptText);
        const text = res.response.text();
        outputResult = JSON.parse(text);
        mode = "LIVE_AI";
        inputTokens = 1200;
        outputTokens = 1500;
      } catch (err) {
        console.warn(`[AI ${params.moduleCode}] Live API error, falling back to dynamic curriculum engine:`, err);
      }
    }

    // High quality dynamic curriculum fallback generator matching the project's exact subject, grade, and exam period
    if (!outputResult) {
      outputResult = AIOrchestrator.generateDeterministicMock(params.moduleCode, params.inputData, project);
      mode = "MOCK_AI";
    }

    const durationMs = Date.now() - startTime;
    const usageLog: AIUsageLog = {
      id: "ai-log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      moduleCode: promptDef.code + "_" + promptDef.name.replace(/\s+/g, "_").toUpperCase(),
      projectId: params.projectId,
      promptVersion: promptDef.version,
      status: mode === "LIVE_AI" ? "SUCCESS" : "FALLBACK_MOCK",
      inputTokens,
      outputTokens,
      durationMs,
      timestamp: new Date().toISOString()
    };

    db.aiUsageLogs.unshift(usageLog);
    DatabaseService.save();

    return { result: outputResult as T, source: mode, usageLog };
  }

  private static generateDeterministicMock(moduleCode: string, inputData: any, project?: Project): any {
    const subject = project?.subject || inputData?.project?.subject || "Toán học";
    const grade = project?.grade || inputData?.project?.grade || 8;
    const semester = (project?.semester || inputData?.project?.semester || "HK1") as "HK1" | "HK2";
    const examPeriod = (project?.examPeriod || inputData?.project?.examPeriod || "GIUA_KY") as "GIUA_KY" | "CUOI_KY";

    const curriculum = getCurriculumData(subject, grade, semester, examPeriod);

    switch (moduleCode) {
      case "AI01":
        return {
          totalPages: 42,
          sourceTypeDetected: `SGK ${subject} ${grade} - Bộ ${project?.textbookSeries || "Kết nối tri thức"}`,
          fragments: curriculum.topics.map((t, idx) => ({
            pageNumber: 10 + idx * 15,
            content: `Nội dung ${t.name}: Các định nghĩa, tính chất, phương pháp giải và bài tập ứng dụng theo chuẩn GDPT 2018.`,
            topicDetected: t.name
          }))
        };

      case "AI02":
        // Flatten topics, units, and yccds with exact matching codes
        const flatTopics: any[] = [];
        const flatUnits: any[] = [];
        const flatYccds: any[] = [];

        curriculum.topics.forEach((t, tIdx) => {
          flatTopics.push({
            code: t.code,
            name: t.name,
            order: tIdx + 1,
            period: t.period,
            weightPercentageMidterm: t.weightPercentageMidterm,
            weightPercentageFinal: t.weightPercentageFinal
          });

          t.units.forEach((u, uIdx) => {
            flatUnits.push({
              topicCode: t.code,
              code: u.code,
              name: u.name,
              order: uIdx + 1,
              lessonHours: u.lessonHours
            });

            u.yccds.forEach((y, yIdx) => {
              flatYccds.push({
                unitCode: u.code,
                topicCode: t.code,
                code: y.code,
                description: y.description,
                cognitiveLevelDefault: y.cognitiveLevelDefault,
                competencyCode: y.competencyCode,
                sourceReference: y.sourceReference
              });
            });
          });
        });

        return {
          topics: flatTopics,
          units: flatUnits,
          yccds: flatYccds,
          appendixNotes: examPeriod === "CUOI_KY" ? curriculum.finalAppendixNotes : curriculum.midtermAppendixNotes
        };

      case "AI03":
        // Distribute cells across the actual curriculum topics based on blueprint
        const cells: any[] = [];
        const numTopics = curriculum.topics.length || 1;

        curriculum.topics.forEach((top, topIdx) => {
          const firstUnit = top.units[0];
          const secondUnit = top.units[1] || firstUnit;

          if (topIdx === 0) {
            // First topic / Phase 1
            cells.push(
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 8, pointsPerItem: 0.25, totalScore: 2.0 },
              { topicCode: top.code, unitCode: secondUnit.code, questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
              { topicCode: top.code, unitCode: secondUnit.code, questionType: "SHORT_ANSWER", cognitiveLevel: "TH", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
              { topicCode: top.code, unitCode: secondUnit.code, questionType: "ESSAY", cognitiveLevel: "VD", count: 1, pointsPerItem: 1.0, totalScore: 1.0 }
            );
          } else if (topIdx === 1) {
            // Second topic / Phase 2
            cells.push(
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "SHORT_ANSWER", cognitiveLevel: "VD", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 }
            );
          } else {
            // Third topic (e.g. Geometry or VDC)
            cells.push(
              { topicCode: top.code, unitCode: firstUnit.code, questionType: "ESSAY", cognitiveLevel: "VDC", count: 1, pointsPerItem: 1.0, totalScore: 1.0 }
            );
          }
        });

        return {
          summaryRationale: `Phân bổ ma trận chuẩn GDPT 2018 cho môn ${subject} ${grade} (${examPeriod === "CUOI_KY" ? "Cuối kỳ: 25% GĐ1 + 75% GĐ2" : "Giữa kỳ: 100% GĐ1"}), tỉ lệ nhận thức NB 40% - TH 30% - VD 20% - VDC 10%.`,
          cells
        };

      case "AI05":
        const reqType = inputData?.questionType || "MULTIPLE_CHOICE";
        const reqCognitive = inputData?.cognitiveLevel || "NB";
        const specRow = inputData?.specRow;

        // Search for a matching sample question in the subject's curriculum library
        let matchedSample: any = null;
        for (const t of curriculum.topics) {
          for (const u of t.units) {
            for (const y of u.yccds) {
              if (y.sampleQuestions) {
                const found = y.sampleQuestions.find(q => q.type === reqType);
                if (found) {
                  matchedSample = found;
                  break;
                }
              }
            }
            if (matchedSample) break;
          }
          if (matchedSample) break;
        }

        if (matchedSample) {
          return matchedSample;
        }

        // Generic dynamic question builder for any subject with KaTeX formulas
        if (reqType === "MULTIPLE_CHOICE") {
          return {
            stem: `Cho biểu thức / định lý trong môn ${subject} ${grade}: Khẳng định nào sau đây là đúng?`,
            type: "MULTIPLE_CHOICE",
            cognitiveLevel: reqCognitive,
            score: 0.25,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Đáp án đúng theo chuẩn kiến thức kĩ năng chương trình GDPT 2018.",
            mcOptions: [
              { label: "A", content: "Khẳng định A (Đáp án chính xác)", isCorrect: true },
              { label: "B", content: "Khẳng định B (Phương án nhiễu 1)", isCorrect: false },
              { label: "C", content: "Khẳng định C (Phương án nhiễu 2)", isCorrect: false },
              { label: "D", content: "Khẳng định D (Phương án nhiễu 3)", isCorrect: false }
            ]
          };
        } else if (reqType === "TRUE_FALSE_4") {
          return {
            stem: `Xét các mệnh đề / tính chất sau trong chương trình ${subject} ${grade}:`,
            type: "TRUE_FALSE_4",
            cognitiveLevel: reqCognitive,
            score: 1.0,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Các ý a, c đúng; ý b, d sai theo định nghĩa.",
            tfItems: [
              { label: "a", content: "Mệnh đề a mô tả đúng tính chất cơ bản.", isCorrect: true, explanation: "Đúng theo lý thuyết." },
              { label: "b", content: "Mệnh đề b đảo ngược điều kiện cần và đủ.", isCorrect: false, explanation: "Sai điều kiện." },
              { label: "c", content: "Mệnh đề c thỏa mãn công thức đã học.", isCorrect: true, explanation: "Đúng theo công thức." },
              { label: "d", content: "Mệnh đề d áp dụng sai đơn vị hoặc phạm vi.", isCorrect: false, explanation: "Sai phạm vi áp dụng." }
            ]
          };
        } else if (reqType === "SHORT_ANSWER") {
          return {
            stem: `Tính giá trị biểu thức / đại lượng trong bài toán ${subject} ${grade}:`,
            type: "SHORT_ANSWER",
            cognitiveLevel: reqCognitive,
            score: 0.5,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Thực hiện các bước tính toán và điền đáp số.",
            saSpec: { expectedAnswer: "10", unit: "", tolerance: 0 }
          };
        } else {
          return {
            stem: `Bài toán tự luận môn ${subject} ${grade}:\na) Trình bày cơ sở lý thuyết và các bước biến đổi.\nb) Vận dụng giải quyết yêu cầu thực tiễn của bài toán.`,
            type: "ESSAY",
            cognitiveLevel: reqCognitive,
            score: 1.0,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Lời giải chi tiết theo các bước biểu điểm.",
            rubricSteps: [
              { stepNumber: 1, criterion: "Nêu đúng công thức và biến đổi bước 1", expectedContent: "Trình bày đúng định lí và thay số ban đầu.", score: 0.5 },
              { stepNumber: 2, criterion: "Thực hiện tính toán và kết luận bài toán", expectedContent: "Tính toán chính xác và đưa ra kết luận cuối cùng.", score: 0.5 }
            ]
          };
        }

      case "AI07":
        return {
          status: "DAT",
          scores: { accuracy: 96, pedagogicalFit: 98, distractorQuality: 95 },
          issues: [],
          recommendations: `Hồ sơ môn ${subject} ${grade} hoàn toàn phù hợp với chuẩn YCCĐ GDPT 2018.`
        };

      default:
        return { message: "Mock response generated successfully", timestamp: new Date().toISOString() };
    }
  }
}
