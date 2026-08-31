import React, { useState, useEffect } from "react";
import { Project } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Copy, Trash2, ArrowRight, BookOpen, Clock, Award, CheckCircle2, Crown, Sparkles, BookCheck, Layers } from "lucide-react";
import { Badge } from "../components/common/Badge.js";
import { Modal } from "../components/common/Modal.js";
import { SubscriptionModal } from "../components/common/SubscriptionModal.js";
import { useNotification } from "../contexts/NotificationContext.js";
import { useAuth } from "../contexts/AuthContext.js";
import { GRADES_ALL, getSubjectsForGrade, TEXTBOOK_SERIES_OPTIONS } from "@shared/rules/curriculumDatabase.js";

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newGrade, setNewGrade] = useState<number>(8);
  const [newSubject, setNewSubject] = useState<string>("Toán học");
  const [newTextbookSeries, setNewTextbookSeries] = useState<string>("Bộ sách chuẩn dùng chung (GDPT 2018)");
  const [newSemester, setNewSemester] = useState<"HK1" | "HK2">("HK1");
  const [newExamPeriod, setNewExamPeriod] = useState<"GIUA_KY" | "CUOI_KY" | "THUONG_XUYEN">("GIUA_KY");

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

  // Update subject list when grade changes
  const availableSubjects = getSubjectsForGrade(newGrade);
  useEffect(() => {
    if (!availableSubjects.includes(newSubject)) {
      setNewSubject(availableSubjects[0] || "Toán học");
    }
  }, [newGrade]);

  const handleCreate = async () => {
    try {
      const periodName = newExamPeriod === "GIUA_KY" ? "Giữa kì" : newExamPeriod === "CUOI_KY" ? "Cuối kì" : "Thường xuyên";
      const semName = newSemester === "HK1" ? "I" : "II";
      const defaultName = `Đề kiểm tra ${periodName} ${semName} - ${newSubject} ${newGrade}`;

      const created = await api.createProject({
        name: newProjectName.trim() || defaultName,
        subject: newSubject,
        grade: newGrade,
        textbookSeries: newTextbookSeries,
        semester: newSemester,
        examPeriod: newExamPeriod,
        ruleProfileId: `${newSubject.toUpperCase().replace(/\s+/g, "_")}_${newGrade}`
      });

      showToast("success", "Khởi tạo đề kiểm tra thành công", created.name);
      setIsCreateOpen(false);
      navigate(`/projects/${created.id}`);
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

  const { user, trialDaysLeft, isExpired } = useAuth();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

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
            Hệ thống Khảo thí GDPT 2018 (Lớp 6 - 12)
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thiết kế ma trận & đề kiểm tra AI</h2>
          <p className="text-brand-100 text-xs md:text-sm leading-relaxed">
            Hỗ trợ đầy đủ tất cả các môn học từ Lớp 6 đến Lớp 12 cho Bộ sách chuẩn dùng chung, Kết nối tri thức, Cánh diều và Chân trời sáng tạo.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-brand-50 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Tạo đề kiểm tra mới
        </button>
      </div>

      {/* Trial / Subscription Notice Banner */}
      {(!user?.isActivated && user?.subscriptionStatus !== "ACTIVE") && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
          isExpired
            ? "bg-rose-50 border-rose-200 text-rose-950"
            : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
              isExpired ? "bg-rose-600" : "bg-amber-500"
            }`}>
              <Crown className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold">
                {isExpired
                  ? "Hết hạn dùng thử 3 ngày miễn phí!"
                  : `Tài khoản đang trong thời gian Dùng thử miễn phí (Còn ${trialDaysLeft} ngày)`}
              </span>
              <p className="text-slate-600 mt-0.5">
                Kích hoạt bản quyền 1 năm chỉ <strong>30.000 VNĐ</strong> liên kết với <strong>tailieugiaoducso@gmail.com</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Kích hoạt 30k/năm
          </button>
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ đề thi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{filtered.length}</strong> đề kiểm tra
          </span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg transition-all hover:border-brand-300 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold rounded-lg text-xs">
                  {p.subject} {p.grade}
                </span>
                <Badge variant="primary">{p.status}</Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors text-base line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> {p.textbookSeries || "Bộ sách chuẩn GDPT 2018"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kì: {p.examPeriod === "GIUA_KY" ? "Giữa kì" : p.examPeriod === "CUOI_KY" ? "Cuối kì" : "Thường xuyên"} ({p.semester || "HK1"})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.durationMinutes} phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.totalScore} điểm</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleClone(p.id)}
                  title="Nhân bản đề"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  title="Xóa đề"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Link
                to={`/projects/${p.id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                Mở hồ sơ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Khởi tạo hồ sơ đề kiểm tra mới (GDPT 2018)"
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
              placeholder={`VD: Đề kiểm tra ${newExamPeriod === "GIUA_KY" ? "Giữa kì" : "Cuối kì"} - ${newSubject} ${newGrade}`}
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp (6 - 12):</label>
              <select
                value={newGrade}
                onChange={e => setNewGrade(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <optgroup label="Cấp THCS">
                  <option value={6}>Lớp 6 (THCS)</option>
                  <option value={7}>Lớp 7 (THCS)</option>
                  <option value={8}>Lớp 8 (THCS)</option>
                  <option value={9}>Lớp 9 (THCS)</option>
                </optgroup>
                <optgroup label="Cấp THPT">
                  <option value={10}>Lớp 10 (THPT)</option>
                  <option value={11}>Lớp 11 (THPT)</option>
                  <option value={12}>Lớp 12 (THPT)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học ({newGrade <= 9 ? "THCS" : "THPT"}):</label>
              <select
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bộ sách giáo khoa:</label>
            <select
              value={newTextbookSeries}
              onChange={e => setNewTextbookSeries(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {TEXTBOOK_SERIES_OPTIONS.map(series => (
                <option key={series} value={series}>{series}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Học kì:</label>
              <select
                value={newSemester}
                onChange={e => setNewSemester(e.target.value as "HK1" | "HK2")}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="HK1">Học kì I (HK1)</option>
                <option value="HK2">Học kì II (HK2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kì kiểm tra:</label>
              <select
                value={newExamPeriod}
                onChange={e => setNewExamPeriod(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="GIUA_KY">Kiểm tra Giữa kì (GĐ 1)</option>
                <option value="CUOI_KY">Kiểm tra Cuối kì (Toàn diện)</option>
                <option value="THUONG_XUYEN">Kiểm tra Thường xuyên</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
};
