// JSON Schemas for AI modules (AI01 to AI10)

export const AI01_SourceExtractorSchema = {
  type: "object",
  required: ["fragments", "totalPages", "sourceTypeDetected"],
  properties: {
    totalPages: { type: "number" },
    sourceTypeDetected: { type: "string" },
    fragments: {
      type: "array",
      items: {
        type: "object",
        required: ["pageNumber", "content"],
        properties: {
          pageNumber: { type: "number" },
          content: { type: "string" },
          topicDetected: { type: "string" },
          keywords: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

export const AI02_CurriculumMapperSchema = {
  type: "object",
  required: ["topics", "units", "yccds"],
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        required: ["code", "name", "order"],
        properties: {
          code: { type: "string" },
          name: { type: "string" },
          order: { type: "number" }
        }
      }
    },
    units: {
      type: "array",
      items: {
        type: "object",
        required: ["topicCode", "code", "name", "order"],
        properties: {
          topicCode: { type: "string" },
          code: { type: "string" },
          name: { type: "string" },
          order: { type: "number" }
        }
      }
    },
    yccds: {
      type: "array",
      items: {
        type: "object",
        required: ["unitCode", "code", "description", "cognitiveLevelDefault", "competencyCode", "sourceReference"],
        properties: {
          unitCode: { type: "string" },
          code: { type: "string" },
          description: { type: "string" },
          cognitiveLevelDefault: { type: "string", enum: ["NB", "TH", "VD", "VDC"] },
          competencyCode: { type: "string" },
          sourceReference: { type: "string" }
        }
      }
    }
  }
};

export const AI03_MatrixAdvisorSchema = {
  type: "object",
  required: ["cells", "summaryRationale"],
  properties: {
    summaryRationale: { type: "string" },
    cells: {
      type: "array",
      items: {
        type: "object",
        required: ["topicCode", "unitCode", "questionType", "cognitiveLevel", "count", "scorePerItem", "totalScore"],
        properties: {
          topicCode: { type: "string" },
          unitCode: { type: "string" },
          questionType: { type: "string", enum: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"] },
          cognitiveLevel: { type: "string", enum: ["NB", "TH", "VD", "VDC"] },
          count: { type: "number" },
          scorePerItem: { type: "number" },
          totalScore: { type: "number" },
          note: { type: "string" }
        }
      }
    }
  }
};

export const AI04_SpecWriterSchema = {
  type: "object",
  required: ["rows"],
  properties: {
    rows: {
      type: "array",
      items: {
        type: "object",
        required: ["matrixCellIndex", "topicCode", "unitCode", "yccdCode", "yccdText", "cognitiveLevel", "questionType", "count", "score", "competency", "sourceReference"],
        properties: {
          matrixCellIndex: { type: "number" },
          topicCode: { type: "string" },
          unitCode: { type: "string" },
          yccdCode: { type: "string" },
          yccdText: { type: "string" },
          cognitiveLevel: { type: "string", enum: ["NB", "TH", "VD", "VDC"] },
          questionType: { type: "string", enum: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"] },
          count: { type: "number" },
          score: { type: "number" },
          competency: { type: "string" },
          sourceReference: { type: "string" }
        }
      }
    }
  }
};

export const AI05_QuestionAuthorSchema = {
  type: "object",
  required: ["stem", "type", "cognitiveLevel", "score", "explanation", "sourceReference"],
  properties: {
    stem: { type: "string" },
    type: { type: "string", enum: ["MULTIPLE_CHOICE", "TRUE_FALSE_4", "SHORT_ANSWER", "ESSAY"] },
    cognitiveLevel: { type: "string", enum: ["NB", "TH", "VD", "VDC"] },
    score: { type: "number" },
    explanation: { type: "string" },
    sourceReference: { type: "string" },
    mcOptions: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "content", "isCorrect"],
        properties: {
          label: { type: "string", enum: ["A", "B", "C", "D"] },
          content: { type: "string" },
          isCorrect: { type: "boolean" }
        }
      }
    },
    tfItems: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "content", "isCorrect", "explanation"],
        properties: {
          label: { type: "string", enum: ["a", "b", "c", "d"] },
          content: { type: "string" },
          isCorrect: { type: "boolean" },
          explanation: { type: "string" }
        }
      }
    },
    saSpec: {
      type: "object",
      required: ["expectedAnswer"],
      properties: {
        expectedAnswer: { type: "string" },
        unit: { type: "string" },
        tolerance: { type: "number" },
        alternativeAnswers: { type: "array", items: { type: "string" } }
      }
    },
    rubricSteps: {
      type: "array",
      items: {
        type: "object",
        required: ["stepNumber", "criterion", "expectedContent", "score"],
        properties: {
          stepNumber: { type: "number" },
          criterion: { type: "string" },
          expectedContent: { type: "string" },
          score: { type: "number" }
        }
      }
    }
  }
};

export const AI07_ContentReviewerSchema = {
  type: "object",
  required: ["status", "scores", "issues", "recommendations"],
  properties: {
    status: { type: "string", enum: ["DAT", "CAN_DUYET", "KHONG_DAT"] },
    scores: {
      type: "object",
      properties: {
        accuracy: { type: "number" },
        pedagogicalFit: { type: "number" },
        distractorQuality: { type: "number" }
      }
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        required: ["severity", "description"],
        properties: {
          severity: { type: "string", enum: ["CRITICAL", "ERROR", "WARNING", "INFO"] },
          description: { type: "string" },
          suggestion: { type: "string" }
        }
      }
    },
    recommendations: { type: "string" }
  }
};
