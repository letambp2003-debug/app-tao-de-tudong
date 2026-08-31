import { SubjectRuleProfile } from "../types/index.js";

export const SUBJECT_RULE_PROFILES: SubjectRuleProfile[] = [
  {
    id: "KHTN_8",
    subject: "Khoa học tự nhiên",
    grade: 8,
    name: "Khoa học tự nhiên 8 (Chương trình GDPT 2018)",
    defaultDuration: 60,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 40,
      TH: 30,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: [
      {
        type: "MULTIPLE_CHOICE",
        count: 16,
        pointsPerItem: 0.25,
        totalScore: 4.0
      },
      {
        type: "TRUE_FALSE_4",
        count: 2,
        pointsPerItem: 1.0,
        totalScore: 2.0
      },
      {
        type: "SHORT_ANSWER",
        count: 4,
        pointsPerItem: 0.5,
        totalScore: 2.0
      },
      {
        type: "ESSAY",
        count: 2,
        pointsPerItem: 1.0,
        totalScore: 2.0
      }
    ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"],
    guidanceNotes: "Theo công văn định dạng cấu trúc đề thi 2018: Phần I trắc nghiệm 4 lựa chọn (0.25đ/câu), Phần II Đúng-Sai (1.0đ/câu gồm 4 ý), Phần III Trả lời ngắn (0.5đ/câu), Phần IV Tự luận (kèm rubric)."
  },
  {
    id: "TOAN_9",
    subject: "Toán học",
    grade: 9,
    name: "Toán học 9 (Đề kiểm tra định kỳ)",
    defaultDuration: 90,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 30,
      TH: 40,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: [
      {
        type: "MULTIPLE_CHOICE",
        count: 12,
        pointsPerItem: 0.25,
        totalScore: 3.0
      },
      {
        type: "SHORT_ANSWER",
        count: 4,
        pointsPerItem: 0.5,
        totalScore: 2.0
      },
      {
        type: "ESSAY",
        count: 4,
        pointsPerItem: 1.25,
        totalScore: 5.0
      }
    ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "SHORT_ANSWER", "ESSAY"],
    guidanceNotes: "Cấu trúc kết hợp trắc nghiệm khách quan và tự luận có kèm rubric chấm chi tiết từng bước toán học."
  },
  {
    id: "VAT_LY_10",
    subject: "Vật lí",
    grade: 10,
    name: "Vật lí 10 (Định dạng cấu trúc 2025)",
    defaultDuration: 50,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 40,
      TH: 30,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: [
      {
        type: "MULTIPLE_CHOICE",
        count: 18,
        pointsPerItem: 0.25,
        totalScore: 4.5
      },
      {
        type: "TRUE_FALSE_4",
        count: 4,
        pointsPerItem: 1.0,
        totalScore: 4.0
      },
      {
        type: "SHORT_ANSWER",
        count: 3,
        pointsPerItem: 0.5,
        totalScore: 1.5
      }
    ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER"],
    guidanceNotes: "Định dạng cấu trúc mới theo cấu trúc đề tốt nghiệp THPT từ 2025 của Bộ GD&ĐT."
  },
  {
    id: "HOA_HOC_11",
    subject: "Hóa học",
    grade: 11,
    name: "Hóa học 11 (Chương trình GDPT 2018)",
    defaultDuration: 50,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 40,
      TH: 30,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: [
      {
        type: "MULTIPLE_CHOICE",
        count: 18,
        pointsPerItem: 0.25,
        totalScore: 4.5
      },
      {
        type: "TRUE_FALSE_4",
        count: 4,
        pointsPerItem: 1.0,
        totalScore: 4.0
      },
      {
        type: "SHORT_ANSWER",
        count: 3,
        pointsPerItem: 0.5,
        totalScore: 1.5
      }
    ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER"],
    guidanceNotes: "Định dạng cấu trúc trắc nghiệm 3 phần: Nhiều lựa chọn, Đúng-Sai 4 lệnh hỏi, Trả lời ngắn."
  }
];

export function getRuleProfileById(id: string): SubjectRuleProfile {
  const profile = SUBJECT_RULE_PROFILES.find((p) => p.id === id);
  if (profile) return profile;

  // Fallback dynamic profile generator
  return {
    id: id || "GENERIC_PROFILE",
    subject: "Toán học",
    grade: 8,
    name: "Cấu trúc đề kiểm tra GDPT 2018",
    defaultDuration: 60,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 40,
      TH: 30,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: [
      { type: "MULTIPLE_CHOICE", count: 16, pointsPerItem: 0.25, totalScore: 4.0 },
      { type: "TRUE_FALSE_4", count: 2, pointsPerItem: 1.0, totalScore: 2.0 },
      { type: "SHORT_ANSWER", count: 4, pointsPerItem: 0.5, totalScore: 2.0 },
      { type: "ESSAY", count: 2, pointsPerItem: 1.0, totalScore: 2.0 }
    ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"],
    guidanceNotes: "Khung cấu trúc chuẩn 4 phần theo định dạng khảo thí của Bộ GD&ĐT."
  };
}

export function getRuleProfileForSubject(subject: string, grade: number): SubjectRuleProfile {
  const match = SUBJECT_RULE_PROFILES.find(
    p => p.subject.toLowerCase() === subject.toLowerCase() && p.grade === Number(grade)
  );
  if (match) return match;

  const isTHPT = grade >= 10;
  return {
    id: `${subject.toUpperCase().replace(/\s+/g, "_")}_${grade}`,
    subject,
    grade,
    name: `${subject} ${grade} (Chương trình GDPT 2018)`,
    defaultDuration: isTHPT ? 50 : 60,
    defaultTotalScore: 10,
    defaultCognitiveWeights: {
      NB: 40,
      TH: 30,
      VD: 20,
      VDC: 10
    },
    defaultQuestionTypeConfigs: isTHPT
      ? [
          { type: "MULTIPLE_CHOICE", count: 18, pointsPerItem: 0.25, totalScore: 4.5 },
          { type: "TRUE_FALSE_4", count: 4, pointsPerItem: 1.0, totalScore: 4.0 },
          { type: "SHORT_ANSWER", count: 3, pointsPerItem: 0.5, totalScore: 1.5 }
        ]
      : [
          { type: "MULTIPLE_CHOICE", count: 16, pointsPerItem: 0.25, totalScore: 4.0 },
          { type: "TRUE_FALSE_4", count: 2, pointsPerItem: 1.0, totalScore: 2.0 },
          { type: "SHORT_ANSWER", count: 4, pointsPerItem: 0.5, totalScore: 2.0 },
          { type: "ESSAY", count: 2, pointsPerItem: 1.0, totalScore: 2.0 }
        ],
    allowedQuestionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"],
    guidanceNotes: `Cấu trúc đề kiểm tra chuẩn môn ${subject} ${grade} theo chương trình GDPT 2018.`
  };
}
