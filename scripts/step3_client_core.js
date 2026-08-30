import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. client/index.html
write("client/index.html", `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EDUTEST AI - Hệ thống thiết kế ma trận, đặc tả và đề kiểm tra chuẩn Bộ GD&ĐT</title>
    <!-- KaTeX CSS for LaTeX math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous">
    <!-- Google Inter Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

// 2. client/src/styles/globals.css
write("client/src/styles/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
  code, pre {
    font-family: 'JetBrains Mono', monospace;
  }
}

/* Custom scrollbar for large matrices and specifications */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Print styling for A4 Exam Paper preview */
@media print {
  body * {
    visibility: hidden;
  }
  .printable-area, .printable-area * {
    visibility: visible;
  }
  .printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
`);

// 3. client/src/services/api.ts
write("client/src/services/api.ts", `import {
  Project,
  SourceMaterial,
  SourceFragment,
  DataPack,
  Blueprint,
  Matrix,
  Specification,
  Question,
  ValidationReport,
  TraceabilityLink,
  User,
  AuditLog,
  AIUsageLog,
  SubjectRuleProfile
} from "@shared/types/index.js";

const API_BASE = "/api";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("edutest_token");
  return token ? { Authorization: \`Bearer \${token}\` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Lỗi kết nối máy chủ" }));
    throw new Error(err.message || \`Lỗi HTTP \${response.status}\`);
  }

  return response.json();
}

export const api = {
  // Auth
  getMe: () => request<{ user: User }>("/auth/me"),
  login: (email: string) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email }) }),
  getUsers: () => request<User[]>("/auth/users"),

  // Projects
  getProjects: () => request<Project[]>("/projects"),
  getProject: (id: string) => request<Project>(\`/projects/\${id}\`),
  createProject: (data: Partial<Project>) => request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(\`/projects/\${id}\`, { method: "PUT", body: JSON.stringify(data) }),
  cloneProject: (id: string) => request<Project>(\`/projects/\${id}/clone\`, { method: "POST" }),
  deleteProject: (id: string) => request<{ success: boolean }>(\`/projects/\${id}\`, { method: "DELETE" }),

  // Sources
  getSources: (projectId: string) => request<SourceMaterial[]>(\`/sources?projectId=\${projectId}\`),
  uploadSource: async (projectId: string, file: File, sourceType: string) => {
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);
    formData.append("sourceType", sourceType);
    const token = localStorage.getItem("edutest_token");
    const res = await fetch(\`\${API_BASE}/sources/upload\`, {
      method: "POST",
      headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      body: formData
    });
    return res.json();
  },
  getSourceFragments: (sourceId: string) => request<SourceFragment[]>(\`/sources/\${sourceId}/fragments\`),

  // DataPack
  getDataPack: (projectId: string) => request<DataPack>(\`/datapack/\${projectId}\`),
  generateDataPack: (projectId: string) => request<DataPack>(\`/datapack/\${projectId}/generate\`, { method: "POST" }),
  updateDataPack: (projectId: string, data: Partial<DataPack>) => request<DataPack>(\`/datapack/\${projectId}\`, { method: "PUT", body: JSON.stringify(data) }),
  approveDataPack: (projectId: string) => request<DataPack>(\`/datapack/\${projectId}/approve\`, { method: "POST" }),

  // Blueprint & Matrix
  getBlueprint: (projectId: string) => request<Blueprint>(\`/matrix/blueprint/\${projectId}\`),
  updateBlueprint: (projectId: string, data: Partial<Blueprint>) => request<Blueprint>(\`/matrix/blueprint/\${projectId}\`, { method: "PUT", body: JSON.stringify(data) }),
  getMatrix: (projectId: string) => request<Matrix>(\`/matrix/\${projectId}\`),
  generateMatrix: (projectId: string) => request<Matrix>(\`/matrix/\${projectId}/generate\`, { method: "POST" }),
  updateMatrix: (projectId: string, data: Partial<Matrix>) => request<Matrix>(\`/matrix/\${projectId}\`, { method: "PUT", body: JSON.stringify(data) }),
  approveMatrix: (projectId: string) => request<Matrix>(\`/matrix/\${projectId}/approve\`, { method: "POST" }),

  // Specification
  getSpecification: (projectId: string) => request<Specification>(\`/spec/\${projectId}\`),
  generateSpecification: (projectId: string) => request<Specification>(\`/spec/\${projectId}/generate\`, { method: "POST" }),
  updateSpecification: (projectId: string, data: Partial<Specification>) => request<Specification>(\`/spec/\${projectId}\`, { method: "PUT", body: JSON.stringify(data) }),
  approveSpecification: (projectId: string) => request<Specification>(\`/spec/\${projectId}/approve\`, { method: "POST" }),

  // Questions
  getQuestions: (projectId?: string) => request<Question[]>(\`/questions\${projectId ? \`?projectId=\${projectId}\` : ""}\`),
  generateQuestion: (data: { projectId: string; specRowId?: string; questionType: string; cognitiveLevel: string }) =>
    request<Question>("/questions/generate-one", { method: "POST", body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: Partial<Question>) => request<Question>(\`/questions/\${id}\`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuestion: (id: string, projectId: string) => request<{ success: boolean }>(\`/questions/\${id}?projectId=\${projectId}\`, { method: "DELETE" }),

  // Exam Assembly & Codes
  getExamAssembly: (projectId: string) => request<any>(\`/exam/\${projectId}\`),
  shuffleExamCodes: (projectId: string, count: number) => request<any[]>(\`/exam/\${projectId}/shuffle-codes\`, { method: "POST", body: JSON.stringify({ count }) }),

  // Validation
  getValidation: (projectId: string) => request<{ report: ValidationReport; traceability: TraceabilityLink[] }>(\`/validate/\${projectId}\`),

  // Exports URLs
  getExcelExportUrl: (projectId: string) => \`\${API_BASE}/export/\${projectId}/excel\`,
  getWordExportUrl: (projectId: string, withAnswers = false) => \`\${API_BASE}/export/\${projectId}/word?withAnswers=\${withAnswers}\`,
  getZipExportUrl: (projectId: string) => \`\${API_BASE}/export/\${projectId}/zip\`,

  // Admin & Audit
  getAuditLogs: () => request<AuditLog[]>("/admin/audit-logs"),
  getAILogs: () => request<AIUsageLog[]>("/admin/ai-logs"),
  getSubjectRules: () => request<SubjectRuleProfile[]>("/admin/rules")
};
`);

