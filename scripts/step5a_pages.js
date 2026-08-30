import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. LoginPage.tsx
write("client/src/pages/LoginPage.tsx", `import React from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { Sparkles, Shield, User, GraduationCap, CheckCircle2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { allUsers, switchUser } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = (userId: string) => {
    switchUser(userId);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow decorative effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/30 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">EDUTEST AI</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Hệ thống hỗ trợ thiết kế ma trận, bản đặc tả, đề kiểm tra và hướng dẫn chấm theo chuẩn Bộ GD&ĐT
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chọn tài khoản trải nghiệm (Demo Roles):
          </div>

          <div className="space-y-2">
            {allUsers.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-700/50 hover:bg-brand-600/30 border border-slate-600/50 hover:border-brand-500 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    {u.role.includes("ADMIN") ? <Shield className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{u.fullName}</div>
                    <div className="text-[11px] text-slate-400">{u.role.replace("R0", "Vai trò ").replace("_", " ")}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-brand-300 font-semibold">Đăng nhập →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Chương trình GDPT 2018 | Nghị định 30/2020/NĐ-CP
        </div>
      </div>
    </div>
  );
};
`);

// 2. DashboardPage.tsx
write("client/src/pages/DashboardPage.tsx", `import React, { useState, useEffect } from "react";
import { Project } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Copy, Trash2, ArrowRight, BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/common/Badge.js";
import { Modal } from "../components/common/Modal.js";
import { useNotification } from "../contexts/NotificationContext.js";

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newSubject, setNewSubject] = useState("Khoa học tự nhiên");
  const [newGrade, setNewGrade] = useState(8);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const list = await api.getProjects();
      setProjects(list);
    } catch (err: any) {
      showToast("error", "Lỗi tải dự án", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      const created = await api.createProject({
        name: newProjectName || \`Đề kiểm tra \${newSubject} \${newGrade}\`,
        subject: newSubject,
        grade: newGrade,
        ruleProfileId: newSubject === "Khoa học tự nhiên" ? "KHTN_8" : "TOAN_9"
      });
      showToast("success", "Khởi tạo dự án thành công", created.name);
      setIsCreateOpen(false);
      navigate(\`/projects/\${created.id}\`);
    } catch (err: any) {
      showToast("error", "Không thể tạo dự án", err.message);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const cloned = await api.cloneProject(id);
      showToast("success", "Đã nhân bản dự án", cloned.name);
      fetchProjects();
    } catch (err: any) {
      showToast("error", "Lỗi nhân bản", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    try {
      await api.deleteProject(id);
      showToast("success", "Đã xóa dự án");
      fetchProjects();
    } catch (err: any) {
      showToast("error", "Lỗi xóa dự án", err.message);
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Hệ thống Khảo thí GDPT 2018
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thiết kế ma trận & đề kiểm tra AI</h2>
          <p className="text-brand-100 text-xs md:text-sm leading-relaxed">
            Quy trình chuẩn hóa 9 bước từ Nguồn tài liệu, Data Pack, Ma trận, Đặc tả, Đề thi đến Kiểm định và Xuất bản.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-brand-50 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Tạo đề kiểm tra mới
        </button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án, môn học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Tổng số: <strong className="text-slate-900">{filtered.length}</strong> dự án đề thi
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(proj => (
          <div
            key={proj.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all hover:border-brand-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant={
                    proj.status === "APPROVED" || proj.status === "EXPORTED"
                      ? "success"
                      : proj.status === "DRAFT"
                      ? "neutral"
                      : "primary"
                  }
                >
                  {proj.status}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">v{proj.version}.0</span>
              </div>

              <Link to={\`/projects/\${proj.id}\`} className="block group">
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base leading-snug line-clamp-2">
                  {proj.name}
                </h3>
              </Link>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Môn học:</span>
                  <span className="font-semibold">{proj.subject} {proj.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Thời gian & Điểm:</span>
                  <span className="font-semibold">{proj.durationMinutes}p | {proj.totalScore}đ</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleClone(proj.id)}
                  className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                  title="Nhân bản đề"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Xóa đề"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <Link
                to={\`/projects/\${proj.id}\`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition-colors"
              >
                <span>Chi tiết</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Khởi tạo hồ sơ đề kiểm tra mới"
        footer={
          <>
            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">
              Hủy
            </button>
            <button onClick={handleCreate} className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs">
              Bắt đầu thiết kế
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên đề kiểm tra:</label>
            <input
              type="text"
              placeholder="VD: Đề kiểm tra Giữa kì I - Môn KHTN 8"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học:</label>
              <select
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                <option value="Toán học">Toán học</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Hóa học">Hóa học</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp:</label>
              <select
                value={newGrade}
                onChange={e => setNewGrade(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
`);

