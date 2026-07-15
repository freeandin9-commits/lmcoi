import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, LMCMark } from "@/components/lmc/Shell";
import { Globe, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Login,
  head: () => ({
    meta: [
      { title: "LM Coin — Account Login" },
      { name: "description", content: "Log in to your LM Coin account with your phone number and password." },
    ],
  }),
});

function Login() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
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

        <h1 className="mt-10 text-3xl font-extrabold tracking-tight">Account Login</h1>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
              <span className="grid place-items-center h-6 w-6 rounded-full text-xs overflow-hidden" style={{ background: "linear-gradient(180deg,#ff9933 33%,#fff 33% 66%,#138808 66%)" }} aria-hidden />
              <span className="font-medium">+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Please enter your phone number."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link to="/" className="text-sm font-semibold text-[color:var(--gold)]">Forgot Password ?</Link>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Please enter your login password."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button onClick={() => setShow((s) => !s)} className="text-muted-foreground" aria-label="Toggle password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => nav({ to: "/home" })}
            className="w-full rounded-xl btn-gold py-3.5 text-base font-semibold"
          >
            Log In
          </button>

          <button className="w-full rounded-xl btn-soft py-3.5 text-base font-semibold">
            Help Center
          </button>

          <p className="text-sm pt-2">
            No Account ?{" "}
            <Link to="/register" className="font-semibold text-[color:var(--gold)]">
              Register Now »
            </Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}
