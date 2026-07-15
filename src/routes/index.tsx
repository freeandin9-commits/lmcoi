import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [{ title: "LM Coin — Sign Up" }, { name: "description", content: "Create a new LM Coin account." }],
  }),
});

function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // State to track which input field is currently focused for the animation
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/home" });
    });
  }, [nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Changed to signUp for registration
    const { error, data } = await supabase.auth.signUp({ email: email.trim(), password: pw });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user && !data.session) {
      toast.success("Registration successful! Please check your email to verify your account.");
    } else {
      toast.success("Account created successfully!");
      nav({ to: "/home" });
    }
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message ?? "Google sign-up failed");
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
          <img
            src="https://i.supaimg.com/a0e6e974-7179-457d-b73d-5f2febbbc7db/d0909bd0-b695-4eba-a668-8db9774fe0d7.jpg"
            alt="LM Coin Logo"
            className="h-11 w-11 rounded-full object-cover"
          />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>

        <div className="opacity-0 animate-fade-up delay-100">
          <h1 className="mt-10 text-3xl font-extrabold tracking-tight">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign up with your email and password.</p>
        </div>

        {/* Animated Human Component */}
        <AnimatedHuman focusedField={focusedField} showPassword={show} />

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
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-[color:var(--gold)]/50 hover:bg-secondary/80">
              <input
                type={show ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a password"
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
            {busy && <Loader2 size={16} className="animate-spin" />} Sign Up
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
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-[color:var(--gold)] hover:underline hover:scale-105 inline-block transition-transform"
            >
              Log In Here »
            </Link>
          </p>
        </form>
      </div>
    </Shell>
  );
}

