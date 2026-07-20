import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Shell, AppHeader, LMCMark } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, placeOrder, formatINR, formatLMC, LMC_PER_INR, FIXED_PRICE_PER_LMC } from "@/lib/lmc-api";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay.functions";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
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

  const { wallet } = useWallet();

  const [buyMode, setBuyMode] = useState<"custom" | "upi" | "bank" | "fixed">("custom");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inr = Number(wallet?.inr_balance ?? 0);
  const lmc = Number(wallet?.lmc_balance ?? 0);

  const lmcPerInr = LMC_PER_INR;
  const pricePerLmcInr = FIXED_PRICE_PER_LMC;
  const sellableInr = Math.round(lmc * pricePerLmcInr * 100) / 100;

  const enteredAmt = parseFloat(amount) || 0;
  /** Buy: You will receive this many LMC after payment success */
  const buyReceiveLmc = Math.round(enteredAmt * lmcPerInr * 10000) / 10000;
  /** Sell: INR entered → LMC to deduct from wallet */
  const sellLmcQty = Math.round(enteredAmt * lmcPerInr * 10000) / 10000;

  const canSubmit = enteredAmt > 0 && (side === "buy" ? true : enteredAmt <= sellableInr + 0.0001);

  const handleInitialSubmit = async () => {
    if (side === "buy") {
      if (enteredAmt <= 0) return toast.error("Enter INR amount");
      setShowConfirm(true);
      return;
    }

    if (enteredAmt <= 0) return toast.error("Enter amount to sell");
    if (enteredAmt > sellableInr) return toast.error("Insufficient Balance");

    await submit();
  };

  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyPaymentFn = useServerFn(verifyRazorpayPayment);

  const submit = async () => {
    setBusy(true);

    try {
      const orderId = generateBuyOrderId();
      let qtyToProcess = 0;

      if (side === "buy") {
        // Razorpay checkout for buying LMC with INR
        const ok = await loadRazorpayScript();
        if (!ok) throw new Error("Failed to load Razorpay. Check your internet connection.");

        const order = await createOrderFn({ data: { amountInr: enteredAmt } });
        const lmcExpected = buyReceiveLmc;

        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay!({
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            order_id: order.orderId,
            name: "LM Coin",
            description: `Buy ${formatLMC(lmcExpected, 4)} LMC`,
            prefill: {
              email: user?.email ?? "",
              name: user?.user_metadata?.display_name ?? "",
            },
            theme: { color: "#D4AF37" },
            handler: async (resp: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                nav({
                  to: "/payment-status",
                  search: {
                    status: "processing",
                    amount: enteredAmt,
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                  },
                });
                // Wallet credit happens only here — after Razorpay success + server verify
                const verified = await verifyPaymentFn({
                  data: {
                    razorpay_order_id: resp.razorpay_order_id,
                    razorpay_payment_id: resp.razorpay_payment_id,
                    razorpay_signature: resp.razorpay_signature,
                    amountInr: enteredAmt,
                  },
                });
                nav({
                  to: "/payment-status",
                  search: {
                    status: "success",
                    amount: enteredAmt,
                    lmc: Number(verified?.lmc ?? lmcExpected),
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                  },
                });
                resolve();
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Verification failed";
                nav({
                  to: "/payment-status",
                  search: {
                    status: "pending",
                    amount: enteredAmt,
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                    reason: msg,
                  },
                });
                reject(err);
              }
            },
            modal: {
              ondismiss: () => {
                nav({
                  to: "/payment-status",
                  search: {
                    status: "failed",
                    amount: enteredAmt,
                    orderId: order.orderId,
                    reason: "Payment cancelled",
                  },
                });
                reject(new Error("Payment cancelled"));
              },
            },
          });
          rzp.open();
        });

        qtyToProcess = lmcExpected;
      } else {
        // Sell: deduct LMC equal to entered INR × 1.25; credit INR to wallet
        qtyToProcess = sellLmcQty;
        await placeOrder("sell", qtyToProcess, pricePerLmcInr);
        toast.success(`Sold ${formatLMC(qtyToProcess, 4)} LMC · ${formatINR(enteredAmt, 2)} credited`);
      }

      setAmount("");
      setShowConfirm(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unable to place order";
      if (side !== "buy") toast.error(message);
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
      setAmount((inr * p).toFixed(2));
    } else {
      setAmount((sellableInr * p).toFixed(2));
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
                {/* Amount എന്റർ ചെയ്യുന്ന ഇൻപുട്ടിന് മുകളിലായി LMC Balance കാണിക്കുന്ന ഭാഗം */}
                <div className="flex justify-between items-center pl-1">
                  <span className="text-sm font-medium text-foreground/80">
                    {side === "buy" ? "Quantity (INR ---> LMC Deposit)" : "Quantity (LMC ---> INR Withdrawal)"}
                  </span>
                  {side === "sell" && (
                    <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
                      Available:
                      <LmcAmount value={lmc} />
                    </span>
                  )}
                </div>

                {/* Input field with INR Symbol for Sell */}
                <div className="relative mt-2">
                  {side === "sell" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-mono text-lg pointer-events-none">
                      ₹
                    </span>
                  )}
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                    placeholder={side === "buy" ? "Enter INR Amount" : "0.00"}
                    className={`w-full rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 py-4 outline-none font-mono text-lg text-foreground focus:border-foreground/30 focus:bg-foreground/10 transition-all shadow-inner ${side === "sell" ? "pl-9 pr-4" : "px-4"}`}
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
                    <Row k="You will receive" v={formatLMC(buyReceiveLmc, 4) + " LMC"} />
                  </>
                ) : (
                  <>
                    <Row k="Price" v={`1 INR = ${formatLMC(lmcPerInr, 4)} LMC`} />
                    <Row k="You receive" v={formatINR(enteredAmt, 2)} className="text-green-500" />
                    <Row k="LMC Balance" v={<LmcAmount value={lmc} />} />
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
            <div className="mt-5 space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <h3 className="font-semibold text-lg text-center mb-4">Fixed LMC</h3>

              <div className="p-4 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:bg-foreground/10 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground/80">Buy LMC</span>
                  <span className="font-mono font-bold text-lg">₹5000</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">You will received LM Coin</span>
                  <span className="font-mono font-bold text-[color:var(--gold)]">₹6250</span>
                </div>
                <button
                  onClick={() => {
                    setAmount("5000");
                    setShowConfirm(true);
                  }}
                  className="w-full py-2.5 text-sm font-bold rounded-xl btn-gold shadow-md hover:shadow-lg transition-all"
                >
                  Buy Now
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:bg-foreground/10 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground/80">Buy LMC</span>
                  <span className="font-mono font-bold text-lg">₹10,000</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">You Will Received LM Coin</span>
                  <span className="font-mono font-bold text-[color:var(--gold)]">₹13,000</span>
                </div>
                <button
                  onClick={() => {
                    setAmount("10000");
                    setShowConfirm(true);
                  }}
                  className="w-full py-2.5 text-sm font-bold rounded-xl btn-gold shadow-md hover:shadow-lg transition-all"
                >
                  Buy Now
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 hover:bg-foreground/10 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground/80">Buy LMC</span>
                  <span className="font-mono font-bold text-lg">₹15,000</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">You Will Received LM Coin</span>
                  <span className="font-mono font-bold text-[color:var(--gold)]">₹19,000</span>
                </div>
                <button
                  onClick={() => {
                    setAmount("15000");
                    setShowConfirm(true);
                  }}
                  className="w-full py-2.5 text-sm font-bold rounded-xl btn-gold shadow-md hover:shadow-lg transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && side === "buy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background/90 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-[340px]">
            <h3 className="text-lg font-bold mb-2 text-center">Confirm Purchase</h3>
            {/* Added confirmation message here */}
            <p className="text-center text-sm text-muted-foreground mb-4">
              Are you sure you want to proceed with this purchase?
            </p>
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
              <button onClick={() => void submit()} className="flex-1 py-3 text-sm font-bold rounded-xl btn-gold">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

// Row component updated to accept className for custom styling
function LmcAmount({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[color:var(--gold)]">
      <LMCMark size={16} />
      {formatLMC(value, 4)}
    </span>
  );
}

function Row({ k, v, className }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground/90">{k}</span>
      <span className={`font-mono font-medium ${className || ""}`}>{v}</span>
    </div>
  );
}
