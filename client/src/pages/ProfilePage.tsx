import React from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { User, School, BookOpen, ShieldCheck } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-600" /> Hồ sơ giáo viên & Tổ chuyên môn
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Thông tin tài khoản và đơn vị công tác</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-2xl border border-brand-200">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Trường / Đơn vị:</span>
            <span className="font-bold text-slate-800">Trường THCS Chu Văn An, Tây Hồ, Hà Nội</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Tổ chuyên môn:</span>
            <span className="font-bold text-slate-800">Tổ Khoa học Tự nhiên</span>
          </div>
        </div>
      </div>
    </div>
  );
};
