import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, LMCMark } from "@/components/lmc/Shell";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Login,
  head: () => ({
    meta: [{ title: "LM Coin — Sign In" }, { name: "description", content: "Sign in to your LM Coin account." }],
  }),
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/home" });
    });
  }, [nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    nav({ to: "/home" });
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
    if (res.redirected) return;
    nav({ to: "/home" });
  };

  return (
    <Shell hideTabs>
      <div className="px-6 pt-8">
        <div className="flex items-center justify-center gap-3">
          <LMCMark size={44} />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>

        <h1 className="mt-10 text-3xl font-extrabold tracking-tight">Account Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your email and password.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl bg-secondary px-4 py-3 outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={async () => {
                  if (!email) return toast.error("Enter your email first");
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent");
                }}
                className="text-sm font-semibold text-[color:var(--gold)]"
              >
                Forgot Password?
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-muted-foreground"
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Log In
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-xl btn-soft py-3.5 text-base font-semibold flex items-center justify-center gap-2"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p className="text-sm pt-2">
            No Account?{" "}
            <Link to="/register" className="font-semibold text-[color:var(--gold)]">
              Register Now »
            </Link>
          </p>
        </form>
      </div>
    </Shell>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
