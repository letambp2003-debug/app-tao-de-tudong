import React from "react";
import { Modal } from "../common/Modal.js";
import { FileSpreadsheet, FileText, Archive } from "lucide-react";
import { api } from "../../services/api.js";

interface ExportModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ projectId, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xuất trọn bộ hồ sơ đề kiểm tra" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Định dạng chuẩn theo Nghị định 30/2020/NĐ-CP và hướng dẫn khảo thí GDPT 2018.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={api.getExcelExportUrl(projectId)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
          >
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Ma trận & Đặc tả (.XLSX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Bảng tính Excel tự động tính toán</div>
            </div>
          </a>

          <a
            href={api.getWordExportUrl(projectId, false)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-brand-600 text-white rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Đề kiểm tra (.DOCX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Tệp Word in cho học sinh</div>
            </div>
          </a>

          <a
            href={api.getWordExportUrl(projectId, true)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors"
          >
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Hướng dẫn chấm (.DOCX)</div>
              <div className="text-xs text-slate-500 mt-0.5">Đáp án chi tiết & Rubric tự luận</div>
            </div>
          </a>

          <a
            href={api.getZipExportUrl(projectId)}
            download
            className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors"
          >
            <div className="p-3 bg-amber-600 text-white rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Gói dự án (.ZIP)</div>
              <div className="text-xs text-slate-500 mt-0.5">Bao gồm Word, Excel, JSON và Báo cáo</div>
            </div>
          </a>
        </div>
      </div>
    </Modal>
  );
};
