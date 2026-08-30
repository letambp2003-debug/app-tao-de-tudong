import React, { useState, useEffect } from "react";
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
        name: newProjectName || `Đề kiểm tra ${newSubject} ${newGrade}`,
        subject: newSubject,
        grade: newGrade,
        ruleProfileId: newSubject === "Khoa học tự nhiên" ? "KHTN_8" : "TOAN_9"
      });
      showToast("success", "Khởi tạo dự án thành công", created.name);
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

              <Link to={`/projects/${proj.id}`} className="block group">
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
                to={`/projects/${proj.id}`}
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
