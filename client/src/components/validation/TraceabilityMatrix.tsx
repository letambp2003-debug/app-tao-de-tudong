import React from "react";
import { TraceabilityLink, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { Badge } from "../common/Badge.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

export const TraceabilityMatrix: React.FC<{ items: TraceabilityLink[] }> = ({ items }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase">
            <th className="py-3 px-3">Câu</th>
            <th className="py-3 px-3">Nội dung câu hỏi</th>
            <th className="py-3 px-3">Dạng câu</th>
            <th className="py-3 px-3">Mức độ</th>
            <th className="py-3 px-3">Yêu cầu cần đạt</th>
            <th className="py-3 px-3">Nguồn SGK</th>
            <th className="py-3 px-3 text-center">Đáp án</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => (
            <tr key={item.questionId} className="hover:bg-slate-50">
              <td className="py-2.5 px-3 font-bold text-slate-900">{item.questionOrder}</td>
              <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                <KaTeXRenderer content={item.stem} />
              </td>
              <td className="py-2.5 px-3">
                <Badge variant="neutral">{QUESTION_TYPE_LABELS[item.questionType]}</Badge>
              </td>
              <td className="py-2.5 px-3">
                <Badge variant="primary">{COGNITIVE_LEVEL_LABELS[item.cognitiveLevel]}</Badge>
              </td>
              <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{item.yccdText}</td>
              <td className="py-2.5 px-3 text-slate-500">{item.sourceReference}</td>
              <td className="py-2.5 px-3 text-center">
                {item.hasRubricOrAnswer ? <Badge variant="success">Có</Badge> : <Badge variant="danger">Thiếu</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
