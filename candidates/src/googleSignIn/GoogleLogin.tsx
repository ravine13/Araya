import { useGoogleLogin } from "@react-oauth/google";
import { apiBase } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { clearProfile } from "@/store/profileStore";
import { resetHydration } from "@/lib/hydrate";
import { login as saveAuth } from "@/store/authStore";
import { GoogleOAuthProvider } from "@react-oauth/google";


export function GoogleProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export default function GoogleLogin() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${apiBase()}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.error || "Google login failed");
          return;
        }

        // clear previous session data
        clearProfile();
        resetHydration();

        // store auth
        saveAuth(data.token, data.user);

        toast.success("Welcome!");

        navigate({ to: "/" });
      } catch (err) {
        toast.error("Google login failed. Try again.");
      }
    },

    onError: () => {
      toast.error("Google login cancelled or failed");
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="relative flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-white text-sm font-medium hover:bg-muted transition"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}