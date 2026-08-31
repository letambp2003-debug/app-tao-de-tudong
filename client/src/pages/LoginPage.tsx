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
  Lock
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { allUsers, switchUser, login, googleAuth, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<"GOOGLE" | "ADMIN" | "REGISTER" | "DEMO">("GOOGLE");
  
  // Google sign in / sign up state
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [storageLocation, setStorageLocation] = useState<"ADMIN_DRIVE" | "PERSONAL_DRIVE">("ADMIN_DRIVE");

  // Admin login state
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("Antam2025@");

  // Traditional register state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    schoolName: "",
    subject: "Toán học"
  });

  const [loading, setLoading] = useState(false);

  // 1. Google 1-Click / Custom Google Login
  const handleGoogleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailToUse = googleEmail.trim() || "giaovien.test@gmail.com";
    const nameToUse = googleName.trim() || (emailToUse.split("@")[0]);

    setLoading(true);
    try {
      await googleAuth({
        email: emailToUse,
        fullName: nameToUse,
        storageLocation
      });
      showToast(
        "success",
        "Đăng ký Google thành công!",
        `Chào mừng ${nameToUse}. Bạn nhận được 5 ngày trải nghiệm Full tính năng.`
      );
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng nhập Google", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Master Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
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
      showToast("error", "Lỗi đăng nhập Quản trị", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Regular Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName.trim() || !registerForm.email.trim()) {
      showToast("error", "Lỗi", "Vui lòng điền họ tên và email.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...registerForm, storageLocation });
      showToast("success", "Đăng ký thành công!", "Tài khoản của bạn có 5 ngày dùng thử miễn phí.");
      navigate("/");
    } catch (err: any) {
      showToast("error", "Lỗi đăng ký", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Demo Switch
  const handleSelectDemoUser = (userId: string) => {
    switchUser(userId);
    showToast("success", "Đăng nhập thành công", "Chào mừng bạn đến với EDUTEST AI");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/30 mb-1">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">EDUTEST.AI</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Hệ thống thiết kế Ma trận, Bản đặc tả, Đề kiểm tra & Hướng dẫn chấm tự động GDPT 2018 (Lớp 6 đến Lớp 12)
          </p>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Miễn phí 5 ngày trải nghiệm Full tính năng • Phí bản quyền: 30.000đ/năm</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 p-1 bg-slate-800/80 rounded-2xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab("GOOGLE")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === "GOOGLE" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Tài khoản Google</span>
            </button>
            <button
              onClick={() => setActiveTab("ADMIN")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === "ADMIN" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Quản trị viên</span>
            </button>
            <button
              onClick={() => setActiveTab("REGISTER")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === "REGISTER" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
            </button>
            <button
              onClick={() => setActiveTab("DEMO")}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === "DEMO" ? "bg-brand-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE SIGN-IN / REGISTER (5-DAY FREE TRIAL) */}
          {activeTab === "GOOGLE" && (
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div className="p-3.5 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-xs text-brand-300 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-brand-200">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  <span>Đăng ký tham gia thử nghiệm bằng Tài khoản Google cá nhân</span>
                </div>
                <p className="text-[11px] text-brand-200/80 leading-relaxed">
                  Khi đăng ký thành công bằng Google, thầy/cô được <strong>thực hành thử 5 ngày trải nghiệm FULL chức năng</strong> (Ma trận, Bản đặc tả, Soạn câu hỏi và Kiểm định 20 quy tắc).
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Địa chỉ Email Google (Gmail):</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: giaovien.toan@gmail.com"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Họ và tên giáo viên:</label>
                  <input
                    type="text"
                    placeholder="VD: Thầy / Cô Nguyễn Văn An"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Google Drive Storage Location Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-brand-400" />
                    <span>Lưu trữ ngân hàng câu hỏi & đề thi trên Google Drive:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${
                      storageLocation === "ADMIN_DRIVE"
                        ? "bg-brand-600/20 border-brand-500 text-white"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}>
                      <input
                        type="radio"
                        name="storage"
                        checked={storageLocation === "ADMIN_DRIVE"}
                        onChange={() => setStorageLocation("ADMIN_DRIVE")}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-200">Drive Trung tâm (Khuyên dùng)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Lưu tại tailieugiaoducso@gmail.com</div>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${
                      storageLocation === "PERSONAL_DRIVE"
                        ? "bg-brand-600/20 border-brand-500 text-white"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}>
                      <input
                        type="radio"
                        name="storage"
                        checked={storageLocation === "PERSONAL_DRIVE"}
                        onChange={() => setStorageLocation("PERSONAL_DRIVE")}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-200">Drive Cá nhân</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Lưu tại email của bạn</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white rounded-xl text-xs font-bold hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Đang kết nối..." : "Đăng nhập Google & Bắt đầu dùng thử 5 ngày"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGoogleEmail("giaovien.test2026@gmail.com");
                  setGoogleName("Thầy Giáo viên Test GDPT 2018");
                  handleGoogleSubmit();
                }}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-semibold border border-slate-700 transition-colors"
              >
                ⚡ 1-Click Trải nghiệm nhanh bằng Tài khoản Google Mẫu (5 Ngày Free)
              </button>
            </form>
          )}

          {/* TAB 2: MASTER ADMIN LOGIN */}
          {activeTab === "ADMIN" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-200">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Khu vực Quản trị viên Chính (Master Admin)</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Email quản trị: <strong>tailieugiaoducso@gmail.com</strong>. Bản quyền vĩnh viễn, toàn quyền quản lý bản quyền và duyệt đề.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tên đăng nhập hoặc Email quản trị:</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Tên đăng nhập: <code>admin</code> hoặc <code>tailieugiaoducso@gmail.com</code></span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Mật khẩu:</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Mật khẩu chuẩn: <code>Antam2025@</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl text-xs font-bold hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? "Đang xác thực..." : "Đăng nhập với Quyền Quản trị viên"}</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW TEACHER ACCOUNT */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-xs font-bold hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Đang đăng ký..." : "Đăng ký & Bắt đầu dùng thử 5 ngày"}</span>
              </button>
            </form>
          )}

          {/* TAB 4: DEMO USERS */}
          {activeTab === "DEMO" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">
                Chọn vai trò để trải nghiệm nhanh:
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
                          {u.email} • {u.role.replace("R0", "").replace("_", " ")}
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
