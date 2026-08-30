import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/index.js";
import { PROMPTS } from "../../prompts/index.js";
import {
  AI01_SourceExtractorSchema,
  AI02_CurriculumMapperSchema,
  AI03_MatrixAdvisorSchema,
  AI04_SpecWriterSchema,
  AI05_QuestionAuthorSchema,
  AI07_ContentReviewerSchema
} from "../../../shared/schemas/index.js";
import { DatabaseService } from "../database/mockDb.js";
import { AIUsageLog } from "../../../shared/types/index.js";

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
          systemInstruction: promptDef.systemPrompt
        });

        const promptText = params.customPrompt || JSON.stringify(params.inputData);
        const res = await model.generateContent(promptText);
        const text = res.response.text();
        outputResult = JSON.parse(text);
        mode = "LIVE_AI";
        inputTokens = 1200;
        outputTokens = 1500;
      } catch (err) {
        console.warn(`[AI ${params.moduleCode}] Live API error, falling back to realistic mock engine:`, err);
      }
    }

    // High quality deterministic fallback generator if live API is not configured or failed
    if (!outputResult) {
      outputResult = AIOrchestrator.generateDeterministicMock(params.moduleCode, params.inputData);
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

    const db = DatabaseService.get();
    db.aiUsageLogs.unshift(usageLog);
    DatabaseService.save();

    return { result: outputResult as T, source: mode, usageLog };
  }

  private static generateDeterministicMock(moduleCode: string, inputData: any): any {
    switch (moduleCode) {
      case "AI01":
        return {
          totalPages: 38,
          sourceTypeDetected: "SGK Khoa học tự nhiên 8 - Bộ Kết nối tri thức",
          fragments: [
            { pageNumber: 12, content: "Biến đổi vật lí và biến đổi hóa học...", topicDetected: "Chất và sự biến đổi của chất" },
            { pageNumber: 16, content: "Định luật bảo toàn khối lượng...", topicDetected: "Phản ứng hóa học" },
            { pageNumber: 22, content: "Mol, khối lượng mol, thể tích mol chất khí ở đkc: V = n * 24.79...", topicDetected: "Mol và chất khí" },
            { pageNumber: 30, content: "Dung dịch, nồng độ C% = (m_ct/m_dd)*100%, CM = n/V...", topicDetected: "Dung dịch" }
          ]
        };

      case "AI02":
        return {
          topics: [
            { code: "CD1", name: "Chất và sự biến đổi của chất", order: 1 },
            { code: "CD2", name: "Khối lượng riêng và áp suất", order: 2 }
          ],
          units: [
            { topicCode: "CD1", code: "B1", name: "Phản ứng hóa học và Biến đổi hóa học", order: 1 },
            { topicCode: "CD1", code: "B2", name: "Định luật bảo toàn khối lượng và PTHH", order: 2 },
            { topicCode: "CD1", code: "B3", name: "Mol, tỉ khối chất khí và dung dịch", order: 3 },
            { topicCode: "CD2", code: "B4", name: "Khối lượng riêng và Áp suất chất lỏng", order: 1 }
          ],
          yccds: [
            { unitCode: "B1", code: "YCCD_KHTN8_01", description: "Phân biệt được hiện tượng vật lí và hiện tượng hóa học trong đời sống.", cognitiveLevelDefault: "NB", competencyCode: "NTHK", sourceReference: "SGK KHTN 8 - Bài 2, tr.12-14" },
            { unitCode: "B2", code: "YCCD_KHTN8_02", description: "Phát biểu được định luật bảo toàn khối lượng và vận dụng tính khối lượng sản phẩm.", cognitiveLevelDefault: "TH", competencyCode: "VD_KTKN", sourceReference: "SGK KHTN 8 - Bài 3, tr.16-19" },
            { unitCode: "B3", code: "YCCD_KHTN8_03", description: "Tính được số mol, thể tích chất khí ở đkc ($V = n \\times 24,79$) và nồng độ dung dịch.", cognitiveLevelDefault: "VD", competencyCode: "VD_KTKN", sourceReference: "SGK KHTN 8 - Bài 4, tr.22-31" },
            { unitCode: "B4", code: "YCCD_KHTN8_04", description: "Vận dụng công thức khối lượng riêng $D = \\frac{m}{V}$ và áp suất $p = \\frac{F}{S}$ giải quyết bài toán thực tế.", cognitiveLevelDefault: "VDC", competencyCode: "THTN", sourceReference: "SGK KHTN 8 - Bài 14, tr.60-65" }
          ]
        };

      case "AI03":
        return {
          summaryRationale: "Đề xuất phân bổ ma trận theo cấu hình Blueprint 40% NB - 30% TH - 20% VD - 10% VDC với 16 TN 4 lựa chọn, 2 Đúng-Sai, 4 Trả lời ngắn, 2 Tự luận.",
          cells: [
            { topicCode: "CD1", unitCode: "B1", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 6, pointsPerItem: 0.25, totalScore: 1.5 },
            { topicCode: "CD1", unitCode: "B2", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
            { topicCode: "CD1", unitCode: "B3", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "TH", count: 2, pointsPerItem: 0.25, totalScore: 0.5 },
            { topicCode: "CD1", unitCode: "B1", questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
            { topicCode: "CD1", unitCode: "B3", questionType: "SHORT_ANSWER", cognitiveLevel: "TH", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
            { topicCode: "CD1", unitCode: "B3", questionType: "SHORT_ANSWER", cognitiveLevel: "VD", count: 2, pointsPerItem: 0.5, totalScore: 1.0 },
            { topicCode: "CD1", unitCode: "B2", questionType: "ESSAY", cognitiveLevel: "VD", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
            { topicCode: "CD2", unitCode: "B4", questionType: "MULTIPLE_CHOICE", cognitiveLevel: "NB", count: 4, pointsPerItem: 0.25, totalScore: 1.0 },
            { topicCode: "CD2", unitCode: "B4", questionType: "TRUE_FALSE_4", cognitiveLevel: "TH", count: 1, pointsPerItem: 1.0, totalScore: 1.0 },
            { topicCode: "CD2", unitCode: "B4", questionType: "ESSAY", cognitiveLevel: "VDC", count: 1, pointsPerItem: 1.0, totalScore: 1.0 }
          ]
        };

      case "AI05":
        const type = inputData?.questionType || "MULTIPLE_CHOICE";
        if (type === "MULTIPLE_CHOICE") {
          return {
            stem: "Hiện tượng nào sau đây thể hiện biến đổi hóa học trong tự nhiên?",
            type: "MULTIPLE_CHOICE",
            cognitiveLevel: "NB",
            score: 0.25,
            sourceReference: "SGK KHTN 8 - Bài 2, tr.12",
            explanation: "Thanh sắt để lâu trong không khí ẩm bị gỉ sét tạo ra chất mới oxit sắt.",
            mcOptions: [
              { label: "A", content: "Nước đá tan chảy thành nước lỏng", isCorrect: false },
              { label: "B", content: "Thanh sắt để ngoài không khí ẩm bị gỉ sét", isCorrect: true },
              { label: "C", content: "Cồn đựng trong lọ hở bị bay hơi dần", isCorrect: false },
              { label: "D", content: "Hòa tan muối ăn vào nước lọc", isCorrect: false }
            ]
          };
        } else if (type === "TRUE_FALSE_4") {
          return {
            stem: "Xét các hiện tượng biến đổi chất trong thực tiễn đời sống:",
            type: "TRUE_FALSE_4",
            cognitiveLevel: "TH",
            score: 1.0,
            sourceReference: "SGK KHTN 8 - Bài 2, tr.13",
            explanation: "a, b, d là nhận định đúng; c là nhận định sai.",
            tfItems: [
              { label: "a", content: "Cồn bay hơi là hiện tượng biến đổi vật lí.", isCorrect: true, explanation: "Chỉ chuyển thể." },
              { label: "b", content: "Đốt cháy củi tạo khí carbon dioxide là biến đổi hóa học.", isCorrect: true, explanation: "Có chất mới." },
              { label: "c", content: "Hòa tan đường vào nước là hiện tượng biến đổi hóa học.", isCorrect: false, explanation: "Biến đổi vật lí." },
              { label: "d", content: "Sắt bị gỉ trong không khí ẩm là hiện tượng biến đổi hóa học.", isCorrect: true, explanation: "Tạo chất mới." }
            ]
          };
        } else if (type === "SHORT_ANSWER") {
          return {
            stem: "Tính thể tích (lít) của $0,2\\text{ mol}$ khí $CO_2$ ở điều kiện chuẩn ($25^\\circ C, 1\\text{ bar}$):",
            type: "SHORT_ANSWER",
            cognitiveLevel: "TH",
            score: 0.5,
            sourceReference: "SGK KHTN 8 - Bài 4, tr.25",
            explanation: "V = 0.2 * 24.79 = 4.96 lít.",
            saSpec: {
              expectedAnswer: "4,96",
              unit: "lít",
              tolerance: 0.01,
              alternativeAnswers: ["4.96", "4,958"]
            }
          };
        } else {
          return {
            stem: "Đốt cháy hoàn toàn $5,6\\text{ g}$ bột sắt ($Fe$) trong khí chlorine ($Cl_2$) dư thu được $16,25\\text{ g}$ muối sắt(III) chloride ($FeCl_3$).\na) Viết phương trình hóa học của phản ứng.\nb) Dựa vào định luật bảo toàn khối lượng, tính khối lượng khí $Cl_2$ đã tham gia phản ứng.",
            type: "ESSAY",
            cognitiveLevel: "VD",
            score: 1.0,
            sourceReference: "SGK KHTN 8 - Bài 3, tr.18",
            explanation: "PTHH 2Fe + 3Cl2 -> 2FeCl3. m_Cl2 = 16.25 - 5.6 = 10.65 gam.",
            rubricSteps: [
              { stepNumber: 1, criterion: "Viết đúng PTHH có cân bằng và nhiệt độ", expectedContent: "$2Fe + 3Cl_2 \\xrightarrow{t^\\circ} 2FeCl_3$. Tỉ lệ $2 : 3$.", score: 0.5 },
              { stepNumber: 2, criterion: "Tính đúng khối lượng Cl2 theo ĐLBTKL", expectedContent: "$m_{Cl_2} = 16,25 - 5,6 = 10,65\\text{ gam}$.", score: 0.5 }
            ]
          };
        }

      case "AI07":
        return {
          status: "DAT",
          scores: { accuracy: 95, pedagogicalFit: 98, distractorQuality: 92 },
          issues: [],
          recommendations: "Câu hỏi chuẩn xác về mặt khoa học và bám sát YCCĐ chương trình GDPT 2018."
        };

      default:
        return { message: "Mock response generated successfully", timestamp: new Date().toISOString() };
    }
  }
}
