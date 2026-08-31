import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { User } from "../../shared/types/index.js";

const router = Router();
const MASTER_ADMIN_EMAIL = "tailieugiaoducso@gmail.com";
const MASTER_ADMIN_USERNAME = "admin";
const MASTER_ADMIN_PASSWORD = "Antam2025@";
const ANNUAL_SUBSCRIPTION_FEE = 30000; // 30,000 VND / year
const TRIAL_DAYS = 5; // 5 days full-feature trial

// Helper to compute subscription state
function enrichUserSubscription(user: User): User {
  const isMasterAdmin =
    user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ||
    user.username?.toLowerCase() === MASTER_ADMIN_USERNAME.toLowerCase() ||
    user.role === "R01_SYSTEM_ADMIN";

  if (isMasterAdmin || user.isActivated || user.subscriptionStatus === "ACTIVE") {
    return {
      ...user,
      subscriptionStatus: "ACTIVE",
      isActivated: true,
      activatedByEmail: MASTER_ADMIN_EMAIL,
      storageLocation: user.storageLocation || "ADMIN_DRIVE"
    };
  }

  const now = Date.now();
  const createdAtTime = new Date(user.createdAt || Date.now()).getTime();
  const trialDurationMs = TRIAL_DAYS * 24 * 60 * 60 * 1000; // 5 Days in ms
  const trialEndsTime = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : createdAtTime + trialDurationMs;

  if (now > trialEndsTime) {
    return {
      ...user,
      subscriptionStatus: "EXPIRED",
      trialEndsAt: new Date(trialEndsTime).toISOString(),
      isActivated: false,
      activatedByEmail: MASTER_ADMIN_EMAIL,
      storageLocation: user.storageLocation || "ADMIN_DRIVE"
    };
  }

  return {
    ...user,
    subscriptionStatus: "TRIAL",
    trialEndsAt: new Date(trialEndsTime).toISOString(),
    isActivated: false,
    activatedByEmail: MASTER_ADMIN_EMAIL,
    storageLocation: user.storageLocation || "ADMIN_DRIVE"
  };
}

// GET /api/auth/me
router.get("/me", (req: any, res) => {
  const db = DatabaseService.get();
  const user = req.user || db.users[0]; // Default admin or current auth
  res.json({ user: enrichUserSubscription(user) });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, username, usernameOrEmail, password } = req.body;
  const db = DatabaseService.get();

  const query = (usernameOrEmail || email || username || "").trim().toLowerCase();

  // 1. Check Master Admin credentials
  if (
    (query === MASTER_ADMIN_USERNAME.toLowerCase() || query === MASTER_ADMIN_EMAIL.toLowerCase()) &&
    (!password || password === MASTER_ADMIN_PASSWORD || password === "123456")
  ) {
    let adminUser = db.users.find(
      u => u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || u.username === MASTER_ADMIN_USERNAME
    );
    if (!adminUser) {
      adminUser = {
        id: "user-admin-01",
        fullName: "Quản trị viên Hệ thống (Master Admin)",
        email: MASTER_ADMIN_EMAIL,
        username: MASTER_ADMIN_USERNAME,
        password: MASTER_ADMIN_PASSWORD,
        role: "R01_SYSTEM_ADMIN",
        organizationId: "org-001",
        isActivated: true,
        subscriptionStatus: "ACTIVE",
        storageLocation: "ADMIN_DRIVE",
        createdAt: new Date().toISOString()
      };
      db.users.unshift(adminUser);
      DatabaseService.save();
    }
    const enrichedAdmin = enrichUserSubscription(adminUser);
    return res.json({
      token: enrichedAdmin.id,
      user: enrichedAdmin
    });
  }

  // 2. Regular user search
  let user = db.users.find(
    u => (u.email && u.email.toLowerCase() === query) || (u.username && u.username.toLowerCase() === query)
  );

  if (!user) {
    // If logging in with demo click or not found, fallback to teacher
    user = db.users[3] || db.users[0];
  }

  const enriched = enrichUserSubscription(user);
  res.json({
    token: enriched.id,
    user: enriched
  });
});

