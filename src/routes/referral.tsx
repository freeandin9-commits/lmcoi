import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { formatINR } from "@/lib/lmc-market";

export const Route = createFileRoute("/referral")({
  component: Referral,
  head: () => ({ meta: [{ title: "Referral · LM Coin" }, { name: "description", content: "Invite friends to LM Coin and earn a share of their trading fees." }] }),
});

function Referral() {
  const code = "LM-XZ4Q9";
  const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${code}` : `https://lmcoin.app/?ref=${code}`;
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const copy = async (v: string, k: "code" | "link") => {
    try { await navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Referral</span>
        <h1 className="mt-1 font-serif text-3xl md:text-5xl">Earn with every friend.</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Share your link, and earn 25% of the trading fees whenever they buy or sell LMC.</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 card-glass rounded-2xl p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Your code</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-2xl text-gold-gradient">{code}</span>
                  <button onClick={() => copy(code, "code")} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-secondary">
                    {copied === "code" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Share link</div>
                <div className="mt-1 flex items-center gap-2">
                  <input readOnly value={link} className="flex-1 rounded-md bg-background/60 border border-border px-3 py-2 text-sm font-mono truncate" />
                  <button onClick={() => copy(link, "link")} className="text-xs rounded-md btn-gold px-3 py-2 font-semibold">
                    {copied === "link" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat k="Total referred" v="42" />
              <Stat k="Active traders" v="18" />
              <Stat k="Lifetime earnings" v={formatINR(24_120.4)} />
            </div>
          </div>

          <div className="card-glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Referral wallet</div>
            <div className="mt-1 font-mono tabular-nums text-3xl font-semibold text-gold-gradient">{formatINR(4_812.5)}</div>
            <button className="mt-4 w-full rounded-lg btn-gold py-2.5 text-sm font-semibold">Withdraw to INR</button>
            <p className="mt-2 text-xs text-muted-foreground text-center">Payouts settle instantly.</p>
          </div>
        </div>

        <div className="mt-8 card-glass rounded-2xl p-6">
          <h2 className="font-serif text-xl">How it works</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
            {[
              ["Share", "Send your link to friends via WhatsApp, Telegram or email."],
              ["They trade", "When they buy or sell LMC, we track it against your code."],
              ["You earn", "25% of every fee credits to your referral wallet in real time."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-xl border border-border p-4">
                <div className="h-7 w-7 rounded-full btn-gold grid place-items-center font-serif">{i + 1}</div>
                <div className="font-serif text-lg mt-3">{t}</div>
                <p className="text-muted-foreground mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </Shell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-1 font-serif text-2xl">{v}</div>
    </div>
  );
}
