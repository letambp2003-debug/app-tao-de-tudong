import React from "react";
import { Specification, Topic, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { Badge } from "../common/Badge.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

interface SpecificationTableProps {
  specification: Specification;
  topics?: Topic[];
  readOnly?: boolean;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({ specification, topics = [] }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase">
            <th className="py-3.5 px-4">STT</th>
            <th className="py-3.5 px-4">Chủ đề</th>
            <th className="py-3.5 px-4">Yêu cầu cần đạt (YCCĐ)</th>
            <th className="py-3.5 px-4 text-center">Mức độ</th>
            <th className="py-3.5 px-4">Dạng câu</th>
            <th className="py-3.5 px-4 text-center">Số câu</th>
            <th className="py-3.5 px-4 text-center">Điểm</th>
            <th className="py-3.5 px-4">Nguồn tham chiếu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {specification.rows.map((row, idx) => {
            const matchedTopic = topics.find(t => t.id === row.topicId);
            const topicDisplayName = matchedTopic ? `${matchedTopic.code}: ${matchedTopic.name}` : row.topicId;

            return (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                  {topicDisplayName}
                </td>
                <td className="py-3 px-4 text-slate-800 leading-relaxed max-w-md">
                  <KaTeXRenderer content={row.yccdText} />
                  <div className="text-[11px] text-slate-400 mt-1">Năng lực: {row.competency}</div>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={
                      row.cognitiveLevel === "NB"
                        ? "success"
                        : row.cognitiveLevel === "TH"
                        ? "primary"
                        : row.cognitiveLevel === "VD"
                        ? "warning"
                        : "purple"
                    }
                  >
                    {COGNITIVE_LEVEL_LABELS[row.cognitiveLevel]}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="neutral">{QUESTION_TYPE_LABELS[row.questionType]}</Badge>
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-900">{row.count}</td>
                <td className="py-3 px-4 text-center font-bold text-brand-600">{row.score.toFixed(2)} đ</td>
                <td className="py-3 px-4 text-xs text-slate-500">{row.sourceReference}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
