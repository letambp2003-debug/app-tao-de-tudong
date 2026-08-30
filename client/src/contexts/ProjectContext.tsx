import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
