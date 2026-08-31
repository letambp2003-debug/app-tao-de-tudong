import { Request, Response, NextFunction } from "express";
import { DatabaseService } from "../services/database/mockDb.js";
import { User, UserRole } from "../../shared/types/index.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const db = DatabaseService.get();

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const matchedUser = db.users.find(u => u.id === token);
    if (matchedUser) {
      req.user = matchedUser;
      return next();
    }
  }

  // If no valid auth header provided, leave req.user undefined
  req.user = undefined;
  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Yêu cầu đăng nhập để truy cập tài nguyên này.",
      requireLogin: true
    });
  }
  next();
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Bạn không có quyền thực hiện thao tác này.",
        requiredRoles: roles,
        userRole: req.user?.role
      });
    }
    next();
  };
};
