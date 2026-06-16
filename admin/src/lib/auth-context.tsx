import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "apronhanger.admin.session";

// Demo credentials (frontend-only)
const ADMIN_EMAIL = "admin@apronhanger.in";
const ADMIN_PASSWORD = "admin123";

interface AdminUser {
  email: string;
  name: string;
  initials: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    if (e !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Invalid credentials. Use admin@apronhanger.in / admin123");
    }
    const u: AdminUser = { email: ADMIN_EMAIL, name: "Super Admin", initials: "SA" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
