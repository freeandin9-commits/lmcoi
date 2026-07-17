import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { Captcha, type CaptchaHandle } from "@/components/lmc/Captcha";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  strongPassword,
  passwordScore,
  checkLock,
  recordFailure,
  clearFailures,
  formatRemaining,
} from "@/lib/auth-security";
import logoAsset from "@/assets/lm-coin-logo.png.asset.json";


export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [{ title: "LM Coin — Create account" }, { name: "description", content: "Create your LM Coin account." }],
  }),
});

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
    displayName: z
      .string()
      .trim()
      .min(2, "Name too short")
      .max(60)
      .regex(/^[\p{L}\p{M} .'-]+$/u, "Name has invalid characters"),
    password: strongPassword,
    confirm: z.string(),
    invite: z.string().trim().toUpperCase().max(20).regex(/^[A-Z0-9-]*$/, "Invalid code").optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] })
  .refine((d) => !d.password.toLowerCase().includes(d.email.split("@")[0]?.toLowerCase() ?? "___"), {
    message: "Password must not contain your email",
    path: ["password"],
  });


// Animation Human (Robert) Component
const Robert = ({ focused, show }: { focused: string | null; show: boolean }) => {
  const isPassword = focused === "password" || focused === "confirm";
  const isEmail = focused === "email";
  const isName = focused === "displayName";
  const isInvite = focused === "invite";
  const coveringEyes = isPassword && !show;
  const peeking = isPassword && show;

  let eyeX = 0;
  let eyeY = 0;
  if (isEmail) {
    eyeX = 0;
    eyeY = 6;
  } else if (isName) {
    eyeX = -2;
    eyeY = 2;
  } else if (isInvite) {
    eyeX = 0;
    eyeY = 10;
  } else if (peeking) {
    eyeX = 6;
    eyeY = -2;
  }

  return (
    <div className="flex justify-center my-4 h-28 items-end relative overflow-visible transition-all duration-300">
      <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible drop-shadow-md">
        <path d="M 20 100 C 20 65 80 65 80 100" fill="#374151" />
        <rect x="25" y="20" width="50" height="50" rx="20" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: "transform 0.3s ease-out" }}>
          <ellipse cx="37" cy="40" rx="5" ry="7" fill="white" />
          <ellipse cx="63" cy="40" rx="5" ry="7" fill="white" />
          <circle cx="37" cy="41" r="2.5" fill="#1f2937" />
          <circle cx="63" cy="41" r="2.5" fill="#1f2937" />
        </g>
        <path
          d={coveringEyes ? "M 42 60 Q 50 55 58 60" : "M 42 58 Q 50 65 58 58"}
          stroke="#b45309"
          strokeWidth="2.5"
          fill="transparent"
          strokeLinecap="round"
          style={{ transition: "all 0.3s ease" }}
        />
        <g
          style={{
            transform: coveringEyes
              ? "translate(37px, 40px)"
              : peeking
                ? "translate(25px, 45px)"
                : "translate(15px, 85px)",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <circle cx="0" cy="0" r="11" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        </g>
        <g
          style={{
            transform: coveringEyes
              ? "translate(63px, 40px)"
              : peeking
                ? "translate(75px, 60px)"
                : "translate(85px, 85px)",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <circle cx="0" cy="0" r="11" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [invite, setInvite] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef<CaptchaHandle>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({ email, displayName, password: pw, confirm: pw2, invite });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const lock = checkLock("signup", parsed.data.email);
    if (lock.locked) {
      toast.error(`Too many attempts. Try again in ${formatRemaining(lock.remainingMs)}.`);
      return;
    }

    if (!captchaRef.current?.verify(captchaInput)) {
      toast.error("Incorrect security code");
      captchaRef.current?.refresh();
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName, invite: parsed.data.invite || null },
        emailRedirectTo: `${window.location.origin}/home`,
      },
    });
    setBusy(false);
    if (error) {
      recordFailure("signup", parsed.data.email);
      captchaRef.current?.refresh();
      // Supabase HIBP surfaces as a password error — pass through the message
      toast.error(error.message);
      return;
    }
    clearFailures("signup", parsed.data.email);
    toast.success("Account created — check your email to confirm.");
    nav({ to: "/home" });
  };

  const strength = passwordScore(pw);


  return (
    <Shell hideTabs>
      <div className="px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center gap-3">
          <img
            src={logoAsset.url}
            alt="LM Coin Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover shadow-md border border-white/60"
          />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Create account</h1>

        <Robert focused={focusedField} show={show} />

        <form onSubmit={onSubmit} className="mt-2 space-y-4">
          <Field label="Full name" focused={focusedField === "displayName"}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Your name"
              maxLength={60}
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Email" focused={focusedField === "email"}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Password" focused={focusedField === "password"}>
            <div className="flex items-center gap-2 w-full">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                minLength={12}
                maxLength={128}
                required
                placeholder="At least 12 chars, mixed case, digit & symbol"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-muted-foreground transition-transform hover:scale-110"
                aria-label="Toggle"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {pw && (
            <div className="-mt-2">
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 4) * 100}%`,
                    background:
                      strength.score >= 3
                        ? "var(--success)"
                        : strength.score === 2
                          ? "var(--gold)"
                          : "var(--danger)",
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Strength: {strength.label}</div>
            </div>
          )}


          <Field label="Confirm password" focused={focusedField === "confirm"}>
            <input
              type={show ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="Re-enter password"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Invitation code (optional)" focused={focusedField === "invite"}>
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value.toUpperCase())}
              onFocus={() => setFocusedField("invite")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. LM-XZ4Q9"
              maxLength={20}
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Captcha ref={captchaRef} value={captchaInput} onChange={setCaptchaInput} />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-[color:var(--gold)]" />
            <span>Captcha, lockout & leaked-password protection are active.</span>
          </div>





          <button
            disabled={busy}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-transform active:scale-95"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Register
          </button>

          <p className="text-sm text-center pt-2">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[color:var(--gold)] hover:underline">
              Log In »
            </Link>
          </p>
        </form>
      </div>
    </Shell>
  );
}

function Field({ label, focused, children }: { label: string; focused?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div
        className={`mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 transition-shadow duration-300 ${focused ? "ring-2 ring-[color:var(--gold)] shadow-md" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
