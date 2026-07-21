import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, formatINR, formatLMC } from "@/lib/lmc-api";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
  head: () => ({
    meta: [{ title: "Wallet · LM Coin" }, { name: "description", content: "View LMC balance." }],
  }),
});

function WalletPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);
  // ഭാവിയിൽ Hold Balance API-ൽ നിന്ന് ലഭ്യമാകുന്നതിനായി സെറ്റ് ചെയ്തത്
  const holdBalance = Number((wallet as any)?.hold_balance ?? 0);
  // Wallet Total = "You will receive" value (LMC amount credited)
  const total = lmc;

  return (
    <Shell>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
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

      {/* Ambient Background Blobs */}
      <div className="bg-blob w-72 h-72 bg-purple-500/30 top-10 left-[-10%]"></div>
      <div className="bg-blob w-80 h-80 bg-blue-500/20 bottom-10 right-[-10%]" style={{ animationDelay: "2s" }}></div>

      <AppHeader title="Wallet" />

      <div className="px-4 pt-4 space-y-4 relative z-10">
        {/* Wallet Overview - Glassmorphism */}
        <div className="rounded-[2rem] p-6 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] bg-white/10 dark:bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold opacity-70 text-foreground">Wallet</div>
            <div className="backdrop-blur-md bg-white/20 p-2 rounded-full border border-white/20">
              <LMCMark size={24} />
            </div>
          </div>

          {/* LMC Price */}
          <div className="mt-2 text-sm font-bold opacity-80 text-foreground">1 INR = 1.25 LMC</div>

          {/* Total Balance = LMC amount received */}
          <div className="mt-1 text-4xl font-extrabold tabular-nums text-foreground drop-shadow-sm">
            {formatLMC(total, 4)} <span className="text-2xl">LMC</span>
          </div>

          {/* INR Balance */}
          <div className="mt-4 pt-4 border-t border-white/20 text-sm font-bold text-foreground/90 flex justify-between">
            <span>INR Balance:</span>
            <span className="font-extrabold">{formatINR(inr, 2)}</span>
          </div>

          {/* Hold Balance */}
          <div className="mt-2 text-sm font-bold text-foreground/90 flex justify-between">
            <span>Hold Balance:</span>
            <span className="font-extrabold">{formatLMC(holdBalance, 4)} LMC</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

