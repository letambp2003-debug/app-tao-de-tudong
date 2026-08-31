import React, { useState } from "react";
import { Modal } from "./Modal.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { useNotification } from "../../contexts/NotificationContext.js";
import { Crown, CheckCircle2, ShieldCheck, Mail, CreditCard, Sparkles, Copy, Clock, AlertTriangle } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, trialDaysLeft, isExpired, activate } = useAuth();
  const { showToast } = useNotification();
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const MASTER_EMAIL = "tailieugiaoducso@gmail.com";
  const ANNUAL_FEE = "30.000 VNĐ / năm";
  const BANK_NAME = "MB Bank (Ngân hàng Quân Đội)";
  const ACCOUNT_NUM = "0987654321";
  const ACCOUNT_HOLDER = "LE TAM - EDUTEST AI";
  const SYNTAX = `EDUTEST ${user?.email || "email_cua_ban"}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast("info", "Đã sao chép", `${label}: ${text}`);
  };

  const handleActivate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await activate(user.email, activationCode || "ACTIVE-ANNUAL-30K");
      showToast("success", "Kích hoạt thành công!", `Đã kích hoạt bản quyền 1 năm liên kết với ${MASTER_EMAIL}`);
      onClose();
    } catch (err: any) {
      showToast("error", "Lỗi kích hoạt", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bản quyền & Gói đăng ký EDUTEST AI" maxWidth="xl">
      <div className="space-y-5 py-2">
        {/* Status Header */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          user?.isActivated || user?.subscriptionStatus === "ACTIVE"
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : isExpired
            ? "bg-rose-50 border-rose-200 text-rose-950"
            : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
              user?.isActivated || user?.subscriptionStatus === "ACTIVE"
                ? "bg-emerald-600"
                : isExpired
                ? "bg-rose-600"
                : "bg-amber-500"
            }`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">
                {user?.isActivated || user?.subscriptionStatus === "ACTIVE"
                  ? "BẢN QUYỀN CHÍNH THỨC (ĐÃ KÍCH HOẠT)"
                  : isExpired
                  ? "ĐÃ HẾT HẠN DÙNG THỬ 3 NGÀY"
                  : `GÓI DÙNG THỬ MIỄN PHÍ (CÒN ${trialDaysLeft} NGÀY)`}
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                Tài khoản: <span className="font-semibold">{user?.email}</span> • Phí kích hoạt: <span className="font-bold">{ANNUAL_FEE}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Account & Registration Details */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Tài khoản chủ tiếp nhận & liên kết kích hoạt:</span>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100">
            <div className="text-xs font-mono font-bold text-indigo-700">{MASTER_EMAIL}</div>
            <button
              onClick={() => copyToClipboard(MASTER_EMAIL, "Email chủ")}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <Copy className="w-3.5 h-3.5" /> Sao chép email
            </button>
          </div>
          <p className="text-[11px] text-indigo-800 leading-relaxed">
            Hệ thống áp dụng chính sách hỗ trợ giáo viên THCS/THPT toàn quốc với mức phí tượng trưng duy trì hệ thống chỉ <strong>30.000 VNĐ / năm</strong>.
          </p>
        </div>

        {/* Bank Transfer Info */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <span>Thông tin chuyển khoản kích hoạt (30.000đ / 1 năm):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Ngân hàng:</span>
              <span className="font-bold text-slate-800">{BANK_NAME}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Số tài khoản:</span>
                <span className="font-bold font-mono text-slate-900">{ACCOUNT_NUM}</span>
              </div>
              <button onClick={() => copyToClipboard(ACCOUNT_NUM, "Số tài khoản")} className="text-brand-600 hover:text-brand-800">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Chủ tài khoản:</span>
              <span className="font-bold text-slate-800">{ACCOUNT_HOLDER}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Cú pháp chuyển khoản:</span>
                <span className="font-bold font-mono text-brand-700">{SYNTAX}</span>
              </div>
              <button onClick={() => copyToClipboard(SYNTAX, "Cú pháp chuyển khoản")} className="text-brand-600 hover:text-brand-800">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Activation Action */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập mã kích hoạt (hoặc nhấn nút xác nhận bên phải)"
              value={activationCode}
              onChange={e => setActivationCode(e.target.value)}
              className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:border-brand-500 focus:outline-none"
            />
            <button
              onClick={handleActivate}
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {loading ? "Đang xử lý..." : "Xác nhận kích hoạt (30k/năm)"}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
