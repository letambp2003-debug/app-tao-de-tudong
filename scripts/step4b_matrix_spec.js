import fs from "fs";
import path from "path";

function write(filePath, content) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
  console.log("[CREATED]", filePath);
}

// 1. MatrixGrid.tsx
write("client/src/components/matrix/MatrixGrid.tsx", `import React from "react";
import { Matrix, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { Trash2 } from "lucide-react";
import { Badge } from "../common/Badge.js";

interface MatrixGridProps {
  matrix: Matrix;
  onUpdate: (matrix: Matrix) => void;
  readOnly?: boolean;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({ matrix, onUpdate, readOnly = false }) => {
  const handleCountChange = (cellId: string, delta: number) => {
    if (readOnly) return;
    const newCells = matrix.cells.map(c => {
      if (c.id === cellId) {
        const newCount = Math.max(0, c.count + delta);
        return {
          ...c,
          count: newCount,
          totalScore: Number((newCount * c.pointsPerItem).toFixed(2))
        };
      }
      return c;
    });
    onUpdate({ ...matrix, cells: newCells });
  };

  const totalQuestions = matrix.cells.reduce((sum, c) => sum + c.count, 0);
  const totalScore = Number(matrix.cells.reduce((sum, c) => sum + c.totalScore, 0).toFixed(2));

  const cognitiveTotals = {
    NB: matrix.cells.filter(c => c.cognitiveLevel === "NB").reduce((sum, c) => sum + c.totalScore, 0),
    TH: matrix.cells.filter(c => c.cognitiveLevel === "TH").reduce((sum, c) => sum + c.totalScore, 0),
    VD: matrix.cells.filter(c => c.cognitiveLevel === "VD").reduce((sum, c) => sum + c.totalScore, 0),
    VDC: matrix.cells.filter(c => c.cognitiveLevel === "VDC").reduce((sum, c) => sum + c.totalScore, 0)
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-md">
        <div>
          <div className="text-xs text-slate-400">Tổng điểm ma trận</div>
          <div className="text-2xl font-extrabold text-brand-400">{totalScore.toFixed(2)} / 10.0 đ</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Nhận biết (NB - 40%)</div>
          <div className="text-xl font-bold text-emerald-400">{cognitiveTotals.NB.toFixed(2)} đ ({((cognitiveTotals.NB / 10) * 100).toFixed(0)}%)</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Thông hiểu (TH - 30%)</div>
          <div className="text-xl font-bold text-sky-400">{cognitiveTotals.TH.toFixed(2)} đ ({((cognitiveTotals.TH / 10) * 100).toFixed(0)}%)</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Vận dụng (VD - 20%)</div>
          <div className="text-xl font-bold text-amber-400">{cognitiveTotals.VD.toFixed(2)} đ ({((cognitiveTotals.VD / 10) * 100).toFixed(0)}%)</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Vận dụng cao (10%)</div>
          <div className="text-xl font-bold text-purple-400">{cognitiveTotals.VDC.toFixed(2)} đ ({((cognitiveTotals.VDC / 10) * 100).toFixed(0)}%)</div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase">
              <th className="py-3.5 px-4">STT</th>
              <th className="py-3.5 px-4">Chủ đề kiến thức</th>
              <th className="py-3.5 px-4">Dạng câu hỏi</th>
              <th className="py-3.5 px-4 text-center">Mức độ</th>
              <th className="py-3.5 px-4 text-center">Số câu</th>
              <th className="py-3.5 px-4 text-center">Điểm / câu</th>
              <th className="py-3.5 px-4 text-center">Tổng điểm ô</th>
              {!readOnly && <th className="py-3.5 px-4 text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.cells.map((cell, idx) => (
              <tr key={cell.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {cell.topicId === "top-1" ? "Chất và sự biến đổi của chất" : "Khối lượng riêng và áp suất"}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  <Badge variant="neutral">{QUESTION_TYPE_LABELS[cell.questionType]}</Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={
                      cell.cognitiveLevel === "NB"
                        ? "success"
                        : cell.cognitiveLevel === "TH"
                        ? "primary"
                        : cell.cognitiveLevel === "VD"
                        ? "warning"
                        : "purple"
                    }
                  >
                    {COGNITIVE_LEVEL_LABELS[cell.cognitiveLevel]}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-800">
                  {!readOnly ? (
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => handleCountChange(cell.id, -1)}
                        className="w-6 h-6 rounded bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{cell.count}</span>
                      <button
                        onClick={() => handleCountChange(cell.id, 1)}
                        className="w-6 h-6 rounded bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    cell.count
                  )}
                </td>
                <td className="py-3 px-4 text-center text-slate-600">{cell.pointsPerItem} đ</td>
                <td className="py-3 px-4 text-center font-bold text-brand-600">{cell.totalScore.toFixed(2)} đ</td>
                {!readOnly && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        const newCells = matrix.cells.filter(c => c.id !== cell.id);
                        onUpdate({ ...matrix, cells: newCells });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                      title="Xóa ô"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-extrabold border-t-2 border-slate-200">
              <td colSpan={4} className="py-3.5 px-4 text-slate-800">TỔNG CỘNG TOÀN MA TRẬN</td>
              <td className="py-3.5 px-4 text-center text-slate-900">{totalQuestions} câu</td>
              <td></td>
              <td className="py-3.5 px-4 text-center text-brand-600 text-base">{totalScore.toFixed(2)} đ</td>
              {!readOnly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
`);

// 2. SpecificationTable.tsx
write("client/src/components/spec/SpecificationTable.tsx", `import React from "react";
import { Specification, COGNITIVE_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@shared/types/index.js";
import { Badge } from "../common/Badge.js";
import { KaTeXRenderer } from "../common/KaTeXRenderer.js";

interface SpecificationTableProps {
  specification: Specification;
  readOnly?: boolean;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({ specification }) => {
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
          {specification.rows.map((row, idx) => (
            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
              <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                {row.topicId === "top-1" ? "Chất & sự biến đổi" : "Khối lượng riêng & áp suất"}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
`);

console.log("Step 4b Matrix & Spec written successfully.");
