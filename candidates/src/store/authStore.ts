// Simple localStorage-backed auth store (no Zustand dep needed)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  hospitalId: string | null;
  candidateId: string | null;
}

const TOKEN_KEY = "apronhanger.candidate.token";
const USER_KEY = "apronhanger.candidate.user";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

let cachedRawUser: string | null = null;
let cachedParsedUser: AuthUser | null = null;

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw === cachedRawUser) return cachedParsedUser;
    
    cachedRawUser = raw;
    cachedParsedUser = raw ? JSON.parse(raw) : null;
    return cachedParsedUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function login(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}

export function logout() {
  // Clear auth keys
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Wipe the profile cache so a new login never sees stale data
  localStorage.removeItem("apronhanger.candidate.profile.v1");
  notify();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// React hook
import { useSyncExternalStore } from "react";

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken, () => null);
  const user = useSyncExternalStore(subscribe, getUser, () => null);
  return { token, user, isAuthenticated: !!token };
}

// Auth header helper for fetch calls
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