// 4. client/src/contexts/AuthContext.tsx
write("client/src/contexts/AuthContext.tsx", `import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types/index.js";
import { api } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  loading: boolean;
  login: (email: string) => Promise<void>;
  switchUser: (userId: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const users = await api.getUsers();
        setAllUsers(users);
        const meRes = await api.getMe();
        setUser(meRes.user || users[3]); // Default Teacher
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string) => {
    const res = await api.login(email);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      localStorage.setItem("edutest_token", target.id);
      setUser(target);
    }
  };

  const logout = () => {
    localStorage.removeItem("edutest_token");
    if (allUsers.length > 0) {
      setUser(allUsers[3]); // Switch back to teacher for easy demo
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, allUsers, loading, login, switchUser, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
`);

// 5. client/src/contexts/NotificationContext.tsx
write("client/src/contexts/NotificationContext.tsx", `import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    const newToast: Toast = { id, type, title, message, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={\`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 \${
              t.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                : t.type === "warning"
                ? "bg-amber-50/95 border-amber-200 text-amber-900"
                : t.type === "error"
                ? "bg-rose-50/95 border-rose-200 text-rose-900"
                : "bg-blue-50/95 border-blue-200 text-blue-900"
            }\`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.message && <div className="text-xs mt-0.5 opacity-90 leading-relaxed">{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
`);

