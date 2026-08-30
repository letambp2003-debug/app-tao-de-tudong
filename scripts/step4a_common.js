import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. KaTeXRenderer.tsx
write("client/src/components/common/KaTeXRenderer.tsx", `import React from "react";
import katex from "katex";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  const renderFormatted = () => {
    const parts: (string | React.ReactNode)[] = [];
    const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const formula = match[0];
      const isDisplay = formula.startsWith("$$");
      const cleanFormula = isDisplay ? formula.slice(2, -2) : formula.slice(1, -1);

      try {
        const html = katex.renderToString(cleanFormula, {
          displayMode: isDisplay,
          throwOnError: false
        });
        parts.push(<span key={match.index} dangerouslySetInnerHTML={{ __html: html }} />);
      } catch (err) {
        parts.push(<span key={match.index} className="text-red-500 font-mono text-xs">{formula}</span>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return <div className={\`inline-block leading-relaxed \${className}\`}>{renderFormatted()}</div>;
};
`);

// 2. Badge.tsx & Modal.tsx
write("client/src/components/common/Badge.tsx", `import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", size = "sm", className = "" }) => {
  const variantStyles = {
    primary: "bg-brand-50 text-brand-700 border-brand-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200"
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-sm font-medium"
  };

  return (
    <span className={\`inline-flex items-center gap-1 rounded-md border \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}>
      {children}
    </span>
  );
};
`);

write("client/src/components/common/Modal.tsx", `import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "2xl"
}) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl"
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={\`relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full \${maxWidthClass} z-10 flex flex-col max-h-[90vh] overflow-hidden transform transition-all\`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};
`);

// 3. Header.tsx, Sidebar.tsx, StepProgressBar.tsx, MainLayout.tsx
write("client/src/components/layout/Header.tsx", `import React from "react";
import { useAuth } from "../../contexts/AuthContext.js";
import { Sparkles, Bell, HelpCircle, Shield, UserCheck, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
  const { user, allUsers, switchUser } = useAuth();

  return (
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

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500 font-medium">Vai trò test:</span>
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
  );
};
`);

write("client/src/components/layout/Sidebar.tsx", `import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Database, ShieldCheck, User, HelpCircle, BookOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.js";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Bảng điều khiển", icon: LayoutDashboard, path: "/" },
    { label: "Ngân hàng câu hỏi", icon: Database, path: "/questions" },
    { label: "Quản trị & Quy tắc", icon: ShieldCheck, path: "/admin" },
    { label: "Hồ sơ giáo viên", icon: User, path: "/profile" },
    { label: "Hướng dẫn sử dụng", icon: HelpCircle, path: "/help" }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Phân hệ chính
        </div>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={\`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 \${
                active
                  ? "bg-brand-50 text-brand-700 shadow-xs border border-brand-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }\`}
            >
              <Icon className={\`w-4 h-4 \${active ? "text-brand-600" : "text-slate-400"}\`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-gradient-to-br from-brand-50 to-blue-50/50 rounded-2xl border border-brand-100">
        <div className="flex items-center gap-2 text-brand-700 font-bold text-xs mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Nguyên tắc vận hành</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          AI đề xuất → Hệ thống kiểm tra → Giáo viên phê duyệt → Chuyển bước.
        </p>
      </div>
    </aside>
  );
};
`);

write("client/src/components/layout/StepProgressBar.tsx", `import React from "react";
import { CheckCircle2 } from "lucide-react";
import { ProjectStatus } from "@shared/types/index.js";

export interface StepDef {
  key: string;
  title: string;
}

export const WORKFLOW_STEPS: StepDef[] = [
  { key: "INFO", title: "1. Khởi tạo đề" },
  { key: "SOURCES", title: "2. Nguồn tài liệu" },
  { key: "DATAPACK", title: "3. Data Pack" },
  { key: "BLUEPRINT", title: "4. Cơ cấu đề" },
  { key: "MATRIX", title: "5. Ma trận" },
  { key: "SPECIFICATION", title: "6. Bản đặc tả" },
  { key: "QUESTIONS", title: "7. Câu hỏi & Đề" },
  { key: "VALIDATE", title: "8. Kiểm định" },
  { key: "EXPORT", title: "9. Xuất bản" }
];

interface StepProgressBarProps {
  currentStepKey: string;
  onSelectStep: (stepKey: string) => void;
  projectStatus: ProjectStatus;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStepKey,
  onSelectStep
}) => {
  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.key === currentStepKey);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 overflow-x-auto">
      <div className="flex items-center min-w-max gap-2">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCurrent = step.key === currentStepKey;
          const isPassed = idx < currentIdx;

          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => onSelectStep(step.key)}
                className={\`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all \${
                  isCurrent
                    ? "bg-brand-600 text-white shadow-sm"
                    : isPassed
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "text-slate-500 hover:bg-slate-100"
                }\`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <div
                    className={\`w-4 h-4 rounded-full flex items-center justify-center text-[10px] \${
                      isCurrent ? "bg-white text-brand-600 font-bold" : "bg-slate-200 text-slate-600"
                    }\`}
                  >
                    {idx + 1}
                  </div>
                )}
                <span>{step.title}</span>
              </button>
              {idx < WORKFLOW_STEPS.length - 1 && <div className="w-3 h-0.5 bg-slate-200" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
`);

write("client/src/components/layout/MainLayout.tsx", `import React from "react";
import { Header } from "./Header.js";
import { Sidebar } from "./Sidebar.js";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
};
`);

console.log("Step 4a Common components written successfully.");
