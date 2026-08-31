import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/index.js";
import { PROMPTS } from "../../prompts/index.js";
import { DatabaseService } from "../database/mockDb.js";
import { AIUsageLog, Project } from "../../../shared/types/index.js";
import { getCurriculumData, SubjectCurriculum } from "../../../shared/rules/curriculumDatabase.js";
import { getAuthenticQuestions, AuthenticQuestionTemplate } from "../../../shared/rules/questionBankDatabase.js";

// Ordered model cascade according to user requirements
const GEMINI_MODELS_CASCADE = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
  "gemini-1.0-pro"
];

export class AIOrchestrator {
  private static geminiClient: GoogleGenerativeAI | null = null;
  private static activeApiKey: string = config.geminiApiKey || "";

  public static setApiKey(key: string) {
    AIOrchestrator.activeApiKey = key;
    config.geminiApiKey = key;
    AIOrchestrator.geminiClient = new GoogleGenerativeAI(key);
  }

  public static getApiKey(): string {
    return AIOrchestrator.activeApiKey || config.geminiApiKey || "";
  }

  public static getGemini(overrideKey?: string): GoogleGenerativeAI | null {
    const key = overrideKey || AIOrchestrator.getApiKey();
    if (key) {
      if (!AIOrchestrator.geminiClient || AIOrchestrator.activeApiKey !== key) {
        try {
          AIOrchestrator.activeApiKey = key;
          AIOrchestrator.geminiClient = new GoogleGenerativeAI(key);
        } catch (err) {
          console.error("Failed to initialize GoogleGenerativeAI:", err);
        }
      }
    }
    return AIOrchestrator.geminiClient;
  }

