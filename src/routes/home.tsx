import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import {
  useLivePrice, generateHistory, TOP_MOVERS, ANNOUNCEMENTS, formatINR,
} from "@/lib/lmc-market";
import { Sparkline } from "@/components/lmc/PriceTicker";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, Gift, Bell, Megaphone } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomeApp,
  head: () => ({
    meta: [
      { title: "LM Coin — Home" },
      { name: "description", content: "Your LM Coin dashboard: balance, live price, quick actions and market." },
    ],
  }),
});

function HomeApp() {
  const { price, change24h } = useLivePrice();
  const history = useMemo(() => generateHistory(80, 60), []);
  const balanceLmc = 1240.5;
  const balanceInr = balanceLmc * price;

  return (
    <Shell>
      <AppHeader
        title="LM Coin"
        right={<button aria-label="Notifications" className="text-muted-foreground"><Bell size={20} /></button>}
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Balance card */}
        <div
          className="rounded-2xl p-5 text-[oklch(0.2_0.02_260)]"
          style={{ background: "linear-gradient(135deg, var(--gold) 0%, oklch(0.92 0.11 92) 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm/none opacity-80">Total Balance</div>
            <LMCMark size={28} />
          </div>
          <div className="mt-3 text-3xl font-extrabold tabular-nums">{formatINR(balanceInr, 2)}</div>
          <div className="mt-1 text-sm font-medium">{balanceLmc.toFixed(2)} LMC</div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <QuickAction to="/wallet" icon={<ArrowDownToLine size={18} />} label="Deposit" />
            <QuickAction to="/wallet" icon={<ArrowUpFromLine size={18} />} label="Withdraw" />
            <QuickAction to="/trade" icon={<Repeat size={18} />} label="Trade" />
            <QuickAction to="/referral" icon={<Gift size={18} />} label="Refer" />
          </div>
        </div>

        {/* Live price */}
        <div className="rounded-2xl card-flat p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LMCMark size={28} />
              <div>
                <div className="font-semibold text-sm">LMC / INR</div>
                <div className="text-xs text-muted-foreground">Live price</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold">{formatINR(price, 4)}</div>
              <div className={`text-xs font-medium ${change24h >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                {change24h >= 0 ? "▲" : "▼"} {change24h}%
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Sparkline data={history} height={80} />
          </div>
          <Link to="/trade" className="mt-3 block text-center rounded-xl btn-gold py-2.5 text-sm">Buy / Sell LMC</Link>
        </div>

        {/* Announcement banner */}
        <div className="rounded-2xl card-flat p-4 flex items-start gap-3">
          <span className="grid place-items-center h-9 w-9 rounded-full" style={{ background: "var(--gold-soft)" }}>
            <Megaphone size={18} />
          </span>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Announcement</div>
            <div className="text-sm font-semibold mt-0.5">{ANNOUNCEMENTS[0].title}</div>
          </div>
        </div>

        {/* Market list */}
        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <h2 className="text-base font-bold">Market</h2>
            <Link to="/trade" className="text-xs text-muted-foreground">View all</Link>
          </div>
          <div className="rounded-2xl card-flat overflow-hidden">
            {TOP_MOVERS.map((m, i) => (
              <div key={m.symbol} className={`flex items-center px-4 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
                {m.symbol === "LMC" ? <LMCMark size={30} /> : (
                  <span className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-xs font-semibold">{m.symbol[0]}</span>
                )}
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">{formatINR(m.price, 2)}</div>
                  <div className={`text-xs font-medium ${m.change >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                    {m.change >= 0 ? "+" : ""}{m.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </Shell>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5">
      <span className="grid place-items-center h-11 w-11 rounded-full bg-background/70 text-[oklch(0.2_0.02_260)]">
        {icon}
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
