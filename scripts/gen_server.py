import os
import json

def write_file(rel_path, content):
    os.makedirs(os.path.dirname(rel_path), exist_ok=True)
    with open(rel_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written {rel_path}")

# 1. server/config/index.ts
write_file("server/config/index.ts", """import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  dataDir: process.env.DATA_DIR || "./server/data",
  uploadDir: process.env.UPLOAD_DIR || "./server/data/uploads"
};
""")

# 2. server/middleware/auth.ts
write_file("server/middleware/auth.ts", """import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../shared/types/index.js";
import { DatabaseService } from "../services/database/mockDb.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const db = DatabaseService.get();

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const userId = authHeader.substring(7);
    const user = db.users.find(u => u.id === userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Default to teacher user if no token for easy development and testing
  const defaultTeacher = db.users.find(u => u.role === "R04_TEACHER") || db.users[0];
  if (defaultTeacher) {
    req.user = defaultTeacher;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Bạn không có quyền thực hiện chức năng này."
      });
    }
    next();
  };
}
""")

print("Part 1 of server written successfully.")
