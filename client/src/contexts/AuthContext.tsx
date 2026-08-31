import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types/index.js";
import { api } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  loading: boolean;
  trialDaysLeft: number;
  isExpired: boolean;
  login: (email: string) => Promise<void>;
  register: (data: { fullName: string; email: string; schoolName?: string; subject?: string }) => Promise<void>;
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
    if (u.isActivated || u.subscriptionStatus === "ACTIVE") return { days: 365, expired: false };

    const now = Date.now();
    const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : new Date(u.createdAt).getTime() + 3 * 86400000;
    const diffMs = trialEnds - now;
    const daysLeft = Math.ceil(diffMs / 86400000);

    return {
      days: Math.max(0, daysLeft),
      expired: daysLeft <= 0
    };
  };

  const refreshUser = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
      const meRes = await api.getMe();
      setUser(meRes.user || users[3]);
    } catch (err) {
      console.error("Auth refresh error:", err);
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

  const login = async (email: string) => {
    const res = await api.login(email);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
  };

  const register = async (data: { fullName: string; email: string; schoolName?: string; subject?: string }) => {
    const res = await api.register(data);
    localStorage.setItem("edutest_token", res.token);
    setUser(res.user);
    await refreshUser();
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
    if (allUsers.length > 0) {
      setUser(allUsers[3]); // Switch back to teacher for demo
    }
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
        register,
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
