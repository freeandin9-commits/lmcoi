import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { PriceBadge, Sparkline } from "@/components/lmc/PriceTicker";
import { useLivePrice, generateHistory, formatINR } from "@/lib/lmc-market";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard · LM Coin" }, { name: "description", content: "Your LM Coin portfolio, balances and recent activity." }] }),
});

const TX = [
  { id: "t1", type: "Buy", amount: "+120 LMC", value: 5124.6, date: "Today · 09:42", status: "Completed" },
  { id: "t2", type: "Deposit", amount: "+₹10,000", value: 10000, date: "Yesterday · 18:11", status: "Completed" },
  { id: "t3", type: "Sell", amount: "-40 LMC", value: 1710.0, date: "Jul 12 · 14:03", status: "Completed" },
  { id: "t4", type: "Referral", amount: "+18.5 LMC", value: 790.4, date: "Jul 11 · 10:22", status: "Credited" },
  { id: "t5", type: "Withdraw", amount: "-₹4,500", value: 4500, date: "Jul 09 · 08:00", status: "Pending" },
];

function Dashboard() {
  const { price } = useLivePrice();
  const history = useMemo(() => generateHistory(80, 120), []);
  const lmcBalance = 842.35;
  const inrBalance = 12_450.75;
  const portfolio = lmcBalance * price + inrBalance;
  const pl = portfolio - 44_820; // fake baseline
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Welcome back</span>
            <h1 className="mt-1 font-serif text-3xl md:text-5xl">Your portfolio</h1>
          </div>
          <PriceBadge />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 card-glass rounded-2xl p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio value</div>
                <div className="mt-1 font-mono tabular-nums text-4xl md:text-5xl font-semibold text-gold-gradient">
                  {formatINR(portfolio)}
                </div>
                <div className={`mt-1 text-sm ${pl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                  {pl >= 0 ? "▲" : "▼"} {formatINR(Math.abs(pl))} <span className="text-muted-foreground">all-time P/L</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/trade" className="rounded-lg btn-gold px-4 py-2 text-sm font-semibold">Buy</Link>
                <Link to="/trade" className="rounded-lg border border-border bg-secondary/60 hover:bg-secondary px-4 py-2 text-sm">Sell</Link>
                <Link to="/wallet" className="rounded-lg border border-border bg-secondary/60 hover:bg-secondary px-4 py-2 text-sm">Deposit</Link>
              </div>
            </div>
            <div className="mt-6"><Sparkline data={history} height={160} /></div>
          </div>

          <div className="grid gap-4">
            <BalanceCard label="LM Coin balance" primary={`${lmcBalance.toLocaleString("en-IN")} LMC`} secondary={formatINR(lmcBalance * price)} />
            <BalanceCard label="INR wallet" primary={formatINR(inrBalance)} secondary="Available to trade" />
            <div className="card-glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">KYC status</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif text-lg">Level 2 · Verified</span>
                <span className="rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] text-xs px-2 py-0.5">Active</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Higher withdrawal limits unlocked.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <QuickAction to="/wallet" label="Deposit INR" />
          <QuickAction to="/wallet" label="Withdraw INR" />
          <QuickAction to="/trade" label="Buy LMC" primary />
          <QuickAction to="/trade" label="Sell LMC" />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 card-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-serif text-xl">Transaction history</h2>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
            <div>
              {TX.map((t) => (
                <div key={t.id} className="grid grid-cols-12 px-5 py-4 border-b border-border last:border-0 items-center">
                  <div className="col-span-5">
                    <div className="font-medium">{t.type}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </div>
                  <div className="col-span-3 text-sm font-mono">{t.amount}</div>
                  <div className="col-span-2 text-right text-sm text-muted-foreground">{formatINR(t.value)}</div>
                  <div className="col-span-2 text-right">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${t.status === "Completed" || t.status === "Credited" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--gold)]/15 text-[color:var(--gold)]"}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <NotificationsCard />
        </div>
      </section>
    </Shell>
  );
}

function BalanceCard({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl">{primary}</div>
      <div className="text-xs text-muted-foreground mt-1">{secondary}</div>
    </div>
  );
}

function QuickAction({ to, label, primary }: { to: string; label: string; primary?: boolean }) {
  return (
    <Link to={to} className={`rounded-xl px-5 py-4 text-sm font-medium ${primary ? "btn-gold" : "border border-border bg-secondary/60 hover:bg-secondary"}`}>
      {label} →
    </Link>
  );
}

function NotificationsCard() {
  const [items] = useState([
    { t: "LMC crossed ₹43", d: "Price alert triggered · 09:02" },
    { t: "Withdrawal pending", d: "₹4,500 · awaiting bank confirmation" },
    { t: "New device signed in", d: "Chrome on macOS · Kochi" },
  ]);
  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-serif text-xl">Notifications</h2>
        <span className="text-xs text-muted-foreground">{items.length} new</span>
      </div>
      <ul>
        {items.map((i) => (
          <li key={i.t} className="px-5 py-4 border-b border-border last:border-0">
            <div className="font-medium text-sm">{i.t}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{i.d}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
