import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  jwtSecret: process.env.JWT_SECRET || "edutest-secret-key-2026",
  isProduction: process.env.NODE_ENV === "production"
};
