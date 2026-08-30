import React from "react";
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
