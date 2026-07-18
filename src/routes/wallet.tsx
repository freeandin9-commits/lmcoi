import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, usePriceSeries, formatINR, formatLMC } from "@/lib/lmc-api";

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
  const { price } = usePriceSeries(20);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);
  // ഭാവിയിൽ Hold Balance API-ൽ നിന്ന് ലഭ്യമാകുന്നതിനായി സെറ്റ് ചെയ്തത്
  const holdBalance = Number((wallet as any)?.hold_balance ?? 0);

  return (
    <Shell>
      <AppHeader title="Wallet" />
      <div className="px-4 pt-4 space-y-4">
        {/* Wallet Overview */}
        <div
          className="rounded-2xl p-5 text-[oklch(0.2_0.02_260)]"
          style={{ background: "linear-gradient(135deg, var(--gold) 0%, oklch(0.92 0.11 92) 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-80">Wallet</div>
            <LMCMark size={28} />
          </div>

          {/* LMC Price Added Here */}
          <div className="mt-2 text-sm font-medium opacity-90">1 INR = 1.25 LMC</div>

          <div className="mt-1 text-3xl font-extrabold tabular-nums">{formatINR(inr + lmc * price, 2)}</div>

          {/* Removed previous LMC/INR balance and Added Hold Balance */}
          <div className="mt-1 text-sm font-medium">Hold Balance: {formatLMC(holdBalance, 4)} LMC</div>
        </div>
      </div>
    </Shell>
  );
}