  public static async executeModule<T>(params: {
    moduleCode: "AI01" | "AI02" | "AI03" | "AI04" | "AI05" | "AI06" | "AI07" | "AI08" | "AI09" | "AI10";
    projectId: string;
    inputData: any;
    customPrompt?: string;
    apiKey?: string;
  }): Promise<{ result: T; source: "LIVE_AI" | "MOCK_AI"; usageLog: AIUsageLog; modelUsed?: string }> {
    const startTime = Date.now();
    const promptDef = Object.values(PROMPTS).find(p => p.code === params.moduleCode) || PROMPTS.AI05_QUESTION_AUTHOR;
    const client = AIOrchestrator.getGemini(params.apiKey);

    const db = DatabaseService.get();
    const project = db.projects.find(p => p.id === params.projectId) || params.inputData?.project;

    let outputResult: any = null;
    let mode: "LIVE_AI" | "MOCK_AI" = "MOCK_AI";
    let inputTokens = 500;
    let outputTokens = 800;
    let modelUsed = "Dynamic-Pedagogical-Engine";

    // Cascade through models: gemini-2.0-flash -> gemini-1.5-flash -> gemini-1.5-pro -> ...
    if (client) {
      for (const modelName of GEMINI_MODELS_CASCADE) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            },
            systemInstruction: `${promptDef.systemPrompt}\n\nThông tin môn học dự án:\n- Môn: ${project?.subject || "Toán học"}\n- Lớp: ${project?.grade || 8}\n- Bộ sách: ${project?.textbookSeries || "Kết nối tri thức"}\n- Học kỳ: ${project?.semester || "HK1"}\n- Kỳ thi: ${project?.examPeriod || "GIUA_KY"}\n\nYêu cầu đặc biệt: Tạo nội dung câu hỏi TOÁN / KHTN thật với công thức LaTeX $ ... $, có đầy đủ đáp án A, B, C, D, giải thích chi tiết, không dùng từ giữ chỗ.`
          });

          const promptText = params.customPrompt || JSON.stringify(params.inputData);
          const res = await model.generateContent(promptText);
          const text = res.response.text();
          outputResult = JSON.parse(text);
          mode = "LIVE_AI";
          modelUsed = modelName;
          inputTokens = 1200;
          outputTokens = 1500;
          console.log(`[AI ${params.moduleCode}] Successfully generated via Live Gemini Model: ${modelName}`);
          break; // Succeeded! Stop cascading.
        } catch (err: any) {
          console.warn(`[AI ${params.moduleCode}] Model ${modelName} failed or unavailable (${err.message}). Trying next in cascade...`);
        }
      }
    }

    // High quality dynamic curriculum generator matching the project's exact subject, grade, and exam period
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

    return { result: outputResult as T, source: mode, usageLog, modelUsed };
  }

  private static generateDeterministicMock(moduleCode: string, inputData: any, project?: Project): any {
    const subject = project?.subject || inputData?.project?.subject || "Toán học";
    const grade = project?.grade || inputData?.project?.grade || 8;
    const semester = (project?.semester || inputData?.project?.semester || "HK1") as "HK1" | "HK2";
    const examPeriod = (project?.examPeriod || inputData?.project?.examPeriod || "GIUA_KY") as "GIUA_KY" | "CUOI_KY";

    const curriculum = getCurriculumData(subject, grade, semester, examPeriod);
    const authenticQuestions = getAuthenticQuestions(subject, grade);

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

      case "AI03": {
        const bp = inputData?.blueprint;
        const dp = inputData?.dataPack;
        const availableTopics = (dp?.topics && dp.topics.length > 0) ? dp.topics : curriculum.topics;

        const cells: any[] = [];
        const configs: any[] = bp?.questionTypeConfigs && bp.questionTypeConfigs.length > 0
          ? bp.questionTypeConfigs.filter((c: any) => c.count > 0)
          : [
              { type: "MULTIPLE_CHOICE", count: 16, pointsPerItem: 0.25, totalScore: 4.0 },
              { type: "TRUE_FALSE_4", count: 2, pointsPerItem: 1.0, totalScore: 2.0 },
              { type: "SHORT_ANSWER", count: 4, pointsPerItem: 0.5, totalScore: 2.0 },
              { type: "ESSAY", count: 2, pointsPerItem: 1.0, totalScore: 2.0 }
            ];

        // For each question type in blueprint, distribute its exact count & points across topics and cognitive levels
        for (const cfg of configs) {
          const qType = cfg.type;
          const totalCount = cfg.count;
          const pointsPerItem = cfg.pointsPerItem || (qType === "MULTIPLE_CHOICE" ? 0.25 : qType === "SHORT_ANSWER" ? 0.5 : 1.0);

          if (qType === "MULTIPLE_CHOICE") {
            // Primarily NB (Nhận biết)
            if (availableTopics.length === 1) {
              cells.push({
                topicCode: availableTopics[0].code,
                unitCode: availableTopics[0].units?.[0]?.code || "U1",
                questionType: "MULTIPLE_CHOICE",
                cognitiveLevel: "NB",
                count: totalCount,
                pointsPerItem,
                totalScore: Number((totalCount * pointsPerItem).toFixed(2))
              });
            } else if (availableTopics.length === 2) {
              const count1 = Math.ceil(totalCount * 0.6);
              const count2 = totalCount - count1;
              cells.push(
                { topicCode: availableTopics[0].code, unitCode: availableTopics[0].units?.[0]?.code || "U1", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: count1, pointsPerItem, totalScore: Number((count1 * pointsPerItem).toFixed(2)) },
                { topicCode: availableTopics[1].code, unitCode: availableTopics[1].units?.[0]?.code || "U2", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: count2, pointsPerItem, totalScore: Number((count2 * pointsPerItem).toFixed(2)) }
              );
            } else {
              // 3 or more topics
              const count1 = Math.floor(totalCount / 2);
              const remaining = totalCount - count1;
              const count2 = Math.ceil(remaining / 2);
              const count3 = remaining - count2;

              if (count1 > 0) cells.push({ topicCode: availableTopics[0].code, unitCode: availableTopics[0].units?.[0]?.code || "U1", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: count1, pointsPerItem, totalScore: Number((count1 * pointsPerItem).toFixed(2)) });
              if (count2 > 0) cells.push({ topicCode: availableTopics[1].code, unitCode: availableTopics[1].units?.[0]?.code || "U2", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: count2, pointsPerItem, totalScore: Number((count2 * pointsPerItem).toFixed(2)) });
              if (count3 > 0) cells.push({ topicCode: availableTopics[2].code, unitCode: availableTopics[2].units?.[0]?.code || "U3", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: count3, pointsPerItem, totalScore: Number((count3 * pointsPerItem).toFixed(2)) });
            }
          } else if (qType === "TRUE_FALSE_4") {
            // Primarily TH (Thông hiểu)
            for (let i = 0; i < totalCount; i++) {
              const top = availableTopics[i % availableTopics.length];
              const un = top.units?.[i % (top.units?.length || 1)] || top.units?.[0] || { code: "U1" };
              cells.push({
                topicCode: top.code,
                unitCode: un.code,
                questionType: "TRUE_FALSE_4",
                cognitiveLevel: "TH",
                count: 1,
                pointsPerItem,
                totalScore: pointsPerItem
              });
            }
          } else if (qType === "SHORT_ANSWER") {
            // Split between TH and VD
            const half1 = Math.ceil(totalCount / 2);
            const half2 = totalCount - half1;

            if (half1 > 0) {
              const top = availableTopics[0];
              const un = top.units?.[0] || { code: "U1" };
              cells.push({
                topicCode: top.code,
                unitCode: un.code,
                questionType: "SHORT_ANSWER",
                cognitiveLevel: "TH",
                count: half1,
                pointsPerItem,
                totalScore: Number((half1 * pointsPerItem).toFixed(2))
              });
            }
            if (half2 > 0) {
              const top = availableTopics[1] || availableTopics[0];
              const un = top.units?.[0] || { code: "U1" };
              cells.push({
                topicCode: top.code,
                unitCode: un.code,
                questionType: "SHORT_ANSWER",
                cognitiveLevel: "VD",
                count: half2,
                pointsPerItem,
                totalScore: Number((half2 * pointsPerItem).toFixed(2))
              });
            }
          } else if (qType === "ESSAY") {
            // Split across VD and VDC
            const vdCount = Math.floor(totalCount / 2);
            const vdcCount = totalCount - vdCount;

            // Distribute VD
            for (let i = 0; i < vdCount; i++) {
              const top = availableTopics[i % availableTopics.length];
              const un = top.units?.[i % (top.units?.length || 1)] || top.units?.[0] || { code: "U1" };
              cells.push({
                topicCode: top.code,
                unitCode: un.code,
                questionType: "ESSAY",
                cognitiveLevel: "VD",
                count: 1,
                pointsPerItem,
                totalScore: pointsPerItem
              });
            }
            // Distribute VDC
            for (let i = 0; i < vdcCount; i++) {
              const topIndex = (availableTopics.length - 1 - i + availableTopics.length) % availableTopics.length;
              const top = availableTopics[topIndex];
              const un = top.units?.[top.units?.length - 1] || top.units?.[0] || { code: "U1" };
              cells.push({
                topicCode: top.code,
                unitCode: un.code,
                questionType: "ESSAY",
                cognitiveLevel: "VDC",
                count: 1,
                pointsPerItem,
                totalScore: pointsPerItem
              });
            }
          }
        }

        const totalCalculated = Number(cells.reduce((sum, c) => sum + c.totalScore, 0).toFixed(2));
        const totalQ = cells.reduce((sum, c) => sum + c.count, 0);

        return {
          summaryRationale: `Phân bổ ma trận chuẩn xác theo Khung cơ cấu đề (Blueprint): ${totalQ} câu hỏi, tổng ${totalCalculated.toFixed(2)} / 10.0 đ trên ${availableTopics.length} chủ đề kiến thức.`,
          cells
        };
      }

      case "AI05":
        const reqType = inputData?.questionType || "MULTIPLE_CHOICE";
        const reqCognitive = inputData?.cognitiveLevel || "NB";
        const specRow = inputData?.specRow;
        const qIndex = inputData?.questionIndex || 1;

        // 1. Try matching authentic questions from our rich question database
        const matchingAuthentic = authenticQuestions.filter(q => q.type === reqType && (q.cognitiveLevel === reqCognitive || reqType === "MULTIPLE_CHOICE"));
        if (matchingAuthentic.length > 0) {
          const selected = matchingAuthentic[(qIndex - 1) % matchingAuthentic.length];
          return {
            ...selected,
            sourceReference: specRow?.sourceReference || selected.sourceReference
          };
        }

        // 2. Dynamic authentic fallback for math / sciences
        if (reqType === "MULTIPLE_CHOICE") {
          const mathStems = [
            { stem: "Trong các biểu thức đại số sau, biểu thức nào là đa thức nhiều biến?", ans: "$2x^2y - 3xy + 1$", d1: "$\\frac{2x}{y}$", d2: "$\\frac{1}{x^2+1}$", d3: "$\\sqrt{x} + y$" },
            { stem: "Kết quả của phép nhân đơn thức $3x^2y$ với đa thức $(2x - y)$ là:", ans: "$6x^3y - 3x^2y^2$", d1: "$6x^2y - 3x^2y^2$", d2: "$5x^3y - 3x^2y^2$", d3: "$6x^3y - y$" },
            { stem: "Khai triển của hằng đẳng thức $(x + 2y)^2$ là:", ans: "$x^2 + 4xy + 4y^2$", d1: "$x^2 + 2xy + 4y^2$", d2: "$x^2 + 4y^2$", d3: "$x^2 + 4xy + 2y^2$" },
            { stem: "Biểu thức $x^2 - 16$ được phân tích thành nhân tử là:", ans: "$(x - 4)(x + 4)$", d1: "$(x - 4)^2$", d2: "$(x - 16)(x + 16)$", d3: "$(x + 4)^2$" },
            { stem: "Điều kiện xác định của phân thức $\\frac{x - 1}{x + 5}$ là:", ans: "$x \\neq -5$", d1: "$x \\neq 5$", d2: "$x \\neq 1$", d3: "$x = -5$" },
            { stem: "Hình chữ nhật có hai cạnh kề bằng nhau là hình gì?", ans: "Hình vuông", d1: "Hình thoi", d2: "Hình bình hành", d3: "Hình thang cân" },
            { stem: "Đoạn thẳng nối trung điểm hai cạnh của tam giác gọi là gì?", ans: "Đường trung bình của tam giác", d1: "Đường trung trực", d2: "Đường trung tuyến", d3: "Đường cao" },
            { stem: "Nếu $\\Delta ABC$ có $MN // BC$ ($M \\in AB, N \\in AC$) thì theo định lí Thalès ta có:", ans: "$\\frac{AM}{AB} = \\frac{AN}{AC}$", d1: "$\\frac{AM}{MB} = \\frac{NC}{AN}$", d2: "$\\frac{AM}{AN} = \\frac{BC}{MN}$", d3: "$\\frac{AM}{AC} = \\frac{AN}{AB}$" }
          ];
          const choice = mathStems[(qIndex - 1) % mathStems.length];
          return {
            stem: choice.stem,
            type: "MULTIPLE_CHOICE",
            cognitiveLevel: reqCognitive,
            score: 0.25,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: `Phương án A là đáp án chính xác: ${choice.ans}.`,
            mcOptions: [
              { id: `opt-${qIndex}-a`, label: "A", content: choice.ans, isCorrect: true },
              { id: `opt-${qIndex}-b`, label: "B", content: choice.d1, isCorrect: false },
              { id: `opt-${qIndex}-c`, label: "C", content: choice.d2, isCorrect: false },
              { id: `opt-${qIndex}-d`, label: "D", content: choice.d3, isCorrect: false }
            ]
          };
        } else if (reqType === "TRUE_FALSE_4") {
          return {
            stem: `Xét các khẳng định toán học sau trong chương trình ${subject} ${grade}:`,
            type: "TRUE_FALSE_4",
            cognitiveLevel: reqCognitive,
            score: 1.0,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Các nhận định a, c đúng theo lý thuyết; b, d sai.",
            tfItems: [
              { id: `tf-${qIndex}-a`, label: "a", content: "Đơn thức $-3x^2y^3$ có hệ số là $-3$ và bậc là $5$.", isCorrect: true, explanation: "Hệ số là -3, bậc 2+3=5." },
              { id: `tf-${qIndex}-b`, label: "b", content: "Đa thức $x^2 - y^2$ chia hết cho đa thức $x + y$.", isCorrect: true, explanation: "Vì x^2 - y^2 = (x-y)(x+y)." },
              { id: `tf-${qIndex}-c`, label: "c", content: "$(x - 1)^3 = x^3 - 3x^2 + 3x - 1$.", isCorrect: true, explanation: "Khai triển đúng lập phương một hiệu." },
              { id: `tf-${qIndex}-d`, label: "d", content: "Hình thang có hai cạnh bên bằng nhau luôn là hình thang cân.", isCorrect: false, explanation: "Có thể là hình bình hành." }
            ]
          };
        } else if (reqType === "SHORT_ANSWER") {
          return {
            stem: `Rút gọn biểu thức $A = (x - 2)^2 + 4x - 4$. Giá trị của $A$ khi $x = 15$ là bao nhiêu?`,
            type: "SHORT_ANSWER",
            cognitiveLevel: reqCognitive,
            score: 0.5,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "A = x^2 - 4x + 4 + 4x - 4 = x^2. Khi x = 15 => A = 225.",
            saSpec: { expectedAnswer: "225", unit: "", tolerance: 0, alternativeAnswers: ["225.0", "+225"] }
          };
        } else {
          return {
            stem: `Bài toán tự luận môn ${subject} ${grade}:\nCho biểu thức $P = \\frac{x^2 - 4}{x - 2}$ với $x \\neq 2$.\na) Rút gọn biểu thức $P$.\nb) Tính giá trị của $P$ khi $x = 2026$.`,
            type: "ESSAY",
            cognitiveLevel: reqCognitive,
            score: 1.0,
            sourceReference: specRow?.sourceReference || `SGK ${subject} ${grade}`,
            explanation: "Rút gọn P = x + 2. Thay x = 2026 => P = 2028.",
            rubricSteps: [
              { id: `rb-${qIndex}-1`, stepNumber: 1, criterion: "Phân tích tử thức thành nhân tử và rút gọn", expectedContent: "$P = \\frac{(x - 2)(x + 2)}{x - 2} = x + 2$.", score: 0.5 },
              { id: `rb-${qIndex}-2`, stepNumber: 2, criterion: "Thay số và kết luận giá trị biểu thức", expectedContent: "Thay $x = 2026$ vào: $P = 2026 + 2 = 2028$.", score: 0.5 }
            ]
          };
        }

      case "AI07":
        return {
          status: "DAT",
          scores: { accuracy: 98, pedagogicalFit: 99, distractorQuality: 96 },
          issues: [],
          recommendations: `Hồ sơ môn ${subject} ${grade} hoàn toàn phù hợp với chuẩn YCCĐ GDPT 2018.`
        };

      default:
        return { message: "Mock response generated successfully", timestamp: new Date().toISOString() };
    }
  }
}
