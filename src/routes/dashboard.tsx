import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, useProfile, useTransactions, usePriceSeries, formatINR, formatLMC } from "@/lib/lmc-api";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Account · LM Coin" },
      { name: "description", content: "Your account, KYC status and transaction history." },
    ],
  }),
});

const TYPE_LABEL: Record<string, string> = {
  buy: "Buy LMC",
  sell: "Sell LMC",
  deposit: "Deposit INR",
  withdraw: "Withdraw INR",
  transfer: "Transfer",
  referral: "Referral reward",
};

function Dashboard() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  useEffect(() => { if (!authLoading && !user) nav({ to: "/" }); }, [authLoading, user, nav]);

  const { wallet } = useWallet();
  const { profile } = useProfile();
  const { transactions } = useTransactions(30);
  const { price } = usePriceSeries(20);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);
  const total = inr + lmc * price;

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <Shell>
      <AppHeader
        title="Account"
        right={
          <button onClick={signOut} className="text-muted-foreground" aria-label="Sign out">
            <LogOut size={20} />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl card-flat p-4 flex items-center gap-3">
          <span
            className="grid place-items-center h-12 w-12 rounded-full font-bold text-lg"
            style={{ background: "var(--gold-soft)" }}
          >
            {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{profile?.display_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>
          <span
            className={`text-[11px] rounded-full px-2 py-0.5 ${
              profile?.kyc_status === "verified"
                ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            KYC: {profile?.kyc_status ?? "unverified"}
          </span>
        </div>

        <div className="rounded-2xl card-flat p-4">
          <div className="flex items-center gap-2">
            <LMCMark size={24} />
            <span className="text-sm font-semibold">Portfolio</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold tabular-nums">{formatINR(total, 2)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatLMC(lmc, 4)} LMC · {formatINR(inr, 2)} INR
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/trade" className="rounded-lg btn-gold py-2 text-center text-sm font-semibold">Trade</Link>
            <Link to="/wallet" className="rounded-lg btn-soft py-2 text-center text-sm font-semibold">Wallet</Link>
          </div>
        </div>

        <div>
          <div className="px-1 pb-2 text-base font-bold">Transactions</div>
          <div className="rounded-2xl card-flat overflow-hidden">
            {transactions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No transactions yet. Deposit INR and start trading.
              </div>
            )}
            {transactions.map((t, i) => {
              const amt =
                t.type === "buy" || t.type === "sell"
                  ? `${t.type === "buy" ? "+" : "-"}${formatLMC(Number(t.amount_lmc), 4)} LMC`
                  : `${t.type === "deposit" || t.type === "referral" ? "+" : "-"}${formatINR(Number(t.amount_inr), 2)}`;
              return (
                <div key={t.id} className={`px-4 py-3 flex items-center gap-3 ${i === 0 ? "" : "border-t border-border"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{TYPE_LABEL[t.type] ?? t.type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{amt}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{t.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={signOut} className="w-full rounded-xl btn-soft py-3 text-sm font-semibold flex items-center justify-center gap-2">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </Shell>
  );
}