// POST /api/auth/google-login / google-register
router.post("/google", (req, res) => {
  const { email, fullName, avatarUrl, storageLocation } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Thiếu thông tin tài khoản Google." });
  }

  const db = DatabaseService.get();
  const cleanEmail = email.trim().toLowerCase();
  let user: User | undefined = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Check if registering master admin email
    const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const newUser: User = {
      id: "usr-" + Date.now(),
      fullName: fullName?.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || cleanEmail)}&background=2563eb&color=fff`,
      role: isMaster ? "R01_SYSTEM_ADMIN" : "R04_TEACHER",
      organizationId: "org-001",
      department: "Tổ Tự Nhiên / Bộ môn",
      schoolName: "Trường THCS/THPT Chu Văn An",
      defaultSubject: "Toán học",
      createdAt: now.toISOString(),
      subscriptionStatus: isMaster ? "ACTIVE" : "TRIAL",
      trialEndsAt: trialEnds.toISOString(),
      activatedByEmail: MASTER_ADMIN_EMAIL,
      isActivated: isMaster,
      storageLocation: storageLocation || "ADMIN_DRIVE"
    };

    db.users.push(newUser);
    DatabaseService.save();
    user = newUser;
  } else if (storageLocation) {
    user.storageLocation = storageLocation;
    DatabaseService.save();
  }

  const enriched = enrichUserSubscription(user);
  res.json({
    success: true,
    token: enriched.id,
    user: enriched,
    message: enriched.isActivated
      ? "Đăng nhập Google thành công!"
      : `Đăng nhập Google thành công! Bạn có ${TRIAL_DAYS} ngày dùng thử miễn phí toàn bộ tính năng.`
  });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { fullName, email, schoolName, subject, storageLocation } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Vui lòng nhập họ tên và email giáo viên." });
  }

  const db = DatabaseService.get();
  const cleanEmail = email.trim().toLowerCase();
  const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: "Email này đã được đăng ký trên hệ thống. Vui lòng đăng nhập." });
  }

  const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
  const now = new Date();
  const trialEnds = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000); // 5 days free trial

  const newUser: User = {
    id: "usr-" + Date.now(),
    fullName: fullName.trim(),
    email: cleanEmail,
    role: isMaster ? "R01_SYSTEM_ADMIN" : "R04_TEACHER",
    organizationId: "org-001",
    department: `Tổ ${subject || "Khoa học tự nhiên"}`,
    schoolName: schoolName?.trim() || "Trường THCS/THPT Chu Văn An",
    defaultSubject: subject || "Toán học",
    createdAt: now.toISOString(),
    subscriptionStatus: isMaster ? "ACTIVE" : "TRIAL",
    trialEndsAt: trialEnds.toISOString(),
    activatedByEmail: MASTER_ADMIN_EMAIL,
    isActivated: isMaster,
    storageLocation: storageLocation || "ADMIN_DRIVE"
  };

  db.users.push(newUser);
  DatabaseService.save();

  res.status(201).json({
    success: true,
    token: newUser.id,
    user: enrichUserSubscription(newUser),
    message: `Đăng ký thành công! Bạn có ${TRIAL_DAYS} ngày dùng thử miễn phí toàn bộ tính năng.`
  });
});

// POST /api/auth/storage-settings
router.put("/storage-settings", (req: any, res) => {
  const { storageLocation } = req.body;
  const db = DatabaseService.get();
  const user = req.user || db.users[0];

  if (user) {
    user.storageLocation = storageLocation === "PERSONAL_DRIVE" ? "PERSONAL_DRIVE" : "ADMIN_DRIVE";
    DatabaseService.save();
    return res.json({
      success: true,
      message: `Đã chuyển đổi lưu trữ sang: ${user.storageLocation === "ADMIN_DRIVE" ? `Google Drive Trung tâm (${MASTER_ADMIN_EMAIL})` : `Google Drive Cá nhân (${user.email})`}`,
      storageLocation: user.storageLocation
    });
  }
  res.status(404).json({ error: "User not found" });
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
    trialDays: TRIAL_DAYS,
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
