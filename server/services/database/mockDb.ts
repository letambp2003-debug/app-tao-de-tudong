import fs from "fs";
import path from "path";
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

const DB_FILE = path.resolve(process.cwd(), "server/data/db.json");

export class DatabaseService {
  private static data: DatabaseSchema;

  public static initialize(): void {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        DatabaseService.data = JSON.parse(raw);
        console.log("Database successfully loaded from", DB_FILE);
        return;
      } catch (err) {
        console.error("Error parsing db.json, initializing empty structure...", err);
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
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(DatabaseService.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving db.json:", err);
    }
  }

  public static get(): DatabaseSchema {
    if (!DatabaseService.data) {
      DatabaseService.initialize();
    }
    return DatabaseService.data;
  }
}
