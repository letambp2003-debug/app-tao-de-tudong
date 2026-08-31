import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext.js";
import {
  Sparkles,
  Shield,
  GraduationCap,
  Mail,
  UserPlus,
  ArrowRight,
  Crown,
  BookOpen,
  CheckCircle2
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { allUsers, switchUser, login, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<"DEMO" | "REGISTER" | "LOGIN">("DEMO");
  const [emailInput, setEmailInput] = useState("");
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    schoolName: "",
    subject: "Toán học"
  });
  const [loading, setLoading] = useState(false);

  const handleSelectDemoUser = (userId: string) => {
    switchUser(userId);
    showToast("success", "Đăng nhập thành công", "Chào mừng bạn đến với EDUTEST AI");
    navigate("/");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      showToast("error", "Lỗi", "Vui lòng nhập địa chỉ email.");
      return;
    }
    setLoading(true);
    try {
      await login(emailInput.trim());
      showToast("success", "Đăng nhập thành công", `Chào mừng ${emailInput}`);
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng nhập", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName.trim() || !registerForm.email.trim()) {
      showToast("error", "Lỗi", "Vui lòng điền họ tên và email.");
      return;
    }
    setLoading(true);
    try {
      await register(registerForm);
      showToast("success", "Đăng ký thành công!", "Tài khoản của bạn có 3 ngày dùng thử miễn phí.");
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng ký", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/30 mb-1">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">EDUTEST.AI</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Hệ thống thiết kế Ma trận, Bản đặc tả, Đề kiểm tra & Hướng dẫn chấm tự động theo chuẩn GDPT 2018
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Miễn phí 3 ngày đầu • Phí gia hạn: 30.000đ/năm</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab("DEMO")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "DEMO" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tài khoản Demo</span>
            </button>
            <button
              onClick={() => setActiveTab("REGISTER")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "REGISTER" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
            </button>
            <button
              onClick={() => setActiveTab("LOGIN")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "LOGIN" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          </div>

          {/* TAB 1: DEMO USERS */}
          {activeTab === "DEMO" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">
                Chọn vai trò để trải nghiệm nhanh toàn bộ tính năng:
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectDemoUser(u.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-brand-600/20 border border-slate-700/60 hover:border-brand-500 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/80 text-slate-200 flex items-center justify-center font-bold text-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        {u.role.includes("ADMIN") ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <GraduationCap className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          {u.role.replace("R0", "Vai trò: ").replace("_", " ")} • {u.department || "Khoa học"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-brand-400 font-bold flex items-center gap-1">
                      Vào <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW TEACHER ACCOUNT */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Chính sách Dùng thử 3 Ngày Miễn phí</span>
                </div>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  Đăng ký để sử dụng đầy đủ công cụ AI. Sau 3 ngày, phí kích hoạt duy trì chỉ 30.000đ/năm liên kết với <strong>tailieugiaoducso@gmail.com</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Họ và tên giáo viên:</label>
                <input
                  type="text"
                  required
                  placeholder="Thầy / Cô Nguyễn Văn An"
                  value={registerForm.fullName}
                  onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Địa chỉ Email:</label>
                <input
                  type="email"
                  required
                  placeholder="giaovien@gmail.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Trường học:</label>
                  <input
                    type="text"
                    placeholder="THCS / THPT..."
                    value={registerForm.schoolName}
                    onChange={e => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Môn giảng dạy:</label>
                  <select
                    value={registerForm.subject}
                    onChange={e => setRegisterForm({ ...registerForm, subject: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                    <option value="Vật lí">Vật lí</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Lịch sử và Địa lí">Lịch sử & Địa lí</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-xs font-bold hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Đang đăng ký..." : "Đăng ký & Bắt đầu dùng thử 3 ngày"}</span>
              </button>
            </form>
          )}

          {/* TAB 3: EMAIL LOGIN */}
          {activeTab === "LOGIN" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Địa chỉ Email đã đăng ký:</label>
                <input
                  type="email"
                  required
                  placeholder="nhap_email@gmail.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>{loading ? "Đang đăng nhập..." : "Đăng nhập vào hệ thống"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <div>Chương trình GDPT 2018 • Nghị định 30/2020/NĐ-CP • Công văn 5512/BGDĐT</div>
          <div>Tài khoản chủ liên kết: <span className="text-slate-400 font-mono">tailieugiaoducso@gmail.com</span> (30.000đ/năm)</div>
        </div>
      </div>
    </div>
  );
};
