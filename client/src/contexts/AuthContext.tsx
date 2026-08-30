import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types/index.js";
import { api } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  loading: boolean;
  login: (email: string) => Promise<void>;
  switchUser: (userId: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const users = await api.getUsers();
        setAllUsers(users);
        const meRes = await api.getMe();
        setUser(meRes.user || users[3]); // Default Teacher
      } catch (err) {
        console.error("Auth init error:", err);
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
      setUser(allUsers[3]); // Switch back to teacher for easy demo
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, allUsers, loading, login, switchUser, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
