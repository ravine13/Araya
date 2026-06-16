import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/store/authStore";

/** Redirect guests to sign-in; optional return path after login. */
export function requireCandidateAuth(returnPath?: string) {
  if (typeof window === "undefined") return;
  if (isAuthenticated()) return;
  const redirectTo =
    returnPath ?? `${window.location.pathname}${window.location.search}`;
  throw redirect({
    to: "/auth",
    search: { redirect: redirectTo },
  });
}
