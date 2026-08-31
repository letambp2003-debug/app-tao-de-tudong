import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { SUBJECT_RULE_PROFILES } from "../../shared/rules/index.js";
import { AIOrchestrator } from "../services/ai/orchestrator.js";
import { User } from "../../shared/types/index.js";

const router = Router();

// In-memory payment and license configuration
let paymentConfig = {
  masterEmail: "tailieugiaoducso@gmail.com",
  annualFee: 30000,
  bankName: "MB Bank (Ngân hàng Quân Đội)",
  accountNumber: "0987654321",
  accountHolder: "LE TAM - EDUTEST AI",
  syntaxPrefix: "EDUTEST",
  trialDays: 3
};

interface LicenseRecord {
  id: string;
  code: string;
  targetEmail: string;
  createdAt: string;
  isUsed: boolean;
  usedAt?: string;
  durationMonths: number;
}

const licenseRecords: LicenseRecord[] = [
  {
    id: "lic-1",
    code: "EDUTEST-2026-30K-AN",
    targetEmail: "giaovien.an@chuvanan.edu.vn",
    createdAt: new Date().toISOString(),
    isUsed: false,
    durationMonths: 12
  }
];

// GET /api/admin/audit-logs
router.get("/audit-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.auditLogs);
});

// GET /api/admin/ai-logs
router.get("/ai-logs", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.aiUsageLogs);
});

// GET /api/admin/rules
router.get("/rules", (req, res) => {
  res.json(SUBJECT_RULE_PROFILES);
});

// GET /api/admin/gemini-key
router.get("/gemini-key", (req, res) => {
  const key = AIOrchestrator.getApiKey();
  res.json({
    hasKey: Boolean(key && key.length > 5),
    maskedKey: key && key.length > 8 ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : ""
  });
});

// POST /api/admin/gemini-key
router.post("/gemini-key", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "Vui lòng nhập API Key hợp lệ của Google AI Studio" });
  }

  AIOrchestrator.setApiKey(apiKey.trim());
  res.json({
    success: true,
    message: "Đã lưu Google AI Studio API Key thành công!",
    hasKey: true,
    maskedKey: `${apiKey.trim().substring(0, 6)}...${apiKey.trim().substring(apiKey.trim().length - 4)}`
  });
});

// GET /api/admin/payment-config
router.get("/payment-config", (req, res) => {
  res.json(paymentConfig);
});

// POST /api/admin/payment-config
router.post("/payment-config", (req, res) => {
  const { masterEmail, annualFee, bankName, accountNumber, accountHolder, syntaxPrefix, trialDays } = req.body;
  paymentConfig = {
    masterEmail: masterEmail || paymentConfig.masterEmail,
    annualFee: Number(annualFee) || paymentConfig.annualFee,
    bankName: bankName || paymentConfig.bankName,
    accountNumber: accountNumber || paymentConfig.accountNumber,
    accountHolder: accountHolder || paymentConfig.accountHolder,
    syntaxPrefix: syntaxPrefix || paymentConfig.syntaxPrefix,
    trialDays: Number(trialDays) || paymentConfig.trialDays
  };
  res.json({ success: true, message: "Đã lưu cấu hình thanh toán thành công!", paymentConfig });
});

// GET /api/admin/licenses
router.get("/licenses", (req, res) => {
  res.json(licenseRecords);
});

// POST /api/admin/generate-license
router.post("/generate-license", (req, res) => {
  const { targetEmail } = req.body;
  if (!targetEmail) {
    return res.status(400).json({ error: "Vui lòng nhập email giáo viên cần cấp mã bản quyền." });
  }

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `EDUTEST-2026-${randomSuffix}-${targetEmail.split("@")[0].substring(0, 4).toUpperCase()}`;

  const newLicense: LicenseRecord = {
    id: "lic-" + Date.now(),
    code,
    targetEmail: targetEmail.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    isUsed: false,
    durationMonths: 12
  };

  licenseRecords.unshift(newLicense);
  res.status(201).json({
    success: true,
    message: `Đã tạo mã kích hoạt thành công cho ${targetEmail}`,
    license: newLicense
  });
});

// POST /api/admin/activate-user
router.post("/activate-user", (req, res) => {
  const { email } = req.body;
  const db = DatabaseService.get();
  const user = db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());

  if (!user) {
    return res.status(404).json({ error: "Không tìm thấy người dùng với email này." });
  }

  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  user.subscriptionStatus = "ACTIVE";
  user.isActivated = true;
  user.activatedByEmail = paymentConfig.masterEmail;
  user.subscriptionExpiresAt = nextYear.toISOString();

  // Mark license as used if exists
  const lic = licenseRecords.find(l => l.targetEmail === user.email.toLowerCase() && !l.isUsed);
  if (lic) {
    lic.isUsed = true;
    lic.usedAt = new Date().toISOString();
  }

  DatabaseService.save();
  res.json({
    success: true,
    message: `Đã kích hoạt bản quyền 1 năm cho giáo viên ${user.fullName} (${user.email})!`,
    user
  });
});

export default router;
