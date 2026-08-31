import React, { useState, useEffect } from "react";
import {
  Blueprint,
  BlueprintQuestionTypeConfig,
  QuestionType,
  QUESTION_TYPE_LABELS
} from "@shared/types/index.js";
import { Badge } from "../common/Badge.js";
import {
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  HelpCircle,
  Plus,
  Minus,
  Check,
  RotateCcw
} from "lucide-react";

interface BlueprintEditorProps {
  blueprint: Blueprint;
  onSave: (updated: Blueprint) => void;
  readOnly?: boolean;
}

const QUESTION_TYPE_INFO: Record<
  QuestionType,
  { name: string; desc: string; defaultPoints: number; icon: string }
> = {
  MULTIPLE_CHOICE: {
    name: "Trắc nghiệm nhiều lựa chọn",
    desc: "Câu hỏi có 4 phương án A, B, C, D (chọn 1 phương án đúng duy nhất). Thường 0.25 đ/câu.",
    defaultPoints: 0.25,
    icon: "🔘"
  },
  TRUE_FALSE_4: {
    name: "Trắc nghiệm Đúng - Sai",
    desc: "Mỗi câu gồm 4 ý a, b, c, d (học sinh chọn Đúng hoặc Sai cho từng ý). Thường 1.0 đ/câu.",
    defaultPoints: 1.0,
    icon: "☑️"
  },
  SHORT_ANSWER: {
    name: "Trắc nghiệm trả lời ngắn",
    desc: "Học sinh tự điền đáp số/giá trị số hoặc thuật ngữ ngắn. Thường 0.5 đ/câu.",
    defaultPoints: 0.5,
    icon: "✍️"
  },
  ESSAY: {
    name: "Tự luận",
    desc: "Học sinh trình bày bài làm chi tiết có kèm Rubric biểu điểm từng bước. Thường 1.0 đ - 2.5 đ/câu.",
    defaultPoints: 1.0,
    icon: "📝"
  }
};

const PRESET_TEMPLATES = [
  {
    id: "GDPT_THCS_4_TYPES",
    name: "Chuẩn GDPT 2018 THCS (4 dạng kết hợp)",
    desc: "16 TN nhiều lựa chọn (4.0đ) + 2 Đúng-Sai (2.0đ) + 4 Trả lời ngắn (2.0đ) + 2 Tự luận (2.0đ)",
    configs: [
      { type: "MULTIPLE_CHOICE" as QuestionType, count: 16, pointsPerItem: 0.25, totalScore: 4.0 },
      { type: "TRUE_FALSE_4" as QuestionType, count: 2, pointsPerItem: 1.0, totalScore: 2.0 },
      { type: "SHORT_ANSWER" as QuestionType, count: 4, pointsPerItem: 0.5, totalScore: 2.0 },
      { type: "ESSAY" as QuestionType, count: 2, pointsPerItem: 1.0, totalScore: 2.0 }
    ],
    weights: { NB: 40, TH: 30, VD: 20, VDC: 10 }
  },
  {
    id: "GDPT_THPT_2025_3_TYPES",
    name: "Định dạng cấu trúc THPT 2025 (3 phần trắc nghiệm)",
    desc: "18 TN nhiều lựa chọn (4.5đ) + 4 Đúng-Sai (4.0đ) + 3 Trả lời ngắn (1.5đ)",
    configs: [
      { type: "MULTIPLE_CHOICE" as QuestionType, count: 18, pointsPerItem: 0.25, totalScore: 4.5 },
      { type: "TRUE_FALSE_4" as QuestionType, count: 4, pointsPerItem: 1.0, totalScore: 4.0 },
      { type: "SHORT_ANSWER" as QuestionType, count: 3, pointsPerItem: 0.5, totalScore: 1.5 },
      { type: "ESSAY" as QuestionType, count: 0, pointsPerItem: 1.0, totalScore: 0.0 }
    ],
    weights: { NB: 40, TH: 30, VD: 20, VDC: 10 }
  },
  {
    id: "TRADITIONAL_MC_ESSAY",
    name: "Truyền thống (Trắc nghiệm 3đ + Tự luận 7đ hoặc 5đ)",
    desc: "12 TN nhiều lựa chọn (3.0đ) + 4 Trả lời ngắn (2.0đ) + 4 Tự luận (5.0đ)",
    configs: [
      { type: "MULTIPLE_CHOICE" as QuestionType, count: 12, pointsPerItem: 0.25, totalScore: 3.0 },
      { type: "TRUE_FALSE_4" as QuestionType, count: 0, pointsPerItem: 1.0, totalScore: 0.0 },
      { type: "SHORT_ANSWER" as QuestionType, count: 4, pointsPerItem: 0.5, totalScore: 2.0 },
      { type: "ESSAY" as QuestionType, count: 4, pointsPerItem: 1.25, totalScore: 5.0 }
    ],
    weights: { NB: 30, TH: 40, VD: 20, VDC: 10 }
  },
  {
    id: "FULL_MULTIPLE_CHOICE",
    name: "100% Trắc nghiệm 4 lựa chọn (40 câu)",
    desc: "40 câu trắc nghiệm nhiều lựa chọn (0.25đ/câu = 10.0đ)",
    configs: [
      { type: "MULTIPLE_CHOICE" as QuestionType, count: 40, pointsPerItem: 0.25, totalScore: 10.0 },
      { type: "TRUE_FALSE_4" as QuestionType, count: 0, pointsPerItem: 1.0, totalScore: 0.0 },
      { type: "SHORT_ANSWER" as QuestionType, count: 0, pointsPerItem: 0.5, totalScore: 0.0 },
      { type: "ESSAY" as QuestionType, count: 0, pointsPerItem: 1.0, totalScore: 0.0 }
    ],
    weights: { NB: 40, TH: 30, VD: 20, VDC: 10 }
  }
];

