// Cơ sở dữ liệu Chuẩn Kiến thức, Kĩ năng & Phụ lục Phân phối Chương trình GDPT 2018
// Theo hướng dẫn Công văn 5512/BGDĐT-GDTrH và Thông tư 22/2021/TT-BGDĐT

export interface CurriculumTopic {
  code: string;
  name: string;
  order: number;
  period: "GIAI_DOAN_1" | "GIAI_DOAN_2" | "TOAN_DIEN"; // GIAI_DOAN_1: Trước giữa kì; GIAI_DOAN_2: Sau giữa kì
  weightPercentageMidterm: number; // Trọng số % khi ra đề Giữa kì
  weightPercentageFinal: number;   // Trọng số % khi ra đề Cuối kì (Chuẩn: 20-30% Giai đoạn 1, 70-80% Giai đoạn 2)
  units: CurriculumUnit[];
}

export interface CurriculumUnit {
  code: string;
  name: string;
  order: number;
  lessonHours: number;
  yccds: CurriculumYCCD[];
}

export interface CurriculumYCCD {
  code: string;
  description: string;
  cognitiveLevelDefault: "NB" | "TH" | "VD" | "VDC";
  competencyCode: string;
  sourceReference: string;
  sampleQuestions?: {
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE_4" | "SHORT_ANSWER" | "ESSAY";
    stem: string;
    cognitiveLevel: "NB" | "TH" | "VD" | "VDC";
    score: number;
    explanation?: string;
    mcOptions?: { label: "A" | "B" | "C" | "D"; content: string; isCorrect: boolean }[];
    tfItems?: { label: "a" | "b" | "c" | "d"; content: string; isCorrect: boolean; explanation?: string }[];
    saSpec?: { expectedAnswer: string; unit?: string; tolerance?: number };
    rubricSteps?: { stepNumber: number; criterion: string; expectedContent: string; score: number }[];
    sourceReference?: string;
  }[];
}

export interface SubjectCurriculum {
  subject: string;
  grade: number;
  textbookSeries: string;
  semester: "HK1" | "HK2";
  midtermAppendixNotes: string;
  finalAppendixNotes: string;
  topics: CurriculumTopic[];
}

