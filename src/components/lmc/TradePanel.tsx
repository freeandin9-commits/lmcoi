import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, usePriceSeries, placeOrder, formatINR, formatLMC } from "@/lib/lmc-api";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

type Side = "buy" | "sell";

// ഓർഡർ ഐഡി ജനറേറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ (Format: BYYMMDD000000000)
const generateBuyOrderId = () => {
  const d = new Date();
  const yy = d.getFullYear().toString().slice(-2); // Last 2 digits of year
  const mm = (d.getMonth() + 1).toString().padStart(2, "0"); // Month
  const dd = d.getDate().toString().padStart(2, "0"); // Day
  // 9 digit unique number
  const unique = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `B${yy}${mm}${dd}${unique}`;
};

export function TradePanel({ side }: { side: Side }) {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { wallet } = useWallet();
  const { price } = usePriceSeries(180);

  const [buyMode, setBuyMode] = useState<"custom" | "upi" | "bank" | "fixed">("custom");
  const [amount, setAmount] = useState("");
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
      let orderId = "";
      if (side === "buy") {
        orderId = generateBuyOrderId();
        console.log("Generated Buy Order ID:", orderId); // കാണാൻ വേണ്ടി കൺസോളിൽ നൽകുന്നു
      }

      await placeOrder(side, qty, price);

      if (side === "buy") {
        // Buy സക്സസ് ആകുമ്പോൾ ഓർഡർ ഐഡി കൂടി കാണിക്കുന്നു
        toast.success(`Bought ${formatLMC(qty)} LMC. Order ID: ${orderId}`);
      } else {
        toast.success(`Sold ${formatLMC(qty)} LMC`);
      }

      setAmount("");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Mock sellers-ൽ നിന്ന് buy ചെയ്യുമ്പോഴും ഓർഡർ ഐഡി വർക്ക് ചെയ്യാൻ
  const handleMockBuy = (sellerName: string) => {
    const orderId = generateBuyOrderId();
    toast.success(`Order placed with ${sellerName}. Order ID: ${orderId}`);
  };

  const setPct = (p: number) => {
    if (side === "buy") {
      const maxQty = inr / (price || 1);
      setAmount((maxQty * p).toFixed(4));
    } else {
      setAmount((lmc * p).toFixed(4));
    }
  };

  const mockSellers = [
    { id: 1, name: "Rahul M.", qty: 500, minLimit: 100 },
    { id: 2, name: "Sneha K.", qty: 1200, minLimit: 500 },
    { id: 3, name: "Ajith P.", qty: 350, minLimit: 50 },
  ];

  return (
    <Shell>
      <AppHeader title={side === "buy" ? "Buy LMC" : "Sell LMC"} />
      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl card-flat p-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            <Link
              to="/buy"
              className={`py-2.5 text-sm font-semibold rounded-lg text-center ${side === "buy" ? "btn-gold" : "bg-secondary text-muted-foreground"}`}
            >
              Buy
            </Link>
            <Link
              to="/sell"
              className={`py-2.5 text-sm font-semibold rounded-lg text-center ${side === "sell" ? "btn-gold" : "bg-secondary text-muted-foreground"}`}
            >
              Sell
            </Link>
          </div>

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
                  onClick={() => setBuyMode(mode.id as typeof buyMode)}
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

          {side === "sell" || (side === "buy" && buyMode === "custom") ? (
            <>
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
                    <button
                      onClick={() => handleMockBuy(seller.name)}
                      className="mt-2 px-4 py-1.5 text-xs font-semibold rounded-lg btn-gold"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
