import {
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
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Lỗi kết nối máy chủ" }));
    throw new Error(err.message || `Lỗi HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth & Subscription
  getMe: () => request<{ user: User }>("/auth/me"),
  login: (email: string) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email }) }),
  register: (data: { fullName: string; email: string; schoolName?: string; subject?: string }) =>
    request<{ success: boolean; token: string; user: User; message: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  activateSubscription: (email: string, activationCode?: string) =>
    request<{ success: boolean; message: string; user: User }>("/auth/activate", { method: "POST", body: JSON.stringify({ email, activationCode }) }),
  getSubscriptionInfo: () =>
    request<{ masterEmail: string; annualFee: number; trialDays: number; bankInfo: any }>("/auth/subscription-info"),
  getUsers: () => request<User[]>("/auth/users"),

  // Projects
  getProjects: () => request<Project[]>("/projects"),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) => request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cloneProject: (id: string) => request<Project>(`/projects/${id}/clone`, { method: "POST" }),
  deleteProject: (id: string) => request<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),

  // Sources & Appendices
  getSources: (projectId: string) => request<SourceMaterial[]>(`/sources?projectId=${projectId}`),
  getAppendix: (projectId: string) => request<{ curriculum: any; midtermNotes: string; finalNotes: string }>(`/sources/appendix/${projectId}`),
  getAppendixTemplates: () => request<any[]>("/sources/appendix-templates"),
  uploadSource: async (projectId: string, file: File, sourceType: string) => {
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);
    formData.append("sourceType", sourceType);
    const token = localStorage.getItem("edutest_token");
    const res = await fetch(`${API_BASE}/sources/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  },
  getSourceFragments: (sourceId: string) => request<SourceFragment[]>(`/sources/${sourceId}/fragments`),

  // DataPack
  getDataPack: (projectId: string) => request<DataPack>(`/datapack/${projectId}`),
  generateDataPack: (projectId: string) => request<DataPack>(`/datapack/${projectId}/generate`, { method: "POST" }),
  updateDataPack: (projectId: string, data: Partial<DataPack>) => request<DataPack>(`/datapack/${projectId}`, { method: "PUT", body: JSON.stringify(data) }),
  approveDataPack: (projectId: string) => request<DataPack>(`/datapack/${projectId}/approve`, { method: "POST" }),

  // Blueprint & Matrix
  getBlueprint: (projectId: string) => request<Blueprint>(`/matrix/blueprint/${projectId}`),
  updateBlueprint: (projectId: string, data: Partial<Blueprint>) => request<Blueprint>(`/matrix/blueprint/${projectId}`, { method: "PUT", body: JSON.stringify(data) }),
  getMatrix: (projectId: string) => request<Matrix>(`/matrix/${projectId}`),
  generateMatrix: (projectId: string) => request<Matrix>(`/matrix/${projectId}/generate`, { method: "POST" }),
  updateMatrix: (projectId: string, data: Partial<Matrix>) => request<Matrix>(`/matrix/${projectId}`, { method: "PUT", body: JSON.stringify(data) }),
  approveMatrix: (projectId: string) => request<Matrix>(`/matrix/${projectId}/approve`, { method: "POST" }),

  // Specification
  getSpecification: (projectId: string) => request<Specification>(`/spec/${projectId}`),
  generateSpecification: (projectId: string) => request<Specification>(`/spec/${projectId}/generate`, { method: "POST" }),
  updateSpecification: (projectId: string, data: Partial<Specification>) => request<Specification>(`/spec/${projectId}`, { method: "PUT", body: JSON.stringify(data) }),
  approveSpecification: (projectId: string) => request<Specification>(`/spec/${projectId}/approve`, { method: "POST" }),

  // Questions
  getQuestions: (projectId?: string) => request<Question[]>(`/questions${projectId ? `?projectId=${projectId}` : ""}`),
  generateQuestion: (data: { projectId: string; specRowId?: string; questionType: string; cognitiveLevel: string }) =>
    request<Question>("/questions/generate-one", { method: "POST", body: JSON.stringify(data) }),
  generateAllQuestions: (projectId: string) => request<Question[]>(`/questions/generate-all/${projectId}`, { method: "POST" }),
  updateQuestion: (id: string, data: Partial<Question>) => request<Question>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuestion: (id: string, projectId: string) => request<{ success: boolean }>(`/questions/${id}?projectId=${projectId}`, { method: "DELETE" }),

  // Exam Assembly & Codes
  getExamAssembly: (projectId: string) => request<any>(`/exam/${projectId}`),
  shuffleExamCodes: (projectId: string, count: number) => request<any[]>(`/exam/${projectId}/shuffle-codes`, { method: "POST", body: JSON.stringify({ count }) }),

  // Validation
  getValidation: (projectId: string) => request<{ report: ValidationReport; traceability: TraceabilityLink[] }>(`/validate/${projectId}`),
  autoFixValidation: (projectId: string) => request<{ success: boolean; report: ValidationReport; traceability: TraceabilityLink[] }>(`/validate/${projectId}/auto-fix`, { method: "POST" }),

  // Exports URLs
  getExcelExportUrl: (projectId: string) => `${API_BASE}/export/${projectId}/excel`,
  getWordExportUrl: (projectId: string, withAnswers = false) => `${API_BASE}/export/${projectId}/word?withAnswers=${withAnswers}`,
  getZipExportUrl: (projectId: string) => `${API_BASE}/export/${projectId}/zip`,

  // Admin, Audit & Gemini API Key & Payments
  getAuditLogs: () => request<AuditLog[]>("/admin/audit-logs"),
  getAILogs: () => request<AIUsageLog[]>("/admin/ai-logs"),
  getSubjectRules: () => request<SubjectRuleProfile[]>("/admin/rules"),
  getGeminiKeyStatus: () => request<{ hasKey: boolean; maskedKey: string }>("/admin/gemini-key"),
  saveGeminiKey: (apiKey: string) => request<{ success: boolean; message: string; hasKey: boolean; maskedKey: string }>("/admin/gemini-key", { method: "POST", body: JSON.stringify({ apiKey }) }),
  getPaymentConfig: () => request<any>("/admin/payment-config"),
  updatePaymentConfig: (data: any) => request<any>("/admin/payment-config", { method: "POST", body: JSON.stringify(data) }),
  getLicenses: () => request<any[]>("/admin/licenses"),
  generateLicense: (targetEmail: string) => request<any>("/admin/generate-license", { method: "POST", body: JSON.stringify({ targetEmail }) }),
  adminActivateUser: (email: string) => request<any>("/admin/activate-user", { method: "POST", body: JSON.stringify({ email }) })
};
