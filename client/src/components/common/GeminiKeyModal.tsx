import React, { useState, useEffect } from "react";
import { Modal } from "./Modal.js";
import { api } from "../../services/api.js";
import { useNotification } from "../../contexts/NotificationContext.js";
import { Sparkles, Key, CheckCircle2, Shield, ExternalLink, RefreshCw } from "lucide-react";

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<{ hasKey: boolean; maskedKey: string }>({ hasKey: false, maskedKey: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getGeminiKeyStatus()
        .then(setStatus)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showToast("error", "Lỗi nhập liệu", "Vui lòng dán Google AI Studio API Key.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.saveGeminiKey(apiKey.trim());
      setStatus({ hasKey: res.hasKey, maskedKey: res.maskedKey });
      setApiKey("");
      showToast("success", "Cấu hình thành công", "Google AI Studio API Key đã được kích hoạt.");
      if (onKeySaved) onKeySaved();
      onClose();
    } catch (err: any) {
      showToast("error", "Lỗi lưu API Key", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cấu hình Google AI Studio API Key (Gemini)" maxWidth="xl">
      <div className="space-y-5 py-2">
        {/* Info Card */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Thứ tự ưu tiên mô hình AI (Model Cascade Sequence):</span>
          </div>
          <div className="text-xs text-purple-800 space-y-1">
            <p>Hệ thống tự động kích hoạt và chuyển đổi mượt mà theo chuỗi mô hình:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-white text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]">1. gemini-2.0-flash</span>
              <span className="text-purple-400">→</span>
              <span className="px-2 py-0.5 bg-white text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]">2. gemini-1.5-flash</span>
              <span className="text-purple-400">→</span>
              <span className="px-2 py-0.5 bg-white text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]">3. gemini-1.5-pro</span>
              <span className="text-purple-400">→</span>
              <span className="px-2 py-0.5 bg-white text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]">4. Fallback Sư phạm</span>
            </div>
          </div>
        </div>

        {/* Current Key Status */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-slate-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Trạng thái API Key hiện tại:</div>
              <div className="text-xs text-slate-500">
                {status.hasKey ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Đang hoạt động ({status.maskedKey})
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">Chưa thiết lập (Đang dùng AI mô phỏng chất lượng cao)</span>
                )}
              </div>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brand-600 font-bold hover:underline"
          >
            Lấy key miễn phí <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Dán Google AI Studio API Key mới:</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
          />
          <p className="text-[11px] text-slate-400">API Key của bạn được lưu an toàn trong phiên làm việc của máy chủ.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {saving ? "Đang lưu..." : "Kích hoạt Gemini AI"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
