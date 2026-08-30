import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Database, ShieldCheck, User, HelpCircle, BookOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.js";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Bảng điều khiển", icon: LayoutDashboard, path: "/" },
    { label: "Ngân hàng câu hỏi", icon: Database, path: "/questions" },
    { label: "Quản trị & Quy tắc", icon: ShieldCheck, path: "/admin" },
    { label: "Hồ sơ giáo viên", icon: User, path: "/profile" },
    { label: "Hướng dẫn sử dụng", icon: HelpCircle, path: "/help" }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Phân hệ chính
        </div>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                active
                  ? "bg-brand-50 text-brand-700 shadow-xs border border-brand-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-brand-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-gradient-to-br from-brand-50 to-blue-50/50 rounded-2xl border border-brand-100">
        <div className="flex items-center gap-2 text-brand-700 font-bold text-xs mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Nguyên tắc vận hành</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          AI đề xuất → Hệ thống kiểm tra → Giáo viên phê duyệt → Chuyển bước.
        </p>
      </div>
    </aside>
  );
};
