import React from "react";
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
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed ${
                opt.isCorrect
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                  : "bg-slate-50/60 border-slate-200 text-slate-700"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
              }`}>
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