// 6. client/src/contexts/ProjectContext.tsx
write("client/src/contexts/ProjectContext.tsx", `import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Project,
  SourceMaterial,
  DataPack,
  Blueprint,
  Matrix,
  Specification,
  Question,
  ValidationReport,
  TraceabilityLink
} from "@shared/types/index.js";
import { api } from "../services/api.js";
import { useNotification } from "./NotificationContext.js";

interface ProjectContextType {
  project: Project | null;
  sources: SourceMaterial[];
  dataPack: DataPack | null;
  blueprint: Blueprint | null;
  matrix: Matrix | null;
  specification: Specification | null;
  questions: Question[];
  validationReport: ValidationReport | null;
  traceability: TraceabilityLink[];
  loading: boolean;
  saving: boolean;
  aiProcessing: boolean;
  loadProject: (projectId: string) => Promise<void>;
  refreshValidation: () => Promise<void>;
  saveCurrentStep: (stepKey: string, data: any) => Promise<void>;
  generateStepAI: (stepKey: string) => Promise<void>;
  approveStep: (stepKey: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<SourceMaterial[]>([]);
  const [dataPack, setDataPack] = useState<DataPack | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [specification, setSpecification] = useState<Specification | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [traceability, setTraceability] = useState<TraceabilityLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const { showToast } = useNotification();

  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const [p, s, dp, bp, m, sp, q] = await Promise.all([
        api.getProject(projectId),
        api.getSources(projectId).catch(() => []),
        api.getDataPack(projectId).catch(() => null),
        api.getBlueprint(projectId).catch(() => null),
        api.getMatrix(projectId).catch(() => null),
        api.getSpecification(projectId).catch(() => null),
        api.getQuestions(projectId).catch(() => [])
      ]);

      setProject(p);
      setSources(s);
      setDataPack(dp);
      setBlueprint(bp);
      setMatrix(m);
      setSpecification(sp);
      setQuestions(q);

      // Trigger automatic validation check
      const val = await api.getValidation(projectId).catch(() => null);
      if (val) {
        setValidationReport(val.report);
        setTraceability(val.traceability);
      }
    } catch (err: any) {
      showToast("error", "Lỗi tải dự án", err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refreshValidation = async () => {
    if (!project) return;
    try {
      const val = await api.getValidation(project.id);
      setValidationReport(val.report);
      setTraceability(val.traceability);
    } catch (err: any) {
      console.error("Validation refresh error:", err);
    }
  };

  const saveCurrentStep = async (stepKey: string, data: any) => {
    if (!project) return;
    setSaving(true);
    try {
      if (stepKey === "DATAPACK") {
        const updated = await api.updateDataPack(project.id, data);
        setDataPack(updated);
      } else if (stepKey === "BLUEPRINT") {
        const updated = await api.updateBlueprint(project.id, data);
        setBlueprint(updated);
      } else if (stepKey === "MATRIX") {
        const updated = await api.updateMatrix(project.id, data);
        setMatrix(updated);
      } else if (stepKey === "SPECIFICATION") {
        const updated = await api.updateSpecification(project.id, data);
        setSpecification(updated);
      }
      showToast("success", "Đã lưu tự động", "Dữ liệu được cập nhật an toàn.");
      refreshValidation();
    } catch (err: any) {
      showToast("error", "Lỗi lưu dữ liệu", err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateStepAI = async (stepKey: string) => {
    if (!project) return;
    setAiProcessing(true);
    try {
      if (stepKey === "DATAPACK") {
        const dp = await api.generateDataPack(project.id);
        setDataPack(dp);
        showToast("success", "AI đã tạo Data Pack", "Đã nhận diện các chủ đề, bài học và YCCĐ.");
      } else if (stepKey === "MATRIX") {
        const mat = await api.generateMatrix(project.id);
        setMatrix(mat);
        showToast("success", "AI đã đề xuất Ma trận", "Phân bổ số câu và điểm khớp chuẩn Blueprint.");
      } else if (stepKey === "SPECIFICATION") {
        const spec = await api.generateSpecification(project.id);
        setSpecification(spec);
        showToast("success", "AI đã tạo Bản đặc tả", "Đã liên kết từng dòng ma trận với YCCĐ và nguồn SGK.");
      }
      refreshValidation();
    } catch (err: any) {
      showToast("error", "Lỗi xử lý AI", err.message);
    } finally {
      setAiProcessing(false);
    }
  };

  const approveStep = async (stepKey: string) => {
    if (!project) return;
    try {
      if (stepKey === "DATAPACK") {
        const dp = await api.approveDataPack(project.id);
        setDataPack(dp);
        showToast("success", "Đã phê duyệt Data Pack", "Bạn có thể chuyển sang cấu hình Blueprint.");
      } else if (stepKey === "MATRIX") {
        const mat = await api.approveMatrix(project.id);
        setMatrix(mat);
        showToast("success", "Đã phê duyệt Ma trận", "Phiên bản ma trận đã được khóa.");
      } else if (stepKey === "SPECIFICATION") {
        const spec = await api.approveSpecification(project.id);
        setSpecification(spec);
        showToast("success", "Đã phê duyệt Bản đặc tả", "Sẵn sàng để sinh các dạng câu hỏi.");
      }
      const updatedProj = await api.getProject(project.id);
      setProject(updatedProj);
      refreshValidation();
    } catch (err: any) {
      showToast("error", "Lỗi phê duyệt", err.message);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        sources,
        dataPack,
        blueprint,
        matrix,
        specification,
        questions,
        validationReport,
        traceability,
        loading,
        saving,
        aiProcessing,
        loadProject,
        refreshValidation,
        saveCurrentStep,
        generateStepAI,
        approveStep
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};
`);

// 7. client/src/router.tsx
write("client/src/router.tsx", `import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { ProjectWizardPage } from "./pages/ProjectWizardPage.js";
import { QuestionBankPage } from "./pages/QuestionBankPage.js";
import { AdminPage } from "./pages/AdminPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { HelpPage } from "./pages/HelpPage.js";
import { MainLayout } from "./components/layout/MainLayout.js";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-slate-500 font-medium">Đang tải EDUTEST AI...</div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectWizardPage /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
`);

// 8. client/src/App.tsx & main.tsx
write("client/src/App.tsx", `import React from "react";
import { AuthProvider } from "./contexts/AuthContext.js";
import { NotificationProvider } from "./contexts/NotificationContext.js";
import { ProjectProvider } from "./contexts/ProjectContext.js";
import { AppRouter } from "./router.js";

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};
`);

write("client/src/main.tsx", `import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

console.log("Step 3 Client Core generated successfully.");
