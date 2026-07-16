import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { Sparkline } from "@/components/lmc/PriceTicker";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, usePriceSeries, placeOrder, formatINR, formatLMC } from "@/lib/lmc-api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trade")({
  component: Trade,
  head: () => ({
    meta: [
      { title: "Trade · LM Coin" },
      { name: "description", content: "Buy and sell LMC at live market price." },
    ],
  }),
});

function Trade() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  useEffect(() => { if (!authLoading && !user) nav({ to: "/" }); }, [authLoading, user, nav]);

  const { wallet } = useWallet();
  const { sparkData, price, change } = usePriceSeries(180);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState(""); // input in LMC
  const [busy, setBusy] = useState(false);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);
  const qty = parseFloat(amount) || 0;
  const total = qty * price;

  const submit = async () => {
    if (qty <= 0) return toast.error("Enter LMC quantity");
    if (side === "buy" && total > inr) return toast.error("Insufficient INR");
    if (side === "sell" && qty > lmc) return toast.error("Insufficient LMC");
    setBusy(true);
    try {
      await placeOrder(side, qty, price);
      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${formatLMC(qty)} LMC`);
      setAmount("");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const setPct = (p: number) => {
    if (side === "buy") {
      const maxQty = inr / (price || 1);
      setAmount((maxQty * p).toFixed(4));
    } else {
      setAmount((lmc * p).toFixed(4));
    }
  };

  return (
    <Shell>
      <AppHeader title="Trade" />
      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl card-flat p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">LMC / INR</div>
              <div className="mt-1 text-3xl font-extrabold font-mono">{price ? formatINR(price, 4) : "—"}</div>
            </div>
          </div>
          <div className="mt-3 min-h-[160px]">
            {sparkData.length >= 2 && <Sparkline data={sparkData} height={160} />}
          </div>
        </div>

        <div className="rounded-2xl card-flat p-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            <button
              onClick={() => setSide("buy")}
              className={`py-2.5 text-sm font-semibold rounded-lg ${side === "buy" ? "btn-gold" : "bg-secondary text-muted-foreground"}`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide("sell")}
              className={`py-2.5 text-sm font-semibold rounded-lg ${side === "sell" ? "btn-gold" : "bg-secondary text-muted-foreground"}`}
            >
              Sell
            </button>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium">Quantity (LMC)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-2 w-full rounded-xl bg-secondary px-4 py-3 outline-none font-mono text-lg"
            />
          </label>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0.25, 0.5, 0.75, 1].map((p) => (
              <button
                key={p}
                onClick={() => setPct(p)}
                className="text-xs py-1.5 rounded-md bg-secondary hover:brightness-95"
              >
                {p === 1 ? "MAX" : `${p * 100}%`}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-secondary p-3 text-sm space-y-1.5">
            <Row k="Price" v={formatINR(price, 4)} />
            <Row k={side === "buy" ? "You pay" : "You receive"} v={formatINR(total, 2)} />
            <Row k="Balance" v={side === "buy" ? formatINR(inr, 2) + " INR" : formatLMC(lmc, 4) + " LMC"} />
          </div>

          <button
            onClick={submit}
            disabled={busy || !price}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 ${
              side === "buy" ? "btn-gold" : "bg-[color:var(--danger)] text-white"
            }`}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {side === "buy" ? "Buy LMC" : "Sell LMC"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
