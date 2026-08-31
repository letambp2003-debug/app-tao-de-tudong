import React, { useState, useEffect } from "react";
import { AuditLog, AIUsageLog, SubjectRuleProfile, User } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { useNotification } from "../contexts/NotificationContext.js";
import {
  Shield,
  Sparkles,
  BookOpen,
  Activity,
  CreditCard,
  Crown,
  Key,
  Copy,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Mail
} from "lucide-react";
import { Badge } from "../components/common/Badge.js";

export const AdminPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiLogs, setAiLogs] = useState<AIUsageLog[]>([]);
  const [rules, setRules] = useState<SubjectRuleProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>({
    masterEmail: "tailieugiaoducso@gmail.com",
    annualFee: 30000,
    bankName: "MB Bank (Ngân hàng Quân Đội)",
    accountNumber: "0987654321",
    accountHolder: "LE TAM - EDUTEST AI",
    syntaxPrefix: "EDUTEST",
    trialDays: 3
  });
  const [licenses, setLicenses] = useState<any[]>([]);
  const [targetEmail, setTargetEmail] = useState("");
  const [tab, setTab] = useState<"SUBSCRIPTION" | "AUDIT" | "AI" | "RULES">("SUBSCRIPTION");
  const [savingPayment, setSavingPayment] = useState(false);
  const [generatingLicense, setGeneratingLicense] = useState(false);

  const { showToast } = useNotification();

  const loadData = async () => {
    api.getAuditLogs().then(setAuditLogs).catch(console.error);
    api.getAILogs().then(setAiLogs).catch(console.error);
    api.getSubjectRules().then(setRules).catch(console.error);
    api.getUsers().then(setUsers).catch(console.error);
    api.getPaymentConfig().then(setPaymentConfig).catch(console.error);
    api.getLicenses().then(setLicenses).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast("info", "Đã sao chép", `${label}: ${text}`);
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      await api.updatePaymentConfig(paymentConfig);
      showToast("success", "Cập nhật thành công", "Đã lưu cấu hình thanh toán & email chủ mới.");
    } catch (err: any) {
      showToast("error", "Lỗi lưu cấu hình", err.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) {
      showToast("error", "Lỗi", "Vui lòng nhập email giáo viên cần cấp mã.");
      return;
    }
    setGeneratingLicense(true);
    try {
      const res = await api.generateLicense(targetEmail.trim());
      showToast("success", "Đã tạo mã kích hoạt", res.license.code);
      setTargetEmail("");
      loadData();
    } catch (err: any) {
      showToast("error", "Lỗi tạo mã", err.message);
    } finally {
      setGeneratingLicense(false);
    }
  };

  const handleDirectActivate = async (email: string) => {
    try {
      const res = await api.adminActivateUser(email);
      showToast("success", "Kích hoạt thành công", res.message);
      loadData();
    } catch (err: any) {
      showToast("error", "Lỗi kích hoạt", err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" /> Trung tâm Quản trị & Kích hoạt Bản quyền
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình thanh toán, tạo mã kích hoạt 30.000đ/năm, quản lý tài khoản giáo viên và giám sát hệ thống
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setTab("SUBSCRIPTION")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            tab === "SUBSCRIPTION" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Bản quyền & Thanh toán (30k/năm)</span>
        </button>
        <button
          onClick={() => setTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            tab === "AUDIT" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Nhật ký thao tác ({auditLogs.length})
        </button>
        <button
          onClick={() => setTab("AI")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            tab === "AI" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Giám sát mô-đun AI ({aiLogs.length})
        </button>
        <button
          onClick={() => setTab("RULES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            tab === "RULES" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Hồ sơ quy tắc ({rules.length})
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION & PAYMENT MANAGEMENT */}
      {tab === "SUBSCRIPTION" && (
        <div className="space-y-6">
          {/* Top 2 Columns: Payment Configuration & License Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Payment Configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>1. Cấu hình Thông tin Thanh toán & Tài khoản chủ</span>
              </div>

              <form onSubmit={handleSavePaymentConfig} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email chủ tiếp nhận liên kết:</label>
                  <input
                    type="email"
                    value={paymentConfig.masterEmail}
                    onChange={e => setPaymentConfig({ ...paymentConfig, masterEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-brand-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phí kích hoạt (VNĐ / năm):</label>
                    <input
                      type="number"
                      value={paymentConfig.annualFee}
                      onChange={e => setPaymentConfig({ ...paymentConfig, annualFee: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời gian dùng thử (ngày):</label>
                    <input
                      type="number"
                      value={paymentConfig.trialDays}
                      onChange={e => setPaymentConfig({ ...paymentConfig, trialDays: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngân hàng thụ hưởng:</label>
                  <input
                    type="text"
                    value={paymentConfig.bankName}
                    onChange={e => setPaymentConfig({ ...paymentConfig, bankName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số tài khoản:</label>
                    <input
                      type="text"
                      value={paymentConfig.accountNumber}
                      onChange={e => setPaymentConfig({ ...paymentConfig, accountNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chủ tài khoản:</label>
                    <input
                      type="text"
                      value={paymentConfig.accountHolder}
                      onChange={e => setPaymentConfig({ ...paymentConfig, accountHolder: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="w-full py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-xs transition-colors"
                  >
                    {savingPayment ? "Đang lưu..." : "Lưu thông tin thanh toán"}
                  </button>
                </div>
              </form>
            </div>

            {/* 2. License Generator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Key className="w-4 h-4 text-purple-600" />
                <span>2. Tạo & Cấp Mã Kích Hoạt (License Code Generator)</span>
              </div>

              <form onSubmit={handleGenerateLicense} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nhập Email giáo viên cần cấp mã:</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="giaovien@gmail.com"
                      value={targetEmail}
                      onChange={e => setTargetEmail(e.target.value)}
                      className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      disabled={generatingLicense}
                      className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingLicense ? "Đang tạo..." : "Tạo mã"}</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700">Danh sách mã kích hoạt đã cấp gần đây:</div>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {licenses.map(lic => (
                    <div
                      key={lic.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-purple-700 flex items-center gap-1.5">
                          <span>{lic.code}</span>
                          <button
                            onClick={() => copyToClipboard(lic.code, "Mã kích hoạt")}
                            className="text-slate-400 hover:text-purple-600"
                            title="Sao chép mã"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Cấp cho: <strong>{lic.targetEmail}</strong> • Hạn: 12 tháng
                        </div>
                      </div>
                      <Badge variant={lic.isUsed ? "neutral" : "success"}>
                        {lic.isUsed ? "Đã kích hoạt" : "Chưa kích hoạt"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. User Accounts & Direct Activation Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Danh sách Giáo viên & Kích hoạt 1 Chạm (Direct User Activation)</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Tổng số: {users.length} tài khoản</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Trường / Tổ</th>
                    <th className="p-3">Ngày tạo</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác kích hoạt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const isAct = u.isActivated || u.subscriptionStatus === "ACTIVE";
                    const isExp = u.subscriptionStatus === "EXPIRED";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="p-3 font-mono text-slate-600">{u.email}</td>
                        <td className="p-3 text-slate-500">{u.schoolName || u.department || "THCS Chu Văn An"}</td>
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge variant={isAct ? "success" : isExp ? "danger" : "warning"}>
                            {isAct ? "BẢN QUYỀN 1 NĂM" : isExp ? "HẾT HẠN DÙNG THỬ" : "DÙNG THỬ (3 NGÀY)"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {isAct ? (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã mở khóa
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDirectActivate(u.email)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 shadow-xs transition-colors"
                            >
                              👑 Kích hoạt 1 năm
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
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
