import React, { useState, useEffect } from "react";
import { AuditLog, AIUsageLog, SubjectRuleProfile } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { Shield, Sparkles, BookOpen, Activity } from "lucide-react";
import { Badge } from "../components/common/Badge.js";

export const AdminPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiLogs, setAiLogs] = useState<AIUsageLog[]>([]);
  const [rules, setRules] = useState<SubjectRuleProfile[]>([]);
  const [tab, setTab] = useState<"AUDIT" | "AI" | "RULES">("AUDIT");

  useEffect(() => {
    api.getAuditLogs().then(setAuditLogs).catch(console.error);
    api.getAILogs().then(setAiLogs).catch(console.error);
    api.getSubjectRules().then(setRules).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-600" /> Quản trị hệ thống & Giám sát AI
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Nhật ký kiểm toán, thống kê token AI và cấu hình quy tắc môn học</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "AUDIT" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Nhật ký thao tác ({auditLogs.length})
        </button>
        <button
          onClick={() => setTab("AI")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "AI" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Giám sát mô-đun AI ({aiLogs.length})
        </button>
        <button
          onClick={() => setTab("RULES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "RULES" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Hồ sơ quy tắc môn học ({rules.length})
        </button>
      </div>

      {tab === "AUDIT" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-3.5">Thời gian</th>
                <th className="p-3.5">Người thực hiện</th>
                <th className="p-3.5">Hành động</th>
                <th className="p-3.5">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.userName}</td>
                  <td className="p-3"><Badge variant="primary">{log.action}</Badge></td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "AI" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-3.5">Mã mô-đun AI</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5">Input Tokens</th>
                <th className="p-3.5">Output Tokens</th>
                <th className="p-3.5">Thời gian xử lý</th>
                <th className="p-3.5">Thời điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{log.moduleCode} ({log.promptVersion})</td>
                  <td className="p-3"><Badge variant={log.status === "SUCCESS" ? "success" : "purple"}>{log.status}</Badge></td>
                  <td className="p-3 text-slate-600 font-mono">{log.inputTokens || 0}</td>
                  <td className="p-3 text-slate-600 font-mono">{log.outputTokens || 0}</td>
                  <td className="p-3 text-slate-600 font-mono">{log.durationMs} ms</td>
                  <td className="p-3 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "RULES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{r.name}</span>
                <Badge variant="primary">{r.defaultDuration} phút</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{r.guidanceNotes}</p>
              <div className="text-[11px] text-slate-500 font-mono">
                Tỉ lệ mặc định: NB {r.defaultCognitiveWeights.NB}% - TH {r.defaultCognitiveWeights.TH}% - VD {r.defaultCognitiveWeights.VD}% - VDC {r.defaultCognitiveWeights.VDC}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
