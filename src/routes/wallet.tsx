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
          <div className="mt-2 text-3xl font-extrabold tabular-nums">{formatINR(inr + lmc * price, 2)}</div>
          <div className="mt-1 text-sm font-medium">
            {formatINR(inr, 2)} INR · {formatLMC(lmc, 4)} LMC
          </div>
        </div>
      </div>
    </Shell>
  );
}
