import fs from "fs";
import path from "path";

// 1. server/config/index.ts
fs.writeFileSync("server/config/index.ts", `import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  dataDir: process.env.DATA_DIR || "./server/data",
  uploadDir: process.env.UPLOAD_DIR || "./server/data/uploads"
};
`, "utf-8");

console.log("Config created.");
