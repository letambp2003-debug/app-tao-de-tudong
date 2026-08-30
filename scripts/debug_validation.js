import { ValidationEngine } from "./server/services/validation/index.js";
import { DatabaseService } from "./server/services/database/mockDb.js";

DatabaseService.initialize();
const db = DatabaseService.get();
const projectId = "proj-khtn8-midterm";

const { report } = ValidationEngine.runFullValidation({
  project: db.projects.find(p => p.id === projectId),
  blueprint: db.blueprints[projectId],
  matrix: db.matrices[projectId],
  specification: db.specifications[projectId],
  questions: db.questions[projectId],
  dataPack: db.dataPacks[projectId]
});

console.log("Failed rules:", report.ruleResults.filter(r => !r.passed));
