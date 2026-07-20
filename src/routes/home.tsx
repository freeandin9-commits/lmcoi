import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useWallet, useAnnouncements, formatINR, FIXED_PRICE_PER_LMC } from "@/lib/lmc-api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDownToLine, ArrowUpFromLine, Gift, Bell, Megaphone } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomeApp,
  head: () => ({
    meta: [
      { title: "LM Coin — Home" },
      { name: "description", content: "Your LM Coin dashboard: balance, quick actions and announcements." },
    ],
  }),
});

function HomeApp() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { wallet } = useWallet();
  const announcements = useAnnouncements();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const lmc = Number(wallet?.lmc_balance ?? 0);
  const inr = Number(wallet?.inr_balance ?? 0);
  const hold = Number((wallet as { hold_balance?: number } | null)?.hold_balance ?? 0);
  const total = lmc * FIXED_PRICE_PER_LMC + inr;

  return (
    <Shell>
      <style>{`
        @keyframes glass-fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        
        .animate-glass-1 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
        .animate-glass-2 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
        .animate-glass-3 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
        
        .glass-shine {
          position: relative;
          overflow: hidden;
        }
        .glass-shine::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 4s infinite;
          pointer-events: none;
          z-index: 10;
        }

        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          z-index: 0;
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Ambient Background Blobs for Glassmorphism Effect */}
      <div className="bg-blob w-72 h-72 bg-yellow-500/30 top-[-5%] left-[-10%]"></div>
      <div className="bg-blob w-64 h-64 bg-purple-500/20 top-[40%] right-[-10%]" style={{ animationDelay: "2s" }}></div>
      <div className="bg-blob w-80 h-80 bg-blue-500/20 bottom-[-10%] left-[10%]" style={{ animationDelay: "4s" }}></div>

      <AppHeader
        title="LM Coin"
        right={
          <button
            aria-label="Notifications"
            className="p-2 rounded-full backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 text-muted-foreground hover:text-foreground hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 relative z-20 shadow-sm"
          >
            <Bell size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-5 relative z-10">
        {/* BALANCE CARD - Glassmorphism */}
        <div
          className="animate-glass-1 glass-shine rounded-[2rem] p-6 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_40px_0_rgba(255,215,0,0.15)] transition-all duration-500 ease-in-out text-foreground relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)" }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-2">
              {/* LMC Price Badge */}
              <div className="text-[11px] font-extrabold backdrop-blur-md bg-white/30 dark:bg-black/30 px-3 py-1 rounded-full inline-flex w-fit items-center border border-white/50 dark:border-white/20 shadow-sm drop-shadow-sm">
                1 INR = 1.25 LMC
              </div>
              <div className="text-sm font-semibold opacity-80 mt-1 drop-shadow-sm">Total Balance</div>
            </div>
            <div className="backdrop-blur-md bg-white/20 p-2 rounded-full border border-white/30 shadow-inner">
              <LMCMark size={32} />
            </div>
          </div>
          <div className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight drop-shadow-md relative z-10">
            {formatINR(total, 2)}
          </div>

          {/* Hold Balance */}
          <div className="mt-2 text-sm font-bold opacity-90 backdrop-blur-sm bg-black/5 dark:bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/20 relative z-10">
            Hold Balance: {formatINR(hold, 2)}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 relative z-10">
            <QuickAction to="/buy" icon={<ArrowDownToLine size={18} />} label="Buy" />
            <QuickAction to="/sell" icon={<ArrowUpFromLine size={18} />} label="Sell" />
            <QuickAction to="/referral" icon={<Gift size={18} />} label="Refer" />
          </div>
        </div>

        {/* FEATURED ANNOUNCEMENT - Glassmorphism */}
        {announcements[0] && (
          <div className="animate-glass-2 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-xl bg-background/40 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] hover:bg-white/20 transition-all duration-300 group">
            <span
              className="grid place-items-center h-10 w-10 rounded-full backdrop-blur-md border border-[color:var(--gold)]/40 shadow-[0_0_15px_rgba(255,215,0,0.2)] group-hover:scale-110 transition-transform duration-300 text-black"
              style={{ background: "var(--gold-soft)" }}
            >
              <Megaphone size={18} />
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {announcements[0].tag}
              </div>
              <div className="text-sm font-extrabold text-foreground leading-tight drop-shadow-sm">
                {announcements[0].title}
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS LIST - Glassmorphism */}
        <div className="animate-glass-3">
          <div className="flex items-center justify-between px-2 pb-3">
            <h2 className="text-base font-extrabold drop-shadow-sm text-foreground">Announcements</h2>
          </div>
          <div className="rounded-3xl backdrop-blur-xl bg-background/40 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
            {announcements.length === 0 && (
              <div className="px-4 py-8 text-center text-sm font-medium text-muted-foreground">
                No announcements yet.
              </div>
            )}
            {announcements.map((a, i) => (
              <div
                key={a.id}
                className={`px-5 py-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-300 ${
                  i === 0 ? "" : "border-t border-white/20 dark:border-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className="font-bold rounded-full px-3 py-1 backdrop-blur-md border border-[color:var(--gold)]/30 text-[color:var(--gold)] shadow-sm"
                    style={{ background: "rgba(255, 215, 0, 0.1)" }}
                  >
                    {a.tag}
                  </span>
                  <span className="text-muted-foreground font-medium backdrop-blur-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    {new Date(a.published_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-bold text-foreground/90 drop-shadow-sm">{a.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>
    </Shell>
  );
}

function QuickAction({
  to,
  icon,
  label,
  search,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  search?: Record<string, string>;
}) {
  return (
    <Link to={to} search={search as never} className="group flex flex-col items-center gap-2">
      <span className="grid place-items-center h-12 w-12 rounded-full backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 text-foreground shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:bg-white/40 dark:group-hover:bg-white/20 group-active:scale-95 transition-all duration-300">
        {icon}
      </span>
      <span className="text-[12px] font-bold text-foreground drop-shadow-sm group-hover:text-[color:var(--gold)] transition-colors duration-300">
        {label}
      </span>
    </Link>
  );
}
