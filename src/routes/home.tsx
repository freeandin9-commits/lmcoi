import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useWallet, usePriceSeries, useAnnouncements, formatINR, formatLMC } from "@/lib/lmc-api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDownToLine, ArrowUpFromLine, Gift, Bell, Megaphone } from "lucide-react";

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
  const { price } = usePriceSeries(120);
  const announcements = useAnnouncements();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const lmc = Number(wallet?.lmc_balance ?? 0);
  const inr = Number(wallet?.inr_balance ?? 0);
  const hold = Number((wallet as { hold_balance?: number } | null)?.hold_balance ?? 0);
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
            <div className="flex flex-col gap-1.5">
              {/* LMC Price Badge Moved Here (Above Total Balance) */}
              <div className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full inline-flex w-fit items-center border border-black/5">
                1 INR = 1.25 LMC
              </div>
              <div className="text-sm/none opacity-80">Total Balance</div>
            </div>
            <LMCMark size={28} />
          </div>
          <div className="mt-3 text-3xl font-extrabold tabular-nums">{formatINR(total, 2)}</div>

          {/* Hold Balance Added Here */}
          <div className="mt-1 text-sm font-medium opacity-90">Hold Balance: {formatINR(hold, 2)}</div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <QuickAction to="/buy" icon={<ArrowDownToLine size={18} />} label="Buy" />
            <QuickAction to="/sell" icon={<ArrowUpFromLine size={18} />} label="Sell" />
            <QuickAction to="/referral" icon={<Gift size={18} />} label="Refer" />
          </div>
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
                  <span className="rounded-full px-2 py-0.5" style={{ background: "var(--gold-soft)" }}>
                    {a.tag}
                  </span>
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

function QuickAction({ to, icon, label, search }: { to: string; icon: React.ReactNode; label: string; search?: Record<string, string> }) {
  return (
    <Link to={to} search={search as never} className="flex flex-col items-center gap-1.5">
      <span className="grid place-items-center h-11 w-11 rounded-full bg-background/70 text-[oklch(0.2_0.02_260)]">
        {icon}
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
