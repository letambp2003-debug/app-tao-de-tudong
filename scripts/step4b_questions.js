import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. QuestionCard.tsx
write("client/src/components/questions/QuestionCard.tsx", `import React from "react";
import { Question, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";
import { Badge } from "../common/Badge.js";
import { Edit2, Trash2, Sparkles } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit?: (question: Question) => void;
  onDelete?: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onEdit, onDelete }) => {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-brand-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-slate-900 text-sm">Câu {index + 1}</span>
          <Badge variant="primary">{question.score} điểm</Badge>
          <Badge
            variant={
              question.cognitiveLevel === "NB"
                ? "success"
                : question.cognitiveLevel === "TH"
                ? "primary"
                : question.cognitiveLevel === "VD"
                ? "warning"
                : "purple"
            }
          >
            {COGNITIVE_LEVEL_LABELS[question.cognitiveLevel]}
          </Badge>
          <Badge variant="neutral">{QUESTION_TYPE_LABELS[question.type]}</Badge>
          {question.aiGenerated && (
            <Badge variant="purple">
              <Sparkles className="w-3 h-3" /> AI Author
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(question)}
              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
              title="Chỉnh sửa câu hỏi"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(question.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Xóa câu hỏi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-slate-900 font-medium text-sm leading-relaxed">
        <KaTeXRenderer content={question.stem} />
      </div>

      {question.type === "MULTIPLE_CHOICE" && question.mcOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
          {question.mcOptions.map(opt => (
            <div
              key={opt.id}
              className={\`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed \${
                opt.isCorrect
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                  : "bg-slate-50/60 border-slate-200 text-slate-700"
              }\`}
            >
              <span className={\`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 \${
                opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
              }\`}>
                {opt.label}
              </span>
              <div className="flex-1">
                <KaTeXRenderer content={opt.content} />
              </div>
            </div>
          ))}
        </div>
      )}

      {question.type === "TRUE_FALSE_4" && question.tfItems && (
        <div className="space-y-2 pt-2">
          {question.tfItems.map(item => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="font-bold text-slate-700">{item.label})</span>
                <div>
                  <KaTeXRenderer content={item.content} />
                  {item.explanation && (
                    <div className="text-slate-500 mt-1 text-[11px] italic">Giải thích: {item.explanation}</div>
                  )}
                </div>
              </div>
              <Badge variant={item.isCorrect ? "success" : "danger"}>
                {item.isCorrect ? "ĐÚNG" : "SAI"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {question.type === "SHORT_ANSWER" && question.saSpec && (
        <div className="p-3 bg-brand-50/60 border border-brand-200 rounded-xl text-xs flex items-center gap-3">
          <span className="font-bold text-brand-900">Đáp án chuẩn:</span>
          <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-brand-200 font-bold text-brand-700">
            {question.saSpec.expectedAnswer} {question.saSpec.unit || ""}
          </span>
        </div>
      )}

      {question.type === "ESSAY" && question.rubricSteps && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700">Hướng dẫn chấm & Rubric biểu điểm:</div>
          {question.rubricSteps.map(step => (
            <div key={step.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">Bước {step.stepNumber}: {step.criterion}</span>
                <div className="text-slate-600"><KaTeXRenderer content={step.expectedContent} /></div>
              </div>
              <Badge variant="primary">{step.score} đ</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Xuất xứ: {question.sourceReference}</span>
      </div>
    </div>
  );
};
`);

// 2. QuestionEditorModal.tsx
write("client/src/components/questions/QuestionEditorModal.tsx", `import React, { useState } from "react";
import { Question } from "@shared/types/index.js";
import { Modal } from "../common/Modal.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

interface QuestionEditorModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Question) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({ question, isOpen, onClose, onSave }) => {
  if (!question) return null;

  const [formData, setFormData] = useState<Question>({ ...question });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={\`Biên tập câu hỏi \${formData.orderNumber} (\${formData.type})\`}
      maxWidth="4xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs">
            Lưu thay đổi
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi (LaTeX $...$):</label>
          <textarea
            value={formData.stem}
            onChange={e => setFormData({ ...formData, stem: e.target.value })}
            rows={3}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="mt-1.5 p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">Xem trước:</span>
            <KaTeXRenderer content={formData.stem} />
          </div>
        </div>

        {formData.type === "MULTIPLE_CHOICE" && formData.mcOptions && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Các phương án:</label>
            {formData.mcOptions.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={opt.isCorrect}
                  onChange={() => {
                    const newOpts = formData.mcOptions!.map((o, i) => ({ ...o, isCorrect: i === idx }));
                    setFormData({ ...formData, mcOptions: newOpts });
                  }}
                  className="w-4 h-4 text-brand-600"
                />
                <span className="font-bold text-sm w-5">{opt.label}.</span>
                <input
                  type="text"
                  value={opt.content}
                  onChange={e => {
                    const newOpts = [...formData.mcOptions!];
                    newOpts[idx].content = e.target.value;
                    setFormData({ ...formData, mcOptions: newOpts });
                  }}
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
`);

console.log("Step 4b Questions written successfully.");
