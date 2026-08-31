import React, { useState } from "react";
import { Question } from "@shared/types/index.js";
import { Modal } from "../common/Modal.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface QuestionEditorModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Question) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({ question, isOpen, onClose, onSave }) => {
  if (!question) return null;

  const [formData, setFormData] = useState<Question>({ ...question });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Biên tập câu hỏi ${formData.orderNumber} (${formData.type})`}
      maxWidth="4xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs">
            Lưu thay đổi
          </button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Question Stem */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nội dung câu hỏi (sử dụng công thức LaTeX $...$ hoặc $$...$$):
          </label>
          <textarea
            value={formData.stem}
            onChange={e => setFormData({ ...formData, stem: e.target.value })}
            rows={3}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="mt-1.5 p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200/80">
            <span className="text-slate-400 font-bold block mb-1 text-[11px]">Xem trước công thức:</span>
            <div className="text-slate-900 font-medium">
              <KaTeXRenderer content={formData.stem} />
            </div>
          </div>
        </div>

        {/* Multiple Choice Options */}
        {formData.type === "MULTIPLE_CHOICE" && formData.mcOptions && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">Các phương án lựa chọn (Chọn nút tròn để đặt đáp án đúng):</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.mcOptions.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`p-3 rounded-xl border space-y-2 ${
                    opt.isCorrect ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOpts = formData.mcOptions!.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setFormData({ ...formData, mcOptions: newOpts });
                      }}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="font-extrabold text-sm text-slate-800">{opt.label}.</span>
                    <input
                      type="text"
                      value={opt.content}
                      onChange={e => {
                        const newOpts = [...formData.mcOptions!];
                        newOpts[idx].content = e.target.value;
                        setFormData({ ...formData, mcOptions: newOpts });
                      }}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 min-h-[30px] flex items-center">
                    <KaTeXRenderer content={opt.content} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* True / False Items */}
        {formData.type === "TRUE_FALSE_4" && formData.tfItems && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">4 Ý nhận định Đúng - Sai:</label>
            {formData.tfItems.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs w-6">{item.label})</span>
                  <input
                    type="text"
                    value={item.content}
                    onChange={e => {
                      const newItems = [...formData.tfItems!];
                      newItems[idx].content = e.target.value;
                      setFormData({ ...formData, tfItems: newItems });
                    }}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                  />
                  <select
                    value={item.isCorrect ? "TRUE" : "FALSE"}
                    onChange={e => {
                      const newItems = [...formData.tfItems!];
                      newItems[idx].isCorrect = e.target.value === "TRUE";
                      setFormData({ ...formData, tfItems: newItems });
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="TRUE">ĐÚNG</option>
                    <option value="FALSE">SAI</option>
                  </select>
                </div>
                <div className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                  <KaTeXRenderer content={item.content} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Short Answer Spec */}
        {formData.type === "SHORT_ANSWER" && formData.saSpec && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700">Đáp án chuẩn & Đơn vị:</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Giá trị số (VD: 24)"
                value={formData.saSpec.expectedAnswer}
                onChange={e => setFormData({
                  ...formData,
                  saSpec: { ...formData.saSpec!, expectedAnswer: e.target.value }
                })}
                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
              <input
                type="text"
                placeholder="Đơn vị (VD: cm²)"
                value={formData.saSpec.unit || ""}
                onChange={e => setFormData({
                  ...formData,
                  saSpec: { ...formData.saSpec!, unit: e.target.value }
                })}
                className="w-32 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Lời giải chi tiết / Hướng dẫn chấm:</label>
          <textarea
            value={formData.explanation || ""}
            onChange={e => setFormData({ ...formData, explanation: e.target.value })}
            rows={2}
            className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
};
