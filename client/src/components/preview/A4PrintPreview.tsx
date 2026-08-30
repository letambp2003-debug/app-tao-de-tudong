import React from "react";
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
                  <span className="font-bold text-brand-800 ml-2">→ Đáp án: {q.saSpec.expectedAnswer} {q.saSpec.unit || ""}</span>
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
                      <div key={s.id}>+ Bước {s.stepNumber} ({s.score}đ): {s.criterion} → {s.expectedContent}</div>
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