// 3. QuestionBankPage.tsx
write("client/src/pages/QuestionBankPage.tsx", `import React, { useState, useEffect } from "react";
import { Question } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { QuestionCard } from "../components/questions/QuestionCard.js";
import { Search, Filter, Database } from "lucide-react";

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    api.getQuestions().then(setQuestions).catch(console.error);
  }, []);

  const filtered = questions.filter(q => {
    const matchSearch = q.stem.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || q.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-600" /> Ngân hàng câu hỏi chuẩn hóa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kho câu hỏi đã qua kiểm duyệt và gắn mã YCCĐ GDPT 2018</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nội dung câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">Tất cả dạng câu</option>
            <option value="MULTIPLE_CHOICE">Trắc nghiệm 4 lựa chọn</option>
            <option value="TRUE_FALSE_4">Đúng - Sai 4 ý</option>
            <option value="SHORT_ANSWER">Trả lời ngắn</option>
            <option value="ESSAY">Tự luận</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((q, idx) => (
          <QuestionCard key={q.id} question={q} index={idx} />
        ))}
      </div>
    </div>
  );
};
`);

// 4. AdminPage.tsx, ProfilePage.tsx, HelpPage.tsx
write("client/src/pages/AdminPage.tsx", `import React, { useState, useEffect } from "react";
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
          className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${
            tab === "AUDIT" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }\`}
        >
          Nhật ký thao tác ({auditLogs.length})
        </button>
        <button
          onClick={() => setTab("AI")}
          className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${
            tab === "AI" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }\`}
        >
          Giám sát mô-đun AI ({aiLogs.length})
        </button>
        <button
          onClick={() => setTab("RULES")}
          className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${
            tab === "RULES" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }\`}
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
`);

write("client/src/pages/ProfilePage.tsx", `import React from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { User, School, BookOpen, ShieldCheck } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-600" /> Hồ sơ giáo viên & Tổ chuyên môn
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Thông tin tài khoản và đơn vị công tác</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-2xl border border-brand-200">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Trường / Đơn vị:</span>
            <span className="font-bold text-slate-800">Trường THCS Chu Văn An, Tây Hồ, Hà Nội</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Tổ chuyên môn:</span>
            <span className="font-bold text-slate-800">Tổ Khoa học Tự nhiên</span>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

write("client/src/pages/HelpPage.tsx", `import React from "react";
import { HelpCircle, CheckCircle2, Sparkles, Shield } from "lucide-react";

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" /> Hướng dẫn sử dụng hệ thống EDUTEST AI
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Nguyên tắc vận hành và cẩm nang tạo đề kiểm tra chuẩn Bộ GD&ĐT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">1</div>
          <h4 className="font-bold text-sm text-slate-900">Bảo đảm tính sư phạm</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI chỉ đóng vai trò trợ lý đề xuất. Giáo viên luôn có quyền kiểm soát, tinh chỉnh và phê duyệt ở từng bước.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">2</div>
          <h4 className="font-bold text-sm text-slate-900">Kiểm định toán học</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            20 quy tắc kỹ thuật V01-V20 được tính toán bằng động cơ toán học độc lập, không dựa vào AI để đảm bảo 100% chính xác.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">3</div>
          <h4 className="font-bold text-sm text-slate-900">Xuất tệp đa định dạng</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hỗ trợ xuất Word (.docx), Excel (.xlsx), PDF và gói ZIP đầy đủ sẵn sàng in ấn và lưu trữ hồ sơ chuyên môn.
          </p>
        </div>
      </div>
    </div>
  );
};
`);

console.log("Step 5a Pages generated successfully.");