// Interactive Animated Human Component
function AnimatedHuman({
  focusedField,
  showPassword,
}: {
  focusedField: "email" | "password" | null;
  showPassword: boolean;
}) {
  const isEmail = focusedField === "email";
  const isPassword = focusedField === "password";

  const [idleState, setIdleState] = useState<"standing" | "driving" | "trading">("standing");

  useEffect(() => {
    if (focusedField !== null) {
      setIdleState("standing");
      return;
    }

    const timer1 = setTimeout(() => {
      setIdleState("driving");
    }, 3000);

    const timer2 = setTimeout(() => {
      setIdleState("trading");
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [focusedField]);

  return (
    <div className="flex justify-center mt-6 mb-2 opacity-0 animate-fade-up delay-100 w-full overflow-hidden relative">
      <style>{`
        @keyframes driveAcross {
          0% { transform: translateX(-200px); }
          25% { transform: translateX(0px); }
          65% { transform: translateX(0px); }
          100% { transform: translateX(200px); }
        }
        @keyframes floatCoin {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 1; transform: translateY(-15px) scale(1.2); }
          80% { opacity: 1; transform: translateY(-40px) scale(1); }
          100% { opacity: 0; transform: translateY(-55px) scale(0.5); }
        }
        @keyframes typeAnimLeft {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(15deg); }
        }
        @keyframes typeAnimRight {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-15deg); }
        }
        @keyframes scrollRoadAnim {
          0% { stroke-dashoffset: 100; }
          25% { stroke-dashoffset: 50; }
          65% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scrollTreeAnim {
          0% { transform: translateX(60px); }
          25% { transform: translateX(0px); }
          65% { transform: translateX(0px); }
          100% { transform: translateX(-60px); }
        }
      `}</style>

      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        className="overflow-visible mx-auto"
        style={{ maxWidth: "100%" }}
      >
        <g style={{ opacity: idleState === "trading" ? 1 : 0, transition: "opacity 1s ease-in-out" }}>
          <rect x="10" y="10" width="180" height="110" rx="8" fill="var(--secondary, #1E293B)" opacity="0.4" />
          <rect
            x="130"
            y="25"
            width="40"
            height="40"
            rx="4"
            fill="#0F172A"
            stroke="var(--border, #334155)"
            strokeWidth="2"
          />
          <path d="M 150 25 L 150 65 M 130 45 L 170 45" stroke="var(--border, #334155)" strokeWidth="2" />
          <rect
            x="30"
            y="25"
            width="50"
            height="30"
            rx="2"
            fill="#0F172A"
            stroke="var(--border, #334155)"
            strokeWidth="1"
          />
          <polyline
            points="35,50 45,40 55,45 75,30"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g style={{ opacity: idleState === "driving" ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}>
          <g style={{ animation: idleState === "driving" ? "scrollTreeAnim 4s ease-in-out forwards" : "none" }}>
            <g transform="translate(20, 25)">
              <rect x="16" y="20" width="8" height="40" rx="2" fill="#78350F" />
              <circle cx="20" cy="5" r="20" fill="#15803D" />
              <circle cx="5" cy="18" r="15" fill="#16A34A" />
              <circle cx="35" cy="18" r="15" fill="#22C55E" />
            </g>
            <g transform="translate(140, 15) scale(0.8)">
              <rect x="16" y="20" width="8" height="50" rx="2" fill="#78350F" />
              <circle cx="20" cy="0" r="22" fill="#15803D" />
              <circle cx="2" cy="18" r="16" fill="#16A34A" />
              <circle cx="38" cy="18" r="16" fill="#22C55E" />
            </g>
          </g>

          <g>
            <rect x="-20" y="105" width="240" height="15" fill="#334155" />
            <line
              x1="-20"
              y1="112.5"
              x2="220"
              y2="112.5"
              stroke="#FACC15"
              strokeWidth="2"
              strokeDasharray="15 15"
              style={{ animation: idleState === "driving" ? "scrollRoadAnim 4s ease-in-out forwards" : "none" }}
            />
          </g>
        </g>

        <g
          style={{
            animation: idleState === "driving" ? "driveAcross 4s ease-in-out forwards" : "none",
            transformOrigin: "center",
          }}
        >
          <g
            className="transition-all duration-700 ease-in-out"
            style={{
              transform:
                idleState === "driving"
                  ? "translate(40px, 25px) scale(0.65)"
                  : idleState === "trading"
                    ? "translate(0px, 15px) scale(0.7)"
                    : "translate(40px, 0px) scale(1)",
              transformOrigin: "60px 60px",
            }}
          >
            <rect x="52" y="65" width="16" height="15" fill="#FFC8A2" />
            <path d="M 35 85 Q 60 70 85 85 L 95 120 L 25 120 Z" fill="#3B82F6" />
            <path d="M 52 70 L 60 82 L 68 70 Z" fill="#2563EB" />
            <circle cx="36" cy="50" r="6" fill="#FFC8A2" />
            <circle cx="84" cy="50" r="6" fill="#FFC8A2" />
            <circle cx="60" cy="50" r="22" fill="#FFC8A2" />
            <path d="M 38 50 C 35 20 85 20 82 50 C 75 40 45 40 38 50 Z" fill="#1E293B" />

            <g
              className="transition-all duration-300 ease-out"
              style={{
                transform: isEmail
                  ? "translateY(5px) scale(0.9)"
                  : idleState === "trading"
                    ? "translate(8px, 4px) scale(0.9)"
                    : "translateY(0)",
              }}
            >
              {isPassword && !showPassword ? (
                <path d="M 43 50 Q 50 45 57 50" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                <circle cx="50" cy="50" r="3.5" fill="#1E293B" />
              )}
              {isPassword && !showPassword ? (
                <path d="M 63 50 Q 70 45 77 50" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                <circle cx="70" cy="50" r="3.5" fill="#1E293B" />
              )}
              <path d="M 52 60 Q 60 66 68 60" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            <g
              className="transition-all duration-300 ease-in-out origin-bottom"
              style={{
                transform: isPassword
                  ? "translate(22px, -45px) rotate(25deg)"
                  : idleState === "trading"
                    ? "translate(15px, -20px) rotate(35deg)"
                    : "translate(0px, 0px) rotate(0deg)",
              }}
            >
              <rect
                x="15"
                y="85"
                width="16"
                height="26"
                rx="8"
                fill="#FFC8A2"
                style={{ animation: idleState === "trading" ? "typeAnimLeft 0.2s infinite alternate" : "none" }}
              />
              <rect x="15" y="85" width="16" height="14" rx="4" fill="#3B82F6" />
            </g>

            <g
              className="transition-all duration-300 ease-in-out origin-bottom"
              style={{
                transform: isPassword
                  ? showPassword
                    ? "translate(-22px, -20px) rotate(-15deg)"
                    : "translate(-22px, -45px) rotate(-25deg)"
                  : idleState === "trading"
                    ? "translate(-10px, -20px) rotate(-45deg)"
                    : "translate(0px, 0px) rotate(0deg)",
              }}
            >
              <rect
                x="89"
                y="85"
                width="16"
                height="26"
                rx="8"
                fill="#FFC8A2"
                style={{ animation: idleState === "trading" ? "typeAnimRight 0.25s infinite alternate" : "none" }}
              />
              <rect x="89" y="85" width="16" height="14" rx="4" fill="#3B82F6" />
            </g>
          </g>

          <g className="transition-opacity duration-300" style={{ opacity: idleState === "driving" ? 1 : 0 }}>
            <path
              d="M 30 75 L 170 75 L 180 110 L 20 110 Z"
              fill="var(--gold, #FFD700)"
              stroke="var(--border, #334155)"
              strokeWidth="3"
            />
            <circle cx="170" cy="90" r="6" fill="#FACC15" />
            <path d="M 175 90 L 195 85 L 195 95 Z" fill="#FACC15" opacity="0.5" />
            <circle cx="60" cy="110" r="14" fill="#1E293B" stroke="var(--border, #334155)" strokeWidth="3" />
            <circle cx="60" cy="110" r="6" fill="#94A3B8" />
            <circle cx="140" cy="110" r="14" fill="#1E293B" stroke="var(--border, #334155)" strokeWidth="3" />
            <circle cx="140" cy="110" r="6" fill="#94A3B8" />
          </g>
        </g>

        <g style={{ opacity: idleState === "trading" ? 1 : 0, transition: "opacity 1s ease-in-out 0.5s" }}>
          <rect
            x="70"
            y="105"
            width="110"
            height="15"
            rx="4"
            fill="#334155"
            stroke="var(--border, #334155)"
            strokeWidth="2"
          />

          <rect
            x="100"
            y="70"
            width="50"
            height="35"
            rx="4"
            fill="#94A3B8"
            stroke="var(--border, #334155)"
            strokeWidth="2"
          />
          <rect
            x="90"
            y="100"
            width="70"
            height="5"
            rx="2"
            fill="#CBD5E1"
            stroke="var(--border, #334155)"
            strokeWidth="1"
          />

          <rect x="105" y="75" width="40" height="25" rx="2" fill="#0F172A" />
          <polyline
            points="108,95 118,85 125,90 140,78"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="140" cy="78" r="2" fill="#22C55E" />

          <g style={{ animation: idleState === "trading" ? "floatCoin 2s infinite linear" : "none", opacity: 0 }}>
            <circle cx="125" cy="65" r="10" fill="#FFD700" stroke="#B45309" strokeWidth="1" />
            <text x="125" y="68.5" fontSize="8" fill="#B45309" textAnchor="middle" fontWeight="bold">
              LMC
            </text>
          </g>
          <g style={{ animation: idleState === "trading" ? "floatCoin 2.5s infinite linear 1s" : "none", opacity: 0 }}>
            <circle cx="105" cy="55" r="8" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <text x="105" y="58" fontSize="10" fill="#064E3B" textAnchor="middle" fontWeight="bold">
              $
            </text>
          </g>
          <g style={{ animation: idleState === "trading" ? "floatCoin 3s infinite linear 0.5s" : "none", opacity: 0 }}>
            <circle cx="145" cy="60" r="8" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <text x="145" y="63" fontSize="10" fill="#064E3B" textAnchor="middle" fontWeight="bold">
              $
            </text>
          </g>
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
