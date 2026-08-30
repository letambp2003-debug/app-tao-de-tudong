import React, { useState, useEffect } from "react";
import { Question } from "@shared/types/index.js";
import { api } from "../services/api.js";
import { QuestionCard } from "../components/questions/QuestionCard.js";
import { Search, Filter, Database } from "lucide-react";

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    api.getQuestions().then(setQuestions).catch(console.error);
  }, []);

  const filtered = questions.filter(q => {
    const matchSearch = q.stem.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || q.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-600" /> Ngân hàng câu hỏi chuẩn hóa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kho câu hỏi đã qua kiểm duyệt và gắn mã YCCĐ GDPT 2018</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nội dung câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">Tất cả dạng câu</option>
            <option value="MULTIPLE_CHOICE">Trắc nghiệm 4 lựa chọn</option>
            <option value="TRUE_FALSE_4">Đúng - Sai 4 ý</option>
            <option value="SHORT_ANSWER">Trả lời ngắn</option>
            <option value="ESSAY">Tự luận</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((q, idx) => (
          <QuestionCard key={q.id} question={q} index={idx} />
        ))}
      </div>
    </div>
  );
};
