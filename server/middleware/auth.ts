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

  // Default to Teacher role for easy exploration if not passed
  req.user = db.users.find(u => u.role === "R04_TEACHER") || db.users[0];
  next();
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Bạn không có quyền thực hiện thao tác này",
        requiredRoles: roles,
        userRole: req.user?.role
      });
    }
    next();
  };
};
