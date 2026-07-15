import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { useLivePrice, formatINR } from "@/lib/lmc-market";

export const Route = createFileRoute("/wallet")({
  component: Wallet,
  head: () => ({ meta: [{ title: "Wallet · LM Coin" }, { name: "description", content: "Manage your INR and LM Coin wallets, deposit, withdraw and transfer funds." }] }),
});

type Tab = "inr" | "lmc";

function Wallet() {
  const [tab, setTab] = useState<Tab>("inr");
  const { price } = useLivePrice();
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Wallet</span>
        <h1 className="mt-1 font-serif text-3xl md:text-5xl">Your assets</h1>

        <div className="mt-6 inline-flex rounded-xl border border-border bg-secondary/60 p-1">
          <TabBtn active={tab === "inr"} onClick={() => setTab("inr")}>INR Wallet</TabBtn>
          <TabBtn active={tab === "lmc"} onClick={() => setTab("lmc")}>LMC Wallet</TabBtn>
        </div>

        {tab === "inr" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 card-glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Available INR</div>
              <div className="mt-1 font-mono tabular-nums text-4xl font-semibold text-gold-gradient">{formatINR(12_450.75)}</div>
              <div className="text-xs text-muted-foreground mt-1">Bank · UPI · IMPS</div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <ActionBtn primary>Deposit</ActionBtn>
                <ActionBtn>Withdraw</ActionBtn>
              </div>
            </div>
            <div className="lg:col-span-2 card-glass rounded-2xl p-6">
              <h2 className="font-serif text-xl">Deposit INR</h2>
              <p className="text-sm text-muted-foreground mt-1">Transfer instantly via UPI or use a linked bank account.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Amount (INR)" placeholder="1,000" />
                <Field label="Method" placeholder="UPI · lmcoin@icici" />
              </div>
              <button className="mt-6 rounded-lg btn-gold px-5 py-3 text-sm font-semibold">Continue</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 card-glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">LMC Balance</div>
              <div className="mt-1 font-mono tabular-nums text-4xl font-semibold text-gold-gradient">842.35 LMC</div>
              <div className="text-xs text-muted-foreground mt-1">≈ {formatINR(842.35 * price)}</div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <ActionBtn primary>Send</ActionBtn>
                <ActionBtn>Receive</ActionBtn>
              </div>
            </div>
            <div className="lg:col-span-2 card-glass rounded-2xl p-6">
              <h2 className="font-serif text-xl">Send LM Coin</h2>
              <p className="text-sm text-muted-foreground mt-1">Instant transfer to any LM Coin user or wallet address.</p>
              <div className="mt-6 grid gap-4">
                <Field label="Recipient" placeholder="username or wallet address" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Amount (LMC)" placeholder="0.00" />
                  <Field label="Network fee" placeholder="0.001 LMC" readOnly />
                </div>
              </div>
              <button className="mt-6 rounded-lg btn-gold px-5 py-3 text-sm font-semibold">Review transfer</button>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm ${active ? "btn-gold" : "text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function ActionBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button className={`rounded-lg px-4 py-2.5 text-sm font-medium ${primary ? "btn-gold" : "border border-border bg-secondary/60 hover:bg-secondary"}`}>{children}</button>
  );
}

function Field({ label, placeholder, readOnly }: { label: string; placeholder?: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full rounded-lg bg-background/60 border border-border px-4 py-3 font-mono text-sm outline-none focus:border-[color:var(--gold)] transition"
      />
    </label>
  );
}
