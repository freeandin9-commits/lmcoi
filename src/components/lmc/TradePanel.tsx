import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, placeOrder, formatINR, formatLMC } from "@/lib/lmc-api";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayOrderPayload {
  id: string;
  amount: number;
  currency: string;
}

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

  const { wallet, refreshWallet } = useWallet();

  const [buyMode, setBuyMode] = useState<"custom" | "upi" | "bank" | "fixed">("custom");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);
  const lmcPerInr = 1.25;
  const pricePerLmcInr = 1 / lmcPerInr;

  const enteredAmt = parseFloat(amount) || 0;
  const parsedAmount = Number(amount.replace(/[^\d.]/g, "")) || 0;
  const minBuyAmount = 1;
  const maxBuyAmount = 5000000;
  const canSubmit = parsedAmount >= minBuyAmount && parsedAmount <= maxBuyAmount && (side === "buy" ? true : parsedAmount <= lmc);

  const openRazorpayCheckout = async () => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TEzx6uRaoHmQeY";
    if (!keyId || keyId.includes("placeholder")) {
      throw new Error("Razorpay is not configured yet.");
    }

    const scriptId = "razorpay-checkout-script";
    if (!document.getElementById(scriptId)) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load Razorpay SDK"));
        document.body.appendChild(script);
      });
    }

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK is unavailable.");
    }

    const amountMinor = Math.round(parsedAmount * 100);
    const orderPayload = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountMinor, currency: "INR", receipt: `lmc-${Date.now()}` }),
    }).then(async (response) => {
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Unable to create Razorpay order");
      }
      return response.json() as Promise<RazorpayOrderPayload>;
    });

    const options: RazorpayOptions = {
      key: keyId,
      amount: orderPayload.amount,
      currency: orderPayload.currency,
      name: "LM Coin",
      description: `Buy ${formatLMC(parsedAmount * lmcPerInr, 4)} LMC`,
      order_id: orderPayload.id,
      prefill: {
        name: user?.email || "",
        email: user?.email || "",
        contact: "",
      },
      theme: { color: "#F59E0B" },
      modal: {
        ondismiss: () => {
          setBusy(false);
          toast.error("Payment cancelled");
        },
      },
      handler: async (response) => {
        try {
          await submit();
          toast.success(`Payment completed. Order ID: ${response.razorpay_order_id}`);
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Unable to place order";
          toast.error(message);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleConfirmPurchase = async () => {
    if (side !== "buy") {
      await submit();
      return;
    }

    try {
      setBusy(true);
      await openRazorpayCheckout();
      setShowConfirm(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unable to start Razorpay checkout";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleInitialSubmit = async () => {
    if (side === "buy") {
      if (parsedAmount < minBuyAmount) return toast.error(`Minimum buy amount is ₹${minBuyAmount}`);
      if (parsedAmount > maxBuyAmount) return toast.error(`Maximum buy amount is ₹${maxBuyAmount.toLocaleString("en-IN")}`);
      if (parsedAmount > inr) {
        toast.error("Insufficient INR");
        return;
      }
      setShowConfirm(true);
      return;
    }

    if (parsedAmount <= 0) return toast.error("Enter LMC quantity");
    if (parsedAmount > lmc) return toast.error("Insufficient LMC");

    await submit();
  };

  const submit = async () => {
    setBusy(true);

    try {
      const orderId = generateBuyOrderId();
      let qtyToProcess = 0;

      if (side === "buy") {
        qtyToProcess = parsedAmount * lmcPerInr;
        await placeOrder(side, qtyToProcess, pricePerLmcInr);
        await refreshWallet();
        toast.success(`Bought ${formatLMC(qtyToProcess, 4)} LMC. Order ID: ${orderId}`);
      } else {
        qtyToProcess = parsedAmount;
        await placeOrder(side, qtyToProcess, pricePerLmcInr);
        await refreshWallet();
        toast.success(`Sold ${formatLMC(qtyToProcess, 4)} LMC`);
      }

      setAmount("");
      setShowConfirm(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unable to place order";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleMockBuy = (sellerName: string) => {
    const orderId = generateBuyOrderId();
    toast.success(`Order placed with ${sellerName}. Order ID: ${orderId}`);
  };

  const setPct = (p: number) => {
    if (side === "buy") {
      const maxQty = inr;
      setAmount((maxQty * p).toFixed(2));
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
      <div className="px-4 pt-4 space-y-4 relative">
        <div className="rounded-3xl bg-background/60 backdrop-blur-2xl border border-white/10 shadow-2xl p-5">
          <div className="grid grid-cols-2 gap-3 rounded-xl overflow-hidden p-1 bg-foreground/5 backdrop-blur-md border border-foreground/10">
            <Link
              to="/buy"
              className={`py-2.5 text-sm font-semibold rounded-lg text-center transition-all duration-300 ${side === "buy" ? "btn-gold shadow-lg" : "text-muted-foreground hover:bg-foreground/5"}`}
            >
              Buy
            </Link>
            <Link
              to="/sell"
              className={`py-2.5 text-sm font-semibold rounded-lg text-center transition-all duration-300 ${side === "sell" ? "btn-gold shadow-lg" : "text-muted-foreground hover:bg-foreground/5"}`}
            >
              Sell
            </Link>
          </div>

          {side === "buy" && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: "custom", label: "Custom" },
                { id: "upi", label: "UPI Transfer" },
                { id: "bank", label: "Bank Transfer" },
                { id: "fixed", label: "Fixed LMC" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setBuyMode(mode.id as typeof buyMode)}
                  className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 border ${
                    buyMode === mode.id
                      ? "bg-[color:var(--gold-soft)] text-black border-transparent shadow-md"
                      : "bg-foreground/5 backdrop-blur-md border-foreground/10 text-muted-foreground hover:bg-foreground/10"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          {side === "sell" || (side === "buy" && buyMode === "custom") ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <label className="mt-5 block">
                <span className="text-sm font-medium text-foreground/80 pl-1">
                  {side === "buy" ? "Quantity (INR - LMC)" : "Quantity (LMC - INR)"}
                </span>
                <div className="mt-2 flex items-center rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 px-4 py-4 shadow-inner">
                  <span className="mr-2 text-lg font-semibold text-foreground">₹</span>
                  <input
                    value={amount}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^ -]/g, "").replace(/^₹\s*/, "");
                      setAmount(sanitized.replace(/[^\d.]/g, ""));
                    }}
                    inputMode="decimal"
                    placeholder={side === "buy" ? "Enter INR Amount" : "0.00"}
                    className="w-full outline-none font-mono text-lg text-foreground bg-transparent"
                  />
                </div>
              </label>

              {side === "sell" && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[0.25, 0.5, 0.75, 1].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPct(p)}
                      className="text-xs py-2 rounded-xl bg-foreground/5 backdrop-blur-md border border-foreground/10 hover:bg-foreground/10 transition-colors"
                    >
                      {p === 1 ? "MAX" : `${p * 100}%`}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 p-4 text-sm space-y-2 shadow-sm">
                {side === "buy" ? (
                  <>
                    <Row k="Price" v={`1 INR = ${formatLMC(lmcPerInr, 4)} LMC`} />
                    <Row k="You pay" v={formatINR(enteredAmt, 2)} />
                    <Row k="You will receive" v={formatLMC(enteredAmt * lmcPerInr, 4) + " LMC"} />
                  </>
                ) : (
                  <>
                    <Row k="Price" v={`1 INR = ${formatLMC(lmcPerInr, 4)} LMC`} />
                    <Row k="You receive" v={enteredAmt.toString()} />
                    <Row k="Balance" v={formatLMC(lmc, 4) + " LMC"} />
                  </>
                )}
              </div>

              <button
                onClick={handleInitialSubmit}
                disabled={busy || !canSubmit}
                className={`mt-6 w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  side === "buy"
                    ? "btn-gold"
                    : "bg-[color:var(--danger)]/90 backdrop-blur-md text-white border border-red-500/50 hover:bg-[color:var(--danger)]"
                }`}
              >
                {busy && <Loader2 size={18} className="animate-spin" />}
                {side === "buy" ? "Buy LMC" : "Sell LMC"}
              </button>
            </div>
          ) : side === "buy" && (buyMode === "upi" || buyMode === "bank") ? (
            <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2 pl-1">
                <Users size={14} className="text-[color:var(--gold)]" />
                {buyMode === "upi" ? "Sellers accepting UPI payments" : "Sellers accepting Bank Transfers"}
              </div>
              {mockSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="p-4 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 flex justify-between items-center hover:bg-foreground/10 transition-colors shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-sm">{seller.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Available: <span className="font-mono text-foreground font-medium">{seller.qty} LMC</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleMockBuy(seller.name)}
                      className="mt-2 px-5 py-2 text-xs font-semibold rounded-xl btn-gold shadow-md hover:shadow-lg transition-all"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 mb-6 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="text-4xl mb-3 drop-shadow-lg">🔒</div>
              <h3 className="font-semibold text-lg">Fixed LMC</h3>
            </div>
          )}
        </div>
      </div>

      {showConfirm && side === "buy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background/90 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-[340px]">
            <h3 className="text-lg font-bold mb-4 text-center">Confirm Purchase</h3>
            <div className="space-y-4 mb-6 p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
              <p className="text-center text-xs text-muted-foreground">
                Pay Amount:{" "}
                <span className="text-lg font-bold text-[color:var(--gold)]">{formatINR(enteredAmt, 2)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border"
              >
                Cancel
              </button>
              <button onClick={() => void handleConfirmPurchase()} className="flex-1 py-3 text-sm font-bold rounded-xl btn-gold">
                Pay with Razorpay
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground/90">{k}</span>
      <span className="font-mono font-medium">{v}</span>
    </div>
  );
}



