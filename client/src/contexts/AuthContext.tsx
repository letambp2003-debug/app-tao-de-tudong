import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types/index.js";
import { api } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  loading: boolean;
  trialDaysLeft: number;
  isExpired: boolean;
  login: (credentials: string | { usernameOrEmail?: string; email?: string; password?: string }) => Promise<void>;
  googleAuth: (data: { email: string; fullName?: string; avatarUrl?: string; storageLocation?: string }) => Promise<void>;
  register: (data: { fullName: string; email: string; schoolName?: string; subject?: string; storageLocation?: string }) => Promise<void>;
  updateStorageLocation: (storageLocation: "ADMIN_DRIVE" | "PERSONAL_DRIVE") => Promise<void>;
  activate: (email: string, code?: string) => Promise<void>;
  switchUser: (userId: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateTrialDays = (u: User | null): { days: number; expired: boolean } => {
    if (!u) return { days: 0, expired: false };
    if (u.isActivated || u.subscriptionStatus === "ACTIVE" || u.role === "R01_SYSTEM_ADMIN") return { days: 365, expired: false };

    const now = Date.now();
    const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : new Date(u.createdAt).getTime() + 5 * 86400000;
    const diffMs = trialEnds - now;
    const daysLeft = Math.ceil(diffMs / 86400000);

    return {
      days: Math.max(0, daysLeft),
      expired: daysLeft <= 0
    };
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("edutest_token");
      if (!token) {
        setUser(null);
        return;
      }
      const users = await api.getUsers().catch(() => []);
      setAllUsers(users);
      const meRes = await api.getMe();
      setUser(meRes.user || null);
    } catch (err) {
      console.error("Auth refresh error:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (credentials: string | { usernameOrEmail?: string; email?: string; password?: string }) => {
    const res = await api.login(credentials);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
  };

  const googleAuth = async (data: { email: string; fullName?: string; avatarUrl?: string; storageLocation?: string }) => {
    const res = await api.googleAuth(data);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (data: { fullName: string; email: string; schoolName?: string; subject?: string; storageLocation?: string }) => {
    const res = await api.register(data);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
    await refreshUser();
  };

  const updateStorageLocation = async (storageLocation: "ADMIN_DRIVE" | "PERSONAL_DRIVE") => {
    const res = await api.updateStorageSettings(storageLocation);
    if (user) {
      setUser({ ...user, storageLocation: res.storageLocation as any });
    }
  };

  const activate = async (email: string, code?: string) => {
    const res = await api.activateSubscription(email, code);
    setUser(res.user);
    await refreshUser();
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      localStorage.setItem("edutest_token", target.id);
      setUser(target);
    }
  };

  const logout = () => {
    localStorage.removeItem("edutest_token");
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const { days: trialDaysLeft, expired: isExpired } = calculateTrialDays(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        loading,
        trialDaysLeft,
        isExpired,
        login,
        googleAuth,
        register,
        updateStorageLocation,
        activate,
        switchUser,
        logout,
        hasRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
