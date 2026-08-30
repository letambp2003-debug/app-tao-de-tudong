import { Router } from "express";
import { DatabaseService } from "../services/database/mockDb.js";

const router = Router();

// GET /api/auth/me
router.get("/me", (req: any, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  const db = DatabaseService.get();
  res.json({ user: db.users[3] }); // Default teacher
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email } = req.body;
  const db = DatabaseService.get();
  const user = db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase()) || db.users[3];
  res.json({
    token: user.id,
    user
  });
});

// GET /api/auth/users (for switching roles in dev)
router.get("/users", (req, res) => {
  const db = DatabaseService.get();
  res.json(db.users);
});

export default router;