const ALL_TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"];

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ blueprint, onSave, readOnly = false }) => {
  // Ensure all 4 question types exist in local state
  const initializeConfigs = (): BlueprintQuestionTypeConfig[] => {
    return ALL_TYPES.map(type => {
      const existing = blueprint.questionTypeConfigs.find(c => c.type === type);
      if (existing) return { ...existing };
      return {
        type,
        count: 0,
        pointsPerItem: QUESTION_TYPE_INFO[type].defaultPoints,
        totalScore: 0
      };
    });
  };

  const [configs, setConfigs] = useState<BlueprintQuestionTypeConfig[]>(initializeConfigs());
  const [weights, setWeights] = useState({
    NB: blueprint.cognitiveWeights?.NB ?? 40,
    TH: blueprint.cognitiveWeights?.TH ?? 30,
    VD: blueprint.cognitiveWeights?.VD ?? 20,
    VDC: blueprint.cognitiveWeights?.VDC ?? 10
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  useEffect(() => {
    setConfigs(initializeConfigs());
    setWeights({
      NB: blueprint.cognitiveWeights?.NB ?? 40,
      TH: blueprint.cognitiveWeights?.TH ?? 30,
      VD: blueprint.cognitiveWeights?.VD ?? 20,
      VDC: blueprint.cognitiveWeights?.VDC ?? 10
    });
  }, [blueprint]);

  const handleCountChange = (type: QuestionType, newCount: number) => {
    const safeCount = Math.max(0, newCount);
    setConfigs(prev =>
      prev.map(c => {
        if (c.type === type) {
          const totalScore = Number((safeCount * c.pointsPerItem).toFixed(2));
          return { ...c, count: safeCount, totalScore };
        }
        return c;
      })
    );
  };

  const handlePointsChange = (type: QuestionType, newPoints: number) => {
    const safePoints = Math.max(0.1, newPoints);
    setConfigs(prev =>
      prev.map(c => {
        if (c.type === type) {
          const totalScore = Number((c.count * safePoints).toFixed(2));
          return { ...c, pointsPerItem: safePoints, totalScore };
        }
        return c;
      })
    );
  };

  const handleWeightChange = (level: "NB" | "TH" | "VD" | "VDC", val: number) => {
    const safeVal = Math.max(0, Math.min(100, val));
    setWeights(prev => ({ ...prev, [level]: safeVal }));
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (!found) return;
    setSelectedPreset(presetId);

    const newConfigs = ALL_TYPES.map(type => {
      const pConfig = found.configs.find(c => c.type === type);
      if (pConfig) return { ...pConfig };
      return {
        type,
        count: 0,
        pointsPerItem: QUESTION_TYPE_INFO[type].defaultPoints,
        totalScore: 0
      };
    });

    setConfigs(newConfigs);
    setWeights({ ...found.weights });
  };

  // Computations
  const totalScore = Number(configs.reduce((sum, c) => sum + c.totalScore, 0).toFixed(2));
  const totalQuestions = configs.reduce((sum, c) => sum + c.count, 0);
  const totalWeightPercent = weights.NB + weights.TH + weights.VD + weights.VDC;

  const isScoreValid = Math.abs(totalScore - 10.0) < 0.01;
  const isWeightValid = totalWeightPercent === 100;

  const handleSave = () => {
    // Filter out configs with 0 questions if needed, but keep active configs
    const activeConfigs = configs.filter(c => c.count > 0);
    const updated: Blueprint = {
      ...blueprint,
      questionTypeConfigs: activeConfigs.length > 0 ? activeConfigs : configs,
      cognitiveWeights: weights,
      totalScore,
      totalQuestions,
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector Banner */}
      {!readOnly && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Chọn nhanh Mẫu cấu trúc đề định sẵn theo Bộ GD&ĐT:</span>
            </div>
            <span className="text-xs text-slate-500">Hoặc tự do tùy chỉnh các ô bên dưới</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_TEMPLATES.map(preset => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-600"
                      : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 font-extrabold" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 4 Question Types Interactive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            <span>Cấu hình chi tiết 4 dạng câu hỏi kiểm tra:</span>
          </h4>
          <span className="text-xs text-slate-500">
            Giáo viên bật/tắt dạng câu, nhập số câu và điểm cho phù hợp với đối tượng học sinh
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map(cfg => {
            const info = QUESTION_TYPE_INFO[cfg.type];
            const isEnabled = cfg.count > 0;

            return (
              <div
                key={cfg.type}
                className={`border rounded-2xl p-5 transition-all space-y-4 ${
                  isEnabled
                    ? "border-brand-300 bg-white shadow-xs ring-1 ring-brand-100"
                    : "border-slate-200 bg-slate-50/60 opacity-80"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{info.name}</span>
                        <Badge variant={isEnabled ? "primary" : "neutral"}>
                          {cfg.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{info.desc}</p>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      onClick={() => {
                        if (isEnabled) {
                          handleCountChange(cfg.type, 0);
                        } else {
                          handleCountChange(cfg.type, cfg.type === "MULTIPLE_CHOICE" ? 12 : cfg.type === "TRUE_FALSE_4" ? 2 : cfg.type === "SHORT_ANSWER" ? 4 : 2);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                        isEnabled
                          ? "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {isEnabled ? "Đang bật" : "Bật dạng này"}
                    </button>
                  )}
                </div>

                {/* Controls Area */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 items-center">
                  {/* Number of Questions */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Số câu hỏi:</label>
                    {!readOnly ? (
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                        <button
                          onClick={() => handleCountChange(cfg.type, cfg.count - 1)}
                          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={cfg.count}
                          onChange={e => handleCountChange(cfg.type, Number(e.target.value))}
                          className="w-full text-center text-xs font-bold text-slate-900 border-x border-slate-200 py-1"
                        />
                        <button
                          onClick={() => handleCountChange(cfg.type, cfg.count + 1)}
                          className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-extrabold text-sm text-slate-900">{cfg.count} câu</span>
                    )}
                  </div>

                  {/* Points per Question */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Điểm / câu:</label>
                    {!readOnly ? (
                      <select
                        value={cfg.pointsPerItem}
                        onChange={e => handlePointsChange(cfg.type, Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                      >
                        <option value={0.25}>0.25 đ/câu</option>
                        <option value={0.5}>0.50 đ/câu</option>
                        <option value={0.75}>0.75 đ/câu</option>
                        <option value={1.0}>1.00 đ/câu</option>
                        <option value={1.25}>1.25 đ/câu</option>
                        <option value={1.5}>1.50 đ/câu</option>
                        <option value={2.0}>2.00 đ/câu</option>
                        <option value={2.5}>2.50 đ/câu</option>
                      </select>
                    ) : (
                      <span className="text-xs text-slate-700">{cfg.pointsPerItem} đ</span>
                    )}
                  </div>

                  {/* Total Score for this type */}
                  <div className="text-right">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tổng điểm dạng:</label>
                    <div className="text-base font-extrabold text-brand-600">
                      {cfg.totalScore.toFixed(2)} đ
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cognitive Levels Weights Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Tỉ lệ mức độ nhận thức (Chuẩn GDPT 2018: 40% NB - 30% TH - 20% VD - 10% VDC)
            </h4>
            <p className="text-xs text-slate-500">Phù hợp với đối tượng học sinh đại trà và nâng cao</p>
          </div>
          <Badge variant={isWeightValid ? "success" : "warning"}>
            Tổng tỉ lệ: {totalWeightPercent}% {isWeightValid ? "✅" : "(Cần bằng 100%)"}
          </Badge>
        </div>

        {/* Visual Progress Ribbon */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${weights.NB}%` }} className="bg-emerald-500" title={`Nhận biết: ${weights.NB}%`} />
          <div style={{ width: `${weights.TH}%` }} className="bg-sky-500" title={`Thông hiểu: ${weights.TH}%`} />
          <div style={{ width: `${weights.VD}%` }} className="bg-amber-500" title={`Vận dụng: ${weights.VD}%`} />
          <div style={{ width: `${weights.VDC}%` }} className="bg-purple-500" title={`Vận dụng cao: ${weights.VDC}%`} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center justify-between">
              <span>Nhận biết (NB)</span>
              <span className="text-emerald-700 font-extrabold">{weights.NB}%</span>
            </div>
            {!readOnly ? (
              <input
                type="number"
                min={0}
                max={100}
                value={weights.NB}
                onChange={e => handleWeightChange("NB", Number(e.target.value))}
                className="w-full p-1.5 border border-emerald-200 rounded-lg text-xs font-bold bg-white"
              />
            ) : (
              <div className="text-xs text-slate-600 font-semibold">{weights.NB}% ({(weights.NB / 10).toFixed(1)} đ)</div>
            )}
          </div>

          <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1.5">
            <div className="font-bold text-sky-900 flex items-center justify-between">
              <span>Thông hiểu (TH)</span>
              <span className="text-sky-700 font-extrabold">{weights.TH}%</span>
            </div>
            {!readOnly ? (
              <input
                type="number"
                min={0}
                max={100}
                value={weights.TH}
                onChange={e => handleWeightChange("TH", Number(e.target.value))}
                className="w-full p-1.5 border border-sky-200 rounded-lg text-xs font-bold bg-white"
              />
            ) : (
              <div className="text-xs text-slate-600 font-semibold">{weights.TH}% ({(weights.TH / 10).toFixed(1)} đ)</div>
            )}
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span>Vận dụng (VD)</span>
              <span className="text-amber-700 font-extrabold">{weights.VD}%</span>
            </div>
            {!readOnly ? (
              <input
                type="number"
                min={0}
                max={100}
                value={weights.VD}
                onChange={e => handleWeightChange("VD", Number(e.target.value))}
                className="w-full p-1.5 border border-amber-200 rounded-lg text-xs font-bold bg-white"
              />
            ) : (
              <div className="text-xs text-slate-600 font-semibold">{weights.VD}% ({(weights.VD / 10).toFixed(1)} đ)</div>
            )}
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5">
            <div className="font-bold text-purple-900 flex items-center justify-between">
              <span>Vận dụng cao (VDC)</span>
              <span className="text-purple-700 font-extrabold">{weights.VDC}%</span>
            </div>
            {!readOnly ? (
              <input
                type="number"
                min={0}
                max={100}
                value={weights.VDC}
                onChange={e => handleWeightChange("VDC", Number(e.target.value))}
                className="w-full p-1.5 border border-purple-200 rounded-lg text-xs font-bold bg-white"
              />
            ) : (
              <div className="text-xs text-slate-600 font-semibold">{weights.VDC}% ({(weights.VDC / 10).toFixed(1)} đ)</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Live Validation Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          isScoreValid && isWeightValid
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            : "bg-amber-50/80 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-3">
          {isScoreValid && isWeightValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              Tổng số câu: <span className="font-extrabold">{totalQuestions} câu</span> • Tổng điểm:{" "}
              <span className={`font-extrabold ${isScoreValid ? "text-emerald-700" : "text-amber-700"}`}>
                {totalScore.toFixed(2)} / 10.0 đ
              </span>
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              {!isScoreValid
                ? `⚠️ Tổng điểm chưa đúng 10.0 đ (Hiện đang là ${totalScore.toFixed(2)} đ, chênh lệch ${(10.0 - totalScore).toFixed(2)} đ). Vui lòng điều chỉnh số câu hoặc điểm/câu.`
                : !isWeightValid
                ? `⚠️ Tổng tỉ lệ nhận thức chưa đạt 100% (Hiện đang là ${totalWeightPercent}%).`
                : "✅ Cơ cấu đề thi hoàn toàn hợp lệ, sẵn sàng chuyển sang bước sinh Ma trận."}
            </div>
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" /> Lưu cấu hình Blueprint
          </button>
        )}
      </div>
    </div>
  );
};
