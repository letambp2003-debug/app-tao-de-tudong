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
  CheckCircle2,
  HardDrive,
  KeyRound,
  Lock,
  AlertCircle,
  HelpCircle,
  Key,
  Database,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { switchUser, login, googleAuth, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER" | "ADMIN">("LOGIN");
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Login form state
  const [loginInput, setLoginInput] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    schoolName: "",
    subject: "Toán học",
    storageLocation: "ADMIN_DRIVE" as "ADMIN_DRIVE" | "PERSONAL_DRIVE"
  });

  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("Antam2025@");

  const [loading, setLoading] = useState(false);

  // 1. Google 1-Click Quick Login
  const handleGoogleQuickLogin = async () => {
    setLoading(true);
    try {
      await googleAuth({
        email: "giaovien.test2026@gmail.com",
        fullName: "Thầy Giáo viên Test GDPT 2018",
        storageLocation: "ADMIN_DRIVE"
      });
      showToast(
        "success",
        "Đăng nhập thành công!",
        "Bạn đang sử dụng tài khoản Google trải nghiệm 5 ngày Full tính năng."
      );
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng nhập", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Member Email Login
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      showToast("error", "Lỗi", "Vui lòng nhập Email hoặc Tên đăng nhập.");
      return;
    }
    setLoading(true);
    try {
      await login({
        usernameOrEmail: loginInput.trim(),
        password: loginPassword.trim() || undefined
      });
      showToast("success", "Đăng nhập thành công!", `Chào mừng ${loginInput}`);
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng nhập", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. New Member Registration (with 5-day trial)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName.trim() || !registerForm.email.trim()) {
      showToast("error", "Lỗi nhập liệu", "Vui lòng điền họ tên và email Google chính xác.");
      return;
    }
    setLoading(true);
    try {
      await register(registerForm);
      showToast("success", "Đăng ký thành công!", "Tài khoản của bạn đã được kích hoạt 5 ngày dùng thử miễn phí Full chức năng.");
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng ký", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Master Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({
        usernameOrEmail: adminUsername.trim(),
        password: adminPassword.trim()
      });
      showToast(
        "success",
        "Đăng nhập Quản trị viên thành công!",
        "Vai trò: Quản trị viên Hệ thống (tailieugiaoducso@gmail.com)"
      );
      navigate("/admin");
    } catch (err: any) {
      showToast("error", "Lỗi đăng nhập", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/30 mb-1">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            EDUTEST<span className="text-brand-400">.AI</span> GDPT 2018
          </h1>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Hệ thống chuyên sâu thiết kế Ma trận, Bản đặc tả, Đề kiểm tra & Hướng dẫn chấm tự động (Lớp 6 đến Lớp 12).
          </p>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Đăng ký mới nhận 5 ngày dùng thử Full tính năng • Bản quyền: 30.000đ/năm</span>
          </div>
        </div>

        {/* Dual Column Layout: Left Form + Right Registration Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-800/80 rounded-2xl text-xs font-bold gap-1">
              <button
                onClick={() => setActiveTab("LOGIN")}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "LOGIN" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
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
                onClick={() => setActiveTab("ADMIN")}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "ADMIN" ? "bg-amber-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Quản trị</span>
              </button>
            </div>

            {/* TAB 1: MEMBER LOGIN */}
            {activeTab === "LOGIN" && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleQuickLogin}
                  disabled={loading}
                  className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>1-Click Đăng nhập bằng Google (5 ngày Free)</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium">hoặc đăng nhập bằng Email</span>
                </div>

                <form onSubmit={handleMemberLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Địa chỉ Email đã đăng ký:</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: giaovien.toan@gmail.com"
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Mật khẩu (nếu có):</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu..."
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>{loading ? "Đang đăng nhập..." : "Đăng nhập vào Hệ thống"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTER NEW ACCOUNT (5-DAY TRIAL) */}
            {activeTab === "REGISTER" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đăng ký thành viên - Kích hoạt 5 Ngày Dùng thử Full tính năng</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    Hệ thống sẽ cấp ngay 5 ngày dùng thử miễn phí. Sau 5 ngày, phí duy trì chỉ 30.000đ/năm.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Họ và tên giáo viên:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thầy / Cô Nguyễn Văn An"
                    value={registerForm.fullName}
                    onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Địa chỉ Email Google (Gmail):</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: giaovien.toan@gmail.com"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Trường học:</label>
                    <input
                      type="text"
                      placeholder="THCS / THPT..."
                      value={registerForm.schoolName}
                      onChange={e => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Môn giảng dạy:</label>
                    <select
                      value={registerForm.subject}
                      onChange={e => setRegisterForm({ ...registerForm, subject: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none cursor-pointer"
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

                {/* Storage Location Choice */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nơi lưu trữ câu hỏi Google Drive:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer ${
                      registerForm.storageLocation === "ADMIN_DRIVE" ? "bg-brand-600/20 border-brand-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      <input
                        type="radio"
                        name="reg_storage"
                        checked={registerForm.storageLocation === "ADMIN_DRIVE"}
                        onChange={() => setRegisterForm({ ...registerForm, storageLocation: "ADMIN_DRIVE" })}
                      />
                      <span className="text-[11px] font-bold">Drive Trung tâm</span>
                    </label>
                    <label className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer ${
                      registerForm.storageLocation === "PERSONAL_DRIVE" ? "bg-brand-600/20 border-brand-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      <input
                        type="radio"
                        name="reg_storage"
                        checked={registerForm.storageLocation === "PERSONAL_DRIVE"}
                        onChange={() => setRegisterForm({ ...registerForm, storageLocation: "PERSONAL_DRIVE" })}
                      />
                      <span className="text-[11px] font-bold">Drive Cá nhân</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "Đang đăng ký..." : "Đăng ký & Nhận 5 ngày dùng thử"}</span>
                </button>
              </form>
            )}

            {/* TAB 3: MASTER ADMIN LOGIN */}
            {activeTab === "ADMIN" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-200">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Tài khoản Quản trị viên Chính (Master Admin)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Email: <strong>tailieugiaoducso@gmail.com</strong>. Toàn quyền quản trị, duyệt đề, cấp quyền bản quyền cho giáo viên.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Tên đăng nhập:</label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Nhập: <code>admin</code> hoặc <code>tailieugiaoducso@gmail.com</code></span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Mật khẩu:</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Mật khẩu: <code>Antam2025@</code></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? "Đang xác thực..." : "Đăng nhập Quyền Quản trị viên"}</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => setActiveTab("REGISTER")}
                  className="text-brand-400 font-bold hover:underline"
                >
                  Đăng ký dùng thử 5 ngày miễn phí ngay
                </button>
              </span>
            </div>
          </div>

          {/* Right Column: Registration Requirements & Guidelines Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-sm text-white">Hướng dẫn & Yêu cầu đăng ký</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Requirement 1 */}
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[11px]">1</span>
                  <span>Tài khoản Google (Gmail)</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Khuyên dùng địa chỉ Gmail cá nhân hoặc email giáo dục của trường để nhận thông báo và đồng bộ Google Drive.
                </p>
              </div>

              {/* Requirement 2 */}
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">2</span>
                  <span>5 Ngày dùng thử Full tính năng</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Sau khi đăng ký thành công, tài khoản được mở khóa 100% chức năng: Tạo đề, Ma trận, Đặc tả, Soạn câu hỏi và Kiểm định kỹ thuật.
                </p>
              </div>

              {/* Requirement 3 */}
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">3</span>
                  <span>Phí duy trì 30.000 VNĐ / năm</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Từ ngày thứ 6, để tiếp tục sử dụng, thành viên gia hạn 30k/năm liên kết với tài khoản quản trị chính <strong>tailieugiaoducso@gmail.com</strong>.
                </p>
              </div>

              {/* Requirement 4 */}
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px]">4</span>
                  <span>Cung cấp Gemini API Key</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Để hệ thống AI tự động sinh câu hỏi theo yêu cầu cần đạt, thành viên cần lấy API Key miễn phí tại{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
              </div>

              {/* Requirement 5 */}
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px]">5</span>
                  <span>Không công khai với khách vãng lai</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Để đảm bảo an toàn dữ liệu khảo thí, toàn bộ các tính năng tạo đề, ma trận và ngân hàng câu hỏi đều yêu cầu đăng nhập.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <div>Hệ thống Khảo thí Đề kiểm tra GDPT 2018 • Nghị định 30/2020/NĐ-CP • Công văn 5512/BGDĐT</div>
          <div>Quản trị viên liên kết: <span className="text-slate-400 font-mono">tailieugiaoducso@gmail.com</span> (Bản quyền 30.000đ/năm)</div>
        </div>
      </div>
    </div>
  );
};
