import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { Sparkline } from "@/components/lmc/PriceTicker";
import { useWallet, usePriceSeries, useAnnouncements, formatINR, formatLMC } from "@/lib/lmc-api";
import { useAuth } from "@/hooks/use-auth";
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
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { wallet } = useWallet();
  const { sparkData, price, change } = usePriceSeries(120);
  const announcements = useAnnouncements();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const lmc = Number(wallet?.lmc_balance ?? 0);
  const inr = Number(wallet?.inr_balance ?? 0);
  const total = lmc * price + inr;

  return (
    <Shell>
      <AppHeader
        title="LM Coin"
        right={
          <button aria-label="Notifications" className="text-muted-foreground">
            <Bell size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <div
          className="rounded-2xl p-5 text-[oklch(0.2_0.02_260)]"
          style={{ background: "linear-gradient(135deg, var(--gold) 0%, oklch(0.92 0.11 92) 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm/none opacity-80">Total Balance</div>
            <LMCMark size={28} />
          </div>
          <div className="mt-3 text-3xl font-extrabold tabular-nums">{formatINR(total, 2)}</div>
          <div className="mt-1 text-sm font-medium">
            {formatLMC(lmc, 4)} LMC · {formatINR(inr, 2)}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <QuickAction to="/wallet" icon={<ArrowDownToLine size={18} />} label="Deposit" />
            <QuickAction to="/wallet" icon={<ArrowUpFromLine size={18} />} label="Withdraw" />
            <QuickAction to="/trade" icon={<Repeat size={18} />} label="Trade" />
            <QuickAction to="/referral" icon={<Gift size={18} />} label="Refer" />
          </div>
        </div>

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
              <div className="font-mono font-semibold">{price ? formatINR(price, 4) : "—"}</div>
              <div className={`text-xs font-medium ${change >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                {change >= 0 ? "▲" : "▼"} {change}%
              </div>
            </div>
          </div>
          <div className="mt-3 min-h-[80px]">
            {sparkData.length >= 2 && <Sparkline data={sparkData} height={80} />}
          </div>
          <Link to="/trade" className="mt-3 block text-center rounded-xl btn-gold py-2.5 text-sm">
            Buy / Sell LMC
          </Link>
        </div>

        {announcements[0] && (
          <div className="rounded-2xl card-flat p-4 flex items-start gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-full" style={{ background: "var(--gold-soft)" }}>
              <Megaphone size={18} />
            </span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{announcements[0].tag}</div>
              <div className="text-sm font-semibold mt-0.5">{announcements[0].title}</div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <h2 className="text-base font-bold">Announcements</h2>
          </div>
          <div className="rounded-2xl card-flat overflow-hidden">
            {announcements.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">No announcements yet.</div>
            )}
            {announcements.map((a, i) => (
              <div key={a.id} className={`px-4 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full px-2 py-0.5" style={{ background: "var(--gold-soft)" }}>{a.tag}</span>
                  <span className="text-muted-foreground">{new Date(a.published_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{a.title}</div>
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
