/**
 * Returns the API base URL.
 * - During SSR (Node.js server): must be an absolute URL so fetch() works.
 * - In the browser: empty string so requests are relative and go through the Vite proxy.
 */
export function apiBase(): string {
  if (typeof window === "undefined") {
    // Server-side rendering — use the full backend URL
    return "http://127.0.0.1:3000";
  }
  // Client-side — relative URL goes through the Vite dev proxy
  return "";
}
