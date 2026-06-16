import { useSyncExternalStore } from "react";
import type { Profile } from "@/data/profile";

const KEY = "apronhanger.candidate.profile.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Cached raw JSON + parsed profile so useSyncExternalStore gets a stable snapshot. */
let cachedRaw: string | null | undefined;
let cachedProfile: Profile | null = null;

function readFromStorage(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedProfile;
    cachedRaw = raw;
    cachedProfile = raw ? (JSON.parse(raw) as Profile) : null;
    return cachedProfile;
  } catch {
    cachedRaw = null;
    cachedProfile = null;
    return null;
  }
}

function getSnapshot(): Profile | null {
  return readFromStorage();
}

function emit() {
  for (const l of listeners) l();
}

export function getProfile(): Profile | null {
  return getSnapshot();
}

export function setProfile(p: Profile | null) {
  if (typeof window === "undefined") return;

  try {
    const nextRaw = p ? JSON.stringify(p) : null;
    if (nextRaw === cachedRaw) return;

    if (p) window.localStorage.setItem(KEY, nextRaw!);
    else window.localStorage.removeItem(KEY);

    cachedRaw = nextRaw;
    cachedProfile = p;
    emit();
  } catch {
    /* noop */
  }
}

/** Clears the profile from both localStorage and the in-memory cache.
 *  Must be called on logout to prevent a new user from seeing stale data. */
export function clearProfile() {
  if (typeof window !== "undefined") {
    try { window.localStorage.removeItem(KEY); } catch { /* noop */ }
  }
  cachedRaw = null;
  cachedProfile = null;
  emit();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProfile(): Profile | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function useHasCV(): boolean {
  const p = useProfile();
  return !!p && p.completeness > 0;
}
