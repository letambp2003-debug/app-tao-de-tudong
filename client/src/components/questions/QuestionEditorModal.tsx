import React, { useState } from "react";
import { Question } from "@shared/types/index.js";
import { Modal } from "../common/Modal.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

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
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi (LaTeX $...$):</label>
          <textarea
            value={formData.stem}
            onChange={e => setFormData({ ...formData, stem: e.target.value })}
            rows={3}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="mt-1.5 p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">Xem trước:</span>
            <KaTeXRenderer content={formData.stem} />
          </div>
        </div>

        {formData.type === "MULTIPLE_CHOICE" && formData.mcOptions && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Các phương án:</label>
            {formData.mcOptions.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={opt.isCorrect}
                  onChange={() => {
                    const newOpts = formData.mcOptions!.map((o, i) => ({ ...o, isCorrect: i === idx }));
                    setFormData({ ...formData, mcOptions: newOpts });
                  }}
                  className="w-4 h-4 text-brand-600"
                />
                <span className="font-bold text-sm w-5">{opt.label}.</span>
                <input
                  type="text"
                  value={opt.content}
                  onChange={e => {
                    const newOpts = [...formData.mcOptions!];
                    newOpts[idx].content = e.target.value;
                    setFormData({ ...formData, mcOptions: newOpts });
                  }}
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
