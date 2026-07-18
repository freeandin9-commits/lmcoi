import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, usePriceSeries, placeOrder, formatINR, formatLMC } from "@/lib/lmc-api";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trade")({
  component: Trade,
  validateSearch: (search: Record<string, unknown>) => ({
    side: search.side === "sell" ? ("sell" as const) : ("buy" as const),
  }),
  head: () => ({
    meta: [{ title: "Trade · LM Coin" }, { name: "description", content: "Buy and sell LMC at live market price." }],
  }),
});

function Trade() {
  const nav = useNavigate();
  const { side: initialSide } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { wallet } = useWallet();
  const { price } = usePriceSeries(180);

  const [side, setSide] = useState<"buy" | "sell">(initialSide);
  useEffect(() => {
    setSide(initialSide);
  }, [initialSide]);
  // NEW: State to manage the 4 modes in Buy session
  const [buyMode, setBuyMode] = useState<"custom" | "upi" | "bank" | "fixed">("custom");

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

  // Mock data for UPI and Bank Transfer modes (Peer to Peer sellers)
  const mockSellers = [
    { id: 1, name: "Rahul M.", qty: 500, minLimit: 100 },
    { id: 2, name: "Sneha K.", qty: 1200, minLimit: 500 },
    { id: 3, name: "Ajith P.", qty: 350, minLimit: 50 },
  ];

  return (
    <Shell>
      <AppHeader title="Trade" />
      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl card-flat p-4">
          {/* Buy / Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                setSide("buy");
                setBuyMode("custom"); // Reset to custom when switching to buy
              }}
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

          {/* NEW: 4 Modes for Buy Session */}
          {side === "buy" && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: "custom", label: "Custom" },
                { id: "upi", label: "UPI Transfer" },
                { id: "bank", label: "Bank Transfer" },
                { id: "fixed", label: "Fixed LMC" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setBuyMode(mode.id as any)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    buyMode === mode.id
                      ? "bg-[color:var(--gold-soft)] text-black"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          {/* Render based on Mode */}
          {side === "sell" || (side === "buy" && buyMode === "custom") ? (
            <>
              {/* 1) CUSTOM MODE (Original Code) */}
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
            </>
          ) : side === "buy" && (buyMode === "upi" || buyMode === "bank") ? (
            /* 2 & 3) UPI / BANK TRANSFER MODE */
            <div className="mt-4 space-y-3">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <Users size={14} />
                {buyMode === "upi" ? "Sellers accepting UPI payments" : "Sellers accepting Bank Transfers"}
              </div>
              {mockSellers.map((seller) => (
                <div key={seller.id} className="p-3 rounded-xl bg-secondary flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">{seller.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Available: <span className="font-mono text-foreground">{seller.qty} LMC</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Limit: {seller.minLimit} - {seller.qty} LMC
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-[color:var(--gold)]">{formatINR(price, 2)}</div>
                    <button className="mt-2 px-4 py-1.5 text-xs font-semibold rounded-lg btn-gold">Buy</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 4) FIXED LMC MODE */
            <div className="mt-8 mb-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-lg">Fixed LMC</h3>
              <p className="text-sm text-muted-foreground mt-2 px-4">
                കൂടുതൽ വിവരങ്ങൾ ഉടൻ വരുന്നതാണ്... (More info coming soon)
              </p>
            </div>
          )}
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
