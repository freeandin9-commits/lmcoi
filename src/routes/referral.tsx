import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/lmc-api";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/referral")({
  component: Referral,
  head: () => ({
    meta: [
      { title: "Referral · LM Coin" },
      { name: "description", content: "Invite friends to LM Coin and earn rewards." },
    ],
  }),
});

function Referral() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { profile } = useProfile();
  const code = profile?.referral_code ?? "";
  const link = typeof window !== "undefined" && code ? `${window.location.origin}/register?ref=${code}` : "";
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = async (v: string, k: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(k);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Join LM Coin", text: `Sign up with my code ${code}`, url: link });
      } catch {}
    } else {
      copy(link, "link");
    }
  };

  return (
    <Shell>
      <AppHeader title="Referral" />
      <div className="px-4 pt-4 space-y-4">
        {/* Glassmorphism Code Card (Gold Tinted Glass) */}
        <div className="rounded-2xl p-5 relative overflow-hidden bg-yellow-500/10 dark:bg-yellow-500/5 backdrop-blur-xl border border-yellow-500/20 shadow-[0_8px_32px_0_rgba(234,179,8,0.15)] text-foreground">
          <div className="text-sm opacity-80">Invite friends. Earn together.</div>
          <div className="mt-3 text-xs uppercase tracking-widest opacity-80">Your code</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight">{code || "—"}</span>
            <button
              disabled={!code}
              onClick={() => copy(code, "code")}
              className="ml-auto grid place-items-center h-9 w-9 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm disabled:opacity-40 hover:bg-white/30 transition-all"
              aria-label="Copy code"
            >
              {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Glassmorphism Share Link Card */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Share link</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm px-3 py-2 text-xs font-mono truncate outline-none text-foreground"
            />
            <button
              disabled={!link}
              onClick={() => copy(link, "link")}
              className="rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/30 px-3 py-2 text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={share}
            disabled={!link}
            className="mt-4 w-full rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-sm py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        {/* Glassmorphism How it Works Card */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <h2 className="text-base font-bold">How it works</h2>
          <ol className="mt-4 space-y-4 text-sm">
            {[
              ["Share", "Send your link to friends via WhatsApp, Telegram or email."],
              ["They join", "When they sign up with your code, we link their account to you."],
              ["You earn", "Earn a share of every trade fee they generate."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-inner text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Shell>
  );
}
