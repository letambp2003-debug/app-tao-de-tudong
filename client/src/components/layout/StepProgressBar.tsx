import React from "react";
import { CheckCircle2 } from "lucide-react";
import { ProjectStatus } from "@shared/types/index.js";

export interface StepDef {
  key: string;
  title: string;
}

export const WORKFLOW_STEPS: StepDef[] = [
  { key: "INFO", title: "1. Khởi tạo đề" },
  { key: "SOURCES", title: "2. Nguồn tài liệu" },
  { key: "DATAPACK", title: "3. Data Pack" },
  { key: "BLUEPRINT", title: "4. Cơ cấu đề" },
  { key: "MATRIX", title: "5. Ma trận" },
  { key: "SPECIFICATION", title: "6. Bản đặc tả" },
  { key: "QUESTIONS", title: "7. Câu hỏi & Đề" },
  { key: "VALIDATE", title: "8. Kiểm định" },
  { key: "EXPORT", title: "9. Xuất bản" }
];

interface StepProgressBarProps {
  currentStepKey: string;
  onSelectStep: (stepKey: string) => void;
  projectStatus: ProjectStatus;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStepKey,
  onSelectStep
}) => {
  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.key === currentStepKey);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 overflow-x-auto">
      <div className="flex items-center min-w-max gap-2">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCurrent = step.key === currentStepKey;
          const isPassed = idx < currentIdx;

          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => onSelectStep(step.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-brand-600 text-white shadow-sm"
                    : isPassed
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent ? "bg-white text-brand-600 font-bold" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </div>
                )}
                <span>{step.title}</span>
              </button>
              {idx < WORKFLOW_STEPS.length - 1 && <div className="w-3 h-0.5 bg-slate-200" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
