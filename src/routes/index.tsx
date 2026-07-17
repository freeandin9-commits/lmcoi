import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { Captcha, type CaptchaHandle } from "@/components/lmc/Captcha";
import { Eye, EyeOff, Loader2, ShieldCheck, Users, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";
import { checkLock, recordFailure, clearFailures, formatRemaining, GENERIC_LOGIN_ERROR } from "@/lib/auth-security";
import logoAsset from "@/assets/lm-coin-logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Login,

  head: () => ({
    meta: [{ title: "LM Coin — Sign In" }, { name: "description", content: "Sign in to your LM Coin account." }],
  }),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password").max(128),
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // State for Email/Password Captcha
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef<CaptchaHandle>(null);

  // New State for Google Login Captcha
  const [googleCaptchaInput, setGoogleCaptchaInput] = useState("");
  const googleCaptchaRef = useRef<CaptchaHandle>(null);

  // New state to display inline errors (Email/Password wrong)
  const [loginError, setLoginError] = useState<string | null>(null);

  // New state to track which input field is currently focused
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  // Mock states for Users Statistics
  const [onlineUsers, setOnlineUsers] = useState(1243);
  const [registeredUsers] = useState(45892);

  // Effect to simulate live online users fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 7) - 3); // Fluctuates between -3 and +3
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/home" });
    });
  }, [nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Clear previous errors on new submission

    const parsed = loginSchema.safeParse({ email, password: pw });
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message ?? "Invalid input";
      toast.error(errorMsg);
      setLoginError(errorMsg);
      return;
    }

    const lock = checkLock("login", parsed.data.email);
    if (lock.locked) {
      const lockMsg = `Too many attempts. Try again in ${formatRemaining(lock.remainingMs)}.`;
      toast.error(lockMsg);
      setLoginError(lockMsg);
      return;
    }

    if (!captchaRef.current?.verify(captchaInput)) {
      const captchaMsg = "Incorrect security code";
      toast.error(captchaMsg);
      setLoginError(captchaMsg);
      captchaRef.current?.refresh();
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);

    if (error) {
      const res = recordFailure("login", parsed.data.email);
      captchaRef.current?.refresh();
      setPw("");

      // Set the display error explicitly for wrong email/password
      setLoginError("Invalid Email or Password.");

      if (res.locked) {
        toast.error("Account temporarily locked. Try again in 15 minutes.");
      } else {
        toast.error(`${GENERIC_LOGIN_ERROR}${res.attemptsLeft <= 2 ? ` · ${res.attemptsLeft} attempts left` : ""}`);
      }
      return;
    }
    clearFailures("login", parsed.data.email);
    nav({ to: "/home" });
  };

  const onGoogle = async () => {
    setLoginError(null);

    // Check separate Google Captcha
    if (!googleCaptchaRef.current?.verify(googleCaptchaInput)) {
      const captchaMsg = "Complete the Google security check first";
      toast.error(captchaMsg);
      setLoginError(captchaMsg);
      googleCaptchaRef.current?.refresh();
      return;
    }

    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) {
      const errMsg = res.error.message ?? "Google sign-in failed";
      toast.error(errMsg);
      setLoginError(errMsg);
    }
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

        /* New Glassmorphism Background & Floating Animations */
        @keyframes blobFloat1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blobFloat2 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(1.2); }
          66% { transform: translate(20px, -20px) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes glassFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glassShimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        
        /* New Animations for LM Coins during Login */
        @keyframes orbitRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes coinFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-orbit {
          animation: orbitRotate 3s linear infinite;
        }
        .animate-flip-coin {
          animation: coinFlip 1s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .animate-flip-coin-delay-1 { animation-delay: 0.2s; }
        .animate-flip-coin-delay-2 { animation-delay: 0.4s; }
        .animate-flip-coin-delay-3 { animation-delay: 0.6s; }

        .animate-blob1 { animation: blobFloat1 12s infinite alternate ease-in-out; }
        .animate-blob2 { animation: blobFloat2 15s infinite alternate ease-in-out; }
        .animate-blob3 { animation: blobFloat1 18s infinite alternate-reverse ease-in-out; }
        .animate-glass-float { animation: glassFloat 6s ease-in-out infinite; }
        .animate-glass-shimmer { animation: glassShimmer 4s infinite linear; }
      `}</style>

      {/* Main Wrapper with Background Gradients for Glassmorphism Context */}
      <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Fluid Animated Glowing Background Blobs to enhance Glassmorphism */}
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-[color:var(--gold)]/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob1" />
        <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob2" />
        <div
          className="absolute top-[50%] left-[50%] w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob3"
          style={{ transform: "translate(-50%, -50%)" }}
        />

        {/* Enhanced Light Glassmorphism Card Container */}
        <div className="relative z-10 w-full max-w-md px-8 py-10 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.25)] transition-all duration-500 animate-glass-float overflow-hidden">
          {/* Busy State Overlay: 4 LM Coins Flip & Orbit Animation */}
          {busy && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-3xl transition-opacity duration-300">
              <div className="relative w-24 h-24 animate-orbit flex items-center justify-center">
                {/* Top Coin */}
                <div className="absolute -top-4 animate-flip-coin">
                  <LMCoinIcon />
                </div>
                {/* Right Coin */}
                <div className="absolute -right-4 animate-flip-coin animate-flip-coin-delay-1">
                  <LMCoinIcon />
                </div>
                {/* Bottom Coin */}
                <div className="absolute -bottom-4 animate-flip-coin animate-flip-coin-delay-2">
                  <LMCoinIcon />
                </div>
                {/* Left Coin */}
                <div className="absolute -left-4 animate-flip-coin animate-flip-coin-delay-3">
                  <LMCoinIcon />
                </div>
              </div>
              <span className="mt-10 text-sm font-extrabold text-gray-900 drop-shadow-sm animate-pulse tracking-wide">
                Authenticating...
              </span>
            </div>
          )}

          {/* Glass Shimmer Effect */}
          <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glass-shimmer pointer-events-none" />

          <div className="flex items-center justify-center gap-3 opacity-0 animate-fade-up hover:scale-105 transition-transform duration-300 cursor-default">
            <img
              src={logoAsset.url}
              alt="LM Coin Logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover shadow-md border border-white/60"
            />
            <span className="text-xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">LM Coin</span>
          </div>

          <div className="opacity-0 animate-fade-up delay-100 text-center">
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Account Login</h1>
            <p className="mt-1 text-sm text-gray-700">Sign in with your email and password.</p>
          </div>

          {/* Animated Human Component added here */}
          <AnimatedHuman focusedField={focusedField} showPassword={show} />

          <form onSubmit={onSubmit} className="mt-4 space-y-5 opacity-0 animate-fade-up delay-200">
            {/* INLINE ERROR DISPLAY */}
            {loginError && (
              <div className="p-3 text-sm font-semibold text-red-700 bg-red-100/80 backdrop-blur-md border border-red-300 rounded-xl animate-fade-up shadow-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-red-600" />
                {loginError}
              </div>
            )}

            {/* Enhanced Glass Email Input */}
            <div className="group">
              <label className="text-sm font-medium text-gray-800 transition-colors group-focus-within:text-yellow-600 drop-shadow-sm">
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
                className="mt-2 w-full rounded-xl bg-white/40 backdrop-blur-xl border border-white/60 px-4 py-3 outline-none text-sm text-gray-900 placeholder:text-gray-600 transition-all duration-300 focus:ring-2 focus:ring-[color:var(--gold)]/60 focus:bg-white/60 hover:bg-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]"
              />
            </div>

            {/* Enhanced Glass Password Input */}
            <div className="group">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-800 transition-colors group-focus-within:text-yellow-600 drop-shadow-sm">
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
                  className="text-sm font-bold text-yellow-600 hover:underline hover:scale-105 transition-all drop-shadow-sm"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/40 backdrop-blur-xl border border-white/60 px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-[color:var(--gold)]/60 focus-within:bg-white/60 hover:bg-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]">
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
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-gray-600 hover:text-yellow-600 hover:scale-110 transition-all duration-200"
                  aria-label="Toggle password"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Captcha Wrapper for Password Login Glass UI */}
            <div className="rounded-xl overflow-hidden backdrop-blur-xl bg-white/30 border border-white/50 p-1 shadow-sm">
              <Captcha ref={captchaRef} value={captchaInput} onChange={setCaptchaInput} />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold drop-shadow-sm">
              <ShieldCheck size={14} className="text-yellow-600" />
              <span>Protected by captcha, lockout & breach-password checks.</span>
            </div>

            <button
              disabled={busy}
              className="w-full rounded-xl btn-gold py-3.5 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(255,215,0,0.4)] shadow-[0_4px_15px_rgba(255,215,0,0.25)] active:scale-95 border border-[color:var(--gold)]/40 backdrop-blur-xl text-gray-900 overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 animate-glass-shimmer pointer-events-none" />
              {busy && <Loader2 size={16} className="animate-spin" />} Log In
            </button>

            <div className="flex items-center gap-3 opacity-0 animate-fade-up delay-300">
              <div className="h-px flex-1 bg-gray-400/40" />
              <span className="text-xs uppercase tracking-widest text-gray-600 font-extrabold drop-shadow-sm">Or</span>
              <div className="h-px flex-1 bg-gray-400/40" />
            </div>

            {/* Captcha Wrapper exclusively for Google Sign-in */}
            <div className="rounded-xl overflow-hidden backdrop-blur-xl bg-white/30 border border-white/50 p-1 shadow-sm opacity-0 animate-fade-up delay-300">
              <Captcha ref={googleCaptchaRef} value={googleCaptchaInput} onChange={setGoogleCaptchaInput} />
            </div>

            {/* Enhanced Glass Google Button */}
            <button
              type="button"
              onClick={onGoogle}
              className="w-full rounded-xl bg-white/40 backdrop-blur-xl border border-white/70 py-3.5 text-base font-bold text-gray-900 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:bg-white/60 hover:shadow-[0_8px_25px_rgba(255,255,255,0.5)] active:scale-95 opacity-0 animate-fade-up delay-300 shadow-md"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <p className="text-sm pt-2 text-center text-gray-700 opacity-0 animate-fade-up delay-300 font-medium">
              No Account?{" "}
              <Link
                to="/register"
                className="font-bold text-yellow-600 hover:underline hover:scale-105 inline-block transition-transform drop-shadow-sm"
              >
                Register Now »
              </Link>
            </p>
          </form>

          {/* User Stats Mock Data Section */}
          <div className="mt-7 flex justify-between items-center px-4 py-4 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-inner opacity-0 animate-fade-up delay-300">
            <div className="flex flex-col items-center gap-1 w-1/2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wider drop-shadow-sm">
                <Activity size={14} className="animate-pulse" />
                <span>Online Users</span>
              </div>
              <span className="text-lg font-extrabold text-gray-900 drop-shadow-sm">
                {onlineUsers.toLocaleString()}
              </span>
            </div>

            <div className="w-px h-10 bg-gray-400/40" />

            <div className="flex flex-col items-center gap-1 w-1/2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider drop-shadow-sm">
                <Users size={14} />
                <span>Registered</span>
              </div>
              <span className="text-lg font-extrabold text-gray-900 drop-shadow-sm">
                {registeredUsers.toLocaleString()}
              </span>
            </div>
          </div>
          {/* End of User Stats */}
        </div>
      </div>
    </Shell>
  );
}

// Icon Component for the rotating LM Coins
function LMCoinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" className="drop-shadow-lg">
      <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#B45309" strokeWidth="5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#B45309" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
      <text
        x="50"
        y="54"
        fontSize="30"
        fill="#B45309"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        LM
      </text>
    </svg>
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

  // State to manage idle animations (driving home, trading)
  const [idleState, setIdleState] = useState<"standing" | "driving" | "trading">("standing");

  useEffect(() => {
    // If user interacts with inputs, reset to normal standing position
    if (focusedField !== null) {
      setIdleState("standing");
      return;
    }

    // Set up the idle animation sequence
    const timer1 = setTimeout(() => {
      setIdleState("driving");
    }, 3000); // After 3 seconds of being idle, start driving

    const timer2 = setTimeout(() => {
      setIdleState("trading");
    }, 7000); // 4 seconds of driving animation, then switch to trading at home

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [focusedField]);

  return (
    <div className="flex justify-center mt-6 mb-2 opacity-0 animate-fade-up delay-100 w-full overflow-hidden relative">
      {/* Keyframes for the idle animations */}
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
        {/* --- BACKGROUND (House - Visible when trading) --- */}
        <g style={{ opacity: idleState === "trading" ? 1 : 0, transition: "opacity 1s ease-in-out" }}>
          {/* Home Wall */}
          <rect x="10" y="10" width="180" height="110" rx="8" fill="rgba(0, 0, 0, 0.05)" />
          {/* Window */}
          <rect
            x="130"
            y="25"
            width="40"
            height="40"
            rx="4"
            fill="rgba(255, 255, 255, 0.6)"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth="2"
          />
          <path d="M 150 25 L 150 65 M 130 45 L 170 45" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="2" />
          {/* Chart on Wall */}
          <rect
            x="30"
            y="25"
            width="50"
            height="30"
            rx="2"
            fill="rgba(255, 255, 255, 0.6)"
            stroke="rgba(0, 0, 0, 0.1)"
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

        {/* --- NEW SCENERY (Road & Trees - Visible only when driving) --- */}
        <g style={{ opacity: idleState === "driving" ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}>
          {/* Trees Group */}
          <g style={{ animation: idleState === "driving" ? "scrollTreeAnim 4s ease-in-out forwards" : "none" }}>
            {/* Tree 1 */}
            <g transform="translate(20, 25)">
              <rect x="16" y="20" width="8" height="40" rx="2" fill="#78350F" />
              <circle cx="20" cy="5" r="20" fill="#15803D" />
              <circle cx="5" cy="18" r="15" fill="#16A34A" />
              <circle cx="35" cy="18" r="15" fill="#22C55E" />
            </g>
            {/* Tree 2 */}
            <g transform="translate(140, 15) scale(0.8)">
              <rect x="16" y="20" width="8" height="50" rx="2" fill="#78350F" />
              <circle cx="20" cy="0" r="22" fill="#15803D" />
              <circle cx="2" cy="18" r="16" fill="#16A34A" />
              <circle cx="38" cy="18" r="16" fill="#22C55E" />
            </g>
          </g>

          {/* Road Group */}
          <g>
            {/* Base Road */}
            <rect x="-20" y="105" width="240" height="15" fill="rgba(0, 0, 0, 0.1)" />
            {/* Moving Dashed Line on the road */}
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

        {/* --- MOVING GROUP (Human + Car) --- */}
        <g
          style={{
            animation: idleState === "driving" ? "driveAcross 4s ease-in-out forwards" : "none",
            transformOrigin: "center",
          }}
        >
          {/* --- THE REAL HUMAN --- */}
          <g
            className="transition-all duration-700 ease-in-out"
            style={{
              transform:
                idleState === "driving"
                  ? "translate(40px, 25px) scale(0.65)"
                  : idleState === "trading"
                    ? "translate(0px, 15px) scale(0.7)"
                    : "translate(40px, 0px) scale(1)", // Default standing centered
              transformOrigin: "60px 60px",
            }}
          >
            {/* Neck */}
            <rect x="52" y="65" width="16" height="15" fill="#FFC8A2" />

            {/* Body (Shirt) */}
            <path d="M 35 85 Q 60 70 85 85 L 95 120 L 25 120 Z" fill="#3B82F6" />
            {/* Shirt Collar */}
            <path d="M 52 70 L 60 82 L 68 70 Z" fill="#2563EB" />

            {/* Ears */}
            <circle cx="36" cy="50" r="6" fill="#FFC8A2" />
            <circle cx="84" cy="50" r="6" fill="#FFC8A2" />

            {/* Head */}
            <circle cx="60" cy="50" r="22" fill="#FFC8A2" />

            {/* Hair */}
            <path d="M 38 50 C 35 20 85 20 82 50 C 75 40 45 40 38 50 Z" fill="#1E293B" />

            {/* Face Features */}
            <g
              className="transition-all duration-300 ease-out"
              style={{
                transform: isEmail
                  ? "translateY(5px) scale(0.9)"
                  : idleState === "trading"
                    ? "translate(8px, 4px) scale(0.9)" /* Looking at laptop */
                    : "translateY(0)",
              }}
            >
              {/* Left Eye */}
              {isPassword && !showPassword ? (
                <path d="M 43 50 Q 50 45 57 50" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                <circle cx="50" cy="50" r="3.5" fill="#1E293B" />
              )}
              {/* Right Eye */}
              {isPassword && !showPassword ? (
                <path d="M 63 50 Q 70 45 77 50" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                <circle cx="70" cy="50" r="3.5" fill="#1E293B" />
              )}
              {/* Mouth */}
              <path d="M 52 60 Q 60 66 68 60" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* Arms / Hands */}
            {/* Left Arm */}
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
              {/* Hand/Arm Base */}
              <rect
                x="15"
                y="85"
                width="16"
                height="26"
                rx="8"
                fill="#FFC8A2"
                style={{ animation: idleState === "trading" ? "typeAnimLeft 0.2s infinite alternate" : "none" }}
              />
              {/* Sleeve */}
              <rect x="15" y="85" width="16" height="14" rx="4" fill="#3B82F6" />
            </g>

            {/* Right Arm */}
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
              {/* Hand/Arm Base */}
              <rect
                x="89"
                y="85"
                width="16"
                height="26"
                rx="8"
                fill="#FFC8A2"
                style={{ animation: idleState === "trading" ? "typeAnimRight 0.25s infinite alternate" : "none" }}
              />
              {/* Sleeve */}
              <rect x="89" y="85" width="16" height="14" rx="4" fill="#3B82F6" />
            </g>
          </g>

          {/* --- CAR FOREGROUND (Visible only when driving) --- */}
          <g className="transition-opacity duration-300" style={{ opacity: idleState === "driving" ? 1 : 0 }}>
            {/* Car Body Profile */}
            <path
              d="M 30 75 L 170 75 L 180 110 L 20 110 Z"
              fill="var(--gold, #FFD700)"
              stroke="rgba(0, 0, 0, 0.2)"
              strokeWidth="3"
            />
            {/* Car Headlight */}
            <circle cx="170" cy="90" r="6" fill="#FACC15" />
            <path d="M 175 90 L 195 85 L 195 95 Z" fill="#FACC15" opacity="0.5" />
            {/* Wheels */}
            <circle cx="60" cy="110" r="14" fill="#1E293B" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="3" />
            <circle cx="60" cy="110" r="6" fill="#94A3B8" />
            <circle cx="140" cy="110" r="14" fill="#1E293B" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="3" />
            <circle cx="140" cy="110" r="6" fill="#94A3B8" />
          </g>
        </g>

        {/* --- FOREGROUND (Desk & Laptop - Visible when trading) --- */}
        <g style={{ opacity: idleState === "trading" ? 1 : 0, transition: "opacity 1s ease-in-out 0.5s" }}>
          {/* Desk */}
          <rect
            x="70"
            y="105"
            width="110"
            height="15"
            rx="4"
            fill="rgba(0, 0, 0, 0.05)"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth="2"
          />

          {/* Laptop */}
          <rect
            x="100"
            y="70"
            width="50"
            height="35"
            rx="4"
            fill="#CBD5E1"
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth="2"
          />
          <rect
            x="90"
            y="100"
            width="70"
            height="5"
            rx="2"
            fill="#94A3B8"
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth="1"
          />

          {/* Laptop Screen Chart */}
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

          {/* Floating Coins (LM Coin Profit) */}
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
