import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
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

  // New state to track which input field is currently focused
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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
      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>

      <div className="px-6 pt-8">
        <div className="flex items-center justify-center gap-3 opacity-0 animate-fade-up hover:scale-105 transition-transform duration-300 cursor-default">
          {/* നിങ്ങൾ നൽകിയ ലിങ്കിൽ നിന്നുള്ള ലോഗോ (Circle ആക്കിയത്) */}
          <img
            src="https://i.supaimg.com/a0e6e974-7179-457d-b73d-5f2febbbc7db/d0909bd0-b695-4eba-a668-8db9774fe0d7.jpg"
            alt="LM Coin Logo"
            className="h-11 w-11 rounded-full object-cover"
          />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>

        <div className="opacity-0 animate-fade-up delay-100">
          <h1 className="mt-10 text-3xl font-extrabold tracking-tight">Account Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your email and password.</p>
        </div>

        {/* Animated Robot Component added here */}
        <AnimatedRobot focusedField={focusedField} showPassword={show} />

        <form onSubmit={onSubmit} className="mt-4 space-y-5 opacity-0 animate-fade-up delay-200">
          <div className="group">
            <label className="text-sm font-medium transition-colors group-focus-within:text-[color:var(--gold)]">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl bg-secondary px-4 py-3 outline-none text-sm placeholder:text-muted-foreground transition-all duration-300 focus:ring-2 focus:ring-[color:var(--gold)]/50 hover:bg-secondary/80"
            />
          </div>

          <div className="group">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium transition-colors group-focus-within:text-[color:var(--gold)]">
                Password
              </label>
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
                className="text-sm font-semibold text-[color:var(--gold)] hover:underline hover:scale-105 transition-all"
              >
                Forgot Password?
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-[color:var(--gold)]/50 hover:bg-secondary/80">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Password"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-muted-foreground hover:text-[color:var(--gold)] hover:scale-110 transition-all duration-200"
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] active:scale-95"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Log In
          </button>

          <div className="flex items-center gap-3 opacity-0 animate-fade-up delay-300">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-xl btn-soft py-3.5 text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary active:scale-95 opacity-0 animate-fade-up delay-300"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p className="text-sm pt-2 text-center opacity-0 animate-fade-up delay-300">
            No Account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[color:var(--gold)] hover:underline hover:scale-105 inline-block transition-transform"
            >
              Register Now »
            </Link>
          </p>
        </form>
      </div>
    </Shell>
  );
}

// Interactive Animated Robot Component
function AnimatedRobot({
  focusedField,
  showPassword,
}: {
  focusedField: "email" | "password" | null;
  showPassword: boolean;
}) {
  const isEmail = focusedField === "email";
  const isPassword = focusedField === "password";

  return (
    <div className="flex justify-center mt-6 mb-2 opacity-0 animate-fade-up delay-100">
      <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
        {/* Antenna */}
        <line x1="60" y1="20" x2="60" y2="5" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
        <circle cx="60" cy="5" r="4" fill="var(--gold, #FFD700)" />

        {/* Head */}
        <rect
          x="25"
          y="20"
          width="70"
          height="60"
          rx="15"
          fill="var(--secondary, #1E293B)"
          stroke="var(--border, #334155)"
          strokeWidth="3"
        />

        {/* Face Screen */}
        <rect x="35" y="35" width="50" height="30" rx="8" fill="var(--background, #0F172A)" />

        {/* Eyes */}
        <g
          className="transition-all duration-300 ease-out"
          style={{ transform: isEmail ? "translateY(6px) scale(0.9)" : "translateY(0)" }}
        >
          {/* Left Eye */}
          {isPassword && !showPassword ? (
            <path
              d="M 42 48 Q 47 44 52 48"
              stroke="var(--gold, #FFD700)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <circle cx="47" cy="50" r="4.5" fill="var(--gold, #FFD700)" />
          )}
          {/* Right Eye */}
          {isPassword && !showPassword ? (
            <path
              d="M 68 48 Q 73 44 78 48"
              stroke="var(--gold, #FFD700)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <circle cx="73" cy="50" r="4.5" fill="var(--gold, #FFD700)" />
          )}
        </g>

        {/* Body */}
        <path
          d="M 40 85 L 80 85 L 90 120 L 30 120 Z"
          fill="var(--secondary, #1E293B)"
          stroke="var(--border, #334155)"
          strokeWidth="3"
        />

        {/* Arms / Hands */}
        {/* Left Arm */}
        <g
          className="transition-all duration-300 ease-in-out origin-bottom"
          style={{
            transform: isPassword ? "translate(22px, -45px) rotate(15deg)" : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          <rect x="15" y="85" width="16" height="26" rx="8" fill="var(--gold, #FFD700)" />
        </g>

        {/* Right Arm */}
        <g
          className="transition-all duration-300 ease-in-out origin-bottom"
          style={{
            transform: isPassword
              ? showPassword
                ? "translate(-22px, -20px) rotate(-15deg)"
                : "translate(-22px, -45px) rotate(-15deg)"
              : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          <rect x="89" y="85" width="16" height="26" rx="8" fill="var(--gold, #FFD700)" />
        </g>
      </svg>
    </div>
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
