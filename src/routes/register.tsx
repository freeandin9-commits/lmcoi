import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, LMCMark } from "@/components/lmc/Shell";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [{ title: "LM Coin — Create account" }, { name: "description", content: "Create your LM Coin account." }],
  }),
});

const schema = z
  .object({
    email: z.string().trim().email().max(255),
    displayName: z.string().trim().min(2).max(60),
    password: z.string().min(8).max(100),
    confirm: z.string(),
    invite: z.string().trim().max(20).optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

// Animation Human (Robert) Component
const Robert = ({ focused, show }: { focused: string | null; show: boolean }) => {
  const isPassword = focused === "password" || focused === "confirm";
  const isEmail = focused === "email";
  const isName = focused === "displayName";
  const isInvite = focused === "invite";
  const coveringEyes = isPassword && !show;
  const peeking = isPassword && show; // If password is visible, he peeks!

  // Eye movement logic
  let eyeX = 0;
  let eyeY = 0;
  if (isEmail) {
    eyeX = 0;
    eyeY = 6; // Looking down at Email field
  } else if (isName) {
    eyeX = -2;
    eyeY = 2; // Looking slightly left/down
  } else if (isInvite) {
    eyeX = 0;
    eyeY = 10; // Looking further down
  } else if (peeking) {
    eyeX = 6;
    eyeY = -2; // Looking sideways when peeking
  }

  return (
    <div className="flex justify-center my-4 h-28 items-end relative overflow-visible transition-all duration-300">
      <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible drop-shadow-md">
        {/* Body */}
        <path d="M 20 100 C 20 65 80 65 80 100" fill="#374151" />

        {/* Head */}
        <rect x="25" y="20" width="50" height="50" rx="20" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />

        {/* Eyes (Animates based on focus) */}
        <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: "transform 0.3s ease-out" }}>
          {/* Eye Whites */}
          <ellipse cx="37" cy="40" rx="5" ry="7" fill="white" />
          <ellipse cx="63" cy="40" rx="5" ry="7" fill="white" />
          {/* Pupils */}
          <circle cx="37" cy="41" r="2.5" fill="#1f2937" />
          <circle cx="63" cy="41" r="2.5" fill="#1f2937" />
        </g>

        {/* Mouth */}
        <path
          d={coveringEyes ? "M 42 60 Q 50 55 58 60" : "M 42 58 Q 50 65 58 58"}
          stroke="#b45309"
          strokeWidth="2.5"
          fill="transparent"
          strokeLinecap="round"
          style={{ transition: "all 0.3s ease" }}
        />

        {/* Left Hand */}
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

        {/* Right Hand */}
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

  // State to track which field Robert should focus on
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, displayName, password: pw, confirm: pw2, invite });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
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
      toast.error(error.message);
      return;
    }
    toast.success("Account created");
    nav({ to: "/home" });
  };

  return (
    <Shell hideTabs>
      <div className="px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <LMCMark size={44} />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">Create account</h1>

        {/* The Animated Human: Robert */}
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
                minLength={8}
                required
                placeholder="At least 8 characters"
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

// Updated Field Component for minor ring animation when focused
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
