import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.js";
import { Sparkles, HelpCircle, UserCheck, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { GeminiKeyModal } from "../common/GeminiKeyModal.js";

export const Header: React.FC = () => {
  const { user, allUsers, switchUser } = useAuth();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-brand-600 font-extrabold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>EDUTEST<span className="text-slate-800">.AI</span></span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
            GDPT 2018
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Gemini AI Key Config Button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors shadow-xs"
            title="Cấu hình Google AI Studio API Key (Gemini)"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Google AI Studio API</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 font-medium">Vai trò:</span>
            <select
              value={user?.id}
              onChange={e => switchUser(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role.replace("R0", "R").replace("_", " ")})
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/help"
            className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Trợ giúp & Hướng dẫn"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{user?.role}</div>
            </div>
          </div>
        </div>
      </header>

      <GeminiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
};
