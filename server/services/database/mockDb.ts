import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  User,
  Organization,
  Project,
  SourceMaterial,
  SourceFragment,
  DataPack,
  Blueprint,
  Matrix,
  Specification,
  Question,
  AuditLog,
  AIUsageLog
} from "../../../shared/types/index.js";

export interface DatabaseSchema {
  users: User[];
  organizations: Organization[];
  projects: Project[];
  sources: SourceMaterial[];
  sourceFragments: SourceFragment[];
  dataPacks: Record<string, DataPack>;
  blueprints: Record<string, Blueprint>;
  matrices: Record<string, Matrix>;
  specifications: Record<string, Specification>;
  questions: Record<string, Question[]>;
  auditLogs: AuditLog[];
  aiUsageLogs: AIUsageLog[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDbFilePath(): string {
  const candidate1 = path.resolve(process.cwd(), "server/data/db.json");
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.resolve(__dirname, "../../data/db.json");
  if (fs.existsSync(candidate2)) return candidate2;

  const candidate3 = path.resolve(process.cwd(), "dist-server/data/db.json");
  if (fs.existsSync(candidate3)) return candidate3;

  return candidate1;
}

export class DatabaseService {
  private static data: DatabaseSchema;

  public static initialize(): void {
    const dbFile = getDbFilePath();
    if (fs.existsSync(dbFile)) {
      try {
        const raw = fs.readFileSync(dbFile, "utf-8");
        DatabaseService.data = JSON.parse(raw);
        console.log("Database successfully loaded from", dbFile);
        return;
      } catch (err) {
        console.error("Error parsing db.json, initializing default structure...", err);
      }
    }

    DatabaseService.data = {
      users: [],
      organizations: [],
      projects: [],
      sources: [],
      sourceFragments: [],
      dataPacks: {},
      blueprints: {},
      matrices: {},
      specifications: {},
      questions: {},
      auditLogs: [],
      aiUsageLogs: []
    };
    DatabaseService.save();
  }

  public static save(): void {
    try {
      const dbFile = getDbFilePath();
      const dir = path.dirname(dbFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFile, JSON.stringify(DatabaseService.data, null, 2), "utf-8");
    } catch (err) {
      // In serverless read-only environment, keep changes in memory without throwing
      console.warn("Notice: In-memory persistence active:", err);
    }
  }

  public static get(): DatabaseSchema {
    if (!DatabaseService.data) {
      DatabaseService.initialize();
    }
    return DatabaseService.data;
  }
}
