import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, LMCMark } from "@/components/lmc/Shell";
import { Globe, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [
      { title: "LM Coin — Register" },
      { name: "description", content: "Create a new LM Coin account." },
    ],
  }),
});

function Register() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [invite, setInvite] = useState("");
  const [show, setShow] = useState(false);

  return (
    <Shell hideTabs>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <LMCMark size={40} />
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Globe size={16} /> English
          </button>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight">Register</h1>

        <div className="mt-6 space-y-4">
          <Field label="Phone Number">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-6 w-6 rounded-full overflow-hidden" style={{ background: "linear-gradient(180deg,#ff9933 33%,#fff 33% 66%,#138808 66%)" }} aria-hidden />
              <span className="font-medium">+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Enter phone number"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </Field>

          <Field label="OTP">
            <div className="flex items-center gap-2">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="6-digit code"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button className="text-sm font-semibold text-[color:var(--gold)]">Send OTP</button>
            </div>
          </Field>

          <Field label="Password">
            <div className="flex items-center gap-2">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Set login password"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button onClick={() => setShow((s) => !s)} className="text-muted-foreground" aria-label="Toggle">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password">
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Re-enter password"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="Invitation Code (optional)">
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value.toUpperCase())}
              placeholder="e.g. LM-XZ4Q9"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </Field>

          <button
            onClick={() => nav({ to: "/home" })}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold"
          >
            Register
          </button>

          <p className="text-sm text-center pt-2">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[color:var(--gold)]">
              Log In »
            </Link>
          </p>
        </div>
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
