import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { User } from "../../shared/types/index.js";

const router = Router();
const MASTER_ADMIN_EMAIL = "tailieugiaoducso@gmail.com";
const ANNUAL_SUBSCRIPTION_FEE = 30000; // 30,000 VND / year

// Helper to compute subscription state
function enrichUserSubscription(user: User): User {
  if (user.isActivated || user.subscriptionStatus === "ACTIVE") {
    return {
      ...user,
      subscriptionStatus: "ACTIVE",
      isActivated: true,
      activatedByEmail: MASTER_ADMIN_EMAIL
    };
  }

  const now = Date.now();
  const createdAtTime = new Date(user.createdAt || Date.now()).getTime();
  const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 3 Days in ms
  const trialEndsTime = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : createdAtTime + trialDurationMs;

  if (now > trialEndsTime) {
    return {
      ...user,
      subscriptionStatus: "EXPIRED",
      trialEndsAt: new Date(trialEndsTime).toISOString(),
      isActivated: false,
      activatedByEmail: MASTER_ADMIN_EMAIL
    };
  }

  return {
    ...user,
    subscriptionStatus: "TRIAL",
    trialEndsAt: new Date(trialEndsTime).toISOString(),
    isActivated: false,
    activatedByEmail: MASTER_ADMIN_EMAIL
  };
}

// GET /api/auth/me
router.get("/me", (req: any, res) => {
  const db = DatabaseService.get();
  const user = req.user || db.users[3]; // Default teacher
  res.json({ user: enrichUserSubscription(user) });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email } = req.body;
  const db = DatabaseService.get();
  let user = db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());

  if (!user) {
    // If not found, use default teacher or create a new trial account
    user = db.users[3];
  }

  const enriched = enrichUserSubscription(user);
  res.json({
    token: enriched.id,
    user: enriched
  });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { fullName, email, schoolName, subject } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Vui lòng nhập họ tên và email giáo viên." });
  }

  const db = DatabaseService.get();
  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email này đã được đăng ký trên hệ thống. Vui lòng đăng nhập." });
  }

  const now = new Date();
  const trialEnds = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Exactly 3 days free trial

  const newUser: User = {
    id: "usr-" + Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role: "R04_TEACHER",
    organizationId: "org-1",
    department: `Tổ ${subject || "Khoa học tự nhiên"}`,
    schoolName: schoolName?.trim() || "Trường THCS Chu Văn An",
    defaultSubject: subject || "Toán học",
    createdAt: now.toISOString(),
    subscriptionStatus: "TRIAL",
    trialEndsAt: trialEnds.toISOString(),
    activatedByEmail: MASTER_ADMIN_EMAIL,
    isActivated: false
  };

  db.users.push(newUser);
  DatabaseService.save();

  res.status(201).json({
    success: true,
    token: newUser.id,
    user: newUser,
    message: "Đăng ký thành công! Bạn có 3 ngày dùng thử miễn phí toàn bộ tính năng."
  });
});

// POST /api/auth/activate
router.post("/activate", (req, res) => {
  const { email, activationCode } = req.body;
  const db = DatabaseService.get();
  const user = db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());

  if (!user) {
    return res.status(404).json({ error: "Không tìm thấy tài khoản người dùng." });
  }

  // Activate 1-year subscription
  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  user.subscriptionStatus = "ACTIVE";
  user.isActivated = true;
  user.activatedByEmail = MASTER_ADMIN_EMAIL;
  user.subscriptionExpiresAt = nextYear.toISOString();

  DatabaseService.save();

  res.json({
    success: true,
    message: `Đã kích hoạt thành công bản quyền 1 năm (30.000đ/năm) liên kết với ${MASTER_ADMIN_EMAIL}.`,
    user: enrichUserSubscription(user)
  });
});

// GET /api/auth/subscription-info
router.get("/subscription-info", (req, res) => {
  res.json({
    masterEmail: MASTER_ADMIN_EMAIL,
    annualFee: ANNUAL_SUBSCRIPTION_FEE,
    trialDays: 3,
    bankInfo: {
      bankName: "MB Bank (Ngân hàng Quân Đội)",
      accountNumber: "0987654321",
      accountHolder: "LE TAM - EDUTEST AI",
      syntax: "EDUTEST [Email giáo viên]"
    }
  });
});

// GET /api/auth/users (for switching roles in dev)
router.get("/users", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.users.map(enrichUserSubscription));
});

export default router;