export const CURRICULUM_DATABASE: SubjectCurriculum[] = [
  // =========================================================================
  // 1. TOÁN HỌC 8 - HỌC KÌ I
  // =========================================================================
  {
    subject: "Toán học",
    grade: 8,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester: "HK1",
    midtermAppendixNotes: "Phạm vi kiểm tra Giữa kì I: 100% nội dung thuộc Chương I (Đa thức) và Chương II (Hằng đẳng thức đáng nhớ và ứng dụng).",
    finalAppendixNotes: "Phạm vi kiểm tra Cuối kì I: Phân bổ 25% kiến thức Giai đoạn 1 (Đa thức, Hằng đẳng thức) + 75% kiến thức Giai đoạn 2 (Phân thức đại số, Tứ giác, Định lí Thalès).",
    topics: [
      {
        code: "CD1",
        name: "Chương I: Đơn thức và Đa thức nhiều biến",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 45,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B1",
            name: "Đơn thức và đa thức nhiều biến, các phép tính với đa thức",
            order: 1,
            lessonHours: 10,
            yccds: [
              {
                code: "YCCD_TOAN8_01",
                description: "Nhận biết đơn thức, đa thức nhiều biến, bậc của đa thức và thu gọn đa thức.",
                cognitiveLevelDefault: "NB",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 1 & 2, tr.6-14",
                sampleQuestions: [
                  {
                    type: "MULTIPLE_CHOICE",
                    stem: "Bậc của đa thức $P = 2x^2y^3 - 5x^3y + 3xy^2 - 7$ là bao nhiêu?",
                    cognitiveLevel: "NB",
                    score: 0.25,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 1",
                    explanation: "Hạng tử có bậc cao nhất là $2x^2y^3$ với bậc $2 + 3 = 5$.",
                    mcOptions: [
                      { label: "A", content: "3", isCorrect: false },
                      { label: "B", content: "4", isCorrect: false },
                      { label: "C", content: "5", isCorrect: true },
                      { label: "D", content: "6", isCorrect: false }
                    ]
                  }
                ]
              },
              {
                code: "YCCD_TOAN8_02",
                description: "Thực hiện được phép nhân đơn thức với đa thức, đa thức với đa thức và phép chia đa thức cho đơn thức.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 4 & 5, tr.18-24",
                sampleQuestions: [
                  {
                    type: "SHORT_ANSWER",
                    stem: "Rút gọn biểu thức $A = 2x(3x - 1) - 6x^2$. Kết quả bằng bao nhiêu khi $x = 5$?",
                    cognitiveLevel: "TH",
                    score: 0.5,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 4",
                    explanation: "A = 6x^2 - 2x - 6x^2 = -2x. Khi x = 5 thì A = -10.",
                    saSpec: { expectedAnswer: "-10", unit: "", tolerance: 0 }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chương II: Bảy hằng đẳng thức đáng nhớ và Phân tích đa thức",
        order: 2,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 35,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B2",
            name: "Bảy hằng đẳng thức đáng nhớ và Phân tích đa thức thành nhân tử",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "YCCD_TOAN8_03",
                description: "Vận dụng được 7 hằng đẳng thức đáng nhớ để khai triển và tính nhanh giá trị biểu thức.",
                cognitiveLevelDefault: "TH",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 6 & 7, tr.30-38",
                sampleQuestions: [
                  {
                    type: "TRUE_FALSE_4",
                    stem: "Xét tính đúng/sai của các đẳng thức hằng đẳng thức sau:",
                    cognitiveLevel: "TH",
                    score: 1.0,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 6",
                    tfItems: [
                      { label: "a", content: "$(A + B)^2 = A^2 + 2AB + B^2$", isCorrect: true, explanation: "Bình phương của một tổng." },
                      { label: "b", content: "$(A - B)^2 = A^2 - B^2$", isCorrect: false, explanation: "Phải là A^2 - 2AB + B^2." },
                      { label: "c", content: "$A^2 - B^2 = (A - B)(A + B)$", isCorrect: true, explanation: "Hiệu hai bình phương." },
                      { label: "d", content: "$(A - B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$", isCorrect: true, explanation: "Lập phương một hiệu." }
                    ]
                  }
                ]
              },
              {
                code: "YCCD_TOAN8_04",
                description: "Vận dụng các phương pháp đặt nhân tử chung, dùng hằng đẳng thức và nhóm hạng tử để phân tích đa thức thành nhân tử.",
                cognitiveLevelDefault: "VD",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 8 & 9, tr.40-48",
                sampleQuestions: [
                  {
                    type: "ESSAY",
                    stem: "Cho đa thức $M = x^2 - 4y^2 + 2x + 1$.\na) Phân tích đa thức $M$ thành nhân tử.\nb) Tính giá trị của $M$ khi $x = 99$ và $y = 50$.",
                    cognitiveLevel: "VD",
                    score: 1.0,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 9",
                    rubricSteps: [
                      { stepNumber: 1, criterion: "Nhóm hạng tử tạo hằng đẳng thức", expectedContent: "$M = (x^2 + 2x + 1) - 4y^2 = (x + 1)^2 - (2y)^2 = (x + 1 - 2y)(x + 1 + 2y)$.", score: 0.5 },
                      { stepNumber: 2, criterion: "Thay số và tính đúng giá trị", expectedContent: "Thay $x = 99, y = 50$: $M = (99 + 1 - 100)(99 + 1 + 100) = 0 \\times 200 = 0$.", score: 0.5 }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương III: Tứ giác và Hình học trực quan",
        order: 3,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 20,
        weightPercentageFinal: 35,
        units: [
          {
            code: "B3",
            name: "Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông",
            order: 1,
            lessonHours: 14,
            yccds: [
              {
                code: "YCCD_TOAN8_05",
                description: "Nhận biết các dấu hiệu và tính chất của hình chữ nhật, hình thoi, hình vuông.",
                cognitiveLevelDefault: "NB",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 14, 15 & 16, tr.75-88",
                sampleQuestions: [
                  {
                    type: "MULTIPLE_CHOICE",
                    stem: "Tứ giác có hai đường chéo bằng nhau và cắt nhau tại trung điểm của mỗi đường là hình gì?",
                    cognitiveLevel: "NB",
                    score: 0.25,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 15",
                    mcOptions: [
                      { label: "A", content: "Hình chữ nhật", isCorrect: true },
                      { label: "B", content: "Hình thoi", isCorrect: false },
                      { label: "C", content: "Hình thang", isCorrect: false },
                      { label: "D", content: "Hình bình hành", isCorrect: false }
                    ]
                  }
                ]
              },
              {
                code: "YCCD_TOAN8_06",
                description: "Vận dụng định nghĩa và tính chất của tứ giác để tính số đo góc và chứng minh hình học.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 14, tr.76",
                sampleQuestions: [
                  {
                    type: "SHORT_ANSWER",
                    stem: "Cho hình thoi có độ dài hai đường chéo là 6 cm và 8 cm. Diện tích của hình thoi đó bằng bao nhiêu cm²?",
                    cognitiveLevel: "TH",
                    score: 0.5,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 16",
                    explanation: "Diện tích hình thoi = 1/2 * d1 * d2 = 1/2 * 6 * 8 = 24 cm².",
                    saSpec: { expectedAnswer: "24", unit: "cm2", tolerance: 0 }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        code: "CD4",
        name: "Chương IV & V: Phân thức đại số và Định lí Thalès",
        order: 4,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 35,
        units: [
          {
            code: "B4",
            name: "Phân thức đại số và Định lí Thalès trong tam giác",
            order: 1,
            lessonHours: 16,
            yccds: [
              {
                code: "YCCD_TOAN8_07",
                description: "Xác định điều kiện xác định của phân thức và rút gọn phân thức đại số.",
                cognitiveLevelDefault: "NB",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 10, tr.52-58",
                sampleQuestions: [
                  {
                    type: "MULTIPLE_CHOICE",
                    stem: "Điều kiện xác định của phân thức $\\frac{2x + 1}{x - 3}$ là:",
                    cognitiveLevel: "NB",
                    score: 0.25,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 10",
                    mcOptions: [
                      { label: "A", content: "$x \\neq 3$", isCorrect: true },
                      { label: "B", content: "$x \\neq -3$", isCorrect: false },
                      { label: "C", content: "$x = 3$", isCorrect: false },
                      { label: "D", content: "$x \\neq -\\frac{1}{2}$", isCorrect: false }
                    ]
                  }
                ]
              },
              {
                code: "YCCD_TOAN8_08",
                description: "Vận dụng định lí Thalès để tính độ dài đoạn thẳng và bài toán thực tế.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 18, tr.95-102",
                sampleQuestions: [
                  {
                    type: "ESSAY",
                    stem: "Cho $\\Delta ABC$ có $MN // BC$ ($M \\in AB, N \\in AC$). Biết $AM = 4\\text{ cm}, MB = 2\\text{ cm}, AN = 6\\text{ cm}$.\na) Tính độ dài đoạn thẳng $NC$.\nb) Vận dụng định lí Thalès giải thích cách đo chiều cao cây trong thực tế.",
                    cognitiveLevel: "VDC",
                    score: 1.0,
                    sourceReference: "SGK Toán 8 Tập 1 - Bài 18",
                    rubricSteps: [
                      { stepNumber: 1, criterion: "Áp dụng đúng định lí Thalès", expectedContent: "$\\frac{AM}{MB} = \\frac{AN}{NC} \\Rightarrow \\frac{4}{2} = \\frac{6}{NC}$.", score: 0.5 },
                      { stepNumber: 2, criterion: "Tính đúng độ dài NC và kết luận", expectedContent: "$NC = \\frac{2 \\times 6}{4} = 3\\text{ cm}$.", score: 0.5 }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. KHOA HỌC TỰ NHIÊN 8 - HỌC KÌ I
  // =========================================================================
  {
    subject: "Khoa học tự nhiên",
    grade: 8,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester: "HK1",
    midtermAppendixNotes: "Phạm vi kiểm tra Giữa kì I: 100% nội dung Chương 1 (Phản ứng hóa học, Mol, Nồng độ dung dịch) và Bài 13-15 (Khối lượng riêng).",
    finalAppendixNotes: "Phạm vi kiểm tra Cuối kì I: 25% kiến thức Giai đoạn 1 (Biến đổi hóa học, Mol) + 75% kiến thức Giai đoạn 2 (Axit - Bazơ - Muối, Áp suất chất lỏng, Tác dụng làm quay của lực, Hệ cơ quan ở người).",
    topics: [
      {
        code: "CD1",
        name: "Chương 1: Phản ứng hóa học, Mol và Dung dịch",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 70,
        weightPercentageFinal: 25,
        units: [
          {
            code: "B1",
            name: "Phản ứng hóa học và Định luật bảo toàn khối lượng",
            order: 1,
            lessonHours: 8,
            yccds: [
              {
                code: "YCCD_KHTN8_01",
                description: "Phân biệt được hiện tượng vật lí và hiện tượng hóa học trong đời sống.",
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: "SGK KHTN 8 - Bài 2, tr.12-14"
              },
              {
                code: "YCCD_KHTN8_02",
                description: "Phát biểu được định luật bảo toàn khối lượng và vận dụng tính khối lượng sản phẩm.",
                cognitiveLevelDefault: "TH",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK KHTN 8 - Bài 3, tr.16-19"
              }
            ]
          },
          {
            code: "B2",
            name: "Mol, tỉ khối chất khí và nồng độ dung dịch",
            order: 2,
            lessonHours: 10,
            yccds: [
              {
                code: "YCCD_KHTN8_03",
                description: "Tính được số mol, thể tích chất khí ở đkc ($V = n \\times 24,79$) và nồng độ dung dịch $C\\%$, $C_M$.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK KHTN 8 - Bài 4 & 5, tr.22-31"
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chương 2: Acid - Base - Oxide - Muối",
        order: 2,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 35,
        units: [
          {
            code: "B3",
            name: "Acid, Base, Thang pH và Phân bón hóa học",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "YCCD_KHTN8_04",
                description: "Nhận biết dung dịch acid làm đổi màu quỳ tím thành đỏ, base làm quỳ tím đổi màu xanh và ý nghĩa thang pH.",
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: "SGK KHTN 8 - Bài 8 & 9, tr.42-50"
              },
              {
                code: "YCCD_KHTN8_05",
                description: "Viết được phương trình hóa học minh họa tính chất hóa học của acid tác dụng với kim loại, base tác dụng với acid.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK KHTN 8 - Bài 10, tr.52-58"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương 3: Khối lượng riêng, Áp suất và Lực",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 30,
        weightPercentageFinal: 40,
        units: [
          {
            code: "B4",
            name: "Khối lượng riêng, Áp suất chất rắn, chất lỏng và khí quyển",
            order: 1,
            lessonHours: 14,
            yccds: [
              {
                code: "YCCD_KHTN8_06",
                description: "Vận dụng công thức khối lượng riêng $D = \\frac{m}{V}$ và áp suất $p = \\frac{F}{S}$ giải quyết bài toán thực tế.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "THTN",
                sourceReference: "SGK KHTN 8 - Bài 14-17, tr.60-78"
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. TOÁN HỌC 9 - HỌC KÌ I
  // =========================================================================
  {
    subject: "Toán học",
    grade: 9,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester: "HK1",
    midtermAppendixNotes: "Phạm vi kiểm tra Giữa kì I: Phương trình và hệ hai phương trình bậc nhất hai ẩn, Căn bậc hai và Căn bậc ba.",
    finalAppendixNotes: "Phạm vi kiểm tra Cuối kì I: 25% kiến thức Giai đoạn 1 (Hệ phương trình, Căn thức) + 75% kiến thức Giai đoạn 2 (Hàm số bậc nhất $y=ax+b$, Hệ thức lượng trong tam giác vuông, Đường tròn).",
    topics: [
      {
        code: "CD1",
        name: "Chương I & II: Hệ phương trình và Căn thức bậc hai",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 100,
        weightPercentageFinal: 25,
        units: [
          {
            code: "B1",
            name: "Hệ hai phương trình bậc nhất hai ẩn",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "YCCD_TOAN9_01",
                description: "Giải hệ phương trình bậc nhất hai ẩn bằng phương pháp thế hoặc phương pháp cộng đại số.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 9 Tập 1 - Bài 2 & 3, tr.10-22"
              }
            ]
          },
          {
            code: "B2",
            name: "Căn bậc hai và căn bậc ba",
            order: 2,
            lessonHours: 14,
            yccds: [
              {
                code: "YCCD_TOAN9_02",
                description: "Thực hiện phép biến đổi rút gọn biểu thức chứa căn bậc hai và trục căn thức ở mẫu.",
                cognitiveLevelDefault: "VD",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 9 Tập 1 - Bài 5-7, tr.32-48"
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chương III: Hệ thức lượng trong tam giác vuông",
        order: 2,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 35,
        units: [
          {
            code: "B3",
            name: "Tỉ số lượng giác của góc nhọn và Hệ thức về cạnh và góc",
            order: 1,
            lessonHours: 14,
            yccds: [
              {
                code: "YCCD_TOAN9_03",
                description: "Vận dụng $\\sin, \\cos, \\tan, \\cot$ giải tam giác vuông và tính khoảng cách chiều cao trong thực tế.",
                cognitiveLevelDefault: "VD",
                competencyCode: "GQVD_TOAN",
                sourceReference: "SGK Toán 9 Tập 1 - Bài 9-11, tr.58-74"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương IV: Đường tròn và Vị trí tương đối",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 40,
        units: [
          {
            code: "B4",
            name: "Đường tròn, Tiếp tuyến của đường tròn",
            order: 1,
            lessonHours: 16,
            yccds: [
              {
                code: "YCCD_TOAN9_04",
                description: "Chứng minh tiếp tuyến của đường tròn và tính chất hai tiếp tuyến cắt nhau.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "TD_TOAN",
                sourceReference: "SGK Toán 9 Tập 1 - Bài 14-16, tr.88-106"
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. VẬT LÍ 10 - HỌC KÌ I
  // =========================================================================
  {
    subject: "Vật lí",
    grade: 10,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester: "HK1",
    midtermAppendixNotes: "Phạm vi kiểm tra Giữa kì I: Mở đầu, Sai số thí nghiệm, Chuyển động thẳng biến đổi đều và Sự rơi tự do.",
    finalAppendixNotes: "Phạm vi kiểm tra Cuối kì I: 25% kiến thức Giai đoạn 1 (Động học, Đồ thị vận tốc) + 75% kiến thức Giai đoạn 2 (Các định luật Newton, Các lực trong tự nhiên, Cân bằng lực và Moment lực).",
    topics: [
      {
        code: "CD1",
        name: "Chương 1: Mô tả chuyển động và Động học chất điểm",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 100,
        weightPercentageFinal: 25,
        units: [
          {
            code: "B1",
            name: "Độ dịch chuyển, Vận tốc và Chuyển động thẳng biến đổi đều",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "YCCD_VATLY10_01",
                description: "Vận dụng các công thức chuyển động thẳng biến đổi đều $v = v_0 + at$, $d = v_0 t + \\frac{1}{2}at^2$, $v^2 - v_0^2 = 2ad$.",
                cognitiveLevelDefault: "TH",
                competencyCode: "NTVL",
                sourceReference: "SGK Vật lí 10 - Bài 4-8, tr.20-40"
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chương 2: Động lực học - Ba định luật Newton và Các lực cơ học",
        order: 2,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 45,
        units: [
          {
            code: "B2",
            name: "Ba định luật Newton, Lực hấp dẫn, Lực ma sát, Lực cản",
            order: 1,
            lessonHours: 16,
            yccds: [
              {
                code: "YCCD_VATLY10_02",
                description: "Vận dụng định luật II Newton $\\vec{F} = m\\vec{a}$ và định luật III Newton giải bài toán chuyển động của vật.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_VL",
                sourceReference: "SGK Vật lí 10 - Bài 10-14, tr.50-76"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương 3: Cân bằng lực và Moment lực",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 30,
        units: [
          {
            code: "B3",
            name: "Quy tắc moment lực và điều kiện cân bằng của vật rắn",
            order: 1,
            lessonHours: 10,
            yccds: [
              {
                code: "YCCD_VATLY10_03",
                description: "Vận dụng quy tắc moment lực $M = F \\times d$ giải bài toán cân bằng đòn bẩy trong thực tế đời sống.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "VD_VL",
                sourceReference: "SGK Vật lí 10 - Bài 18-20, tr.88-102"
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. HÓA HỌC 11 - HỌC KÌ I
  // =========================================================================
  {
    subject: "Hóa học",
    grade: 11,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester: "HK1",
    midtermAppendixNotes: "Phạm vi kiểm tra Giữa kì I: Cân bằng hóa học, Sự điện li, Thuyết Brønsted - Lowry về acid - base và pH.",
    finalAppendixNotes: "Phạm vi kiểm tra Cuối kì I: 25% kiến thức Giai đoạn 1 (Cân bằng hóa học, pH) + 75% kiến thức Giai đoạn 2 (Nitrogen và Sulfur, Đại cương hóa học hữu cơ).",
    topics: [
      {
        code: "CD1",
        name: "Chương 1: Cân bằng hóa học và Dung dịch chất điện li",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 100,
        weightPercentageFinal: 25,
        units: [
          {
            code: "B1",
            name: "Khái niệm về cân bằng hóa học, Chuyển dịch cân bằng và pH",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "YCCD_HOAHOC11_01",
                description: "Vận dụng nguyên lí Le Chatelier giải thích sự chuyển dịch cân bằng và tính giá trị pH của dung dịch acid/base.",
                cognitiveLevelDefault: "TH",
                competencyCode: "NTHH",
                sourceReference: "SGK Hóa học 11 - Bài 1-3, tr.6-24"
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chương 2: Nitrogen và Sulfur",
        order: 2,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 45,
        units: [
          {
            code: "B2",
            name: "Đơn chất Nitrogen, Ammonia, Muối ammonium, Acid nitric, Sulfur và $H_2SO_4$",
            order: 1,
            lessonHours: 16,
            yccds: [
              {
                code: "YCCD_HOAHOC11_02",
                description: "Giải thích tính oxi hóa mạnh của $HNO_3$ và $H_2SO_4$ đặc nóng và tính toán phản ứng hóa học trong thực tế.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_HH",
                sourceReference: "SGK Hóa học 11 - Bài 4-8, tr.28-56"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương 3: Đại cương hóa học hữu cơ",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 30,
        units: [
          {
            code: "B3",
            name: "Hợp chất hữu cơ, Công thức phân tử và Cấu trúc phân tử hữu cơ",
            order: 1,
            lessonHours: 10,
            yccds: [
              {
                code: "YCCD_HOAHOC11_03",
                description: "Xác định công thức phân tử hợp chất hữu cơ từ phổ MS và phân tích nguyên tố.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "VD_HH",
                sourceReference: "SGK Hóa học 11 - Bài 9-11, tr.60-78"
              }
            ]
          }
        ]
      }
    ]
  }
];

// Hàm tra cứu chuẩn dữ liệu phân phối chương trình
export function getCurriculumData(
  subject: string,
  grade: number,
  semester: "HK1" | "HK2" = "HK1",
  examPeriod: "GIUA_KY" | "CUOI_KY" = "GIUA_KY"
): SubjectCurriculum {
  const normSubject = (subject || "").toLowerCase().trim();
  
  const matched = CURRICULUM_DATABASE.find(c => {
    const s = c.subject.toLowerCase();
    const g = c.grade === Number(grade);
    const matchSub = normSubject.includes("toán") ? s.includes("toán")
      : normSubject.includes("khoa học") || normSubject.includes("khtn") ? s.includes("khoa học")
      : normSubject.includes("vật") || normSubject.includes("lí") ? s.includes("vật")
      : normSubject.includes("hóa") ? s.includes("hóa")
      : s === normSubject;
    return matchSub && g;
  });

  if (matched) {
    // Nếu là thi Giữa kì: chỉ giữ lại các chủ đề GIAI_DOAN_1
    // Nếu là thi Cuối kì: giữ lại toàn bộ chủ đề (cả GIAI_DOAN_1 và GIAI_DOAN_2)
    if (examPeriod === "GIUA_KY") {
      const filteredTopics = matched.topics.filter(t => t.period === "GIAI_DOAN_1" || t.period === "TOAN_DIEN");
      return {
        ...matched,
        topics: filteredTopics.length > 0 ? filteredTopics : matched.topics
      };
    }
    return matched;
  }

  // Fallback linh hoạt cho các môn học khác chưa có trong danh mục sẵn
  return {
    subject,
    grade,
    textbookSeries: "Kết nối tri thức với cuộc sống",
    semester,
    midtermAppendixNotes: `Phạm vi kiểm tra Giữa kì: 100% nội dung nửa đầu học kỳ môn ${subject} ${grade}.`,
    finalAppendixNotes: `Phạm vi kiểm tra Cuối kì: 25% kiến thức nửa đầu kì + 75% kiến thức nửa sau kì môn ${subject} ${grade}.`,
    topics: [
      {
        code: "CD1",
        name: `Chủ đề 1: Kiến thức trọng tâm nửa đầu kì - ${subject} ${grade}`,
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 100,
        weightPercentageFinal: 30,
        units: [
          {
            code: "B1",
            name: `Bài 1 & 2: Khái niệm và Kiến thức cơ bản ${subject} ${grade}`,
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: `YCCD_${grade}_01`,
                description: `Nhận biết các khái niệm, định nghĩa và tính chất cơ bản môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: `SGK ${subject} ${grade} - Bài 1 & 2`
              },
              {
                code: `YCCD_${grade}_02`,
                description: `Thông hiểu và giải thích được các quy luật, hiện tượng hoặc bài toán cơ bản môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD",
                sourceReference: `SGK ${subject} ${grade} - Bài 3 & 4`
              }
            ]
          }
        ]
      },
      ...(examPeriod === "CUOI_KY" ? [
        {
          code: "CD2",
          name: `Chủ đề 2: Kiến thức phát triển nửa sau kì - ${subject} ${grade}`,
          order: 2,
          period: "GIAI_DOAN_2" as const,
          weightPercentageMidterm: 0,
          weightPercentageFinal: 70,
          units: [
            {
              code: "B2",
              name: `Bài 3 & 4: Vận dụng kiến thức chuyên sâu ${subject} ${grade}`,
              order: 1,
              lessonHours: 16,
              yccds: [
                {
                  code: `YCCD_${grade}_03`,
                  description: `Vận dụng các kiến thức đã học giải quyết các bài toán thực tiễn môn ${subject} ${grade}.`,
                  cognitiveLevelDefault: "VD" as const,
                  competencyCode: "VD_KTKN",
                  sourceReference: `SGK ${subject} ${grade} - Bài 5 & 6`
                },
                {
                  code: `YCCD_${grade}_04`,
                  description: `Vận dụng cao giải quyết bài toán tổng hợp liên môn hoặc tình huống phức tạp môn ${subject} ${grade}.`,
                  cognitiveLevelDefault: "VDC" as const,
                  competencyCode: "VD_KTKN",
                  sourceReference: `SGK ${subject} ${grade} - Bài 7 & 8`
                }
              ]
            }
          ]
        }
      ] : [])
    ]
  };
}
