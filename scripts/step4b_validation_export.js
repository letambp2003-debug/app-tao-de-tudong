import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. ValidationReportPanel.tsx
write("client/src/components/validation/ValidationReportPanel.tsx", `import React, { useState } from "react";
import { ValidationReport } from "@shared/types/index.js";
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "../common/Badge.js";

interface ValidationReportPanelProps {
  report: ValidationReport | null;
  onRefresh: () => void;
}

export const ValidationReportPanel: React.FC<ValidationReportPanelProps> = ({ report, onRefresh }) => {
  const [filter, setFilter] = useState<"ALL" | "FAILED">("ALL");

  if (!report) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
        <div className="text-slate-500 text-sm">Chưa có kết quả kiểm định.</div>
        <button onClick={onRefresh} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Chạy kiểm định
        </button>
      </div>
    );
  }

  const filteredRules = report.ruleResults.filter(r => {
    if (filter === "FAILED") return !r.passed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div
        className={\`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 \${
          report.allPassed
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            : "bg-rose-50/90 border-rose-200 text-rose-950"
        }\`}
      >
        <div className="flex items-center gap-4">
          <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md \${
            report.allPassed ? "bg-emerald-600" : "bg-rose-600"
          }\`}>
            {report.allPassed ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {report.allPassed ? "HỒ SƠ ĐỀ THI ĐẠT CHUẨN KIỂM ĐỊNH" : "PHÁT HIỆN LỖI CẦN XỬ LÝ"}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              Đã kiểm tra 20 quy tắc kỹ thuật (V01 - V20) | {new Date(report.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/80 rounded-xl text-xs font-bold text-rose-700 border border-rose-200">
              {report.criticalErrorsCount} Lỗi nghiêm trọng
            </span>
            <span className="px-3 py-1 bg-white/80 rounded-xl text-xs font-bold text-amber-700 border border-amber-200">
              {report.warningsCount} Cảnh báo
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Kiểm định lại"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Chi tiết 20 quy tắc kiểm định (V01 - V20)</h4>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={\`px-3 py-1 rounded-lg font-semibold \${filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}\`}
            >
              Tất cả ({report.ruleResults.length})
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={\`px-3 py-1 rounded-lg font-semibold \${filter === "FAILED" ? "bg-white text-rose-600 shadow-xs" : "text-slate-500"}\`}
            >
              Chưa đạt ({report.ruleResults.filter(r => !r.passed).length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRules.map(rule => (
            <div key={rule.ruleCode} className="py-3.5 flex items-start gap-3.5">
              <div className="mt-0.5">
                {rule.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : rule.severity === "CRITICAL" ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">{rule.ruleCode}</span>
                  <span className="font-bold text-sm text-slate-900">{rule.ruleName}</span>
                  <Badge variant={rule.severity === "CRITICAL" ? "danger" : "neutral"}>
                    {rule.severity}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">{rule.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
`);

// 2. TraceabilityMatrix.tsx
write("client/src/components/validation/TraceabilityMatrix.tsx", `import React from "react";
import { TraceabilityLink, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { Badge } from "../common/Badge.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

export const TraceabilityMatrix: React.FC<{ items: TraceabilityLink[] }> = ({ items }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase">
            <th className="py-3 px-3">Câu</th>
            <th className="py-3 px-3">Nội dung câu hỏi</th>
            <th className="py-3 px-3">Dạng câu</th>
            <th className="py-3 px-3">Mức độ</th>
            <th className="py-3 px-3">Yêu cầu cần đạt</th>
            <th className="py-3 px-3">Nguồn SGK</th>
            <th className="py-3 px-3 text-center">Đáp án</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => (
            <tr key={item.questionId} className="hover:bg-slate-50">
              <td className="py-2.5 px-3 font-bold text-slate-900">{item.questionOrder}</td>
              <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                <KaTeXRenderer content={item.stem} />
              </td>
              <td className="py-2.5 px-3">
                <Badge variant="neutral">{QUESTION_TYPE_LABELS[item.questionType]}</Badge>
              </td>
              <td className="py-2.5 px-3">
                <Badge variant="primary">{COGNITIVE_LEVEL_LABELS[item.cognitiveLevel]}</Badge>
              </td>
              <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{item.yccdText}</td>
              <td className="py-2.5 px-3 text-slate-500">{item.sourceReference}</td>
              <td className="py-2.5 px-3 text-center">
                {item.hasRubricOrAnswer ? <Badge variant="success">Có</Badge> : <Badge variant="danger">Thiếu</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
`);

