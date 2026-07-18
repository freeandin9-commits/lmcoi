import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, usePriceSeries, depositInr, withdrawInr, formatINR, formatLMC } from "@/lib/lmc-api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
  head: () => ({
    meta: [
      { title: "Wallet · LM Coin" },
      { name: "description", content: "Deposit and withdraw INR, view LMC balance." },
    ],
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

        {/* Action Panel (INR Deposit/Withdraw) */}
        <InrPanel />
      </div>
    </Shell>
  );
}

function InrPanel() {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    try {
      if (mode === "deposit") {
        await depositInr(n);
        toast.success(`Deposited ${formatINR(n)}`);
      } else {
        await withdrawInr(n);
        toast.success(`Withdrew ${formatINR(n)}`);
      }
      setAmount("");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl card-flat p-4">
      {/* Available INR session removed as requested */}

      <div className="inline-flex w-full rounded-xl bg-secondary p-1">
        <TabBtn active={mode === "deposit"} onClick={() => setMode("deposit")}>
          Deposit
        </TabBtn>
        <TabBtn active={mode === "withdraw"} onClick={() => setMode("withdraw")}>
          Withdraw
        </TabBtn>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">Amount (INR)</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder="0.00"
          className="mt-2 w-full rounded-xl bg-secondary px-4 py-3 outline-none font-mono text-lg"
        />
      </label>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[100, 500, 1000, 5000].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="text-xs py-1.5 rounded-md bg-secondary hover:brightness-95"
          >
            +₹{v}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={busy}
        className="mt-4 w-full rounded-xl btn-gold py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {busy && <Loader2 size={16} className="animate-spin" />}
        {mode === "deposit" ? "Deposit INR" : "Withdraw INR"}
      </button>
      <p className="mt-2 text-[11px] text-muted-foreground text-center">Instant simulated settlement.</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${active ? "btn-gold" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
