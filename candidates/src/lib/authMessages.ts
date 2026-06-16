export type PortalKind = "candidate" | "recruiter";

export function rolePortalMismatchMessage(
  accountRole: string | undefined,
  portal: PortalKind,
): string | null {
  if (!accountRole) return null;
  if (portal === "candidate" && accountRole === "RECRUITER") {
    return "This email is registered as a recruiter account. Please sign in on the Recruiter Portal instead.";
  }
  if (portal === "recruiter" && accountRole === "CANDIDATE") {
    return "This email is registered as a candidate account. Please sign in on the Candidate Portal instead.";
  }
  return null;
}

export function loginErrorMessage(status: number, bodyError?: string): string {
  if (status === 401) return "Invalid email or password. Please try again.";
  if (status === 400) return bodyError || "Please check your email and password.";
  if (status === 409) return bodyError || "This email is already registered.";
  if (status >= 500) return "Server error. Please try again in a moment.";
  return bodyError || "Something went wrong. Please try again.";
}
