import { QuestionType, CognitiveLevel } from "../types/index.js";

export interface AuthenticQuestionTemplate {
  subject: string;
  grade: number;
  type: QuestionType;
  cognitiveLevel: CognitiveLevel;
  stem: string;
  score: number;
  explanation: string;
  sourceReference: string;
  mcOptions?: { id: string; label: "A" | "B" | "C" | "D"; content: string; isCorrect: boolean }[];
  tfItems?: { id: string; label: "a" | "b" | "c" | "d"; content: string; isCorrect: boolean; explanation: string }[];
  saSpec?: { expectedAnswer: string; unit?: string; tolerance?: number; alternativeAnswers?: string[] };
  rubricSteps?: { id: string; stepNumber: number; criterion: string; expectedContent: string; score: number }[];
}

export const AUTHENTIC_QUESTIONS_DATABASE: AuthenticQuestionTemplate[] = [
  // =========================================================================
  // TOÁN HỌC 8
  // =========================================================================
  // 1. MCQs - Nhận biết (0.25đ)
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Trong các biểu thức đại số sau, biểu thức nào là đơn thức?",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 1, tr.6",
    explanation: "Đơn thức là biểu thức đại số chỉ gồm một số, hoặc một biến, hoặc một tích giữa các số và các biến.",
    mcOptions: [
      { id: "opt-m1-a", label: "A", content: "$\\frac{2}{3}x^2y$", isCorrect: true },
      { id: "opt-m1-b", label: "B", content: "$2x + y$", isCorrect: false },
      { id: "opt-m1-c", label: "C", content: "$\\frac{x - 1}{y}$", isCorrect: false },
      { id: "opt-m1-d", label: "D", content: "$x^2 - 4$", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Bậc của đa thức $A = 4x^3y^2 - 2x^4y + 5x^2y^2 - 1$ là:",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 2, tr.10",
    explanation: "Hạng tử có bậc cao nhất là $4x^3y^2$ và $-2x^4y$ đều có bậc $3 + 2 = 5$ và $4 + 1 = 5$.",
    mcOptions: [
      { id: "opt-m2-a", label: "A", content: "4", isCorrect: false },
      { id: "opt-m2-b", label: "B", content: "5", isCorrect: true },
      { id: "opt-m2-c", label: "C", content: "3", isCorrect: false },
      { id: "opt-m2-d", label: "D", content: "6", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Hằng đẳng thức hiệu hai bình phương $A^2 - B^2$ bằng biểu thức nào sau đây?",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 6, tr.32",
    explanation: "Hiệu hai bình phương của hai biểu thức bằng tích của hiệu hai biểu thức với tổng của chúng: $A^2 - B^2 = (A - B)(A + B)$.",
    mcOptions: [
      { id: "opt-m3-a", label: "A", content: "$(A - B)(A + B)$", isCorrect: true },
      { id: "opt-m3-b", label: "B", content: "$(A - B)^2$", isCorrect: false },
      { id: "opt-m3-c", label: "C", content: "$A^2 - 2AB + B^2$", isCorrect: false },
      { id: "opt-m3-d", label: "D", content: "$(A + B)^2$", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Khai triển của hằng đẳng thức $(x - 3)^2$ là:",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 6, tr.31",
    explanation: "$(x - 3)^2 = x^2 - 2 \\cdot x \\cdot 3 + 3^2 = x^2 - 6x + 9$.",
    mcOptions: [
      { id: "opt-m4-a", label: "A", content: "$x^2 - 6x + 9$", isCorrect: true },
      { id: "opt-m4-b", label: "B", content: "$x^2 - 9$", isCorrect: false },
      { id: "opt-m4-c", label: "C", content: "$x^2 + 6x + 9$", isCorrect: false },
      { id: "opt-m4-d", label: "D", content: "$x^2 - 3x + 9$", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Điều kiện xác định của phân thức đại số $\\frac{3x - 1}{x - 2}$ là:",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 10, tr.54",
    explanation: "Phân thức xác định khi mẫu thức khác 0: $x - 2 \\neq 0 \\Leftrightarrow x \\neq 2$.",
    mcOptions: [
      { id: "opt-m5-a", label: "A", content: "$x \\neq 2$", isCorrect: true },
      { id: "opt-m5-b", label: "B", content: "$x \\neq -2$", isCorrect: false },
      { id: "opt-m5-c", label: "C", content: "$x \\neq \\frac{1}{3}$", isCorrect: false },
      { id: "opt-m5-d", label: "D", content: "$x = 2$", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Tứ giác có 4 cạnh bằng nhau là hình gì?",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 16, tr.85",
    explanation: "Theo định nghĩa: Hình thoi là tứ giác có bốn cạnh bằng nhau.",
    mcOptions: [
      { id: "opt-m6-a", label: "A", content: "Hình thoi", isCorrect: true },
      { id: "opt-m6-b", label: "B", content: "Hình chữ nhật", isCorrect: false },
      { id: "opt-m6-c", label: "C", content: "Hình thang cân", isCorrect: false },
      { id: "opt-m6-d", label: "D", content: "Hình bình hành", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Tứ giác có hai đường chéo bằng nhau và cắt nhau tại trung điểm của mỗi đường là hình gì?",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 15, tr.80",
    explanation: "Hình bình hành có hai đường chéo bằng nhau là hình chữ nhật.",
    mcOptions: [
      { id: "opt-m7-a", label: "A", content: "Hình chữ nhật", isCorrect: true },
      { id: "opt-m7-b", label: "B", content: "Hình thoi", isCorrect: false },
      { id: "opt-m7-c", label: "C", content: "Hình thang", isCorrect: false },
      { id: "opt-m7-d", label: "D", content: "Hình vuông", isCorrect: false }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "MULTIPLE_CHOICE",
    cognitiveLevel: "NB",
    stem: "Tổng các góc trong một tứ giác lồi bất kì bằng:",
    score: 0.25,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 13, tr.72",
    explanation: "Tổng các góc trong một tứ giác bằng $360^\\circ$.",
    mcOptions: [
      { id: "opt-m8-a", label: "A", content: "$360^\\circ$", isCorrect: true },
      { id: "opt-m8-b", label: "B", content: "$180^\\circ$", isCorrect: false },
      { id: "opt-m8-c", label: "C", content: "$90^\\circ$", isCorrect: false },
      { id: "opt-m8-d", label: "D", content: "$540^\\circ$", isCorrect: false }
    ]
  },

  // 2. True / False - Thông hiểu (1.0đ)
  {
    subject: "Toán học",
    grade: 8,
    type: "TRUE_FALSE_4",
    cognitiveLevel: "TH",
    stem: "Cho các đẳng thức biến đổi hằng đẳng thức và đa thức sau:",
    score: 1.0,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 6 & 7, tr.30-38",
    explanation: "a, c đúng theo công thức chuẩn; b, d sai dấu và hệ số.",
    tfItems: [
      { id: "tf-m1-a", label: "a", content: "$(2x + y)^2 = 4x^2 + 4xy + y^2$", isCorrect: true, explanation: "Khai triển đúng bình phương của tổng." },
      { id: "tf-m1-b", label: "b", content: "$(x - 2y)^2 = x^2 - 2xy + 4y^2$", isCorrect: false, explanation: "Sai hệ số hạng tử giữa (phải là -4xy)." },
      { id: "tf-m1-c", label: "c", content: "$x^3 - 8 = (x - 2)(x^2 + 2x + 4)$", isCorrect: true, explanation: "Hằng đẳng thức hiệu hai lập phương." },
      { id: "tf-m1-d", label: "d", content: "$(x + 1)^3 = x^3 + 3x^2 + 3x + 3$", isCorrect: false, explanation: "Hạng tử tự do phải là 1 (1^3 = 1)." }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "TRUE_FALSE_4",
    cognitiveLevel: "TH",
    stem: "Cho tứ giác $ABCD$ có $AB // CD$ và $AD // BC$. Xét tính đúng/sai của các nhận định sau:",
    score: 1.0,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 14, tr.76",
    explanation: "Tứ giác ABCD là hình bình hành, suy ra các tính chất tương ứng.",
    tfItems: [
      { id: "tf-m2-a", label: "a", content: "Tứ giác $ABCD$ là hình bình hành.", isCorrect: true, explanation: "Đúng theo dấu hiệu hai cặp cạnh đối song song." },
      { id: "tf-m2-b", label: "b", content: "Các cạnh đối $AB = CD$ và $AD = BC$.", isCorrect: true, explanation: "Đúng tính chất hình bình hành." },
      { id: "tf-m2-c", label: "c", content: "Hai đường chéo $AC$ và $BD$ luôn vuông góc với nhau.", isCorrect: false, explanation: "Chỉ vuông góc khi là hình thoi." },
      { id: "tf-m2-d", label: "d", content: "Hai góc đối $\\widehat{A} = \\widehat{C}$ và $\\widehat{B} = \\widehat{D}$.", isCorrect: true, explanation: "Đúng tính chất các góc đối bằng nhau." }
    ]
  },

  // 3. Short Answers - Thông hiểu & Vận dụng (0.5đ)
  {
    subject: "Toán học",
    grade: 8,
    type: "SHORT_ANSWER",
    cognitiveLevel: "TH",
    stem: "Thực hiện phép tính rút gọn biểu thức $P = (x + 2)^2 - x(x + 4)$. Giá trị của $P$ bằng bao nhiêu?",
    score: 0.5,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 6, tr.33",
    explanation: "P = x^2 + 4x + 4 - x^2 - 4x = 4.",
    saSpec: { expectedAnswer: "4", unit: "", tolerance: 0, alternativeAnswers: ["4.0", "+4"] }
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "SHORT_ANSWER",
    cognitiveLevel: "TH",
    stem: "Tính giá trị của biểu thức $Q = x^2 - 4xy + 4y^2$ tại $x = 104$ và $y = 2$:",
    score: 0.5,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 6, tr.34",
    explanation: "Q = (x - 2y)^2. Thay x = 104, y = 2 => Q = (104 - 4)^2 = 100^2 = 10000.",
    saSpec: { expectedAnswer: "10000", unit: "", tolerance: 0, alternativeAnswers: ["10.000", "10000.0"] }
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "SHORT_ANSWER",
    cognitiveLevel: "VD",
    stem: "Cho $\\Delta ABC$ có $MN // BC$ ($M \\in AB, N \\in AC$). Biết $AM = 4\\text{ cm}, MB = 2\\text{ cm}, AN = 6\\text{ cm}$. Tính độ dài đoạn thẳng $NC$ (cm):",
    score: 0.5,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 18, tr.98",
    explanation: "Theo định lí Thalès: AM / MB = AN / NC => 4 / 2 = 6 / NC => NC = 3 cm.",
    saSpec: { expectedAnswer: "3", unit: "cm", tolerance: 0, alternativeAnswers: ["3.0", "3 cm"] }
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "SHORT_ANSWER",
    cognitiveLevel: "VD",
    stem: "Một hình thoi có độ dài hai đường chéo là $d_1 = 8\\text{ cm}$ và $d_2 = 6\\text{ cm}$. Diện tích hình thoi bằng bao nhiêu $\\text{cm}^2$?",
    score: 0.5,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 16, tr.88",
    explanation: "Diện tích hình thoi S = 1/2 * d1 * d2 = 1/2 * 8 * 6 = 24 cm^2.",
    saSpec: { expectedAnswer: "24", unit: "cm2", tolerance: 0, alternativeAnswers: ["24.0", "24 cm^2"] }
  },

  // 4. Essays - Vận dụng & Vận dụng cao (1.0đ)
  {
    subject: "Toán học",
    grade: 8,
    type: "ESSAY",
    cognitiveLevel: "VD",
    stem: "Cho đa thức $M = x^2 - 25 - 4xy + 4y^2$.\na) Phân tích đa thức $M$ thành nhân tử.\nb) Tính giá trị của biểu thức $M$ khi $x - 2y = 15$.",
    score: 1.0,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 9, tr.45",
    explanation: "Nhóm (x^2 - 4xy + 4y^2) - 25 = (x - 2y)^2 - 5^2 = (x - 2y - 5)(x - 2y + 5).",
    rubricSteps: [
      {
        id: "rb-m1-1",
        stepNumber: 1,
        criterion: "Nhóm hạng tử tạo hằng đẳng thức",
        expectedContent: "$M = (x^2 - 4xy + 4y^2) - 25 = (x - 2y)^2 - 5^2 = (x - 2y - 5)(x - 2y + 5)$.",
        score: 0.5
      },
      {
        id: "rb-m1-2",
        stepNumber: 2,
        criterion: "Thay giá trị và tính đúng kết quả",
        expectedContent: "Thay $x - 2y = 15$ vào: $M = (15 - 5)(15 + 5) = 10 \\times 20 = 200$.",
        score: 0.5
      }
    ]
  },
  {
    subject: "Toán học",
    grade: 8,
    type: "ESSAY",
    cognitiveLevel: "VDC",
    stem: "Cho biểu thức $A = \\left( \\frac{x}{x^2 - 9} + \\frac{1}{x + 3} \\right) : \\frac{2}{x - 3}$ với $x \\neq \\pm 3$.\na) Rút gọn biểu thức $A$.\nb) Tìm giá trị nguyên của $x$ để $A$ nhận giá trị nguyên.",
    score: 1.0,
    sourceReference: "SGK Toán 8 Tập 1 - Bài 12, tr.64",
    explanation: "Biểu thức rút gọn ra A = (2x - 3) / (2(x + 3)). Tìm x nguyên để A nguyên.",
    rubricSteps: [
      {
        id: "rb-m2-1",
        stepNumber: 1,
        criterion: "Quy đồng và thực hiện phép cộng trong ngoặc",
        expectedContent: "$\\frac{x + x - 3}{(x - 3)(x + 3)} = \\frac{2x - 3}{(x - 3)(x + 3)}$.",
        score: 0.25
      },
      {
        id: "rb-m2-2",
        stepNumber: 2,
        criterion: "Nhân đảo ngược và rút gọn ra $A$",
        expectedContent: "$A = \\frac{2x - 3}{(x - 3)(x + 3)} \\cdot \\frac{x - 3}{2} = \\frac{2x - 3}{2(x + 3)}$.",
        score: 0.25
      },
      {
        id: "rb-m2-3",
        stepNumber: 3,
        criterion: "Biến đổi tìm điều kiện $x$ nguyên",
        expectedContent: "$2A = \\frac{2x - 3}{x + 3} = 2 - \\frac{9}{x + 3}$. Để $2A$ nguyên thì $(x + 3) \\in Ư(9) = \\{\\pm 1, \\pm 3, \\pm 9\\}$.",
        score: 0.25
      },
      {
        id: "rb-m2-4",
        stepNumber: 4,
        criterion: "Đối chiếu ĐKXĐ và kết luận các giá trị $x$",
        expectedContent: "Tìm được $x \\in \\{-12, -6, -4, -2, 0, 6\\}$ (loại $x = \\pm 3$). Kiểm tra để $A$ nhận giá trị nguyên.",
        score: 0.25
      }
    ]
  }
];

export function getAuthenticQuestions(subject: string, grade: number): AuthenticQuestionTemplate[] {
  const normSub = (subject || "").toLowerCase();
  return AUTHENTIC_QUESTIONS_DATABASE.filter(q => {
    const qSub = q.subject.toLowerCase();
    const matchSub = normSub.includes("toán") ? qSub.includes("toán") : qSub === normSub;
    return matchSub && q.grade === Number(grade);
  });
}
