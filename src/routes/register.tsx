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
    meta: [
      { title: "LM Coin — Create account" },
      { name: "description", content: "Create your LM Coin account." },
    ],
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

function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [invite, setInvite] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

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
      <div className="px-6 pt-8">
        <div className="flex items-center gap-3">
          <LMCMark size={44} />
          <span className="text-xl font-extrabold tracking-tight">LM Coin</span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">Create account</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Full name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Password">
            <div className="flex items-center gap-2 w-full">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                minLength={8}
                required
                placeholder="At least 8 characters"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground" aria-label="Toggle">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm password">
            <input
              type={show ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              required
              placeholder="Re-enter password"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Invitation code (optional)">
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value.toUpperCase())}
              placeholder="e.g. LM-XZ4Q9"
              maxLength={20}
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <button
            disabled={busy}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} Register
          </button>

          <p className="text-sm text-center pt-2">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[color:var(--gold)]">
              Log In »
            </Link>
          </p>
        </form>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">{children}</div>
    </div>
  );
}
