import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/lmc-api";
import { Copy, Check, Share2, Users, Coins, QrCode, MessageCircle, Send, Twitter } from "lucide-react";
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

  // New Feature: Direct Social Media Sharing Logic
  const shareSocial = (platform: "wa" | "tg" | "tw") => {
    if (!link) return;
    const text = encodeURIComponent(`Join LM Coin and earn rewards! Sign up with my code: ${code}`);
    const url = encodeURIComponent(link);
    let shareUrl = "";

    if (platform === "wa") shareUrl = `https://wa.me/?text=${text}%20${url}`;
    if (platform === "tg") shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    if (platform === "tw") shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;

    window.open(shareUrl, "_blank");
  };

  return (
    <Shell>
      <AppHeader title="Referral" />
      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* NEW FEATURE: Rewards & Stats Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
              <Users size={20} />
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Total Invites</div>
          </div>
          <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-2">
              <Coins size={20} />
            </div>
            <div className="text-2xl font-bold">0.00</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Earned (LMC)</div>
          </div>
        </div>

        {/* Glassmorphism Code Card (Gold Tinted Glass) */}
        <div className="rounded-2xl p-5 relative overflow-hidden bg-yellow-500/10 dark:bg-yellow-500/5 backdrop-blur-xl border border-yellow-500/20 shadow-[0_8px_32px_0_rgba(234,179,8,0.15)] text-foreground">
          <div className="text-sm opacity-80">Invite friends. Earn together.</div>
          <div className="mt-3 text-xs uppercase tracking-widest opacity-80">Your code</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight">{code || "—"}</span>
            <div className="ml-auto flex gap-2">
              <button
                disabled={!code}
                onClick={() => toast.info("QR Code feature coming soon!")}
                className="grid place-items-center h-9 w-9 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm disabled:opacity-40 hover:bg-white/30 transition-all"
                aria-label="Show QR"
              >
                <QrCode size={16} />
              </button>
              <button
                disabled={!code}
                onClick={() => copy(code, "code")}
                className="grid place-items-center h-9 w-9 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm disabled:opacity-40 hover:bg-white/30 transition-all"
                aria-label="Copy code"
              >
                {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
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

          {/* NEW FEATURE: Direct Social Share Buttons */}
          <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Quick share:</span>
            <div className="flex gap-2">
              <button
                onClick={() => shareSocial("wa")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 flex items-center justify-center transition-all disabled:opacity-50"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => shareSocial("tg")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
              <button
                onClick={() => shareSocial("tw")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-neutral-500/10 text-foreground hover:bg-neutral-500/20 border border-neutral-500/20 flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Twitter size={18} />
              </button>
            </div>
          </div>
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

        {/* NEW FEATURE: Recent Referrals List */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <h2 className="text-sm font-bold mb-4">Recent Referrals</h2>
          <div className="flex flex-col items-center justify-center py-6 text-center opacity-60">
            <Users size={32} className="mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No friends joined yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share your code to get started!</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
