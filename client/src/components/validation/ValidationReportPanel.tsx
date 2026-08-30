import React, { useState } from "react";
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
        className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          report.allPassed
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            : "bg-rose-50/90 border-rose-200 text-rose-950"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
            report.allPassed ? "bg-emerald-600" : "bg-rose-600"
          }`}>
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
              className={`px-3 py-1 rounded-lg font-semibold ${filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
            >
              Tất cả ({report.ruleResults.length})
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={`px-3 py-1 rounded-lg font-semibold ${filter === "FAILED" ? "bg-white text-rose-600 shadow-xs" : "text-slate-500"}`}
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
