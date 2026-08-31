export type UserRole = 
  | "R01_SYSTEM_ADMIN"
  | "R02_SCHOOL_ADMIN"
  | "R03_HEAD_OF_DEPT"
  | "R04_TEACHER"
  | "R05_REVIEWER"
  | "R06_VIEWER";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  schoolName?: string;
  defaultSubject?: string;
  username?: string;
  password?: string;
  subscriptionStatus?: "TRIAL" | "ACTIVE" | "EXPIRED";
  trialEndsAt?: string;
  subscriptionExpiresAt?: string;
  activatedByEmail?: string;
  isActivated?: boolean;
  storageLocation?: "ADMIN_DRIVE" | "PERSONAL_DRIVE";
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
  departments: string[];
}

export interface TeacherProfile {
  userId: string;
  fullName: string;
  schoolName: string;
  department: string;
  defaultSubject: string;
  defaultGrade: number;
}

export type ProjectStatus =
  | "DRAFT"
  | "SOURCES_UPLOADED"
  | "DATA_EXTRACTED"
  | "DATA_APPROVED"
  | "BLUEPRINT_CONFIGURED"
  | "MATRIX_GENERATED"
  | "MATRIX_APPROVED"
  | "SPECIFICATION_GENERATED"
  | "SPECIFICATION_APPROVED"
  | "QUESTIONS_GENERATED"
  | "QUESTIONS_REVIEWED"
  | "EXAM_ASSEMBLED"
  | "VALIDATED"
  | "APPROVED"
  | "EXPORTED"
  | "ARCHIVED";

export type CognitiveLevel = "NB" | "TH" | "VD" | "VDC";

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  NB: "Nhận biết",
  TH: "Thông hiểu",
  VD: "Vận dụng",
  VDC: "Vận dụng cao"
};

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE_4"
  | "SHORT_ANSWER"
  | "ESSAY";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm nhiều lựa chọn",
  TRUE_FALSE_4: "Trắc nghiệm Đúng - Sai",
  SHORT_ANSWER: "Trắc nghiệm Trả lời ngắn",
  ESSAY: "Tự luận"
};

