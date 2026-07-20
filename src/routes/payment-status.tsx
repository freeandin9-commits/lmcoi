import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { CheckCircle2, XCircle, Clock, Loader2, ArrowRight, Home } from "lucide-react";
import { formatINR, formatLMC } from "@/lib/lmc-api";
import { useState } from "react";

// Added "cancelled" to strictly match the requirement
type Status = "success" | "failed" | "pending" | "processing" | "cancelled";

type Search = {
  status?: Status;
  type?: "Buy" | "Sell";
  amount?: number;
  lmc?: number;
  paymentId?: string;
  orderId?: string;
  reason?: string;
  date?: string;
};

export const Route = createFileRoute("/payment-status")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const s = String(search.status ?? "pending");
    let status: Status = ["success", "failed", "pending", "processing", "cancelled"].includes(s)
      ? (s as Status)
      : "pending";

    const reason = search.reason ? String(search.reason) : undefined;

    // Auto-detect 'cancelled' status if Razorpay modal was closed
    if (status === "failed" && reason?.toLowerCase().includes("cancel")) {
      status = "cancelled";
    }

    return {
      status,
      type: search.type === "Sell" ? "Sell" : "Buy",
      amount: search.amount != null ? Number(search.amount) : undefined,
      lmc: search.lmc != null ? Number(search.lmc) : undefined,
      paymentId: search.paymentId ? String(search.paymentId) : undefined,
      orderId: search.orderId ? String(search.orderId) : undefined,
      reason,
      date: search.date ? String(search.date) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Payment Status · LM Coin" },
      { name: "description", content: "Razorpay payment status for your LMC purchase." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentStatusPage,
});

function PaymentStatusPage() {
  const { status = "pending", amount, lmc, paymentId, orderId, reason, type = "Buy", date } = Route.useSearch();
  const nav = useNavigate();

  const config = STATUS_CONFIG[status as Status];
  const Icon = config.icon;

  // Generate Current Date & Time (hh:mm:ss) dynamically if not provided in URL
  const [displayDate] = useState(() => {
    if (date)
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  });

  // Calculate Pay Amount
  const payAmount =
    type === "Buy" && amount != null ? formatINR(amount, 2) : lmc != null ? `${formatLMC(lmc, 4)} LMC` : "N/A";

  // Calculate Receive Amount specifically mirroring TradePanel.tsx logic
  let receiveAmount = "N/A";
  if (type === "Buy") {
    if (amount === 5000) {
      receiveAmount = "₹6250";
    } else if (amount === 10000) {
      receiveAmount = "₹13,000";
    } else if (amount === 15000) {
      receiveAmount = "₹19,000";
    } else if (lmc != null) {
      receiveAmount = `${formatLMC(lmc, 4)} LMC`;
    }
  } else {
    // For Sell
    if (amount != null) receiveAmount = formatINR(amount, 2);
  }

  // Strict Status Text display (Success / Pending / Cancelled / Failure)
  const statusText = status === "failed" ? "Failure" : status;

  return (
    <Shell>
      <AppHeader title="Payment Status" />
      <div className="px-4 pt-4 pb-8">
        <div className="rounded-3xl bg-background/60 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${config.iconBg}`}>
            <Icon
              size={44}
              className={`${config.iconColor} ${status === "processing" ? "animate-spin" : ""}`}
              strokeWidth={2}
            />
          </div>

          <h2 className={`text-xl font-bold mb-1 ${config.titleColor}`}>{config.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{reason ?? config.subtitle}</p>

          <div className="rounded-2xl bg-foreground/5 backdrop-blur-xl border border-foreground/10 p-4 text-sm space-y-3 text-left">
            {/* New Display Fields based on requirements */}
            {orderId && <Row label="Order ID" value={<span className="text-xs">{orderId}</span>} />}

            <Row label="Type" value={<span className="font-bold">{type}</span>} />
            <Row label="Pay Amount" value={payAmount} />
            <Row label="Receive Amount" value={receiveAmount} valueClass="text-[color:var(--gold)]" />

            <Row label="Date & Time" value={<span className="text-xs">{displayDate}</span>} />

            {paymentId && <Row label="Payment ID" value={<span className="text-xs">{paymentId}</span>} />}

            <Row
              label="Status"
              value={<span className={`uppercase font-bold tracking-wider ${config.titleColor}`}>{statusText}</span>}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {status === "success" ? (
              <>
                <Link
                  to="/wallet"
                  className="w-full rounded-2xl py-3.5 text-sm font-bold btn-gold shadow-lg flex items-center justify-center gap-2"
                >
                  View Wallet <ArrowRight size={16} />
                </Link>
                <Link
                  to="/home"
                  className="w-full rounded-2xl py-3 text-sm font-semibold border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={16} /> Back to Home
                </Link>
              </>
            ) : status === "failed" || status === "cancelled" ? (
              <>
                <button
                  onClick={() => nav({ to: "/buy" })}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold btn-gold shadow-lg"
                >
                  Try Again
                </button>
                <Link
                  to="/transactions"
                  className="w-full rounded-2xl py-3 text-sm font-semibold border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2"
                >
                  View Transactions
                </Link>
              </>
            ) : (
              <>
                <Link to="/transactions" className="w-full rounded-2xl py-3.5 text-sm font-bold btn-gold shadow-lg">
                  Check Transactions
                </Link>
                <Link
                  to="/home"
                  className="w-full rounded-2xl py-3 text-sm font-semibold border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={16} /> Back to Home
                </Link>
              </>
            )}
          </div>

          {status === "pending" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Your bank has taken longer than usual to confirm this payment. If the amount was debited, it will be
              credited automatically within a few minutes.
            </p>
          )}
          {(status === "failed" || status === "cancelled") && (
            <p className="mt-4 text-xs text-muted-foreground">
              No amount was deducted. If money was debited, it will be refunded to your source within 5–7 working days.
            </p>
          )}
          {status === "success" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Your payment was successful. The amount will be reflected shortly. Thank you for your patience.
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Row({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-muted-foreground/90">{label}</span>
      <span className={`font-mono font-medium text-right break-all ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

const STATUS_CONFIG: Record<
  Status,
  {
    icon: typeof CheckCircle2;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    title: string;
    subtitle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-500/15 border border-green-500/30",
    iconColor: "text-green-500",
    titleColor: "text-green-500",
    title: "Payment Successful",
    subtitle: "Your LMC has been credited to your wallet.",
  },
  failed: {
    icon: XCircle,
    iconBg: "bg-red-500/15 border border-red-500/30",
    iconColor: "text-[color:var(--danger)]",
    titleColor: "text-[color:var(--danger)]",
    title: "Payment Failed",
    subtitle: "We couldn't complete your payment.",
  },
  cancelled: {
    icon: XCircle,
    iconBg: "bg-red-500/15 border border-red-500/30",
    iconColor: "text-[color:var(--danger)]",
    titleColor: "text-[color:var(--danger)]",
    title: "Payment Cancelled",
    subtitle: "You have cancelled the payment.",
  },
  pending: {
    icon: Clock,
    iconBg: "bg-yellow-500/15 border border-yellow-500/30",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-500",
    title: "Payment Pending",
    subtitle: "Waiting for bank confirmation.",
  },
  processing: {
    icon: Loader2,
    iconBg: "bg-[color:var(--gold-soft)]/20 border border-[color:var(--gold)]/30",
    iconColor: "text-[color:var(--gold)]",
    titleColor: "text-[color:var(--gold)]",
    title: "Processing Payment",
    subtitle: "Please wait while we verify your transaction.",
  },
};
