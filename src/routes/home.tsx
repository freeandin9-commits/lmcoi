import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react"; // useState ചേർത്തു
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useWallet, usePriceSeries, useAnnouncements, formatINR, formatLMC } from "@/lib/lmc-api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, Gift, Bell, Megaphone, X } from "lucide-react";

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
  const [showCoinModel, setShowCoinModel] = useState(false); // Modal visibility state

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const lmc = Number(wallet?.lmc_balance ?? 0);
  const inr = Number(wallet?.inr_balance ?? 0);
  const total = lmc * price + inr;

  // Clickable Logo Component
  const Logo = () => (
    <button
      onClick={() => setShowCoinModel(true)}
      className="flex items-center gap-2 text-xl font-bold"
      aria-label="View LM Coin 3D model"
    >
      <img
        src="https://i.supaimg.com/a0e6e974-7179-457d-b73d-5f2febbbc7db/d0909bd0-b695-4eba-a668-8db9774fe0d7.jpg"
        alt="LM Coin Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      LM Coin
    </button>
  );

  return (
    <Shell>
      <AppHeader
        title={<Logo />} // Passing Logo component instead of text
        right={
          <button aria-label="Notifications" className="text-muted-foreground">
            <Bell size={20} />
          </button>
        }
      />

      {/* 3D Coin Model Modal */}
      {showCoinModel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCoinModel(false)}
        >
          <div
            className="w-[80vw] h-[80vh] rounded-2xl bg-background p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCoinModel(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
            <div className="w-full h-full rounded-xl overflow-hidden">
              {/* 3D Model Viewer - using a placeholder for .glb file */}
              <model-viewer
                src="/lmc-coin.glb"
                alt="A 3D model of LM Coin"
                auto-rotate
                camera-controls
                style={{ width: "100%", height: "100%" }}
              ></model-viewer>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">3D model of LM Coin</p>
          </div>
        </div>
      )}

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