export interface Project {
  id: string;
  name: string;
  subject: string;
  grade: number;
  textbookSeries: string;
  semester: "HK1" | "HK2";
  examPeriod: "GIUA_KY" | "CUOI_KY" | "THUONG_XUYEN";
  durationMinutes: number;
  totalScore: number;
  status: ProjectStatus;
  organizationId: string;
  authorId: string;
  authorName: string;
  organizationName: string;
  ruleProfileId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SourceMaterial {
  id: string;
  projectId: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "IMAGE" | "MARKDOWN";
  fileSize: number;
  fileUrl: string;
  hash: string;
  sourceType: "SGK" | "CTGDPT" | "YCCD" | "CONG_VAN" | "OTHER";
  status: "PENDING" | "EXTRACTED" | "ERROR";
  pageCount: number;
  extractedText?: string;
  createdAt: string;
}

export interface SourceFragment {
  id: string;
  sourceId: string;
  pageNumber: number;
  content: string;
  topicRef?: string;
  metadata?: Record<string, any>;
}

export interface DataPackTopic {
  id: string;
  code: string;
  name: string;
  order: number;
  period?: "GIAI_DOAN_1" | "GIAI_DOAN_2" | "TOAN_DIEN";
  weightPercentageMidterm?: number;
  weightPercentageFinal?: number;
}

export interface DataPackUnit {
  id: string;
  topicId: string;
  code: string;
  name: string;
  order: number;
  lessonHours?: number;
}

export interface DataPackYCCD {
  id: string;
  unitId: string;
  topicId?: string;
  code: string;
  description: string;
  cognitiveLevelDefault: CognitiveLevel;
  competencyCode: string;
  sourceReference: string;
}

export type Topic = DataPackTopic;
export type Unit = DataPackUnit;
export type YCCD = DataPackYCCD;

export interface DataPack {
  projectId: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  topics: DataPackTopic[];
  units: DataPackUnit[];
  yccds: DataPackYCCD[];
  appendixNotes?: string;
  version: number;
}

export interface BlueprintCognitiveWeight {
  NB: number;
  TH: number;
  VD: number;
  VDC: number;
}

export interface BlueprintQuestionTypeConfig {
  type: QuestionType;
  count: number;
  pointsPerItem: number;
  totalScore: number;
}

export interface BlueprintTopicAllocation {
  topicId: string;
  targetScore: number;
  targetPercentage: number;
}

export interface Blueprint {
  id: string;
  projectId: string;
  totalScore: number;
  totalQuestions?: number;
  durationMinutes: number;
  cognitiveWeights: BlueprintCognitiveWeight;
  questionTypeConfigs: BlueprintQuestionTypeConfig[];
  topicAllocations: BlueprintTopicAllocation[];
  updatedAt: string;
}

export interface MatrixCell {
  id: string;
  topicId: string;
  unitId?: string;
  questionType: QuestionType;
  cognitiveLevel: CognitiveLevel;
  count: number;
  pointsPerItem: number;
  totalScore: number;
  note?: string;
}

export interface Matrix {
  id: string;
  projectId: string;
  cells: MatrixCell[];
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  version: number;
  updatedAt: string;
}

export interface SpecificationRow {
  id: string;
  matrixCellId: string;
  topicId: string;
  unitId: string;
  yccdId: string;
  yccdText: string;
  cognitiveLevel: CognitiveLevel;
  questionType: QuestionType;
  count: number;
  score: number;
  competency: string;
  sourceReference: string;
}

export interface Specification {
  id: string;
  projectId: string;
  rows: SpecificationRow[];
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  version: number;
  updatedAt: string;
}

export interface MultipleChoiceOption {
  id: string;
  label: "A" | "B" | "C" | "D";
  content: string;
  isCorrect: boolean;
}

export interface TrueFalseItem {
  id: string;
  label: "a" | "b" | "c" | "d";
  content: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ShortAnswerSpec {
  expectedAnswer: string;
  unit?: string;
  tolerance?: number;
  alternativeAnswers: string[];
}

export interface EssayRubricStep {
  id: string;
  stepNumber: number;
  criterion: string;
  expectedContent: string;
  score: number;
}

export interface Question {
  id: string;
  projectId: string;
  specificationId: string;
  section: "PHAN_1" | "PHAN_2" | "PHAN_3" | "PHAN_4";
  orderNumber: number;
  type: QuestionType;
  stem: string;
  score: number;
  cognitiveLevel: CognitiveLevel;
  topicId: string;
  unitId: string;
  yccdId: string;
  sourceReference: string;
  explanation?: string;
  mcOptions?: MultipleChoiceOption[];
  tfItems?: TrueFalseItem[];
  saSpec?: ShortAnswerSpec;
  rubricSteps?: EssayRubricStep[];
  aiGenerated: boolean;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "REJECTED";
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamPart {
  id: string;
  title: string;
  type: QuestionType;
  description: string;
  questionIds: string[];
}

export interface ExamCodeVersion {
  examCode: string;
  questionOrder: {
    questionId: string;
    shuffledOptionIds?: string[];
  }[];
}

export interface ExamAssembly {
  projectId: string;
  examTitle: string;
  schoolName: string;
  subjectName: string;
  grade: number;
  durationMinutes: number;
  academicYear: string;
  semester: string;
  instructions: string;
  parts: ExamPart[];
  examCodeVersions: ExamCodeVersion[];
  updatedAt: string;
}

export type ValidationSeverity = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

export interface ValidationRuleResult {
  ruleCode: string;
  ruleName: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  guidance?: string;
  stepKey?: "INFO" | "SOURCES" | "DATAPACK" | "BLUEPRINT" | "MATRIX" | "SPECIFICATION" | "QUESTIONS" | "VALIDATE" | "EXPORT";
  actionLabel?: string;
  details?: any;
  autoFixable?: boolean;
}

export interface ValidationReport {
  projectId: string;
  timestamp: string;
  allPassed: boolean;
  criticalErrorsCount: number;
  errorsCount: number;
  warningsCount: number;
  totalRulesChecked: number;
  ruleResults: ValidationRuleResult[];
}

export interface TraceabilityLink {
  questionId: string;
  questionOrder: number;
  questionType: QuestionType;
  stem: string;
  score: number;
  cognitiveLevel: CognitiveLevel;
  specRowId: string;
  yccdCode: string;
  yccdText: string;
  topicName: string;
  unitName: string;
  sourceReference: string;
  hasRubricOrAnswer: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  projectId?: string;
  details: string;
  timestamp: string;
}

export interface AIUsageLog {
  id: string;
  moduleCode: string;
  projectId: string;
  promptVersion: string;
  status: "SUCCESS" | "ERROR" | "FALLBACK_MOCK";
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
  timestamp: string;
  errorMessage?: string;
}

export interface SubjectRuleProfile {
  id: string;
  subject: string;
  grade: number;
  name: string;
  defaultDuration: number;
  defaultTotalScore: number;
  defaultCognitiveWeights: BlueprintCognitiveWeight;
  defaultQuestionTypeConfigs: BlueprintQuestionTypeConfig[];
  allowedQuestionTypes: QuestionType[];
  guidanceNotes: string;
}
