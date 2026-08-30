import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "../contexts/ProjectContext.js";
import { useAuth } from "../contexts/AuthContext.js";
import { useNotification } from "../contexts/NotificationContext.js";
import { StepProgressBar } from "../components/layout/StepProgressBar.js";
import { MatrixGrid } from "../components/matrix/MatrixGrid.js";
import { SpecificationTable } from "../components/spec/SpecificationTable.js";
import { QuestionCard } from "../components/questions/QuestionCard.js";
import { QuestionEditorModal } from "../components/questions/QuestionEditorModal.js";
import { ValidationReportPanel } from "../components/validation/ValidationReportPanel.js";
import { TraceabilityMatrix } from "../components/validation/TraceabilityMatrix.js";
import { A4PrintPreview } from "../components/preview/A4PrintPreview.js";
import { ExportModal } from "../components/export/ExportModal.js";
import { Badge } from "../components/common/Badge.js";
import { Modal } from "../components/common/Modal.js";
import { api } from "../services/api.js";
import { Question } from "@shared/types/index.js";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Download,
  Shuffle,
  ShieldCheck,
  RefreshCw,
  Plus
} from "lucide-react";

export const ProjectWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user } = useAuth();

  const {
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
    aiProcessing,
    loadProject,
    saveCurrentStep,
    generateStepAI,
    approveStep,
    refreshValidation
  } = useProject();

  const [currentStep, setCurrentStep] = useState("INFO");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (loading || !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-slate-500 font-medium">Đang tải dữ liệu hồ sơ đề...</div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      await api.uploadSource(project.id, file, "SGK");
      showToast("success", "Tải tệp thành công", file.name);
      loadProject(project.id);
    } catch (err: any) {
      showToast("error", "Lỗi tải tệp", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleShuffleCodes = async () => {
    try {
      await api.shuffleExamCodes(project.id, 4);
      showToast("success", "Đã tạo 4 mã đề (101, 102, 103, 104)", "Đã xáo trộn thứ tự các câu theo từng phần.");
    } catch (err: any) {
      showToast("error", "Lỗi tạo mã đề", err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Project Context Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900">{project.name}</h1>
            <Badge variant="primary">{project.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {project.subject} {project.grade} • {project.organizationName} • Người tạo: {project.authorName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Xuất hồ sơ đề
          </button>
        </div>
      </div>

      {/* 9-Step Progress Bar */}
      <StepProgressBar
        currentStepKey={currentStep}
        onSelectStep={setCurrentStep}
        projectStatus={project.status}
      />

      {/* STEP 1: INFO */}
      {currentStep === "INFO" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-3xl">
          <h3 className="font-bold text-base text-slate-900">Thông tin cơ bản hồ sơ đề</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên kỳ thi / Đề kiểm tra:</label>
              <input
                type="text"
                value={project.name}
                onChange={e => saveCurrentStep("INFO", { ...project, name: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
              <input type="text" disabled value={project.subject} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời gian làm bài (Phút):</label>
              <input
                type="number"
                value={project.durationMinutes}
                onChange={e => saveCurrentStep("INFO", { ...project, durationMinutes: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thang điểm tổng:</label>
              <input type="number" disabled value={project.totalScore} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep("SOURCES")}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
            >
              Tiếp theo: Nguồn tài liệu <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SOURCES */}
      {currentStep === "SOURCES" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Tài liệu nguồn & Cơ sở kiến thức (SGK / Chuẩn CT GDPT)</h3>
                <p className="text-xs text-slate-500">Tải lên tệp SGK (PDF, DOCX) để trích xuất ngữ liệu và số trang tham chiếu</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4" /> {isUploading ? "Đang xử lý..." : "Tải lên tệp SGK"}
                <input type="file" accept=".pdf,.docx,.xlsx" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
              </label>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {sources.map(src => (
                <div key={src.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{src.fileName}</div>
                      <div className="text-[11px] text-slate-400">
                        {src.fileType} • {src.pageCount} trang • Trạng thái: {src.status}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">Đã trích xuất {src.pageCount} trang</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("INFO")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("DATAPACK")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Data Pack <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATAPACK */}
      {currentStep === "DATAPACK" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Gói dữ liệu chuẩn hóa (Data Pack)</h3>
                <p className="text-xs text-slate-500">Danh mục Chủ đề, Bài học và Yêu cầu cần đạt (YCCĐ) gắn mã định danh</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateStepAI("DATAPACK")}
                  disabled={aiProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> {aiProcessing ? "AI Đang xử lý..." : "AI Tạo Data Pack"}
                </button>
                {dataPack && !dataPack.isApproved && (
                  <button
                    onClick={() => approveStep("DATAPACK")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt Data Pack
                  </button>
                )}
              </div>
            </div>

            {dataPack && (
              <div className="space-y-4">
                {dataPack.topics.map(t => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Badge variant="primary">{t.code}</Badge> {t.name}
                    </div>
                    <div className="pl-4 space-y-2">
                      {dataPack.yccds.map(y => (
                        <div key={y.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800"><Badge variant="neutral">{y.code}</Badge> {y.description}</div>
                            <div className="text-[11px] text-slate-400">Tham chiếu: {y.sourceReference}</div>
                          </div>
                          <Badge variant="primary">{y.cognitiveLevelDefault}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("SOURCES")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("BLUEPRINT")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Cơ cấu đề <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BLUEPRINT */}
      {currentStep === "BLUEPRINT" && blueprint && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900">Khung cơ cấu đề kiểm tra (Blueprint)</h3>
              <p className="text-xs text-slate-500">Tỉ lệ mức độ nhận thức (NB 40% - TH 30% - VD 20% - VDC 10%) và cấu trúc 4 dạng câu</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {blueprint.questionTypeConfigs.map(cfg => (
                <div key={cfg.type} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-slate-700">{cfg.type}</div>
                  <div className="text-lg font-extrabold text-brand-600">{cfg.count} câu</div>
                  <div className="text-[11px] text-slate-500">{cfg.pointsPerItem} đ/câu = {cfg.totalScore} đ</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("DATAPACK")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("MATRIX")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Ma trận đề <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MATRIX */}
      {currentStep === "MATRIX" && matrix && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Ma trận đề kiểm tra định kỳ</h3>
                <p className="text-xs text-slate-500">Bảng phân bổ chi tiết số lượng câu hỏi và điểm số theo từng đơn vị kiến thức</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateStepAI("MATRIX")}
                  disabled={aiProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> {aiProcessing ? "AI Đang tạo..." : "AI Đề xuất Ma trận"}
                </button>
                {!matrix.isApproved && (
                  <button
                    onClick={() => approveStep("MATRIX")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt Ma trận
                  </button>
                )}
              </div>
            </div>

            <MatrixGrid matrix={matrix} onUpdate={m => saveCurrentStep("MATRIX", m)} readOnly={matrix.isApproved} />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("BLUEPRINT")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("SPECIFICATION")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Bản đặc tả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SPECIFICATION */}
      {currentStep === "SPECIFICATION" && specification && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Bản đặc tả đề kiểm tra</h3>
                <p className="text-xs text-slate-500">Mỗi dòng liên kết chặt chẽ với ma trận, chỉ rõ YCCĐ và biểu hiện năng lực</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateStepAI("SPECIFICATION")}
                  disabled={aiProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" /> {aiProcessing ? "AI Đang tạo..." : "AI Tạo Đặc tả"}
                </button>
                {!specification.isApproved && (
                  <button
                    onClick={() => approveStep("SPECIFICATION")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt Đặc tả
                  </button>
                )}
              </div>
            </div>

            <SpecificationTable specification={specification} />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("MATRIX")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("QUESTIONS")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Soạn câu hỏi & Lắp ráp <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: QUESTIONS & ASSEMBLY */}
      {currentStep === "QUESTIONS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Danh sách câu hỏi đề kiểm tra ({questions.length} câu)</h3>
              <p className="text-xs text-slate-500">Phần I (16 TN), Phần II (2 Đ-S), Phần III (4 Trả lời ngắn), Phần IV (2 Tự luận)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffleCodes}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 shadow-xs"
              >
                <Shuffle className="w-4 h-4" /> Xáo trộn 4 mã đề (101 - 104)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                onEdit={setEditingQuestion}
                onDelete={async qId => {
                  await api.deleteQuestion(qId, project.id);
                  loadProject(project.id);
                }}
              />
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setCurrentStep("SPECIFICATION")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("VALIDATE")} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700">
              Tiếp theo: Kiểm định đề (V01-V20) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: VALIDATE */}
      {currentStep === "VALIDATE" && (
        <div className="space-y-6">
          <ValidationReportPanel report={validationReport} onRefresh={refreshValidation} />
          {traceability.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Ma trận truy vết nguồn gốc (Traceability Matrix)</h4>
              <TraceabilityMatrix items={traceability} />
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setCurrentStep("QUESTIONS")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => setCurrentStep("EXPORT")} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
              Tiếp theo: Xuất bản & In ấn <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: EXPORT & PRINT */}
      {currentStep === "EXPORT" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Xem trước bản in A4 tiêu chuẩn</h3>
              <p className="text-xs text-slate-500">Đã căn lề chuẩn theo Thông tư 22/2021/TT-BGDĐT</p>
            </div>
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs"
            >
              <Download className="w-4 h-4" /> Tải gói hồ sơ (.DOCX, .XLSX, .ZIP)
            </button>
          </div>

          <A4PrintPreview project={project} questions={questions} showAnswers={true} />

          <div className="flex justify-between no-print">
            <button onClick={() => setCurrentStep("VALIDATE")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Quay lại
            </button>
            <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800">
              Về bảng điều khiển
            </button>
          </div>
        </div>
      )}

      {/* Question Editor Modal */}
      <QuestionEditorModal
        question={editingQuestion}
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        onSave={async updated => {
          await api.updateQuestion(updated.id, { ...updated, projectId: project.id });
          loadProject(project.id);
          showToast("success", "Đã cập nhật câu hỏi", `Câu ${updated.orderNumber}`);
        }}
      />

      {/* Export Modal */}
      <ExportModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
