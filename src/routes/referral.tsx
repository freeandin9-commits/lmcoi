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
  useEffect(() => { if (!authLoading && !user) nav({ to: "/" }); }, [authLoading, user, nav]);

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
        <div
          className="rounded-2xl p-5 text-[oklch(0.2_0.02_260)]"
          style={{ background: "linear-gradient(135deg, var(--gold) 0%, oklch(0.92 0.11 92) 100%)" }}
        >
          <div className="text-sm opacity-80">Invite friends. Earn together.</div>
          <div className="mt-3 text-xs uppercase tracking-widest opacity-80">Your code</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight">{code || "—"}</span>
            <button
              disabled={!code}
              onClick={() => copy(code, "code")}
              className="ml-auto grid place-items-center h-9 w-9 rounded-full bg-background/70 disabled:opacity-40"
              aria-label="Copy code"
            >
              {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="rounded-2xl card-flat p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Share link</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-mono truncate outline-none"
            />
            <button
              disabled={!link}
              onClick={() => copy(link, "link")}
              className="rounded-lg btn-gold px-3 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={share}
            disabled={!link}
            className="mt-3 w-full rounded-xl btn-soft py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        <div className="rounded-2xl card-flat p-4">
          <h2 className="text-base font-bold">How it works</h2>
          <ol className="mt-3 space-y-3 text-sm">
            {[
              ["Share", "Send your link to friends via WhatsApp, Telegram or email."],
              ["They join", "When they sign up with your code, we link their account to you."],
              ["You earn", "Earn a share of every trade fee they generate."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid place-items-center h-7 w-7 rounded-full btn-gold text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-muted-foreground text-xs">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Shell>
  );
}
