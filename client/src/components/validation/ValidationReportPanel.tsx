import React, { useState } from "react";
import { ValidationReport, ValidationRuleResult } from "@shared/types/index.js";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Wand2,
  ArrowRight,
  Lightbulb,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Badge } from "../common/Badge.js";
import { api } from "../../services/api.js";
import { useNotification } from "../../contexts/NotificationContext.js";

interface ValidationReportPanelProps {
  report: ValidationReport | null;
  onRefresh: () => void;
  onNavigateStep?: (stepKey: string) => void;
}

export const ValidationReportPanel: React.FC<ValidationReportPanelProps> = ({
  report,
  onRefresh,
  onNavigateStep
}) => {
  const [filter, setFilter] = useState<"ALL" | "FAILED">("ALL");
  const [isFixing, setIsFixing] = useState(false);
  const { showToast } = useNotification();

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

  const handleAutoFixAll = async () => {
    setIsFixing(true);
    try {
      await api.autoFixValidation(report.projectId);
      showToast("success", "Đã tự động sửa lỗi thành công", "Hệ thống đã cân đối lại Ma trận, Bản đặc tả và Câu hỏi.");
      onRefresh();
    } catch (err: any) {
      showToast("error", "Lỗi tự động sửa", err.message);
    } finally {
      setIsFixing(false);
    }
  };

  const filteredRules = report.ruleResults.filter(r => {
    if (filter === "FAILED") return !r.passed;
    return true;
  });

  const failedCount = report.ruleResults.filter(r => !r.passed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Auto-Fix All button */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-xs ${
          report.allPassed
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            : "bg-rose-50/90 border-rose-200 text-rose-950"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              report.allPassed ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {report.allPassed ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {report.allPassed ? "HỒ SƠ ĐỀ THI ĐẠT CHUẨN KIỂM ĐỊNH (20/20 QUY TẮC)" : "PHÁT HIỆN LỖI CẦN XỬ LÝ"}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              Đã kiểm tra 20 quy tắc kỹ thuật (V01 - V20) | {new Date(report.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/80 rounded-xl text-xs font-bold text-rose-700 border border-rose-200">
              {report.criticalErrorsCount} Lỗi nghiêm trọng
            </span>
            <span className="px-3 py-1 bg-white/80 rounded-xl text-xs font-bold text-amber-700 border border-amber-200">
              {report.warningsCount} Cảnh báo
            </span>
          </div>

          {!report.allPassed && (
            <button
              onClick={handleAutoFixAll}
              disabled={isFixing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors shrink-0 disabled:opacity-50"
              title="Tự động cân đối điểm số, ma trận, bản đặc tả và câu hỏi"
            >
              <Sparkles className="w-4 h-4" /> {isFixing ? "Đang tự động sửa..." : "⚡ Tự động sửa toàn bộ lỗi"}
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Kiểm định lại"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Rules Diagnostic Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Chi tiết 20 quy tắc kiểm định (V01 - V20)</h4>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tất cả ({report.ruleResults.length})
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === "FAILED" ? "bg-white text-rose-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Chưa đạt ({failedCount})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRules.map(rule => {
            const isFailed = !rule.passed;

            return (
              <div key={rule.ruleCode} className={`py-4 transition-colors ${isFailed ? "bg-rose-50/20 -mx-6 px-6" : ""}`}>
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {rule.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : rule.severity === "CRITICAL" ? (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-500">{rule.ruleCode}</span>
                      <span className="font-bold text-sm text-slate-900">{rule.ruleName}</span>
                      <Badge variant={rule.severity === "CRITICAL" ? "danger" : "neutral"}>
                        {rule.severity}
                      </Badge>
                    </div>

                    <div className={`text-xs leading-relaxed ${isFailed ? "text-rose-700 font-medium" : "text-slate-600"}`}>
                      {rule.message}
                    </div>

                    {/* Step-by-Step Fix Guidance Box for Failed Rules */}
                    {isFailed && (
                      <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-2">
                        <div className="flex items-start gap-2 text-amber-900">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold">Hướng dẫn sửa lỗi: </span>
                            <span>{rule.guidance || "Kiểm tra và cập nhật lại dữ liệu ở bước tương ứng."}</span>
                          </div>
                        </div>

                        {/* Direct Action Navigation & Auto Fix Button */}
                        <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                          {rule.stepKey && onNavigateStep && (
                            <button
                              onClick={() => onNavigateStep(rule.stepKey!)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition-colors shadow-xs"
                            >
                              <span>{rule.actionLabel || `Đến bước ${rule.stepKey}`}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={handleAutoFixAll}
                            disabled={isFixing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold text-[11px] hover:bg-purple-200 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Tự động sửa</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
