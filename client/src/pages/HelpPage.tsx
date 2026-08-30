import React from "react";
import { HelpCircle, CheckCircle2, Sparkles, Shield } from "lucide-react";

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" /> Hướng dẫn sử dụng hệ thống EDUTEST AI
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Nguyên tắc vận hành và cẩm nang tạo đề kiểm tra chuẩn Bộ GD&ĐT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">1</div>
          <h4 className="font-bold text-sm text-slate-900">Bảo đảm tính sư phạm</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI chỉ đóng vai trò trợ lý đề xuất. Giáo viên luôn có quyền kiểm soát, tinh chỉnh và phê duyệt ở từng bước.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">2</div>
          <h4 className="font-bold text-sm text-slate-900">Kiểm định toán học</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            20 quy tắc kỹ thuật V01-V20 được tính toán bằng động cơ toán học độc lập, không dựa vào AI để đảm bảo 100% chính xác.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">3</div>
          <h4 className="font-bold text-sm text-slate-900">Xuất tệp đa định dạng</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hỗ trợ xuất Word (.docx), Excel (.xlsx), PDF và gói ZIP đầy đủ sẵn sàng in ấn và lưu trữ hồ sơ chuyên môn.
          </p>
        </div>
      </div>
    </div>
  );
};