// 3. A4PrintPreview.tsx
write("client/src/components/preview/A4PrintPreview.tsx", `import React from "react";
import { Project, Question } from "@shared/types/index.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";
import { Printer } from "lucide-react";

interface A4PrintPreviewProps {
  project: Project;
  questions: Question[];
  showAnswers?: boolean;
}

export const A4PrintPreview: React.FC<A4PrintPreviewProps> = ({ project, questions, showAnswers = false }) => {
  const part1 = questions.filter(q => q.section === "PHAN_1" || q.type === "MULTIPLE_CHOICE");
  const part2 = questions.filter(q => q.section === "PHAN_2" || q.type === "TRUE_FALSE_4");
  const part3 = questions.filter(q => q.section === "PHAN_3" || q.type === "SHORT_ANSWER");
  const part4 = questions.filter(q => q.section === "PHAN_4" || q.type === "ESSAY");

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 shadow-sm"
        >
          <Printer className="w-4 h-4" /> In đề kiểm tra (A4)
        </button>
      </div>

      <div className="printable-area bg-white p-10 max-w-[210mm] mx-auto border border-slate-300 rounded-xl shadow-lg min-h-[297mm] text-black font-serif text-sm leading-relaxed">
        <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
          <div className="text-center font-bold text-xs uppercase space-y-1">
            <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
            <div className="font-extrabold text-sm">{project.organizationName || "TRƯỜNG THCS CHU VĂN AN"}</div>
            <div>MÃ ĐỀ THI: 101</div>
          </div>
          <div className="text-center font-bold text-xs uppercase space-y-1">
            <div className="text-sm font-extrabold">{project.name}</div>
            <div>Môn: {project.subject} - Khối {project.grade}</div>
            <div className="font-normal italic">Thời gian: {project.durationMinutes} phút</div>
          </div>
        </div>

        <div className="border border-black p-3 mb-6 flex justify-between text-xs">
          <div>Họ và tên thí sinh: ................................................................</div>
          <div>Lớp: ......... SBD: .........</div>
        </div>

        {part1.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="font-bold text-xs uppercase">
              PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (4,0 điểm).
            </div>
            {part1.map((q, idx) => (
              <div key={q.id} className="space-y-1 text-xs">
                <div className="font-semibold">
                  <span>Câu {idx + 1}: </span>
                  <KaTeXRenderer content={q.stem} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-4">
                  {q.mcOptions?.map(opt => (
                    <div key={opt.id} className={showAnswers && opt.isCorrect ? "font-bold text-emerald-800" : ""}>
                      <span>{opt.label}. </span>
                      <KaTeXRenderer content={opt.content} />
                      {showAnswers && opt.isCorrect && " (Đ)"}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {part2.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="font-bold text-xs uppercase">
              PHẦN II. Câu trắc nghiệm Đúng - Sai (2,0 điểm).
            </div>
            {part2.map((q, idx) => (
              <div key={q.id} className="space-y-1 text-xs">
                <div className="font-semibold">
                  <span>Câu {idx + 1}: </span>
                  <KaTeXRenderer content={q.stem} />
                </div>
                <div className="space-y-1 pl-4">
                  {q.tfItems?.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span>{item.label}) </span>
                        <KaTeXRenderer content={item.content} />
                      </div>
                      {showAnswers && <span className="font-bold">[{item.isCorrect ? "Đ" : "S"}]</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {part3.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="font-bold text-xs uppercase">
              PHẦN III. Câu trắc nghiệm trả lời ngắn (2,0 điểm).
            </div>
            {part3.map((q, idx) => (
              <div key={q.id} className="text-xs">
                <span className="font-semibold">Câu {idx + 1}: </span>
                <KaTeXRenderer content={q.stem} />
                {showAnswers && q.saSpec && (
                  <span className="font-bold text-brand-800 ml-2">-> Đáp án: {q.saSpec.expectedAnswer} {q.saSpec.unit || ""}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {part4.length > 0 && (
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase">
              PHẦN IV. Tự luận (2,0 điểm).
            </div>
            {part4.map((q, idx) => (
              <div key={q.id} className="text-xs space-y-1">
                <div>
                  <span className="font-semibold">Câu {idx + 1}: </span>
                  <KaTeXRenderer content={q.stem} />
                </div>
                {showAnswers && q.rubricSteps && (
                  <div className="pl-4 text-[11px] text-slate-700 bg-slate-50 p-2 rounded">
                    <div className="font-bold">Biểu điểm:</div>
                    {q.rubricSteps.map(s => (
                      <div key={s.id}>+ Bước {s.stepNumber} ({s.score}đ): {s.criterion} -> {s.expectedContent}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center font-bold text-xs mt-10">--- HẾT ---</div>
      </div>
    </div>
  );
};
`);

// 4. ExportModal.tsx
write("client/src/components/export/ExportModal.tsx", `import React from "react";
import { Modal } from "../common/Modal.js";
import { FileSpreadsheet, FileText, Archive } from "lucide-react";
import { api } from "../../services/api.js";

interface ExportModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ projectId, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xuất trọn bộ hồ sơ đề kiểm tra" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Định dạng chuẩn theo Nghị định 30/2020/NĐ-CP và hướng dẫn khảo thí GDPT 2018.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={api.getExcelExportUrl(projectId)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
          >
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Ma trận & Đặc tả (.XLSX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Bảng tính Excel tự động tính toán</div>
            </div>
          </a>

          <a
            href={api.getWordExportUrl(projectId, false)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-brand-600 text-white rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Đề kiểm tra (.DOCX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Tệp Word in cho học sinh</div>
            </div>
          </a>

          <a
            href={api.getWordExportUrl(projectId, true)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors"
          >
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Hướng dẫn chấm (.DOCX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Đáp án chi tiết & Rubric tự luận</div>
            </div>
          </a>

          <a
            href={api.getZipExportUrl(projectId)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors"
          >
            <div className="p-3 bg-amber-600 text-white rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Gói dự án (.ZIP)</div>
              <div className="text-xs text-slate-500 mt-0.5">Bao gồm Word, Excel, JSON và Báo cáo</div>
            </div>
          </a>
        </div>
      </div>
    </Modal>
  );
};
`);

console.log("Step 4b Validation & Export written successfully.");
