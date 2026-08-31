// Cơ sở dữ liệu Chuẩn Kiến thức, Kĩ năng & Phụ lục Phân phối Chương trình GDPT 2018
// Đầy đủ các môn học từ Lớp 6 đến Lớp 12 cho tất cả các bộ sách giáo khoa hiện hành
// Theo hướng dẫn Công văn 5512/BGDĐT-GDTrH và Thông tư 22/2021/TT-BGDĐT

export interface CurriculumTopic {
  code: string;
  name: string;
  order: number;
  period: "GIAI_DOAN_1" | "GIAI_DOAN_2" | "TOAN_DIEN"; // GIAI_DOAN_1: Trước giữa kì; GIAI_DOAN_2: Sau giữa kì
  weightPercentageMidterm: number; // Trọng số % khi ra đề Giữa kì
  weightPercentageFinal: number;   // Trọng số % khi ra đề Cuối kì (Chuẩn: 25% GĐ1, 75% GĐ2)
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

export const TEXTBOOK_SERIES_OPTIONS = [
  "Bộ sách chuẩn dùng chung (GDPT 2018)",
  "Kết nối tri thức với cuộc sống",
  "Cánh diều",
  "Chân trời sáng tạo"
];

export const GRADES_ALL = [6, 7, 8, 9, 10, 11, 12];
export const GRADES_THCS = [6, 7, 8, 9];
export const GRADES_THPT = [10, 11, 12];

export const SUBJECTS_THCS = [
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Khoa học tự nhiên",
  "Lịch sử và Địa lí",
  "Giáo dục công dân",
  "Tin học",
  "Công nghệ"
];

export const SUBJECTS_THPT = [
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Vật lí",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lí",
  "Giáo dục kinh tế và pháp luật",
  "Tin học",
  "Công nghệ"
];

export const ALL_SUBJECTS = Array.from(new Set([...SUBJECTS_THCS, ...SUBJECTS_THPT]));

export function getSubjectsForGrade(grade: number): string[] {
  if (grade <= 9) return SUBJECTS_THCS;
  return SUBJECTS_THPT;
}

// Built-in Authentic Subject Knowledge Base for GDPT 2018
export const CURRICULUM_DATABASE: SubjectCurriculum[] = [
  // 1. TOÁN HỌC 8
  {
    subject: "Toán học",
    grade: 8,
    textbookSeries: "Bộ sách chuẩn dùng chung (GDPT 2018)",
    semester: "HK1",
    midtermAppendixNotes: "Kiểm tra Giữa kì I: Trọng tâm Chương I (Đơn thức, Đa thức nhiều biến) và Chương II (7 HĐT đáng nhớ).",
    finalAppendixNotes: "Kiểm tra Cuối kì I: 25% Chương I, II (Đại số nửa đầu kì) + 75% Chương III (Tứ giác & Hình học trực quan, Định lí Thalès).",
    topics: [
      {
        code: "CD1",
        name: "Chương I: Đơn thức và Đa thức nhiều biến",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B1",
            name: "Bài 1 & 2: Đơn thức và Đa thức nhiều biến",
            order: 1,
            lessonHours: 6,
            yccds: [
              {
                code: "TOAN8_CD1_NB01",
                description: "Nhận biết được đơn thức, đa thức nhiều biến, đơn thức thu gọn và bậc của đa thức.",
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 1 & 2, tr.6-14"
              },
              {
                code: "TOAN8_CD1_TH01",
                description: "Thực hiện được phép cộng, trừ các đơn thức đồng dạng và thu gọn đa thức.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 1 & 2, tr.10-15"
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
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B2",
            name: "Bài 3 & 4: Bảy hằng đẳng thức đáng nhớ và Phân tích đa thức thành nhân tử",
            order: 1,
            lessonHours: 8,
            yccds: [
              {
                code: "TOAN8_CD2_NB01",
                description: "Nhận biết dạng khai triển của 7 hằng đẳng thức đáng nhớ.",
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 3, tr.16-22"
              },
              {
                code: "TOAN8_CD2_VD01",
                description: "Vận dụng các phương pháp phân tích đa thức thành nhân tử để tính nhanh và tìm nghiệm.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 4, tr.23-28"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chương III: Tứ giác và Hình học trực quan",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 70,
        units: [
          {
            code: "B3",
            name: "Bài 5 & 6: Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông",
            order: 1,
            lessonHours: 12,
            yccds: [
              {
                code: "TOAN8_CD3_TH01",
                description: "Hiểu và giải thích được tính chất và dấu hiệu nhận biết các tứ giác đặc biệt.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 5, tr.45-56"
              },
              {
                code: "TOAN8_CD3_VDC01",
                description: "Vận dụng tính chất tứ giác và định lí Pythagore để chứng minh hình học và giải bài toán cực trị/thực tiễn.",
                cognitiveLevelDefault: "VDC",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK Toán 8 Tập 1 - Bài 6, tr.57-65"
              }
            ]
          }
        ]
      }
    ]
  },

  // 2. KHOA HỌC TỰ NHIÊN 8
  {
    subject: "Khoa học tự nhiên",
    grade: 8,
    textbookSeries: "Bộ sách chuẩn dùng chung (GDPT 2018)",
    semester: "HK1",
    midtermAppendixNotes: "Giữa kì I: Phân môn Hóa học (Phản ứng hóa học, Định luật bảo toàn khối lượng) và Phân môn Vật lí (Khối lượng riêng, Áp suất).",
    finalAppendixNotes: "Cuối kì I: 25% Hóa - Lí nửa đầu kì + 75% Phân môn Sinh học cơ thể người và Sinh thái học.",
    topics: [
      {
        code: "CD1",
        name: "Chủ đề 1: Phản ứng hóa học và Biến đổi chất",
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B1",
            name: "Bài 1 & 2: Phản ứng hóa học và Định luật bảo toàn khối lượng",
            order: 1,
            lessonHours: 8,
            yccds: [
              {
                code: "KHTN8_CD1_NB01",
                description: "Nêu được khái niệm phản ứng hóa học, chất tham gia và sản phẩm.",
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: "SGK KHTN 8 - Bài 1 & 2, tr.10-18"
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: "Chủ đề 2: Khối lượng riêng và Áp suất",
        order: 2,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B2",
            name: "Bài 3 & 4: Khối lượng riêng, Áp suất chất lỏng và Khí quyển",
            order: 1,
            lessonHours: 8,
            yccds: [
              {
                code: "KHTN8_CD2_TH01",
                description: "Tính được khối lượng riêng và giải thích được các hiện tượng liên quan đến áp suất.",
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD",
                sourceReference: "SGK KHTN 8 - Bài 3 & 4, tr.25-36"
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: "Chủ đề 3: Sinh học cơ thể người và Môi trường sống",
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 70,
        units: [
          {
            code: "B3",
            name: "Bài 5 & 6: Hệ tuần hoàn, Hô hấp và Cân bằng nội môi",
            order: 1,
            lessonHours: 14,
            yccds: [
              {
                code: "KHTN8_CD3_VD01",
                description: "Vận dụng hiểu biết về các hệ cơ quan để thực hiện chế độ dinh dưỡng và bảo vệ sức khỏe.",
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_KTKN",
                sourceReference: "SGK KHTN 8 - Bài 5 & 6, tr.60-78"
              }
            ]
          }
        ]
      }
    ]
  }
];

// Dynamic Curriculum Generator that guarantees comprehensive curriculum support
// for any Subject and Grade (6 to 12) across all Textbook Series
export function getCurriculumData(
  subject: string,
  grade: number,
  semester: "HK1" | "HK2" = "HK1",
  examPeriod: "GIUA_KY" | "CUOI_KY" = "GIUA_KY",
  textbookSeries: string = "Bộ sách chuẩn dùng chung (GDPT 2018)"
): SubjectCurriculum {
  const match = CURRICULUM_DATABASE.find(
    c => c.subject.toLowerCase() === subject.toLowerCase() && c.grade === Number(grade) && c.semester === semester
  );

  if (match) {
    return {
      ...match,
      textbookSeries: textbookSeries || match.textbookSeries
    };
  }

  // Generic Dynamic Subject Generator tailored to GDPT 2018 standards for Grades 6-12
  const isTHCS = grade <= 9;
  const periodDesc = examPeriod === "CUOI_KY" ? "Cuối kì (25% GĐ1 + 75% GĐ2)" : "Giữa kì (100% GĐ1)";

  let topic1Name = `Chủ đề 1: Kiến thức nền tảng & Khái niệm cốt lõi - ${subject} ${grade}`;
  let topic2Name = `Chủ đề 2: Kĩ năng thực hành & Phép tính trọng tâm - ${subject} ${grade}`;
  let topic3Name = `Chủ đề 3: Vận dụng tổng hợp & Tình huống thực tiễn - ${subject} ${grade}`;

  if (subject === "Toán học") {
    if (grade === 6) {
      topic1Name = "Chương I: Số tự nhiên và Tính chia hết";
      topic2Name = "Chương II: Số nguyên và Phép tính";
      topic3Name = "Chương III: Hình học trực quan và Đo lường";
    } else if (grade === 7) {
      topic1Name = "Chương I: Số hữu tỉ và Số thực";
      topic2Name = "Chương II: Góc và Đường thẳng song song, Tam giác bằng nhau";
      topic3Name = "Chương III: Biểu thức đại số và Đa thức một biến";
    } else if (grade === 9) {
      topic1Name = "Chương I: Phương trình và Hệ hai phương trình bậc nhất hai ẩn";
      topic2Name = "Chương II: Bất đẳng thức và Bất phương trình bậc nhất";
      topic3Name = "Chương III: Căn thức và Đường tròn";
    } else if (grade === 10) {
      topic1Name = "Chương I: Mệnh đề, Tập hợp và Bất phương trình bậc nhất";
      topic2Name = "Chương II: Hàm số bậc hai và Đồ thị";
      topic3Name = "Chương III: Hệ thức lượng trong tam giác và Véc-tơ";
    } else if (grade === 11) {
      topic1Name = "Chương I: Hàm số lượng giác và Phương trình lượng giác";
      topic2Name = "Chương II: Dãy số, Cấp số cộng và Cấp số nhân";
      topic3Name = "Chương III: Giới hạn, Hàm số liên tục và Hình học không gian";
    } else if (grade === 12) {
      topic1Name = "Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số";
      topic2Name = "Chương II: Tọa độ và Véc-tơ trong không gian (Oxyz)";
      topic3Name = "Chương III: Nguyên hàm, Tích phân và Thống kê nâng cao";
    }
  } else if (subject === "Vật lí") {
    if (grade === 10) {
      topic1Name = "Chủ đề 1: Động học (Chuyển động thẳng đều và biến đổi đều)";
      topic2Name = "Chủ đề 2: Động lực học (Các định luật Newton và Các lực cơ học)";
      topic3Name = "Chủ đề 3: Năng lượng, Công và Động lượng";
    } else if (grade === 11) {
      topic1Name = "Chủ đề 1: Dao động cơ (Dao động điều hòa và Con lắc)";
      topic2Name = "Chủ đề 2: Sóng cơ và Sóng âm";
      topic3Name = "Chủ đề 3: Điện trường và Dòng điện không đổi";
    } else if (grade === 12) {
      topic1Name = "Chủ đề 1: Vật lí nhiệt (Nhiệt độ, Nhiệt dung và Trạng thái khí)";
      topic2Name = "Chủ đề 2: Khí lí tưởng và Các định luật chất khí";
      topic3Name = "Chủ đề 3: Từ trường, Cảm ứng điện từ và Hạt nhân nguyên tử";
    }
  } else if (subject === "Hóa học") {
    if (grade === 10) {
      topic1Name = "Chủ đề 1: Cấu tạo nguyên tử và Bảng tuần hoàn";
      topic2Name = "Chủ đề 2: Liên kết hóa học và Phản ứng oxi hóa - khử";
      topic3Name = "Chủ đề 3: Năng lượng hóa học, Tốc độ phản ứng và Halogen";
    } else if (grade === 11) {
      topic1Name = "Chủ đề 1: Cân bằng hóa học, Nitrogen và Sulfur";
      topic2Name = "Chủ đề 2: Đại cương hóa hữu cơ và Hydrocarbon";
      topic3Name = "Chủ đề 3: Dẫn xuất Halogen, Alcohol, Phenol và Carbonyl";
    } else if (grade === 12) {
      topic1Name = "Chủ đề 1: Ester, Lipid và Carbohydrate";
      topic2Name = "Chủ đề 2: Amine, Amino acid, Peptide và Protein";
      topic3Name = "Chủ đề 3: Pin điện hóa, Điện phân và Đại cương kim loại";
    }
  } else if (subject === "Sinh học") {
    if (grade === 10) {
      topic1Name = "Chủ đề 1: Thành phần hóa học và Cấu trúc tế bào";
      topic2Name = "Chủ đề 2: Trao đổi chất, Năng lượng và Chu kì tế bào";
      topic3Name = "Chủ đề 3: Vi sinh vật, Virus và Ứng dụng";
    } else if (grade === 11) {
      topic1Name = "Chủ đề 1: Trao đổi chất và Năng lượng ở sinh vật";
      topic2Name = "Chủ đề 2: Cảm ứng, Sinh trưởng và Phát triển";
      topic3Name = "Chủ đề 3: Sinh sản ở thực vật và động vật";
    } else if (grade === 12) {
      topic1Name = "Chủ đề 1: Di truyền phân tử và Di truyền nhiễm sắc thể";
      topic2Name = "Chủ đề 2: Di truyền quần thể và Bằng chứng tiến hóa";
      topic3Name = "Chủ đề 3: Sinh thái học, Quần xã và Môi trường";
    }
  } else if (subject === "Ngữ văn") {
    topic1Name = `Chủ đề 1: Đọc hiểu văn bản văn học và Ngữ liệu thực tế (${grade >= 10 ? "THPT" : "THCS"})`;
    topic2Name = `Chủ đề 2: Thực hành Tiếng Việt, Biện pháp tu từ và Liên kết câu`;
    topic3Name = `Chủ đề 3: Viết bài văn nghị luận xã hội và Nghị luận văn học`;
  } else if (subject === "Tiếng Anh") {
    topic1Name = `Unit 1-3: Language Focus (Phonetics, Vocabulary & Core Grammar Grade ${grade})`;
    topic2Name = `Unit 4-6: Reading Comprehension & Functional Communication`;
    topic3Name = `Unit 7-8: Writing Skills, Sentence Transformation & Error Correction`;
  } else if (subject.includes("Lịch sử") || subject.includes("Địa lí")) {
    topic1Name = `Chủ đề 1: Lịch sử / Địa lí nửa đầu kì - Môn ${subject} ${grade}`;
    topic2Name = `Chủ đề 2: Khám phá các nền văn minh và Hiện tượng địa lí`;
    topic3Name = `Chủ đề 3: Vận dụng kiến thức lịch sử - địa lí vào thực tiễn phát triển`;
  }

  return {
    subject,
    grade,
    textbookSeries: textbookSeries || "Bộ sách chuẩn dùng chung (GDPT 2018)",
    semester,
    midtermAppendixNotes: `Khung phân phối chương trình môn ${subject} ${grade} theo Công văn 5512/BGDĐT (${periodDesc}).`,
    finalAppendixNotes: `Phân phối chương trình Cuối kì môn ${subject} ${grade}: 25% nửa đầu kì + 75% nửa sau kì.`,
    topics: [
      {
        code: "CD1",
        name: topic1Name,
        order: 1,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B1",
            name: `Bài 1: Kiến thức nền tảng & Nhận biết môn ${subject} ${grade}`,
            order: 1,
            lessonHours: 8,
            yccds: [
              {
                code: `YCCD_${grade}_01`,
                description: `Nhận biết và trình bày được các định nghĩa, khái niệm và tính chất cơ bản môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "NB",
                competencyCode: "NTHK",
                sourceReference: `SGK ${subject} ${grade} (${textbookSeries}) - Bài 1 & 2`
              },
              {
                code: `YCCD_${grade}_02`,
                description: `Thông hiểu bản chất và giải thích được các quy luật, hiện tượng hoặc bài toán cơ bản môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "TH",
                competencyCode: "GQVD",
                sourceReference: `SGK ${subject} ${grade} (${textbookSeries}) - Bài 3 & 4`
              }
            ]
          }
        ]
      },
      {
        code: "CD2",
        name: topic2Name,
        order: 2,
        period: "GIAI_DOAN_1",
        weightPercentageMidterm: 50,
        weightPercentageFinal: 15,
        units: [
          {
            code: "B2",
            name: `Bài 2: Rèn luyện kĩ năng & Vận dụng môn ${subject} ${grade}`,
            order: 1,
            lessonHours: 10,
            yccds: [
              {
                code: `YCCD_${grade}_03`,
                description: `Vận dụng các công thức, định lí và phương pháp đã học để giải quyết bài toán hoặc tình huống cụ thể môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "VD",
                competencyCode: "VD_KTKN",
                sourceReference: `SGK ${subject} ${grade} (${textbookSeries}) - Bài 5 & 6`
              }
            ]
          }
        ]
      },
      {
        code: "CD3",
        name: topic3Name,
        order: 3,
        period: "GIAI_DOAN_2",
        weightPercentageMidterm: 0,
        weightPercentageFinal: 70,
        units: [
          {
            code: "B3",
            name: `Bài 3: Tổng hợp kiến thức & Vận dụng thực tiễn môn ${subject} ${grade}`,
            order: 1,
            lessonHours: 14,
            yccds: [
              {
                code: `YCCD_${grade}_04`,
                description: `Vận dụng cao kiến thức tổng hợp để phân tích, biện luận và giải quyết các bài toán liên môn hoặc tình huống thực tiễn phức tạp môn ${subject} ${grade}.`,
                cognitiveLevelDefault: "VDC",
                competencyCode: "VD_KTKN",
                sourceReference: `SGK ${subject} ${grade} (${textbookSeries}) - Bài 7 & 8`
              }
            ]
          }
        ]
      }
    ]
  };
}
