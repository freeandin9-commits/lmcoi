import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, History, ArrowUpRight, ArrowDownLeft, Gift, Copy, Check, Share2, Loader2 } from "lucide-react";
import { useTransactions, formatINR, formatLMC } from "@/lib/lmc-api";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [{ title: "Transactions · LM Coin" }],
  }),
});

function TransactionsPage() {
  const nav = useNavigate();
  // Fetching last 50 transactions
  const { transactions } = useTransactions(50);

  // State for tracking copied Order ID
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // State for tracking which transaction is currently generating the image for sharing
  const [sharingId, setSharingId] = useState<string | null>(null);

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy":
      case "deposit":
        return <ArrowDownLeft size={20} className="text-[color:var(--success)]" />;
      case "sell":
      case "withdraw":
        return <ArrowUpRight size={20} className="text-red-500" />;
      case "referral":
        return <Gift size={20} className="text-purple-500" />;
      default:
        return <History size={20} className="text-muted-foreground" />;
    }
  };

  // Strictly matched with payment-status.tsx logic & colors
  const getStatusData = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "success") return { text: "Success", color: "text-green-500" };
    if (s === "cancelled") return { text: "Cancelled", color: "text-[color:var(--danger)]" };
    if (s === "failed" || s === "failure") return { text: "Failure", color: "text-[color:var(--danger)]" };
    if (s === "processing") return { text: "Processing", color: "text-[color:var(--gold)]" };
    // Default to pending
    return { text: "Pending", color: "text-yellow-500" };
  };

  // 1) Handle Copy Order ID
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
  };

  // 2) Handle Share as Image
  const handleShare = async (id: string) => {
    if (sharingId) return; // Prevent multiple clicks
    const element = document.getElementById(`tx-${id}`);
    if (!element) return;

    setSharingId(id); // Show loading state

    try {
      // Create canvas from the specific transaction div
      const canvas = await html2canvas(element, {
        backgroundColor: null, // Keep background transparent
        scale: 2, // Better image quality
        useCORS: true, // Crucial for loading external fonts/icons securely
        logging: false, // Turn off console logs from html2canvas
      });

      // Convert canvas to Blob safely
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0);
      });

      if (!blob) throw new Error("Could not generate image blob");

      const file = new File([blob], `transaction_${id}.png`, { type: "image/png" });

      // Fallback function to download the image if sharing fails
      const downloadFallback = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transaction_${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // Check if browser supports Web Share API with files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: "LM Coin Transaction",
            files: [file],
          });
        } catch (shareError: any) {
          // If share fails (e.g., due to async delay browser security), fallback to download
          if (shareError.name !== "AbortError") {
            console.warn("Native share blocked or failed, falling back to download...");
            downloadFallback();
          }
        }
      } else {
        // Direct fallback for browsers that don't support file sharing
        downloadFallback();
      }
    } catch (error) {
      console.error("Error generating or sharing transaction image:", error);
      alert("Unable to generate the image. Please try again.");
    } finally {
      setSharingId(null); // Remove loading state
    }
  };

  return (
    <Shell>
      <AppHeader
        title="Transactions"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-12 space-y-4">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-secondary/50 rounded-2xl border border-white/10 mt-6">
            <History size={40} className="mx-auto mb-3 opacity-50" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((t) => {
              // 1. Format Date & Time with seconds (hh:mm:ss)
              const displayDate = new Date(t.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              });

              // 2. Strict Status Data (Text & Color) from payment-status logic
              const statusData = getStatusData(t.status);

              // 3. Calculate Pay & Receive Amounts mirroring payment-status logic
              let payAmount = "N/A";
              let receiveAmount = "N/A";
              const amtInr = Number(t.amount_inr || 0);
              const amtLmc = Number(t.amount_lmc || 0);

              if (t.type?.toLowerCase() === "buy") {
                payAmount = formatINR(amtInr, 2);
                if (amtInr === 5000) receiveAmount = "₹6250";
                else if (amtInr === 10000) receiveAmount = "₹13,000";
                else if (amtInr === 15000) receiveAmount = "₹19,000";
                else receiveAmount = `${formatLMC(amtLmc, 4)} LMC`;
              } else if (t.type?.toLowerCase() === "sell") {
                payAmount = `${formatLMC(amtLmc, 4)} LMC`;
                receiveAmount = formatINR(amtInr, 2);
              } else {
                payAmount = "N/A";
                receiveAmount = formatINR(amtInr, 2); // default for deposits/referrals
              }

              return (
                <div
                  key={t.id}
                  id={`tx-${t.id}`} // ID for html2canvas to capture this specific div
                  className="p-4 rounded-3xl bg-secondary/40 backdrop-blur-md border border-white/10 shadow-sm relative flex flex-col gap-3"
                >
                  {/* Card Header (Icon, Title, Action Buttons) */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                        {getTransactionIcon(t.type)}
                      </div>
                      <div className="font-bold text-base capitalize text-foreground">{t.type}</div>
                    </div>

                    <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                      <button
                        onClick={() => handleCopy(t.id)}
                        className="p-2 bg-background/50 border border-border rounded-xl hover:bg-white/10 text-muted-foreground transition-all"
                        title="Copy Order ID"
                      >
                        {copiedId === t.id ? (
                          <Check size={16} className="text-[color:var(--success)]" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>

                      <button
                        onClick={() => handleShare(t.id)}
                        disabled={sharingId === t.id}
                        className="p-2 bg-background/50 border border-border rounded-xl hover:bg-white/10 text-muted-foreground transition-all disabled:opacity-50"
                        title="Share Transaction"
                      >
                        {sharingId === t.id ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Transaction Details Box */}
                  <div className="rounded-2xl bg-foreground/5 border border-foreground/10 p-4 text-sm space-y-3 text-left">
                    <Row label="Order ID" value={<span className="text-xs">{t.id}</span>} />

                    <Row label="Type" value={<span className="font-bold capitalize">{t.type}</span>} />
                    <Row label="Pay Amount" value={payAmount} />
                    <Row label="Receive Amount" value={receiveAmount} valueClass="text-[color:var(--gold)]" />

                    <Row label="Date & Time" value={<span className="text-xs">{displayDate}</span>} />

                    <Row
                      label="Status"
                      value={
                        <span className={`uppercase font-bold tracking-wider ${statusData.color}`}>
                          {statusData.text}
                        </span>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

// Row component for rendering transaction details uniformly
function Row({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-muted-foreground/90">{label}</span>
      <span className={`font-mono font-medium text-right break-all ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
